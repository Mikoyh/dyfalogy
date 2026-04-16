import { GoogleGenAI, Type } from "@google/genai";

// Use a getter to initialize the AI client only when needed, 
// and use import.meta.env for Vite compatibility.
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    // Check both import.meta.env (Vite) and process.env (Node/Define)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
      return null;
    }
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
};

export const getGeminiResponse = async (prompt: string, history: { role: string, parts: { text: string }[] }[] = []) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");
  
  // Use the standard SDK pattern
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are dyfalogy AI, an expert Biology tutor specializing in OSP (Olimpiade Sains Provinsi) Biologi. You help students understand complex biological concepts, provide study strategies, and solve practice problems. Keep your tone encouraging, professional, and clear. Use Indonesian as the primary language, but use scientific terms correctly.",
  });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: h.parts
    }))
  });

  const result = await chat.sendMessage(prompt);
  return result.response.text();
};

export const generateQuiz = async (topicTitle: string, topicContent: string) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");

  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  const prompt = `Buatkan 10 soal pilihan ganda (A, B, C, D, E) tentang topik: ${topicTitle}. 
    Gunakan materi berikut sebagai referensi: ${topicContent}.
    Berikan jawaban yang benar untuk setiap soal.
    Format output harus JSON ARRAY of OBJECTS dengan struktur:
    [
      {
        "question": "teks soal",
        "options": ["A", "B", "C", "D", "E"],
        "correctAnswer": 0, // index dari options (0-4)
        "explanation": "penjelasan singkat"
      }
    ]`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
