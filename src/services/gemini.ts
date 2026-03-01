import { GoogleGenAI } from '@google/genai';

// In a real app, use environment variables. For MVP, we can mock or pass a key directly.
const getGenAIClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export async function generatePitch(apiKey: string, combinedIdeas: string) {
    try {
        const ai = getGenAIClient(apiKey);
        const prompt = `You are a professional screenwriter. Read the following combined random ideas and generate a creative movie or novel concept.\n\nIdeas: ${combinedIdeas}\n\nProvide the output strictly in two parts: a creative 'Title' and a 'Logline' (max 2 sentences).\nFormat exactly as:\nTitle: <title>\nLogline: <logline>`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        const titleMatch = text?.match(/Title:\s*(.*)/i);
        const loglineMatch = text?.match(/Logline:\s*(.*)/i);

        return {
            title: titleMatch ? titleMatch[1].trim() : 'Untitled Concept',
            logline: loglineMatch ? loglineMatch[1].trim() : 'A mysterious new idea blossoms from the chaos.',
            fullText: text || '',
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
