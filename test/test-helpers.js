// Modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
        expenses,
        payment_methods,
        categories,
        users
        RESTART IDENTITY CASCADE`
    );
}

function makeCategoriesArray(users) {
    return [
        {
            id: 1,
            user_id: users[0].id,
            category_name: "Auto",
            type: "monthly",
            amount: 50,
            description:
                "All car related expenses: gas, service, insurance, etc.",
            date_created: "2020-05-03T00:00:00.000Z",
            date_modified: "2020-05-03T00:00:00.000Z",
        },
        {
            id: 2,
            user_id: users[0].id,
            category_name: "Bills",
            type: "monthly",
            amount: 300,
            description:
                "Monthly bills including phone, internet, utilities, etc.",
            date_created: "2020-05-04T00:00:00.000Z",
            date_modified: "2020-05-04T00:00:00.000Z",
        },
        {
            id: 3,
            user_id: users[0].id,
            category_name: "Home",
            type: "monthly",
            amount: 1700,
            description: "Mortgage and purchases to improve/fix my house",
            date_created: "2020-05-06T00:00:00.000Z",
            date_modified: "2020-05-06T00:00:00.000Z",
        },
        {
            id: 4,
            user_id: users[0].id,
            category_name: "Shopping",
            type: "monthly",
            amount: 200,
            description:
                "All shopping expenses not covered by other categories.",
            date_created: "2020-05-05T00:00:00.000Z",
            date_modified: "2020-05-05T00:00:00.000Z",
        },
        {
            id: 5,
            user_id: users[1].id,
            category_name: "Business",
            type: "monthly",
            amount: 150,
            description: "Purchases for work related items, home office stuff.",
            date_created: "2020-05-03T00:00:00.000Z",
            date_modified: "2020-05-03T00:00:00.000Z",
        },
        {
            id: 6,
            user_id: users[1].id,
            category_name: "Clothing",
            type: "quarterly",
            amount: 300,
            description:
                "Clothing purchases for me and my family. Includes shoes.",
            date_created: "2020-05-04T00:00:00.000Z",
            date_modified: "2020-05-04T00:00:00.000Z",
        },
        {
            id: 7,
            user_id: users[1].id,
            category_name: "Pets",
            type: "monthly",
            amount: 100,
            description: "Pet expenses like food, litter, toys, etc.",
            date_created: "2020-05-06T00:00:00.000Z",
            date_modified: "2020-05-06T00:00:00.000Z",
        },
        {
            id: 8,
            user_id: users[1].id,
            category_name: "Travel",
            type: "yearly",
            amount: 2000,
            description:
                "Expenses from traveling on flying, road trips, food while traveling.",
            date_created: "2020-05-05T00:00:00.000Z",
            date_modified: "2020-05-05T00:00:00.000Z",
        },
    ];
}

function makeExpensesArray(users, categories, paymentMethods) {
    return [
        {
            id: 1,
            user_id: users[0].id,
            date: "2020-05-05T00:00:00.000Z",
            type: "expense",
            amount: 20,
            payee: "Book store",
            category: categories[3].id,
            payment_method: paymentMethods[2].id,
            description: "New Harry Potter book",
            date_created: "2020-05-05T00:00:00.000Z",
            date_modified: "2020-05-05T00:00:00.000Z",
        },
        {
            id: 2,
            user_id: users[0].id,
            date: "2020-05-06T00:00:00.000Z",
            type: "expense",
            amount: 35.23,
            payee: "Gas station",
            category: categories[0].id,
            payment_method: paymentMethods[0].id,
            description: "Gas for truck",
            date_created: "2020-05-06T00:00:00.000Z",
            date_modified: "2020-05-06T00:00:00.000Z",
        },
        {
            id: 3,
            user_id: users[0].id,
            date: "2020-05-07T00:00:00.000Z",
            type: "credit",
            amount: 10.5,
            payee: "Shoe store",
            category: categories[3].id,
            payment_method: paymentMethods[0].id,
            description: "Return sandals that are too big",
            date_created: "2020-05-07T00:00:00.000Z",
            date_modified: "2020-05-07T00:00:00.000Z",
        },
        {
            id: 4,
            user_id: users[0].id,
            date: "2020-05-07T00:00:00.000Z",
            type: "expense",
            amount: 1500,
            payee: "Bank of America",
            category: categories[2].id,
            payment_method: paymentMethods[3].id,
            description: "Mortgage payment",
            date_created: "2020-05-07T00:00:00.000Z",
            date_modified: "2020-05-07T00:00:00.000Z",
        },
        {
            id: 5,
            user_id: users[1].id,
            date: "2020-05-05T00:00:00.000Z",
            type: "expense",
            amount: 20,
            payee: "Office Store",
            category: categories[4].id,
            payment_method: paymentMethods[6].id,
            description: "Get new printer paper",
            date_created: "2020-05-05T00:00:00.000Z",
            date_modified: "2020-05-05T00:00:00.000Z",
        },
        {
            id: 6,
            user_id: users[0].id,
            date: "2020-05-06T00:00:00.000Z",
            type: "expense",
            amount: 120,
            payee: "Pet Store",
            category: categories[6].id,
            payment_method: paymentMethods[5].id,
            description: "Pet food for two months",
            date_created: "2020-05-06T00:00:00.000Z",
            date_modified: "2020-05-06T00:00:00.000Z",
        },
        {
            id: 7,
            user_id: users[0].id,
            date: "2020-05-07T00:00:00.000Z",
            type: "expense",
            amount: 10.5,
            payee: "Old Navy",
            category: categories[5].id,
            payment_method: paymentMethods[6].id,
            description: "Buy new t-shirts",
            date_created: "2020-05-07T00:00:00.000Z",
            date_modified: "2020-05-07T00:00:00.000Z",
        },
        {
            id: 8,
            user_id: users[0].id,
            date: "2020-05-07T00:00:00.000Z",
            type: "expense",
            amount: 250,
            payee: "Hotel",
            category: categories[7].id,
            payment_method: paymentMethods[7].id,
            description: "Hotel while traveling",
            date_created: "2020-05-07T00:00:00.000Z",
            date_modified: "2020-05-07T00:00:00.000Z",
        },
    ];
}

function makeExpensesFixtures() {
    const testUsers = makeUsersArray();
    const testCategories = makeCategoriesArray(testUsers);
    const testPaymentMethods = makePaymentMethodsArray(testUsers);
    const testExpenses = makeExpensesArray(
        testUsers,
        testCategories,
        testPaymentMethods
    );
    return { testUsers, testCategories, testPaymentMethods, testExpenses };
}

function makePaymentMethodsArray(users) {
    return [
        {
            id: 1,
            user_id: users[0].id,
            payment_method_name: "Chase CC",
            type: "offset",
            cycle_start: 9,
            cycle_end: 8,
            description: "Visa card from Chase bank",
            date_created: "2020-05-03T00:00:00.000Z",
            date_modified: "2020-05-03T00:00:00.000Z",
        },
        {
            id: 2,
            user_id: users[0].id,
            payment_method_name: "Wells Fargo CC",
            type: "offset",
            cycle_start: 11,
            cycle_end: 10,
            description: "Mastercard card from Wells Fargo bank",
            date_created: "2020-05-04T00:00:00.000Z",
            date_modified: "2020-05-04T00:00:00.000Z",
        },
        {
            id: 3,
            user_id: users[0].id,
            payment_method_name: "Cash",
            type: "monthly",
            cycle_start: 0,
            cycle_end: 0,
            description: "Payments made with cash (paper and coins)",
            date_created: "2020-05-06T00:00:00.000Z",
            date_modified: "2020-05-06T00:00:00.000Z",
        },
        {
            id: 4,
            user_id: users[0].id,
            payment_method_name: "Check",
            type: "monthly",
            cycle_start: 0,
            cycle_end: 0,
            description: "Payments made with checks (paper only)",
            date_created: "2020-05-05T00:00:00.000Z",
            date_modified: "2020-05-05T00:00:00.000Z",
        },
        {
            id: 5,
            user_id: users[1].id,
            payment_method_name: "Target CC",
            type: "offset",
            cycle_start: 12,
            cycle_end: 11,
            description:
                "Visa card from Target. Use only for Target purchases.",
            date_created: "2020-05-03T00:00:00.000Z",
            date_modified: "2020-05-03T00:00:00.000Z",
        },
        {
            id: 6,
            user_id: users[1].id,
            payment_method_name: "Kroger CC",
            type: "offset",
            cycle_start: 20,
            cycle_end: 19,
            description:
                "Mastercard for Kroger stores. Mostly used for groceries.",
            date_created: "2020-05-04T00:00:00.000Z",
            date_modified: "2020-05-04T00:00:00.000Z",
        },
        {
            id: 7,
            user_id: users[1].id,
            payment_method_name: "Cash",
            type: "monthly",
            cycle_start: 0,
            cycle_end: 0,
            description: "Payments made with cash (paper and coins)",
            date_created: "2020-05-06T00:00:00.000Z",
            date_modified: "2020-05-06T00:00:00.000Z",
        },
        {
            id: 8,
            user_id: users[1].id,
            payment_method_name: "Wells Fargo Bill Pay",
            type: "monthly",
            cycle_start: 0,
            cycle_end: 0,
            description: "Payments made from Bill Pay at Wells Fargo.",
            date_created: "2020-05-05T00:00:00.000Z",
            date_modified: "2020-05-05T00:00:00.000Z",
        },
    ];
}

function makeUsersArray() {
    return [
        {
            id: 1,
            email: "testuser_1@test.com",
            password: "test1",
            date_created: "2019-01-03T00:00:00.000Z",
            date_modified: "2019-01-03T00:00:00.000Z",
        },
        {
            id: 2,
            email: "testuser_2@test.com",
            password: "test2",
            date_created: "2018-08-15T23:00:00.000Z",
            date_modified: "2018-08-15T23:00:00.000Z",
        },
    ];
}

function seedUsers(db, users) {
    const preppedUsers = users.map((user) => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1),
    }));
    return db
        .into("users")
        .insert(preppedUsers)
        .then(() =>
            // update the auto sequence to stay in sync
            db.raw(`SELECT setval('users_id_seq', ?)`, [
                users[users.length - 1].id,
            ])
        );
}

module.exports = {
    cleanTables,
    makeCategoriesArray,
    makeExpensesArray,
    makeExpensesFixtures,
    makePaymentMethodsArray,
    makeUsersArray,
    seedUsers,
};
