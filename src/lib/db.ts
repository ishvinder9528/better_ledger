import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Customer, FinancialRecord } from './types';
import { initialCustomers, initialRecords } from './data';

const dbPath = path.join(process.cwd(), 'ledger.db');
const dbExists = fs.existsSync(dbPath);
const db = new Database(dbPath);

// Initialize DB if it doesn't exist
if (!dbExists) {
  console.log("Database not found. Initializing...");
  try {
    // Create tables
    db.exec(`
      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT
      );
    `);
    db.exec(`
      CREATE TABLE financial_records (
        id TEXT PRIMARY KEY,
        customerId TEXT,
        date TEXT,
        amount REAL,
        type TEXT,
        description TEXT,
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );
    `);
    
    // Seed data
    const insertCustomer = db.prepare('INSERT INTO customers (id, name, email, phone) VALUES (?, ?, ?, ?)');
    const insertRecord = db.prepare('INSERT INTO financial_records (id, customerId, date, amount, type, description) VALUES (?, ?, ?, ?, ?, ?)');
    
    const insertManyCustomers = db.transaction((customers) => {
      for (const customer of customers) insertCustomer.run(customer.id, customer.name, customer.email, customer.phone);
    });
    
    const insertManyRecords = db.transaction((records) => {
      for (const record of records) insertRecord.run(record.id, record.customerId, record.date, record.amount, record.type, record.description);
    });

    insertManyCustomers(initialCustomers);
    insertManyRecords(initialRecords);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Customer Functions
export function getCustomers(): Customer[] {
  return db.prepare('SELECT * FROM customers ORDER BY name ASC').all() as Customer[];
}

export function getCustomerById(id: string): Customer | null {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer;
  return customer || null;
}

export function addCustomer(customer: Omit<Customer, 'id'>): Customer {
  const newId = `C${String(Date.now())}${Math.floor(Math.random() * 100)}`;
  db.prepare('INSERT INTO customers (id, name, email, phone) VALUES (?, ?, ?, ?)')
    .run(newId, customer.name, customer.email, customer.phone);
  return { id: newId, ...customer };
}

export function updateCustomer(customer: Customer): Customer {
  db.prepare('UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?')
    .run(customer.name, customer.email, customer.phone, customer.id);
  return customer;
}

export function deleteCustomer(id: string): { id: string } {
  db.prepare('DELETE FROM financial_records WHERE customerId = ?').run(id);
  db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  return { id };
}

// Financial Record Functions
export function getRecords(customerId: string): FinancialRecord[] {
  return db.prepare('SELECT * FROM financial_records WHERE customerId = ? ORDER BY date DESC').all(customerId) as FinancialRecord[];
}

export function addRecord(record: Omit<FinancialRecord, 'id'>): FinancialRecord {
  const newId = `R${String(Date.now())}${Math.floor(Math.random() * 100)}`;
  db.prepare('INSERT INTO financial_records (id, customerId, date, amount, type, description) VALUES (?, ?, ?, ?, ?, ?)')
    .run(newId, record.customerId, record.date, record.amount, record.type, record.description);
  return { id: newId, ...record };
}

export function updateRecord(record: FinancialRecord): FinancialRecord {
  db.prepare('UPDATE financial_records SET date = ?, amount = ?, type = ?, description = ? WHERE id = ?')
    .run(record.date, record.amount, record.type, record.description, record.id);
  return record;
}

export function deleteRecord(id: string): { id: string } {
  db.prepare('DELETE FROM financial_records WHERE id = ?').run(id);
  return { id };
}
