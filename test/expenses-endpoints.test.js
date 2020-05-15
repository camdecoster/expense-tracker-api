// Modules
const app = require("../src/app");
const knex = require("knex");

// Configuration
const helpers = require("./test-helpers");

describe("Expenses Endpoints", function () {
    let db;

    const {
        testCategories,
        testExpenses,
        testPayment_methods,
        testUsers,
    } = helpers.makeExpensesFixtures();

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

    describe(`GET /api/expenses`, () => {
        context(`Given no expenses`, () => {
            beforeEach(() => helpers.seedTables.users(db, testUsers));
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get("/api/expenses")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context("Given there are expenses in the database", () => {
            beforeEach("insert everything and expenses", () =>
                helpers.seedTables.expenses(
                    db,
                    testUsers,
                    testCategories,
                    testPayment_methods,
                    testExpenses
                )
            );

            it("responds with 200 and all of the expenses", () => {
                const filteredExpenses = testExpenses.filter(
                    (expense) => expense.user_id === testUsers[0].id
                );
                // Omit user_id from expected expenses
                const expectedExpenses = filteredExpenses.map((expense) =>
                    helpers.makeExpected.expense(expense)
                );
                return supertest(app)
                    .get("/api/expenses")
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedExpenses);
            });
        });

        context(`Given an XSS attack expense`, () => {
            const testUser = testUsers[1];
            const testCategory = {
                ...testCategories[1],
                user_id: testUser.id,
            };
            const testPayment_method = {
                ...testPayment_methods[1],
                user_id: testUser.id,
            };

            const {
                maliciousExpense,
                expectedExpense,
            } = helpers.makeMalicious.expense(
                testUser,
                testCategory,
                testPayment_method
            );

            beforeEach("insert everything, then malicious expense", () => {
                return helpers.seedMalicious.expense(
                    db,
                    testUser,
                    testCategory,
                    testPayment_method,
                    maliciousExpense
                );
            });

            it("removes XSS attack content", () => {
                return supertest(app)
                    .get("/api/expenses")
                    .set("Authorization", helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect((res) => {
                        expect(res.body[0].type).to.eql(expectedExpense.type);
                        expect(res.body[0].payee).to.eql(expectedExpense.payee);
                        expect(res.body[0].description).to.eql(
                            expectedExpense.description
                        );
                    });
            });
        });
    });

    describe(`GET /api/expenses/:expense_id`, () => {
        context(`Given no expenses`, () => {
            beforeEach(() => helpers.seedTables.users(db, testUsers));

            it(`responds with 404`, () => {
                const expenseId = 123456;
                return supertest(app)
                    .get(`/api/expenses/${expenseId}`)
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: `Expense doesn't exist` });
            });
        });

        context("Given there are expenses in the database", () => {
            beforeEach("insert expenses", () =>
                helpers.seedTables.expenses(
                    db,
                    testUsers,
                    testCategories,
                    testPayment_methods,
                    testExpenses
                )
            );

            it("responds with 200 and the specified expense", () => {
                const expenseId = 2;
                const expectedExpense = helpers.makeExpected.expense(
                    testExpenses[expenseId - 1]
                );

                return supertest(app)
                    .get(`/api/expenses/${expenseId}`)
                    .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedExpense);
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
