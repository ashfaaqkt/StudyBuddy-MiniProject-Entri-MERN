import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const isApiKeyValid = (key) => {
    return key && key.length > 20 && !key.includes("YOUR_API_KEY");
};

const genAI = new GoogleGenerativeAI(isApiKeyValid(API_KEY) ? API_KEY : "DUMMY_KEY");

const MODEL_CANDIDATES = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-pro"
];

const MAX_INPUT_CHARS = 8000;

const MOCK_QUIZ = [
    {
        id: 1,
        question: "Real AI is currently unavailable. (Check Console for error details)",
        options: ["Check API Key", "Retry", "Use Offline Mode", "Help"],
        correctAnswer: "Check API Key"
    }
];

const parseJSONResponse = (text) => {
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        const jsonMatch = text.match(/\[\s*\{.*\}\s*\]|\{\s*.*\s*\}/s);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0].trim());
            } catch (e2) { }
        }
        throw new Error("Invalid AI format");
    }
};

const normalizeContent = (content) => {
    if (!content) return '';
    if (content.length <= MAX_INPUT_CHARS) return content;
    return content.slice(0, MAX_INPUT_CHARS) + "\n[Truncated]";
};

const tryGenerate = async (prompt, options = {}) => {
    if (!isApiKeyValid(API_KEY)) {
        console.warn("⚠️ [Mock AI] API Key is missing or invalid. Check your .env file.");
        throw new Error("Missing API Key");
    }

    console.log(" Key Info:", { length: API_KEY.length, firstChars: API_KEY.substring(0, 5) });

    let lastError = null;

    for (const modelName of MODEL_CANDIDATES) {
        for (const version of ['v1', 'v1beta']) {
            try {
                const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${API_KEY}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: options
                    })
                });

                if (!response.ok) continue;

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    console.log(`✅ [AI] Success using ${modelName}`);
                    return text;
                }
            } catch (error) {
                // Silent catch, try next
            }
        }
    }

    throw new Error("AI Generation failed. Check API key or connection.");
};


const extractSentences = (text) => {
    if (!text) return [];
    const sentences = text
        .replace(/\s+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 25);
    return sentences.length ? sentences : text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
};

const stopwords = new Set([
    "the", "and", "with", "from", "that", "this", "there", "their", "have", "has", "been", "were", "what", "when", "where", "which", "will", "would", "could", "should", "about", "into", "over", "under", "after", "before", "during", "while", "your", "ours", "they", "them", "then", "than", "also"
]);

const pickKeyword = (sentence) => {
    const words = sentence
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((w) => w.toLowerCase())
        .filter((w) => w.length > 4 && !stopwords.has(w));
    return words[0] || null;
};

const buildFallbackSummary = (content) => {
    const sentences = extractSentences(content).slice(0, 5);
    if (!sentences.length) return "No content provided.";
    return sentences.map((s) => `• ${s}`).join("\n");
};

const buildFallbackTable = (content) => {
    const sentences = extractSentences(content).slice(0, 4);
    const rows = sentences.length ? sentences : ["No content provided."];
    const rowHtml = rows
        .map((s, index) => {
            const topic = s.split(' ').slice(0, 3).join(' ') || `Topic ${index + 1}`;
            const keyPoints = s.length > 120 ? `${s.slice(0, 120)}...` : s;
            return `<tr><td>${topic}</td><td>${keyPoints}</td><td>See notes</td></tr>`;
        })
        .join("");
    return `<table class="sb-ai-table"><thead><tr><th>Topic</th><th>Key Points</th><th>Example</th></tr></thead><tbody>${rowHtml}</tbody></table>`;
};

const buildFallbackQuiz = (content) => {
    const sentences = extractSentences(content);
    if (!sentences.length) return MOCK_QUIZ;

    const questions = [];
    for (let i = 0; i < 5; i += 1) {
        const sentence = sentences[i % sentences.length];
        const keyword = pickKeyword(sentence) || "the notes";
        const decoys = sentences.filter((s) => s !== sentence && !s.toLowerCase().includes(keyword)).slice(0, 3);
        while (decoys.length < 3) decoys.push("Not mentioned in the notes.");
        const options = [sentence, ...decoys].map((s) => (s.length > 140 ? `${s.slice(0, 140)}...` : s));
        const shuffled = options.sort(() => Math.random() - 0.5);
        questions.push({
            id: i + 1,
            question: `Which statement in your notes is associated with \"${keyword}\"?`,
            options: shuffled,
            correctAnswer: sentence.length > 140 ? `${sentence.slice(0, 140)}...` : sentence
        });
    }
    return questions;
};

const buildFallbackRewrite = (content, style) => {
    if (!content) return "No content provided.";
    const header = style ? `Rewrite (${style})` : 'Rewrite';
    return `${header}:\n${content}`;
};

export const generateQuizFromNote = async (noteContent) => {
    try {
        const trimmed = normalizeContent(noteContent);
        const prompt = `You are creating a quiz from study notes.
Generate exactly 5 multiple-choice questions based ONLY on the notes.
Return a JSON array with 5 objects:
[
  {"id":1,"question":"...","options":["A","B","C","D"],"correctAnswer":"..."}
]
Rules: 4 options, only one correct answer, ids must be 1-5, no extra text.
Notes:
${trimmed}`;

        const responseText = await tryGenerate(prompt);
        return parseJSONResponse(responseText);
    } catch (error) {
        return buildFallbackQuiz(noteContent);
    }
};

export const rewriteNote = async (noteContent, style = 'neutral') => {
    try {
        const trimmed = normalizeContent(noteContent);
        const prompt = `Rewrite the following notes in a ${style} writing style.
Keep the meaning intact. Preserve lists where possible. Return plain text.
Notes:
${trimmed}`;
        return await tryGenerate(prompt);
    } catch (error) {
        return buildFallbackRewrite(noteContent, style);
    }
};

export const summarizeNote = async (noteContent) => {
    try {
        const trimmed = normalizeContent(noteContent);
        const prompt = `Summarize the following notes into 4-6 concise bullet points.
Keep each bullet short and high signal. Return plain text bullet points.
Notes:
${trimmed}`;
        return await tryGenerate(prompt);
    } catch (error) {
        return buildFallbackSummary(noteContent);
    }
};

export const generateNoteTable = async (noteContent) => {
    if (!API_KEY) {
        return buildFallbackTable(noteContent);
    }

    try {
        const trimmed = normalizeContent(noteContent);
        const prompt = `
Create a concise HTML table that summarizes the notes.
Rules:
- Return ONLY the <table>...</table> HTML (no markdown, no backticks, no extra text).
- Include class="sb-ai-table" on the <table>.
- Use 3 columns: Topic, Key Points, Example.
- Keep 3–6 rows.
Notes:
${trimmed}
        `.trim();

        return await tryGenerate(prompt);
    } catch (error) {
        console.error("AI Table Error:", error);
        return buildFallbackTable(noteContent);
    }
};

export const chatWithGemini = async (messages) => {
    try {
        const historyPrompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
        const systemPrompt = "You are Gemini, a helpful study assistant. Keep answers concise, clear, and relevant to students. Use markdown for simple formatting if needed (bold, lists).";
        const finalPrompt = `${systemPrompt}\n\nChat History:\n${historyPrompt}\nAssistant:`;

        return await tryGenerate(finalPrompt);
    } catch (error) {
        throw error;
    }
};

