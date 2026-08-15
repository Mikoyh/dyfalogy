import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Film, 
  Crown, 
  Sparkles, 
  Lock, 
  Maximize2, 
  RefreshCw, 
  Video,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Lesson } from '../constants/data';
import { VeoVideoModal } from './VeoVideoModal';
import { cn } from '../lib/utils';

interface LessonVideoVisualizerProps {
  lesson: Lesson;
  isPro?: boolean;
  onUpgradePro?: () => void;
}

export const LessonVideoVisualizer: React.FC<LessonVideoVisualizerProps> = ({
  lesson,
  isPro = false,
  onUpgradePro
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVeoModal, setShowVeoModal] = useState(false);

  const video = lesson.aiAssets?.videos?.[0];

  const defaultVeoPrompt = `Cinematic 3D educational biology animation explaining ${lesson.title}: ${lesson.description}. High visual fidelity, molecular mechanisms, vivid lighting.`;

  return (
    <div className="my-6 rounded-3xl overflow-hidden bg-slate-950/90 border border-emerald-500/20 text-white shadow-xl">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
            <Film size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm text-white tracking-tight">
                {video?.title || `Visualisasi AI Materi: ${lesson.title}`}
              </h4>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Crown size={9} /> PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {video?.description || "Simulasi animasi kinetik dan visualisasi konsep olimpiade biologi"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isPro && (
            <button
              onClick={() => setShowVeoModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Sparkles size={13} className="text-emerald-400" />
              <span>Generate Video Baru (Veo 3)</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Content / Player Area */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {isPro ? (
          // PRO USER VIEW
          video?.url ? (
            isPlaying ? (
              <iframe
                src={`${video.url}?autoplay=1`}
                title={video.title || lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
                {/* Fallback image or stylish biology poster */}
                <img
                  src={lesson.aiAssets?.images?.[0]?.url || "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1000"}
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 brightness-75 group-hover:brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                
                {/* Center Play Button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
                  >
                    <Play size={28} className="fill-slate-950 ml-1" />
                  </motion.div>
                  <span className="text-xs font-black tracking-wider uppercase bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-300">
                    Putar Video Visualisasi (HD)
                  </span>
                </div>
              </div>
            )
          ) : (
            <div className="text-center p-6 space-y-3">
              <Film size={36} className="mx-auto text-emerald-400 opacity-60" />
              <p className="text-sm font-bold text-slate-300">Belum ada video khusus untuk topik ini.</p>
              <button
                onClick={() => setShowVeoModal(true)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 mx-auto shadow-lg shadow-emerald-500/20"
              >
                <Sparkles size={14} />
                <span>Generate Video dengan Veo 3 AI</span>
              </button>
            </div>
          )
        ) : (
          // NON-PRO GATED VIEW
          <div className="relative w-full h-full">
            <img
              src={lesson.aiAssets?.images?.[0]?.url || "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1000"}
              alt={lesson.title}
              className="w-full h-full object-cover blur-sm brightness-40"
            />
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
                <Lock size={26} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h5 className="font-black text-base text-white">Video Visualisasi Materi (Eksklusif Pro)</h5>
                <p className="text-xs text-slate-300">
                  Upgrade ke <strong>Dyfalogy Pro</strong> untuk membuka video visualisasi 3D seluruh materi dan fitur generate video Veo 3 AI.
                </p>
              </div>

              <button
                onClick={onUpgradePro}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
              >
                <Crown size={14} />
                <span>Buka Akses Video Dyfalogy Pro</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Veo Video Modal for generation */}
      <VeoVideoModal
        isOpen={showVeoModal}
        onClose={() => setShowVeoModal(false)}
        isPro={isPro}
        initialPrompt={defaultVeoPrompt}
        onUpgradePro={onUpgradePro}
      />
    </div>
  );
};
