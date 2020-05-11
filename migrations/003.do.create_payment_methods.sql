CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE
    SET
        NULL,
        payment_method_name TEXT NOT NULL,
        cycle_type TEXT NOT NULL,
        cycle_start INTEGER NOT NULL,
        cycle_end INTEGER NOT NULL,
        description TEXT,
        date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
        date_modified TIMESTAMPTZ
);