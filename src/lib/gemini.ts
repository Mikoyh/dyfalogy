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

export const getGeminiResponse = async (prompt: string, history: any[] = [], imageBase64?: string, isPro: boolean = false) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");
  
  const userParts: any[] = [{ text: prompt }];
  if (imageBase64) {
    // Check if it's a data URL and extract base64
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const mimeType = imageBase64.includes(';') ? imageBase64.split(';')[0].split(':')[1] : 'image/jpeg';
    
    userParts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });
  }

  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: h.parts
    })),
    { role: 'user', parts: userParts }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents,
    config: {
      systemInstruction: `You are Dyfa AI ${isPro ? 'PRO (Elite Version)' : ''}, an expert Biology tutor specializing in ${isPro ? 'National OSN (Olimpiade Sains Nasional)' : 'OSP (Olimpiade Sains Provinsi)'} Biologi. 
        ${isPro ? 'As a PRO model, you provide extremely advanced, detailed, and analytical responses. You are direct, formal, and use high-level biological terminology.' : 'You help students understand complex biological concepts, provide study strategies, and solve practice problems. Keep your tone encouraging and professional.'}
        Use Indonesian as the primary language, but use scientific terms correctly. If the user provides an image, analyze it deeply in the context of ${isPro ? 'Advanced OSN' : 'OSP'} Biologi.`,
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

export const generateQuiz = async (
  topicTitle: string, 
  topicContent: string, 
  count: number = 10,
  isTryOut: boolean = false,
  weaknessFocus?: string[],
  isPro: boolean = false
) => {
  const ai = getAI();
  if (!ai) throw new Error("AI client not initialized. Please check your API key.");

  let prompt = `Buatkan ${count} soal tentang topik: ${topicTitle}. 
    Gunakan materi berikut sebagai referensi: ${topicContent}.`;

  if (isTryOut || isPro) {
    prompt = `Buatkan ${count} soal simulasi OSN (Olimpiade Sains Nasional) Biologi tingkat ${isPro ? 'NASIONAL (ELITE)' : 'Provinsi'}. 
    Soal harus mencakup berbagai topik biologi modern (Biokimia, Genetika, Fisiologi, Ekologi).
    Tingkat kesulitan harus ${isPro ? 'SANGAT TINGGI (ELITE OSN)' : 'TINGGI (Olympic Grade)'}, fokus pada analisis data, pemecahan masalah eksperimental, dan interpretasi grafik atau tabel statistik.`;
  }

  if (weaknessFocus && weaknessFocus.length > 0) {
    prompt += ` NB: Siswa memiliki kelemahan pada topik berikut: ${weaknessFocus.join(', ')}. 
    Berikan lebih banyak soal yang menantang pada area tersebut untuk membantu mereka berlatih.`;
  }

  prompt += `
    CRITICAL: Kamu HARUS menghasilkan campuran dua tipe soal:
    1. MULTIPLE_CHOICE: Pilihan ganda standar (A-E).
    2. MULTIPLE_STATEMENTS: Format OSN dimana terdapat 4 pernyataan (A, B, C, D) dan siswa harus menentukan apakah setiap pernyataan tersebut Benar (B) atau Salah (S).
    
    Untuk MULTIPLE_STATEMENTS, pastikan pernyataan bervariasi (bisa jadi semua benar, semua salah, atau campuran). Ini adalah format khas OSN Biologi.

    Format output harus JSON ARRAY of OBJECTS dengan struktur:
    [
      {
        "type": "MULTIPLE_CHOICE" | "MULTIPLE_STATEMENTS",
        "question": "teks soal",
        "options": ["A", "B", "C", "D", "E"], // HANYA untuk MULTIPLE_CHOICE
        "correctAnswer": 0, // HANYA untuk MULTIPLE_CHOICE (index dari options 0-4)
        "statements": [ // HANYA untuk MULTIPLE_STATEMENTS (tepat 4 pernyataan)
           {"text": "pernyataan A", "isCorrect": true},
           {"text": "pernyataan B", "isCorrect": false},
           {"text": "pernyataan C", "isCorrect": true},
           {"text": "pernyataan D", "isCorrect": true}
        ],
        "optionExplanations": ["Penjelasan A", "Penjelasan B", ...], // Berikan penjelasan untuk setiap opsi/pernyataan
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
            type: { type: Type.STRING, enum: ["MULTIPLE_CHOICE", "MULTIPLE_STATEMENTS"] },
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER },
            statements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN }
                },
                required: ["text", "isCorrect"]
              }
            },
            optionExplanations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          },
          required: ["type", "question", "optionExplanations", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
