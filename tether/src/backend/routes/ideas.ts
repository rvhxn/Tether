import { Router } from 'express';
import { getIdeas, getRandomIdeas, createIdea, updateIdea, deleteIdea } from '../controllers/ideas.js';

const router = Router();

// Define routes (order matters for static vs parameterized)
router.get('/random', getRandomIdeas);
router.get('/', getIdeas);
router.post('/', createIdea);
router.put('/:id', updateIdea);
router.delete('/:id', deleteIdea);

export default router;
