require("dotenv").config();

// Modules
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const ExpensesService = require("./expenses/expenses-service");
const usersRouter = require("./users/users-router");
const categoriesRouter = require("./categories/categories-router");
const authRouter = require("./auth/auth-router");
const paymentMethodsRouter = require("./payment_methods/payment_methods-router");

// Configuration
const { NODE_ENV } = require("./config");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/payment-methods", paymentMethodsRouter);

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (process.env.NODE_ENV === "production") {
        response = { error: { message: "server error" } };
    } else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});

module.exports = app;
