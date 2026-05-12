const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Open (or create) the database file
const dbPath = process.env.DB_PATH || path.join(__dirname, 'gymlog.db');
const db = new Database(dbPath);

// Enable foreign keys (off by default in SQLite)
db.pragma('foreign_keys = ON');

// Run the schema to create tables if they don't exist
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

console.log('Database ready at', dbPath);

module.exports = db;