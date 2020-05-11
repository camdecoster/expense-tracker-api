// Modules
const app = require("../src/app");
const bcrypt = require("bcryptjs");
const ExpensesService = require("../src/expenses/expenses-service");
const knex = require("knex");

// Configuration
const helpers = require("./test-helpers");

describe.skip(`Expenses service object`, function () {
    let db;

    let {
        testUsers,
        testCategories,
        testPaymentMethods,
        testExpenses,
    } = helpers.makeExpensesFixtures();

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

    describe(`getAllExpenses()`, () => {
        context(`Given no expenses`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app).get("/api/expenses").expect(200, []);
            });
        });
    });
});
