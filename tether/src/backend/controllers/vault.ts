import { Request, Response } from 'express';
import { db } from '../db/index.js';

// GET /api/vault
export const getVaultCollisions = (req: Request, res: Response) => {
    try {
        const stmt = db.prepare('SELECT * FROM collisions ORDER BY created_at DESC');
        const collisions = stmt.all();
        res.json(collisions);
    } catch (error) {
        console.error('Error fetching vault collisions:', error);
        res.status(500).json({ error: 'Failed to fetch vault collisions' });
    }
};

// POST /api/vault
export const saveVaultCollision = (req: Request, res: Response) => {
    try {
        const { idea_ids, combined_text, title, logline, tags } = req.body;

        if (!idea_ids || !combined_text) {
            return res.status(400).json({ error: 'idea_ids array and combined_text are required' });
        }

        const stmt = db.prepare('INSERT INTO collisions (idea_ids, combined_text, title, logline, tags) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(JSON.stringify(idea_ids), combined_text, title || null, logline || null, tags || null);

        res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
        console.error('Error saving vault collision:', error);
        res.status(500).json({ error: 'Failed to save vault collision' });
    }
};

// DELETE /api/vault/:id
export const deleteVaultCollision = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM collisions WHERE id = ?');
        stmt.run(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting vault collision:', error);
        res.status(500).json({ error: 'Failed to delete vault collision' });
    }
};
