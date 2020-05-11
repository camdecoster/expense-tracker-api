CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE
    SET
        NULL,
        date TIMESTAMPTZ NOT NULL,
        type TEXT NOT NULL,
        amount MONEY NOT NULL,
        payee TEXT NOT NULL,
        category INTEGER REFERENCES categories(id) ON DELETE
    SET
        NULL,
        payment_method INTEGER REFERENCES payment_methods(id) ON DELETE
    SET
        NULL,
        description TEXT,
        date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
        date_modified TIMESTAMPTZ
);