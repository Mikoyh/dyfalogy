// Client-side API caller for Dyfa Super AI & Veo 3 Video Generator

export interface GeminiChatResponse {
  text: string;
  modelUsed?: string;
  thoughtSteps?: string[];
  mode?: string;
}

export interface VideoGenerationResult {
  operationName: string;
}

export interface VideoStatusResult {
  done: boolean;
  error?: string | null;
  operationName: string;
}

export const getGeminiResponse = async (
  prompt: string, 
  history: any[] = [], 
  imageBase64?: string, 
  isPro: boolean = false,
  mode: 'standard' | 'fast' | 'pro' = 'standard',
  quickAnswer: boolean = false
): Promise<GeminiChatResponse> => {
  const res = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      history,
      imageBase64,
      isPro,
      mode: quickAnswer ? 'fast' : mode,
      quickAnswer
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal memproses permintaan AI" }));
    throw new Error(err.error || `Error ${res.status}`);
  }

  return await res.json();
};

export const getFastGeminiResponse = async (prompt: string, isPro: boolean = false): Promise<string> => {
  const res = await fetch("/api/gemini/fast-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, isPro })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal memproses jawaban cepat" }));
    throw new Error(err.error || `Error ${res.status}`);
  }

  const data = await res.json();
  return data.text;
};

export const generateVeoVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9',
  resolution: '720p' | '1080p' = '720p',
  isPro: boolean = true
): Promise<VideoGenerationResult> => {
  const res = await fetch("/api/generate-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      aspectRatio,
      resolution,
      isPro
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal memulai generate video" }));
    throw new Error(err.error || "Gagal memulai pembuatan video Veo");
  }

  return await res.json();
};

export const checkVideoStatus = async (operationName: string): Promise<VideoStatusResult> => {
  const res = await fetch("/api/video-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operationName })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal memeriksa status video" }));
    throw new Error(err.error || "Gagal memeriksa status video");
  }

  return await res.json();
};

export const downloadVeoVideoBlob = async (operationName: string): Promise<Blob> => {
  const res = await fetch("/api/video-download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operationName })
  });

  if (!res.ok) {
    throw new Error("Gagal mengunduh video yang telah di-generate.");
  }

  return await res.blob();
};

export const generateTTS = async (text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore'): Promise<string> => {
  const res = await fetch("/api/gemini/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal generate audio TTS" }));
    throw new Error(err.error || "Gagal memproses TTS");
  }

  const data = await res.json();
  return data.audio;
};

export const generateQuiz = async (
  topicTitle: string, 
  topicContent: string, 
  count: number = 10,
  isTryOut: boolean = false,
  weaknessFocus?: string[],
  isPro: boolean = false
) => {
  const res = await fetch("/api/gemini/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topicTitle,
      topicContent,
      count,
      isTryOut,
      weaknessFocus,
      isPro
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Gagal membuat quiz AI" }));
    throw new Error(err.error || "Gagal membuat quiz");
  }

  const data = await res.json();
  return data.questions;
};

export const toggleProDemo = async (userId: string, enable: boolean) => {
  const res = await fetch("/api/toggle-pro-demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, enable })
  });
  return await res.json();
};

