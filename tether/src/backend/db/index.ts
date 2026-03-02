import Database from 'better-sqlite3';
import path from 'path';

// Define the database path (can be absolute or relative)
const dbPath = process.env.DB_PATH || path.resolve('tether.db');

export const db = new Database(dbPath, { verbose: console.log });

// Enable Write-Ahead Logging for better concurrent performance
db.pragma('journal_mode = WAL');

// Initialize schema
export const initDb = () => {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS ideas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                type TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS collisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                idea_ids TEXT NOT NULL,
                combined_text TEXT NOT NULL,
                title TEXT,
                logline TEXT,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize database:", error);
    }
};
