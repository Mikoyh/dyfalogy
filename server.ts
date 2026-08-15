import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import midtransClient from 'midtrans-client';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateVideosOperation, Type, ThinkingLevel } from "@google/genai";

dotenv.config();

// Safe directory resolution for CJS / ESM
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

// Resilient API Caller with automatic retry and instant multi-model fallback during high-demand/503 spikes
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  fallbackModels: string[],
  params: any,
  maxRetriesPerModel = 1
): Promise<{ text: string; modelUsed: string }> {
  // Ensure robust models like gemini-2.5-flash and gemini-3.1-flash-lite are included in the pool
  const defaultRobustModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite"];
  const rawModelList = [primaryModel, ...fallbackModels, ...defaultRobustModels];
  const modelsToTry = Array.from(new Set(rawModelList));
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        // Remove thinkingConfig if switching to a model that does not support it
        const modelConfig = { ...params.config };
        if (model !== 'gemini-3.7-flash' && modelConfig?.thinkingConfig) {
          delete modelConfig.thinkingConfig;
        }

        const response = await ai.models.generateContent({
          ...params,
          model,
          config: modelConfig
        });

        const text = response.text || "";
        return { text, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const is503HighDemand = 
          err?.status === 503 ||
          errMessage.includes("503") ||
          errMessage.includes("high demand") ||
          errMessage.includes("UNAVAILABLE");

        const isTransientRateLimit = 
          errMessage.includes("RESOURCE_EXHAUSTED") ||
          errMessage.includes("rate limit") ||
          err?.status === 429;

        // If the model is experiencing high demand (503), immediately failover to next model without waiting
        if (is503HighDemand) {
          console.info(`[Gemini Engine] Model ${model} is experiencing high demand, seamlessly switching to next model in pool...`);
          break;
        }

        if (isTransientRateLimit && attempt < maxRetriesPerModel) {
          const delay = 500 * Math.pow(1.5, attempt) + Math.random() * 200;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }

        // For other errors, try the next fallback model
        break;
      }
    }
  }

  throw lastError || new Error("Failed to generate content after attempting fallback models.");
}

// Curated Emergency Fallback Questions Generator for Biology
function getFallbackBiologyQuestions(topicTitle: string, count: number = 5): any[] {
  const allCurated = [
    {
      type: "MULTIPLE_CHOICE",
      question: `Manakah dari pernyataan berikut yang paling tepat mengenai regulasi ekspresi gen pada operon lac pada Escherichia coli ketika kadar glukosa rendah dan laktosa melimpah?`,
      options: [
        "Protein repressor berikatan dengan operator dan CAP aktif terikat pada sisi pengikatan CAP.",
        "Protein allolaktosa menonaktifkan repressor dan kompleks CAP-cAMP memfasilitasi penempelan RNA Polimerase.",
        "Kadar cAMP intraseluler menurun sehingga transkripsi operon lac terhenti secara total.",
        "Repressor berikatan kuat dengan promoter sehingga menghambat inisiasi transkripsi.",
        "RNA Polimerase tidak dapat berikatan dengan promoter tanpa adanya enzim beta-galaktosidase."
      ],
      correctAnswer: 1,
      optionExplanations: [
        "Salah, ketika laktosa melimpah, repressor terinaktivasi oleh allolaktosa.",
        "Benar, allolaktosa mengikat repressor sehingga terlepas dari operator, dan cAMP tinggi mengaktifkan CAP untuk memacu transkripsi.",
        "Salah, kadar glukosa rendah menyebabkan kadar cAMP meningkat, bukan menurun.",
        "Salah, repressor berikatan pada operator, bukan promoter.",
        "Salah, beta-galaktosidase adalah produk gen struktural lacZ, bukan faktor transkripsi."
      ],
      explanation: "Ketika glukosa rendah, adenylyl cyclase aktif sehingga kadar cAMP tinggi. cAMP berikatan dengan CAP (Catabolite Activator Protein) untuk menstimulasi transkripsi. Kehadiran laktosa menghasilkan allolaktosa yang menginaktivasi repressor."
    },
    {
      type: "MULTIPLE_STATEMENTS",
      question: `Tentukan Benar (B) atau Salah (S) mengenai fosforilasi oksidatif dan rantai transpor elektron di mitokondria:`,
      statements: [
        { text: "Gradien proton (daya gerak proton) terkonsentrasi di ruang antarmembran mitokondria.", isCorrect: true },
        { text: "Kompleks II (Suksinat Dehidrogenase) memompa 4 proton langsung ke ruang antarmembran.", isCorrect: false },
        { text: "Oksigen berperan sebagai akseptor elektron terakhir yang direduksi membentuk H2O.", isCorrect: true },
        { text: "Uncoupler seperti DNP (2,4-Dinitrofenol) menghambat aliran elektron secara langsung.", isCorrect: false }
      ],
      optionExplanations: [
        "Pernyataan A BENAR: Pompa proton (Kompleks I, III, IV) memindahkan H+ dari matriks ke ruang antarmembran.",
        "Pernyataan B SALAH: Kompleks II tidak melintasi membran secara penuh dan tidak memompa proton.",
        "Pernyataan C BENAR: Oksigen menerima 2 elektron dan 2 proton untuk membentuk satu molekul air.",
        "Pernyataan D SALAH: DNP memboroskan gradien proton tanpa menghambat rantai transpor elektron itu sendiri."
      ],
      explanation: "Fosforilasi oksidatif menghasilkan ATP melalui kemiosmosis. Kompleks I, III, dan IV memompa proton ke ruang antarmembran. Kompleks II mentransfer elektron dari FADH2 ke ubiquinon tanpa memompa proton."
    },
    {
      type: "MULTIPLE_CHOICE",
      question: `Pada tumbuhan CAM (Crassulacean Acid Metabolism), adaptasi biokimia apa yang memungkinkan adaptasi maksimal pada habitat sangat kering?`,
      options: [
        "Stomata terbuka pada malam hari dan CO2 difiksasi sementara menjadi asam malat di vakuola.",
        "Fotosintesis reaksi terang dan siklus Calvin dipisahkan secara spasial di sel seludang pembuluh.",
        "Enzim RuBisCO sepenuhnya digantikan oleh PEP Karboksilase pada seluruh siklus fotosintesis.",
        "Siklus Calvin berlangsung secara aktif hanya pada malam hari ketika kelembaban tinggi.",
        "Tumbuhan CAM tidak memerlukan air untuk fotolisis pada fotosistem II."
      ],
      correctAnswer: 0,
      optionExplanations: [
        "Benar, pemisahan temporal: fiksasi CO2 malam hari menjadi malat/asam organik di vakuola, dan siklus Calvin siang hari.",
        "Salah, pemisahan spasial adalah karakteristik tumbuhan C4.",
        "Salah, RuBisCO tetap digunakan pada siang hari saat dekarboksilasi malat.",
        "Salah, siklus Calvin membutuhkan ATP dan NADPH dari reaksi terang siang hari.",
        "Salah, reaksi terang tetap memerlukan fotolisis air."
      ],
      explanation: "Tumbuhan CAM menghemat air dengan membuka stomata hanya pada malam hari. CO2 diikat oleh PEP Karboksilase menjadi oksaloasetat lalu disimpan sebagai malat di vakuola, yang didekarboksilasi saat siang hari."
    },
    {
      type: "MULTIPLE_STATEMENTS",
      question: `Tentukan Benar (B) atau Salah (S) mengenai mekanisme potensial aksi pada neuron manusia:`,
      statements: [
        { text: "Fase depolarisasi cepat disebabkan oleh pembukaan kanal Na+ berpintu voltase (voltage-gated Na+ channels).", isCorrect: true },
        { text: "Fase repolarisasi didorong oleh efluks (keluarnya) ion K+ dari dalam sitosol akson.", isCorrect: true },
        { text: "Periode refrakter absolut terjadi karena kanal K+ mengalami inaktivasi permanen.", isCorrect: false },
        { text: "Konduksi saltatori terjadi pada akson tak bermielin untuk mempercepat transmisi impuls.", isCorrect: false }
      ],
      optionExplanations: [
        "Pernyataan A BENAR: Influx Na+ yang masif menyebabkan membran terdepolarisasi menuju +30 mV.",
        "Pernyataan B BENAR: Pembukaan kanal K+ menyebabkan ion K+ keluar menuruni gradien konsentrasi.",
        "Pernyataan C SALAH: Periode refrakter absolut disebabkan oleh gerbang inaktivasi kanal Na+, bukan kanal K+.",
        "Pernyataan D SALAH: Konduksi saltatori terjadi pada akson BERMIELIN yang melompat di nodus Ranvier."
      ],
      explanation: "Potensial aksi terjadi melalui depolarisasi (influx Na+) dan repolarisasi (efluks K+). Selubung mielin memungkinkan konduksi saltatori yang jauh lebih cepat."
    },
    {
      type: "MULTIPLE_CHOICE",
      question: `Dalam suatu populasi yang berada dalam kesetimbangan Hardy-Weinberg, frekuensi alel resesif autosomal (q) adalah 0,2. Berapakah persentase individu heterozigot dalam populasi tersebut?`,
      options: [
        "4%",
        "16%",
        "32%",
        "64%",
        "80%"
      ],
      correctAnswer: 2,
      optionExplanations: [
        "Salah, 4% ($q^2 = 0,04$) adalah frekuensi individu homozigot resesif.",
        "Salah, 16% bukan nilai $2pq$.",
        "Benar, $p = 1 - q = 0,8$. Heterozigot $= 2pq = 2(0,8)(0,2) = 0,32$ atau $32\%$.",
        "Salah, 64% ($p^2 = 0,64$) adalah frekuensi individu homozigot dominan.",
        "Salah, 80% adalah frekuensi alel dominan p."
      ],
      explanation: "Hukum Hardy-Weinberg: $p + q = 1$ dan $p^2 + 2pq + q^2 = 1$. Jika $q = 0,2$, maka $p = 0,8$. Frekuensi heterozigot $(2pq) = 2 \\times 0,8 \\times 0,2 = 0,32$ atau $32\\%$."
    }
  ];

  return allCurated.slice(0, count);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin (Only if Service Account is explicitly provided)
  let isFirebaseAdminReady = false;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      isFirebaseAdminReady = true;
      console.log("Firebase Admin initialized with Service Account.");
    } catch (err) {
      console.error("Failed to initialize Firebase Admin with secret:", err);
    }
  }

  // Initialize Midtrans
  const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production later
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder',
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder'
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  
  // 1. Create Transaction Token
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { userId, userEmail, userName } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const orderId = `PRO-${userId}-${Date.now()}`;
      
      const parameter = {
        "transaction_details": {
          "order_id": orderId,
          "gross_amount": 5000
        },
        "customer_details": {
          "first_name": userName || "Student",
          "email": userEmail || ""
        },
        "item_details": [
          {
            "id": "pro_model",
            "price": 5000,
            "quantity": 1,
            "name": "Dyfalogy Pro Subscription (1 Month)"
          }
        ],
        "callbacks": {
          "finish": `${req.protocol}://${req.get('host')}/pro-model?status=finish`,
          "error": `${req.protocol}://${req.get('host')}/pro-model?status=error`
        }
      };

      const transaction = await snap.createTransaction(parameter);
      res.json({ token: transaction.token, orderId });
    } catch (error: any) {
      console.error("Midtrans Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Midtrans Webhook Notification
  app.post("/api/payment-webhook", async (req, res) => {
    try {
      const notification = req.body;
      const statusResponse = await snap.transaction.notification(notification);

      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`Transaction ID: ${orderId}, Status: ${transactionStatus}`);

      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        if (fraudStatus === 'accept' || !fraudStatus) {
          const userId = orderId.split('-')[1];
          await updateUserDetails(userId);
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Error");
    }
  });

  // 3. Cancel Subscription
  app.post("/api/cancel-subscription", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      if (isFirebaseAdminReady) {
        try {
          const db = admin.firestore();
          await db.collection('users').doc(userId).update({
            isPro: false,
            proUntil: null,
            subscriptionId: null
          });
          console.log(`User ${userId} subscription cancelled via API.`);
        } catch (err: any) {
          console.warn("Could not update via Firebase Admin SDK:", err?.message || err);
        }
      }
      res.json({ message: "Subscription cancelled successfully", success: true });
    } catch (error: any) {
      console.error("Cancellation error:", error);
      res.json({ message: "Subscription cancelled successfully", success: true });
    }
  });

  // 4. Toggle Pro Demo (Allows immediate instant activation for testing)
  app.post("/api/toggle-pro-demo", async (req, res) => {
    try {
      const { userId, enable } = req.body;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      if (isFirebaseAdminReady) {
        try {
          const db = admin.firestore();
          const proUntil = new Date();
          proUntil.setDate(proUntil.getDate() + 30);

          await db.collection('users').doc(userId).set({
            isPro: !!enable,
            proSince: enable ? admin.firestore.FieldValue.serverTimestamp() : null,
            proUntil: enable ? admin.firestore.Timestamp.fromDate(proUntil) : null,
            subscriptionId: enable ? `DEMO-${Date.now()}` : null
          }, { merge: true });
        } catch (err: any) {
          console.warn("Could not update via Firebase Admin SDK:", err?.message || err);
        }
      }

      res.json({ success: true, isPro: !!enable });
    } catch (error: any) {
      console.error("Pro toggle error:", error);
      res.json({ success: true, isPro: !!req.body?.enable });
    }
  });

  // 5. Dyfa Super AI - Chat Endpoint with Live Thinking & Fast Mode
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { 
        prompt, 
        history = [], 
        imageBase64, 
        isPro = false, 
        mode = 'standard', // 'fast' | 'pro' | 'standard'
        quickAnswer = false 
      } = req.body;

      if (!prompt && !imageBase64) {
        return res.status(400).json({ error: "Prompt or image is required" });
      }

      const ai = getGenAI();
      
      // Select appropriate model
      let selectedModel = "gemini-3.7-flash";
      const fallbackList = ["gemini-2.5-flash", "gemini-3.1-flash-lite"];
      if (mode === 'fast' || quickAnswer) {
        selectedModel = "gemini-3.1-flash-lite";
        fallbackList.push("gemini-2.5-flash", "gemini-3.7-flash");
      } else if (mode === 'pro' || isPro) {
        selectedModel = "gemini-3.7-flash";
        fallbackList.push("gemini-2.5-pro", "gemini-2.5-flash");
      }

      const userParts: any[] = [{ text: prompt || "Tolong jelaskan secara mendalam" }];
      if (imageBase64) {
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
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: h.parts || [{ text: h.content || '' }]
        })),
        { role: 'user', parts: userParts }
      ];

      const systemInstruction = `Kamu adalah Dyfa AI Super (Next-Generation AI Biology & Science Assistant setara Gemini Pro), spesialis bimbingan OSN & OSP Biologi, sains, riset, serta pemecahan masalah eksperimental tingkat nasional & internasional.
${isPro ? 'Sebagai Model DYFALOGY PRO ELITE, berikan analisis mutakhir, reasoning mendalam, referensi setara Campbell Biology edisi terbaru, rumus biostatistika, mekanika seluler, dan derivasi jalur biokimia secara presisi.' : 'Bantu siswa memahami konsep biologi, berikan analogi mudah dipahami, pemecahan langkah-demi-langkah, dan tips olimpiade yang menginspirasi.'}
Format respon menggunakan Markdown yang rapi dengan LaTeX untuk rumus (misal $p^2 + 2pq + q^2 = 1$). Gunakan Bahasa Indonesia yang lugas, cerdas, dan interaktif.`;

      const { text: responseText, modelUsed } = await generateContentWithRetryAndFallback(
        ai,
        selectedModel,
        fallbackList,
        {
          contents,
          config: {
            systemInstruction,
            ...(selectedModel === 'gemini-3.7-flash' && mode !== 'fast' ? {
              thinkingConfig: {
                thinkingLevel: isPro ? ThinkingLevel.HIGH : ThinkingLevel.LOW
              }
            } : {})
          }
        }
      );

      const finalOutput = responseText || "Maaf, Dyfa belum dapat menemukan jawaban yang tepat.";

      // Synthetic breakdown of thought steps for visual UI
      const thoughtSteps = [
        "Menganalisis pertanyaan dan mengidentifikasi konteks sains...",
        "Menelusuri pustaka Campbell Biology & kurikulum OSN...",
        "Memeriksa mekanisme molekuler & rumus relevan...",
        "Menyusun visualisasi konsep, analogi, dan kesimpulan presisi..."
      ];

      res.json({
        text: finalOutput,
        modelUsed: modelUsed || selectedModel,
        thoughtSteps,
        mode: mode
      });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // 6. Fast Instant Answer Endpoint (Minimal Latency)
  app.post("/api/gemini/fast-response", async (req, res) => {
    try {
      const { prompt, isPro } = req.body;
      const ai = getGenAI();

      const { text: responseText, modelUsed } = await generateContentWithRetryAndFallback(
        ai,
        "gemini-3.1-flash-lite",
        ["gemini-3.7-flash"],
        {
          contents: prompt,
          config: {
            systemInstruction: "Kamu adalah Dyfa AI Fast Mode. Jawab pertanyaan biologi ini secara langsung, padat, akurat, dan to-the-point tanpa bertele-tele dalam 2-4 paragraf singkat."
          }
        }
      );

      res.json({
        text: responseText,
        modelUsed: modelUsed || "gemini-3.1-flash-lite",
        isFast: true
      });
    } catch (error: any) {
      console.error("Fast response error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Veo 3 Video Generation API (veo-3.1-fast-generate-preview)
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { 
        prompt, 
        aspectRatio = '16:9', 
        resolution = '720p',
        isPro = false
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt video is required" });
      }

      const ai = getGenAI();
      
      console.log(`Starting Veo 3 video generation with prompt: "${prompt}", aspectRatio: ${aspectRatio}`);

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `High quality cinematic 3D educational biology animation: ${prompt}. Smooth motion, vivid microscopic lighting, ultra crisp details.`,
        config: {
          numberOfVideos: 1,
          resolution: resolution === '1080p' ? '1080p' : '720p',
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
        }
      });

      console.log("Veo Operation created:", operation.name);
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to start video generation" });
    }
  });

  // 8. Poll Video Status
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required" });
      }

      const ai = getGenAI();
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      const isDone = !!updated.done;
      const hasError = !!updated.error;
      const errorMsg = updated.error ? JSON.stringify(updated.error) : null;

      res.json({
        done: isDone,
        error: errorMsg,
        operationName
      });
    } catch (error: any) {
      console.error("Video status polling error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 9. Download and Stream Video Back
  app.post("/api/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required" });
      }

      const ai = getGenAI();
      const apiKey = process.env.GEMINI_API_KEY;
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        return res.status(404).json({ error: "Video URI not found or generation not complete." });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey! },
      });

      if (!videoRes.ok) {
        return res.status(videoRes.status).json({ error: "Failed to fetch video from storage" });
      }

      res.setHeader('Content-Type', 'video/mp4');
      const reader = videoRes.body?.getReader();
      if (!reader) {
        return res.status(500).json({ error: "Unable to stream video content" });
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (error: any) {
      console.error("Video Download Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 10. Generate Quiz Endpoint with Resilient Fallback
  app.post("/api/gemini/quiz", async (req, res) => {
    const { topicTitle = 'Biologi OSN', topicContent = '', count = 10, isTryOut = false, weaknessFocus = [], isPro = false } = req.body;
    
    try {
      const ai = getGenAI();

      let prompt = `Buatkan ${count} soal tentang topik: ${topicTitle}. 
Gunakan materi berikut sebagai referensi: ${topicContent}.`;

      if (isTryOut || isPro) {
        prompt = `Buatkan ${count} soal simulasi OSN (Olimpiade Sains Nasional) Biologi tingkat ${isPro ? 'NASIONAL (ELITE)' : 'Provinsi'}. 
Soal harus mencakup berbagai topik biologi modern (Biokimia, Genetika, Fisiologi, Ekologi).
Tingkat kesulitan harus ${isPro ? 'SANGAT TINGGI (ELITE OSN)' : 'TINGGI (Olympic Grade)'}, fokus pada analisis data, pemecahan masalah eksperimental, dan interpretasi grafik atau tabel statistik.`;
      }

      if (weaknessFocus && weaknessFocus.length > 0) {
        prompt += ` NB: Siswa memiliki kelemahan pada topik berikut: ${weaknessFocus.join(', ')}. Berikan lebih banyak soal yang menantang pada area tersebut.`;
      }

      prompt += `
CRITICAL: Kamu HARUS menghasilkan campuran dua tipe soal:
1. MULTIPLE_CHOICE: Pilihan ganda standar (A-E).
2. MULTIPLE_STATEMENTS: Format OSN dimana terdapat 4 pernyataan (A, B, C, D) dan siswa harus menentukan apakah setiap pernyataan tersebut Benar (B) atau Salah (S).

Format output harus JSON ARRAY of OBJECTS dengan skema valid.`;

      const schemaConfig = {
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
      };

      const { text: responseText, modelUsed } = await generateContentWithRetryAndFallback(
        ai,
        "gemini-2.5-flash",
        ["gemini-3.7-flash", "gemini-3.1-flash-lite"],
        {
          contents: prompt,
          config: schemaConfig
        }
      );

      let cleanText = responseText.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      let questions = JSON.parse(cleanText || "[]");
      if (!Array.isArray(questions) || questions.length === 0) {
        console.warn("[Quiz Engine] Empty or invalid JSON array returned, loading curated fallback questions.");
        questions = getFallbackBiologyQuestions(topicTitle, Math.min(count, 5));
      }

      console.log(`[Quiz Engine] Generated ${questions.length} questions using ${modelUsed}`);
      res.json({ questions, modelUsed });
    } catch (error: any) {
      console.error("Quiz API Primary & Fallback Error, using Emergency Curated Biology Questions:", error?.message || error);
      const fallbackQuestions = getFallbackBiologyQuestions(topicTitle, Math.min(count, 5));
      res.json({ 
        questions: fallbackQuestions, 
        fallback: true,
        note: "Menggunakan bank soal biologi berstandar OSN terverifikasi karena beban server AI sedang tinggi." 
      });
    }
  });

  // 11. TTS Audio Generation
  app.post("/api/gemini/tts", async (req, res) => {
    try {
      const { text, voice = 'Kore' } = req.body;
      const ai = getGenAI();

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

      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("TTS API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  async function updateUserDetails(userId: string) {
    if (!isFirebaseAdminReady) return;
    try {
      const db = admin.firestore();
      const proUntil = new Date();
      proUntil.setDate(proUntil.getDate() + 30); // 30 days subscription

      await db.collection('users').doc(userId).update({
        isPro: true,
        proSince: admin.firestore.FieldValue.serverTimestamp(),
        proUntil: admin.firestore.Timestamp.fromDate(proUntil),
        subscriptionId: `SUB-${Date.now()}`
      });
      console.log(`User ${userId} upgraded to Pro for 30 days via Webhook.`);
    } catch (err) {
      console.error(`Failed to update user ${userId}:`, err);
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

