import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'kyc_database.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database\n');
});

// Function to display table data
function displayTable(tableName) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TABLE: ${tableName.toUpperCase()}`);
    console.log('='.repeat(60));
    
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      if (err) {
        console.error(`Error reading ${tableName}:`, err);
        reject(err);
        return;
      }
      
      if (rows.length === 0) {
        console.log('(No data)');
      } else {
        // Display headers
        const firstRow = rows[0];
        const headers = Object.keys(firstRow);
        console.log(headers.join(' | '));
        console.log('-'.repeat(60));
        
        // Display rows
        rows.forEach(row => {
          const values = headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'string' && val.length > 30) {
              return val.substring(0, 27) + '...';
            }
            return String(val);
          });
          console.log(values.join(' | '));
        });
        
        console.log(`\nTotal rows: ${rows.length}`);
      }
      
      resolve();
    });
  });
}

// Main function
async function viewDatabase() {
  try {
    // Get all tables
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.name));
      });
    });
    
    console.log('Available tables:', tables.join(', '));
    
    // Display each table
    for (const table of tables) {
      await displayTable(table);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    for (const table of tables) {
      const count = await new Promise((resolve) => {
        db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
          resolve(err ? 0 : row.count);
        });
      });
      console.log(`${table}: ${count} row(s)`);
    }
    
    db.close();
    console.log('\nDatabase connection closed.');
  } catch (error) {
    console.error('Error:', error);
    db.close();
    process.exit(1);
  }
}

viewDatabase();



