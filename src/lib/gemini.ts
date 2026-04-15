import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getGeminiResponse = async (prompt: string, history: { role: string, parts: { text: string }[] }[] = []) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: "You are dyfalogy AI, an expert Biology tutor specializing in OSP (Olimpiade Sains Provinsi) Biologi. You help students understand complex biological concepts, provide study strategies, and solve practice problems. Keep your tone encouraging, professional, and clear. Use Indonesian as the primary language, but use scientific terms correctly.",
    }
  });

  return response.text;
};

export const generateQuiz = async (topicTitle: string, topicContent: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Buatkan 10 soal pilihan ganda (A, B, C, D, E) tentang topik: ${topicTitle}. 
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
    ]`,
    config: {
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

  return JSON.parse(response.text);
};
