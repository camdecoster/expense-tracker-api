INSERT INTO
    payment_methods (
        user_id,
        payment_method_name,
        cycle_type,
        cycle_start,
        cycle_end,
        description,
        date_created,
        date_modified
    )
VALUES
    (
        '1',
        'Chase CC',
        'offset',
        '9',
        '8',
        'Visa card from Chase bank',
        '2020-05-03T00:00:00.000Z',
        '2020-05-03T00:00:00.000Z'
    ),
    (
        '1',
        'Wells Fargo CC',
        'offset',
        '11',
        '10',
        'Mastercard card from Wells Fargo bank',
        '2020-05-04T00:00:00.000Z',
        '2020-05-04T00:00:00.000Z'
    ),
    (
        '1',
        'Cash',
        'monthly',
        '0',
        '0',
        'Payments made with cash (paper and coins)',
        '2020-05-06T00:00:00.000Z',
        '2020-05-06T00:00:00.000Z'
    ),
    (
        '1',
        'Check',
        'monthly',
        '0',
        '0',
        'Payments made with checks (paper only)',
        '2020-05-05T00:00:00.000Z',
        '2020-05-05T00:00:00.000Z'
    ),
    (
        '2',
        'Target CC',
        'offset',
        '12',
        '11',
        'Visa card from Target. Use only for Target purchases.',
        '2020-05-03T00:00:00.000Z',
        '2020-05-03T00:00:00.000Z'
    ),
    (
        '2',
        'Kroger CC',
        'offset',
        '20',
        '19',
        'Mastercard for Kroger stores. Mostly used for groceries.',
        '2020-05-04T00:00:00.000Z',
        '2020-05-04T00:00:00.000Z'
    ),
    (
        '2',
        'Cash',
        'monthly',
        '0',
        '0',
        'Payments made with cash (paper and coins)',
        '2020-05-06T00:00:00.000Z',
        '2020-05-06T00:00:00.000Z'
    ),
    (
        '2',
        'Wells Fargo Bill Pay',
        'monthly',
        '0',
        '0',
        'Payments made from Bill Pay at Wells Fargo.',
        '2020-05-05T00:00:00.000Z',
        '2020-05-05T00:00:00.000Z'
    )