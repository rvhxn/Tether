import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/index.js';
import ideasRouter from './routes/ideas.js';
import vaultRouter from './routes/vault.js';
import pitchRouter from './routes/pitch.js';

dotenv.config();

// Initialize the local SQLite database
initDb();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/ideas', ideasRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/pitch', pitchRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'tether-backend' });
});

app.listen(PORT, () => {
    console.log(`Tether backend server running on http://localhost:${PORT}`);
});
