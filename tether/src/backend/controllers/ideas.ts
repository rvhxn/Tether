import type { Request, Response } from 'express';
import { db } from '../db/index.js';

// GET /api/ideas
export const getIdeas = (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM ideas';
        const params: any[] = [];

        if (type && type !== 'All') {
            query += ' WHERE type = ?';
            params.push(type);
        }

        query += ' ORDER BY created_at DESC';

        const stmt = db.prepare(query);
        const ideas = stmt.all(...params);
        res.json(ideas);
    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
};

// GET /api/ideas/random
export const getRandomIdeas = (req: Request, res: Response) => {
    try {
        const countQuery = req.query.count;
        const countStr = Array.isArray(countQuery) ? countQuery[0] as string : countQuery as string;
        const count = parseInt(countStr) || 3;
        const stmt = db.prepare('SELECT * FROM ideas ORDER BY RANDOM() LIMIT ?');
        const ideas = stmt.all(count);
        res.json(ideas);
    } catch (error) {
        console.error('Error fetching random ideas:', error);
        res.status(500).json({ error: 'Failed to fetch random ideas' });
    }
};

// POST /api/ideas
export const createIdea = (req: Request, res: Response) => {
    try {
        const { content, type } = req.body;
        if (!content || !type) {
            return res.status(400).json({ error: 'Content and Type are required' });
        }
        const stmt = db.prepare('INSERT INTO ideas (content, type) VALUES (?, ?)');
        const result = stmt.run(content, type);
        res.status(201).json({ id: result.lastInsertRowid, content, type });
    } catch (error) {
        console.error('Error creating idea:', error);
        res.status(500).json({ error: 'Failed to create idea' });
    }
};

// PUT /api/ideas/:id
export const updateIdea = (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { content, type } = req.body;
        if (!content || !type) {
            return res.status(400).json({ error: 'Content and Type are required' });
        }
        const stmt = db.prepare('UPDATE ideas SET content = ?, type = ? WHERE id = ?');
        stmt.run(content, type, id);
        res.json({ id: parseInt(id), content, type });
    } catch (error) {
        console.error('Error updating idea:', error);
        res.status(500).json({ error: 'Failed to update idea' });
    }
};

// DELETE /api/ideas/:id
export const deleteIdea = (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const stmt = db.prepare('DELETE FROM ideas WHERE id = ?');
        stmt.run(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting idea:', error);
        res.status(500).json({ error: 'Failed to delete idea' });
    }
};
