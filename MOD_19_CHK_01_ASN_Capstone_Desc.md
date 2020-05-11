# Expense Tracker

You might ask yourself, where do I spend my money? Most people can think of big items like rent and car payments, but then it starts to get fuzzy. Did I buy pizza this week or last week? How much did I spend on groceries? **Expense Tracker** aims to help people track their spending by making it easy to add an expense and quickly see where money is being spent by category. You set the categories, you set the payment methods, then you start tracking. This will help a user in two ways:

1. Show how closely they are following their budget
1. Create a financial log which can be referred to in the future

After creating an account, the user will need to get things set up. This will include creating a list of categories with associated budgets, as well as creating a list of payment methods (credit card, cash, etc.). **Expense Tracker** will even show how much money you've spent using your credit card per billing cycle.

The add expense page will be simple and ask the user for the following items:

1. Transaction date (default to current date)
1. Expense type (expense or credit, default to expense)
1. Amount
1. Payee
1. Description (optional)
1. Category
1. Payment method

With the expenses entered, a dashboard will present information about the current month (or recent months). This will include showing spending by category with budget expenses and remaining budget, some charts breaking down spending by category, category spending over time, etc. The emphasis will be on keeping things simple, such that my wife would use it.

The backend will be built using Node/Express with storage in a PostgreSQL database. The frontend will be built using React and be responsive so that it will be easy to use on a phone.

Future features will include:

-   Email notifications
-   Annual budget tracking
-   Quarterly budget tracking
-   Rolling budget tracking
-   Add multiple expenses at once
-   Bill tracking?
-   Give user points for tracking (like a videogame)?
