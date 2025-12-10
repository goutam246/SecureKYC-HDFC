import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, 'kyc_database.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Improve concurrency and reduce write contention for small multi-user load
    db.run('PRAGMA journal_mode=WAL;');
    db.run('PRAGMA synchronous=NORMAL;');
    db.run('PRAGMA busy_timeout=5000;'); // wait up to 5s on locked DB
  }
});

// Promisify database methods - sqlite3 has a different callback signature
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT UNIQUE NOT NULL,
        username TEXT,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // KYC Applications table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS kyc_applications (
        id TEXT PRIMARY KEY,
        application_id TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        current_step INTEGER DEFAULT 1,
        full_name TEXT,
        date_of_birth TEXT,
        address TEXT,
        gender TEXT,
        rejection_reason TEXT,
        face_match_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Documents table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        document_type TEXT NOT NULL,
        file_path TEXT,
        file_name TEXT,
        file_size INTEGER,
        file_type TEXT,
        status TEXT DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES kyc_applications(application_id) ON DELETE CASCADE,
        UNIQUE(application_id, document_type)
      )
    `);

    // Photos table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        photo_type TEXT NOT NULL,
        file_path TEXT,
        file_name TEXT,
        file_size INTEGER,
        file_type TEXT,
        status TEXT DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        face_match_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES kyc_applications(application_id) ON DELETE CASCADE,
        UNIQUE(application_id, photo_type)
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_applications(user_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_kyc_application_id ON kyc_applications(application_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_photos_application_id ON photos(application_id)`);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Database helper functions
export const dbHelpers = {
  run: dbRun,
  get: dbGet,
  all: dbAll,
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

export default db;

