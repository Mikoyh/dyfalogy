import { GoogleGenAI, Type } from "@google/genai";

// Use a getter to initialize the AI client only when needed.
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    // Rely on process.env.GEMINI_API_KEY which is injected by the platform
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in the environment.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const getGeminiResponse = async (prompt: string, history: any[] = []) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");
  
  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: h.parts
    })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents,
    config: {
      systemInstruction: "You are Dyfa AI, an expert Biology tutor specializing in OSP (Olimpiade Sains Provinsi) Biologi. You help students understand complex biological concepts, provide study strategies, and solve practice problems. Keep your tone encouraging, professional, and clear. Use Indonesian as the primary language, but use scientific terms correctly.",
    }
  });

  return response.text;
};

export const generateTTS = async (text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore') => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized.");

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate audio.");

  return base64Audio;
};

export const generateQuiz = async (topicTitle: string, topicContent: string, count: number = 10) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");

  const prompt = `Buatkan ${count} soal pilihan ganda (A, B, C, D, E) tentang topik: ${topicTitle}. 
    Gunakan materi berikut sebagai referensi: ${topicContent}.
    
    CRITICAL: Kamu HARUS memberikan penjelasan untuk SETIAP opsi jawaban (baik yang benar maupun yang salah).
    Penjelasan harus membantu siswa memahami mengapa sebuah opsi benar atau mengapa opsi tersebut salah/kurang tepat dalam konteks soal.
    
    Format output harus JSON ARRAY of OBJECTS dengan struktur:
    [
      {
        "question": "teks soal",
        "options": ["A", "B", "C", "D", "E"],
        "correctAnswer": 0, // index dari options (0-4)
        "optionExplanations": [
          "Penjelasan untuk opsi A...",
          "Penjelasan untuk opsi B...",
          "Penjelasan untuk opsi C...",
          "Penjelasan untuk opsi D...",
          "Penjelasan untuk opsi E..."
        ],
        "explanation": "Ringkasan penjelasan umum/kunci jawaban"
      }
    ]`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
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
            optionExplanations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "optionExplanations", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
