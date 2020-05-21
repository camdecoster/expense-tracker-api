CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE
    SET
        NULL,
        category_name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL NOT NULL,
        description TEXT,
        date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
        date_modified TIMESTAMPTZ
);