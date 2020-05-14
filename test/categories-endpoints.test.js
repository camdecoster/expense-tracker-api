// Modules
const app = require("../src/app");
const knex = require("knex");

// Configuration
const helpers = require("./test-helpers");

describe("Categories Endpoints", function () {
    let db;

    const { testUsers, testCategories } = helpers.makeExpensesFixtures();

    // Connect to DB
    before(() => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DB_URL,
        });
        app.set("db", db);
    });

    after("disconnect from db", () => db.destroy());

    before("cleanup", () => helpers.cleanTables(db));

    afterEach("cleanup", () => helpers.cleanTables(db));

    describe(`GET /api/categories`, () => {
        context(`Given no categories`, () => {
            beforeEach(() => helpers.seedUsers(db, testUsers));
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get("/api/categories")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context("Given there are categories in the database", () => {
            beforeEach("insert categories", () =>
                helpers.seedCategoriesTables(db, testUsers, testCategories)
            );

            it("responds with 200 and all of the categories", () => {
                const filteredCategories = testCategories.filter(
                    (category) => category.user_id === testUsers[0].id
                );
                // Omit user_id from expected categories
                const expectedCategories = filteredCategories.map((category) =>
                    helpers.makeExpectedCategory(category)
                );
                return supertest(app)
                    .get("/api/categories")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedCategories);
            });
        });

        context(`Given an XSS attack category`, () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousCategory,
                expectedCategory,
            } = helpers.makeMaliciousCategory(testUser);

            beforeEach("insert malicious category", () => {
                return helpers.seedMaliciousCategory(
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
            beforeEach(() => helpers.seedUsers(db, testUsers));

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
                helpers.seedCategoriesTables(db, testUsers, testCategories)
            );

            it("responds with 200 and the specified category", () => {
                const categoryId = 2;
                const expectedCategory = helpers.makeExpectedCategory(
                    testCategories[categoryId - 1]
                );

                return supertest(app)
                    .get(`/api/categories/${categoryId}`)
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedCategory);
            });
        });

        context(`Given an XSS attack category`, () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousCategory,
                expectedCategory,
            } = helpers.makeMaliciousCategory(testUser);

            beforeEach("insert malicious category", () => {
                return helpers.seedMaliciousCategory(
                    db,
                    testUser,
                    maliciousCategory
                );
            });

            it("removes XSS attack content", () => {
                return supertest(app)
                    .get(`/api/categories/${maliciousCategory.id}`)
                    .set("Authorization", helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect((res) => {
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
});
