// Modules
const app = require("../src/app");
const knex = require("knex");

// Configuration
const helpers = require("./test-helpers");

// ADD TESTS FOR POSTING/UPDATING CATEGORIES

describe("Categories Endpoints", function () {
    let db;

    const { testUsers, testCategories } = helpers.makeExpensesFixtures();

    // Connect to DB
    before(() => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set("db", db);
    });

    after("disconnect from db", () => db.destroy());

    before("cleanup", () => helpers.cleanTables(db));

    afterEach("cleanup", () => helpers.cleanTables(db));

    describe(`GET /api/categories`, () => {
        context(`Given no categories`, () => {
            beforeEach(() => helpers.seedTables.users(db, testUsers));
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get("/api/categories")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context("Given there are categories in the database", () => {
            beforeEach("insert categories", () =>
                helpers.seedTables.categories(db, testUsers, testCategories)
            );

            it("responds with 200 and all of the categories", () => {
                const filteredCategories = testCategories.filter(
                    (category) => category.user_id === testUsers[0].id
                );
                // Omit user_id from expected categories
                const expectedCategories = filteredCategories.map((category) =>
                    helpers.makeExpected.category(category)
                );
                return supertest(app)
                    .get("/api/categories")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedCategories);
            });
        });

        context(`Given an XSS attack category`, () => {
            const testUser = testUsers[1];
            const {
                maliciousCategory,
                expectedCategory,
            } = helpers.makeMalicious.category(testUser);

            beforeEach("insert malicious category", () => {
                return helpers.seedMalicious.category(
                    db,
                    testUser,
                    maliciousCategory
                );
            });

            it("removes XSS attack content", () => {
                return supertest(app)
                    .get("/api/categories")
                    .set("Authorization", helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect((res) => {
                        expect(res.body[0].category_name).to.eql(
                            expectedCategory.category_name
                        );
                        expect(res.body[0].type).to.eql(expectedCategory.type);
                        expect(res.body[0].description).to.eql(
                            expectedCategory.description
                        );
                    });
            });
        });
    });

    describe(`GET /api/categories/:category_id`, () => {
        context(`Given no categories`, () => {
            beforeEach(() => helpers.seedTables.users(db, testUsers));

            it(`responds with 404`, () => {
                const categoryId = 123456;
                return supertest(app)
                    .get(`/api/categories/${categoryId}`)
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: `Category doesn't exist` });
            });
        });

        context("Given there are categories in the database", () => {
            beforeEach("insert categories", () =>
                helpers.seedTables.categories(db, testUsers, testCategories)
            );

            it("responds with 200 and the specified category", () => {
                const categoryId = 2;
                const expectedCategory = helpers.makeExpected.category(
                    testCategories[categoryId - 1]
                );

                return supertest(app)
                    .get(`/api/categories/${categoryId}`)
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedCategory);
            });
        });

        context(`Given an XSS attack category`, () => {
            const testUser = testUsers[1];
            const {
                maliciousCategory,
                expectedCategory,
            } = helpers.makeMalicious.category(testUser);

            beforeEach("insert malicious category", () => {
                return helpers.seedMalicious.category(
                    db,
                    testUser,
                    maliciousCategory
                );
            });

            it.only("removes XSS attack content", () => {
                return supertest(app)
                    .get(`/api/categories/${maliciousCategory.id}`)
                    .set("Authorization", helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect((res) => {
                        console.log(res);
                        expect(res.body.category_name).to.eql(
                            expectedCategory.category_name
                        );
                        expect(res.body.type).to.eql(expectedCategory.type);
                        expect(res.body.description).to.eql(
                            expectedCategory.description
                        );
                    });
            });
        });
    });

    describe.only(`POST /api/categories`, () => {
        context(`Category Validation`, () => {
            beforeEach("insert users and categories", () =>
                helpers.seedTables.categories(db, testUsers, testCategories)
            );

            const requiredFields = ["category_name", "type", "amount"];

            requiredFields.forEach((field) => {
                const postAttemptBody = {
                    category_name: "test category_name",
                    type: "monthly",
                    amount: "100",
                    description: "test description",
                };

                it(`responds with 400 required error when '${field}' is missing`, () => {
                    delete postAttemptBody[field];
                    // console.log(postAttemptBody);

                    return supertest(app)
                        .post("/api/categories")
                        .set(
                            "Authorization",
                            helpers.makeAuthHeader(testUsers[0])
                        )
                        .send(postAttemptBody)
                        .expect(400, {
                            error: {
                                message: `Missing '${field}' in request body`,
                            },
                        });
                });
            });

            it(`responds 400 'Category name '[category_name]' already used' when category_name isn't unique`, () => {
                const duplicateCategory = {
                    category_name: testCategories[0].category_name,
                    type: "monthly",
                    amount: 999,
                    description: "test",
                };

                return supertest(app)
                    .post("/api/categories")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .send(duplicateCategory)
                    .expect(400, {
                        error: {
                            message: `Category name '${duplicateCategory.category_name}' already used`,
                        },
                    });
            });
        });

        context(`Happy path`, () => {
            beforeEach("insert users", () =>
                helpers.seedTables.users(db, testUsers)
            );
            it(`responds 201 with sanitized category, storing category`, () => {
                const newCategory = {
                    category_name: "New Category",
                    type: "monthly",
                    amount: "$999.00",
                    description: "New description",
                };
                return supertest(app)
                    .post("/api/categories")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .send(newCategory)
                    .expect(201)
                    .expect((res) => {
                        expect(res.body).to.have.property("id");
                        expect(res.body.category_name).to.eql(
                            newCategory.category_name
                        );
                        expect(res.body.type).to.eql(newCategory.type);
                        expect(res.body.amount).to.eql(newCategory.amount);
                        expect(res.body.description).to.eql(
                            newCategory.description
                        );
                        expect(res.headers.location).to.eql(
                            `/api/categories/${res.body.id}`
                        );
                        const expectedDate = new Date().toLocaleString("en", {
                            timeZone: "UTC",
                        });
                        const actualDate = new Date(
                            res.body.date_created
                        ).toLocaleString();
                        expect(actualDate).to.eql(expectedDate);
                    })
                    .expect((res) =>
                        db
                            .from("categories")
                            .select("*")
                            .where({ id: res.body.id })
                            .first()
                            .then((row) => {
                                expect(row.category_name).to.eql(
                                    newCategory.category_name
                                );
                                const expectedDate = new Date().toLocaleString(
                                    "en",
                                    { timeZone: "UTC" }
                                );
                                const actualDate = new Date(
                                    row.date_created
                                ).toLocaleString();
                                expect(actualDate).to.eql(expectedDate);
                            })
                    );
            });
        });
    });

    // ADD TEST FOR DELETING CATEGORY, CHECK IF EXPENSES ASSOCIATED
    // WITH THAT CATEGORY MOVE TO UNCATEGORIZED
});
