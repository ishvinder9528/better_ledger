CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL
);

CREATE TABLE financial_records (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Seed Data
INSERT INTO customers (id, name, email, phone) VALUES
('C001', 'Innovate Inc.', 'contact@innovate.com', '123-456-7890'),
('C002', 'Solutions Co.', 'support@solutions.co', '987-654-3210'),
('C003', 'Tech Giants LLC', 'admin@techgiants.com', '555-123-4567');

INSERT INTO financial_records (id, customerId, date, amount, type, description) VALUES
('R001', 'C001', '2023-10-01', 1500.0, 'invoice', 'Q3 Web Development Services'),
('R002', 'C001', '2023-10-15', -1500.0, 'payment', 'Payment for INV-001'),
('R003', 'C002', '2023-11-05', 3200.5, 'invoice', 'Cloud Consulting Services'),
('R004', 'C003', '2023-11-10', 5000.0, 'invoice', 'Software License Renewal'),
('R005', 'C002', '2023-11-20', -3200.5, 'payment', 'Payment for INV-002'),
('R006', 'C001', '2023-12-01', 1800.0, 'invoice', 'Q4 Web Development Services'),
('R007', 'C003', '2023-12-12', -2500.0, 'payment', 'Partial payment for INV-003'),
('R008', 'C001', '2023-12-15', -1800.0, 'payment', 'Payment for INV-004'),
('R009', 'C002', '2024-01-05', -50.0, 'refund', 'Credit for service outage'),
('R010', 'C003', '2024-01-20', -2500.0, 'payment', 'Final payment for INV-003');
