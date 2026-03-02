import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const GENRE_LIST = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy",
    "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller", "Western"
];

// POST /api/pitch/generate
export const generatePitch = async (req: Request, res: Response) => {
    try {
        const { combinedIdeas } = req.body;

        if (!combinedIdeas) {
            return res.status(400).json({ error: 'combinedIdeas is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server GEMINI_API_KEY is not configured securely.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a professional screenwriter. Read the following combined random ideas and generate a creative movie or novel concept.\n\nIdeas: ${combinedIdeas}\n\nProvide the output strictly in three parts: a creative 'Title', a 'Logline' (max 2 sentences), and ONE 'Genre' chosen exactly from this list: [${GENRE_LIST.join(', ')}].\nFormat exactly as:\nTitle: <title>\nLogline: <logline>\nGenre: <genre>`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        const titleMatch = text?.match(/Title:\s*(.*)/i);
        const loglineMatch = text?.match(/Logline:\s*(.*)/i);
        const genreMatch = text?.match(/Genre:\s*(.*)/i);

        const pitchData = {
            title: titleMatch ? titleMatch[1].trim() : 'Untitled Concept',
            logline: loglineMatch ? loglineMatch[1].trim() : 'A mysterious new idea blossoms from the chaos.',
            genre: genreMatch ? genreMatch[1].trim() : 'Sci-Fi',
            fullText: text || '',
        };

        res.json(pitchData);
    } catch (error) {
        console.error('Error generating pitch:', error);
        res.status(500).json({ error: 'Failed to generate pitch with AI' });
    }
};
