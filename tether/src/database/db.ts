import * as SQLite from 'expo-sqlite';

export const dbName = 'tether.db';

export async function initDb() {
    const db = await SQLite.openDatabaseAsync(dbName);

    await db.execAsync(`
    PRAGMA journal_mode = WAL;

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
}

export async function addIdea(content: string, type: string) {
    const db = await SQLite.openDatabaseAsync(dbName);
    const result = await db.runAsync(
        'INSERT INTO ideas (content, type) VALUES (?, ?)',
        content, type
    );
    return result.lastInsertRowId;
}

export async function getIdeas() {
    const db = await SQLite.openDatabaseAsync(dbName);
    return await db.getAllAsync<{ id: number, content: string, type: string, created_at: string }>('SELECT * FROM ideas ORDER BY created_at DESC');
}

export async function getRandomIdeas(count: number) {
    const db = await SQLite.openDatabaseAsync(dbName);
    return await db.getAllAsync<{ id: number, content: string, type: string, created_at: string }>(
        'SELECT * FROM ideas ORDER BY RANDOM() LIMIT ?',
        [count]
    );
}

export async function saveCollision(idea_ids: number[], combined_text: string, title?: string, logline?: string, tags?: string) {
    const db = await SQLite.openDatabaseAsync(dbName);
    const result = await db.runAsync(
        'INSERT INTO collisions (idea_ids, combined_text, title, logline, tags) VALUES (?, ?, ?, ?, ?)',
        JSON.stringify(idea_ids), combined_text, title || null, logline || null, tags || null
    );
    return result.lastInsertRowId;
}

export async function getCollisions() {
    const db = await SQLite.openDatabaseAsync(dbName);
    return await db.getAllAsync<{
        id: number,
        idea_ids: string,
        combined_text: string,
        title: string | null,
        logline: string | null,
        tags: string | null,
        created_at: string
    }>('SELECT * FROM collisions ORDER BY created_at DESC');
}
