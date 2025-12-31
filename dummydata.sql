insert into users (id, name, email) values
('11111111-1111-1111-1111-111111111111', 'Rahul Sharma', 'rahul@example.com'),
('22222222-2222-2222-2222-222222222222', 'Anita Verma', 'anita@example.com');
insert into accounts (id, user_id, name, balance) values
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Cash Wallet', 5000),
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Bank Account', 25000),

('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'Savings', 40000);
insert into categories (id, user_id, name, type) values
-- Rahul categories
('ccccccc1-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', 'Food', 'expense'),
('ccccccc2-cccc-cccc-cccc-ccccccccccc2', '11111111-1111-1111-1111-111111111111', 'Transport', 'expense'),
('ccccccc3-cccc-cccc-cccc-ccccccccccc3', '11111111-1111-1111-1111-111111111111', 'Salary', 'income'),

-- Anita categories
('ddddddd1-dddd-dddd-dddd-ddddddddddd1', '22222222-2222-2222-2222-222222222222', 'Shopping', 'expense'),
('ddddddd2-dddd-dddd-dddd-ddddddddddd2', '22222222-2222-2222-2222-222222222222', 'Freelance', 'income');
insert into transactions (
  id, user_id, account_id, category_id, type, amount, description, transaction_date
) values
-- Rahul transactions
(
  'tx111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'ccccccc1-cccc-cccc-cccc-ccccccccccc1',
  'expense',
  250,
  'Lunch at restaurant',
  '2025-01-05'
),
(
  'tx222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  'ccccccc3-cccc-cccc-cccc-ccccccccccc3',
  'income',
  50000,
  'January Salary',
  '2025-01-01'
),

-- Anita transactions
(
  'tx333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'ddddddd1-dddd-dddd-dddd-ddddddddddd1',
  'expense',
  3200,
  'Online shopping',
  '2025-01-07'
),
(
  'tx444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'ddddddd2-dddd-dddd-dddd-ddddddddddd2',
  'income',
  15000,
  'Freelance project payment',
  '2025-01-03'
);
