import { GoogleGenAI, Type } from "@google/genai";

// Use a getter to initialize the AI client only when needed.
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    // Rely on Vite's define for process.env.GEMINI_API_KEY
    // @ts-ignore
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const getGeminiResponse = async (prompt: string, history: any[] = []) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");
  
  // Combine history and current prompt into contents for generateContent
  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: h.parts
    })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: "You are dyfalogy AI, an expert Biology tutor specializing in OSP (Olimpiade Sains Provinsi) Biologi. You help students understand complex biological concepts, provide study strategies, and solve practice problems. Keep your tone encouraging, professional, and clear. Use Indonesian as the primary language, but use scientific terms correctly.",
    }
  });

  return response.text;
};

export const generateQuiz = async (topicTitle: string, topicContent: string, count: number = 10) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");

  const prompt = `Buatkan ${count} soal pilihan ganda (A, B, C, D, E) tentang topik: ${topicTitle}. 
    Gunakan materi berikut sebagai referensi: ${topicContent}.
    Berikan jawaban yang benar untuk setiap soal.
    
    CRITICAL: Untuk field 'explanation', berikan penjelasan yang sangat mendetail yang tidak hanya menjelaskan mengapa jawaban yang benar itu tepat, tetapi juga memberikan pengertian/definisi singkat dari opsi-opsi lain yang salah agar siswa bisa belajar lebih banyak.
    
    Format output harus JSON ARRAY of OBJECTS dengan struktur:
    [
      {
        "question": "teks soal",
        "options": ["A", "B", "C", "D", "E"],
        "correctAnswer": 0, // index dari options (0-4)
        "explanation": "Penjelasan mendalam: Jawaban [A] benar karena... Sedangkan [B] adalah... [C] merujuk pada... dst."
      }
    ]`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
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
