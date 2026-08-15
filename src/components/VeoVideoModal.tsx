import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Sparkles, 
  X, 
  Play, 
  Download, 
  Crown, 
  Maximize2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Film,
  Zap,
  Sliders,
  Tv,
  Smartphone
} from 'lucide-react';
import { generateVeoVideo, checkVideoStatus, downloadVeoVideoBlob } from '../lib/gemini';
import { cn } from '../lib/utils';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
  initialPrompt?: string;
  onUpgradePro?: () => void;
}

const PROMPT_PRESETS = [
  {
    title: "Replikasi DNA & Enzim Polimerase",
    prompt: "Cinematic 3D animation of DNA double helix unwinding with DNA Helicase and DNA Polymerase synthesizing leading and lagging strands with Okazaki fragments in microscopic detail."
  },
  {
    title: "Pembelahan Sel Mitosis Anafase",
    prompt: "3D visualization of animal cell mitosis during anaphase, spindle fibers pulling sister chromatids apart toward opposite centrosome poles inside fluorescent glowing cytoplasm."
  },
  {
    title: "Pompa Natrium-Kalium (Na+/K+ ATPase)",
    prompt: "Detailed molecular 3D animation of sodium potassium pump conformational change using ATP hydrolysis across phospholipid bilayer membrane."
  },
  {
    title: "Fotosintesis: Reaksi Terang & Siklus Calvin",
    prompt: "Microscopic journey inside thylakoid membrane showing Photosystem II, electron transport chain, and ATP synthase generating cellular energy from sunlight."
  },
  {
    title: "Sirkulasi Darah Jantung 4 Ruang",
    prompt: "Cross-section 3D beating heart showing deoxygenated blood entering right atrium to lungs and oxygenated blood pumped via aorta to body tissues."
  }
];

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({
  isOpen,
  onClose,
  isPro = false,
  initialPrompt = '',
  onUpgradePro
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || PROMPT_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return;
    if (!isPro) {
      if (onUpgradePro) onUpgradePro();
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedVideoUrl(null);
    setProgressPercent(15);
    setGenerationStep("Menginisialisasi model Veo 3 (veo-3.1-fast-generate-preview)...");

    try {
      const res = await generateVeoVideo(prompt, aspectRatio, resolution, true);
      setOperationName(res.operationName);
      setGenerationStep("Merender simulasi visual 3D & frame biologis...");
      setProgressPercent(35);

      let attempts = 0;
      pollIntervalRef.current = setInterval(async () => {
        attempts++;
        setProgressPercent((prev) => Math.min(prev + 5, 92));
        
        if (attempts > 30) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          setErrorMsg("Waktu render melebihi batas (timeout). Silakan coba kembali.");
          return;
        }

        try {
          const status = await checkVideoStatus(res.operationName);
          if (status.done) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setGenerationStep("Mengunduh hasil kompilasi video Veo 3...");
            setProgressPercent(98);

            const blob = await downloadVeoVideoBlob(res.operationName);
            const blobUrl = URL.createObjectURL(blob);
            setGeneratedVideoUrl(blobUrl);
            setIsGenerating(false);
            setProgressPercent(100);
            setGenerationStep("Selesai!");
          } else if (status.error) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsGenerating(false);
            setErrorMsg(`Render gagal: ${status.error}`);
          }
        } catch (err: any) {
          console.error("Polling error:", err);
        }
      }, 4000);

    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err.message || "Gagal membuat video AI");
    }
  };

  const handleDownload = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `dyfa-veo3-biology-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0F172A] border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-hidden z-10 my-auto"
        >
          {/* Subtle Glow FX */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <Film size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg sm:text-xl text-white tracking-tight">Studio Video AI Veo 3</h3>
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown size={10} /> PRO
                  </span>
                </div>
                <p className="text-xs text-slate-400">Generate visualisasi 3D konsep biologi dengan model Veo 3.1 Fast</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Non-Pro Warning Banner */}
          {!isPro && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Crown size={20} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-amber-300">Akses Dyfalogy Pro Dibutuhkan</p>
                  <p className="text-slate-400 text-[11px]">Generate video AI Veo 3 tanpa batas dengan berlangganan Dyfalogy Pro.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onUpgradePro) onUpgradePro();
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all shrink-0"
              >
                Buka PRO
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="mt-4 space-y-4">
            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Deskripsi Visual Video (Prompt)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Veo 3.1 Fast Preview</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder="Contoh: 3D microscopic animation of cellular respiration inside mitochondria with ATP Synthase spinning..."
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 rounded-2xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />
            </div>

            {/* Quick Templates */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-emerald-400" />
                <span>Template Konsep Biologi Cepat:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(preset.prompt)}
                    disabled={isGenerating}
                    className={cn(
                      "text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all",
                      prompt === preset.prompt 
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold" 
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                    )}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration: Aspect Ratio & Resolution */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Format Rasio Aspek</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    disabled={isGenerating}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                      aspectRatio === '16:9'
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <Tv size={14} />
                    <span>16:9 Landscape</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    disabled={isGenerating}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                      aspectRatio === '9:16'
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <Smartphone size={14} />
                    <span>9:16 Portrait</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Resolusi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolution('720p')}
                    disabled={isGenerating}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                      resolution === '720p'
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    720p HD (Cepat)
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    disabled={isGenerating}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                      resolution === '1080p'
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    1080p FHD
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Generating Progress State */}
            {isGenerating && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-emerald-400" />
                    {generationStep}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic text-center">Veo 3 sedang menghasilkan video beresolusi tinggi. Estimasi render: 15-45 detik.</p>
              </div>
            )}

            {/* Generated Video Player */}
            {generatedVideoUrl && (
              <div className="space-y-3 pt-2">
                <div className={cn(
                  "relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/40 shadow-xl mx-auto flex items-center justify-center",
                  aspectRatio === '9:16' ? "max-w-[240px] aspect-[9/16]" : "w-full aspect-[16/9]"
                )}>
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>Video Berhasil Dibuat!</span>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Download size={14} />
                    <span>Download MP4</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={isGenerating || !prompt.trim()}
              className={cn(
                "px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-xl transition-all active:scale-95",
                isPro
                  ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 shadow-emerald-500/20 hover:brightness-110"
                  : "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/20 hover:scale-105"
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Merender Video...</span>
                </>
              ) : isPro ? (
                <>
                  <Film size={14} />
                  <span>Generate Video Veo 3</span>
                </>
              ) : (
                <>
                  <Crown size={14} />
                  <span>Buka Akses Pro untuk Generate</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
