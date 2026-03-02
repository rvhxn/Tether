import Constants from 'expo-constants';

const getBaseUrl = () => {
    // debuggerHost is 'IP:PORT'. We want the IP.
    const debuggerHost = Constants.expoConfig?.hostUri;
    const host = debuggerHost?.split(':')[0] || 'localhost';
    return `http://${host}:3000/api`;
};

const API_BASE_URL = getBaseUrl();
console.log('🔗 API Base URL:', API_BASE_URL);

export const fetchIdeas = async (type: string = 'All') => {
    let url = `${API_BASE_URL}/ideas`;
    if (type !== 'All') {
        url += `?type=${encodeURIComponent(type)}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch ideas');
    return response.json();
};

export const fetchRandomIdeas = async (count: number = 3) => {
    const response = await fetch(`${API_BASE_URL}/ideas/random?count=${count}`);
    if (!response.ok) throw new Error('Failed to fetch random ideas');
    return response.json();
};

export const createIdea = async (content: string, type: string) => {
    const response = await fetch(`${API_BASE_URL}/ideas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, type })
    });
    if (!response.ok) throw new Error('Failed to create idea');
    return response.json();
};

export const updateIdea = async (id: number, content: string, type: string) => {
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, type })
    });
    if (!response.ok) throw new Error('Failed to update idea');
    return response.json();
};

export const deleteIdea = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/ideas/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete idea');
};

export const fetchVaultCollisions = async () => {
    const response = await fetch(`${API_BASE_URL}/vault`);
    if (!response.ok) throw new Error('Failed to fetch vault collisions');
    return response.json();
};

export const saveCollision = async (idea_ids: number[], combined_text: string, title?: string, logline?: string, tags?: string) => {
    const response = await fetch(`${API_BASE_URL}/vault`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idea_ids, combined_text, title, logline, tags })
    });
    if (!response.ok) throw new Error('Failed to save collision to vault');
    return response.json();
};

export const deleteVaultCollision = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/vault/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete vault collision');
};

export const generateAIPitch = async (combinedIdeas: string) => {
    const response = await fetch(`${API_BASE_URL}/pitch/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ combinedIdeas })
    });
    if (!response.ok) throw new Error('Failed to generate AI pitch');
    return response.json();
};
