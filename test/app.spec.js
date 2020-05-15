const app = require("../src/app");

describe("App", () => {
    it("GET / responds with 200 containing welcome message", () => {
        return supertest(app)
            .get("/")
            .expect(
                200,
                "Welcome to the Expense Tracker API! Go to [site] to start using it."
            );
    });
});
