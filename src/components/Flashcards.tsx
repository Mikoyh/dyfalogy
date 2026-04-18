import React, { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2, XCircle, Brain, Calendar, ArrowRight, Share2, Info, Zap, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  nextReview: string | Date;
  easeFactor: number;
  interval: number;
  consecutiveCorrect: number;
}

interface FlashcardsProps {
  cards: Flashcard[];
  onReview: (cardId: string, success: boolean) => void;
  onClose: () => void;
}

export const Flashcards: React.FC<FlashcardsProps> = memo(({
  cards,
  onReview,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [direction, setDirection] = useState(0);

  const currentCard = cards[currentIndex];
  const isFinished = currentIndex >= cards.length;

  const handleResponse = (success: boolean) => {
    onReview(currentCard.id, success);
    setDirection(success ? 1 : -1);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setShowBack(false);
      setDirection(0);
    }, 200);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-white rounded-[40px] shadow-2xl border border-border overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent -z-0" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-accent/10 rounded-[32px] flex items-center justify-center text-accent mb-8 mx-auto rotate-3 group-hover:rotate-6 transition-transform">
            <Brain size={48} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-text-main mb-4 leading-tight">Belum Ada Kartu Review! 🧬</h2>
          <p className="text-text-muted mb-10 max-w-sm mx-auto text-base leading-relaxed">
            Sistem Spaced Repetition (Anki) kamu masih kosong. Kamu perlu menyelesaikan materi pembelajaran untuk secara otomatis menambahkan poin penting ke dalam sistem review ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Zap size={18} /> Mulai Belajar Sekarang
            </button>
          </div>
          <p className="mt-8 text-[11px] font-bold text-text-muted uppercase tracking-widest opacity-40">
            Tip: Selesaikan kuis di setiap materi untuk hasil maksimal
          </p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-white rounded-[40px] shadow-2xl border border-border overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent -z-0" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center text-emerald-600 mb-8 mx-auto shadow-lg">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-black text-text-main mb-4">Review Selesai Habis! 🏆</h2>
          <p className="text-text-muted mb-10 max-w-sm mx-auto text-base leading-relaxed">
            Luar biasa! Kamu sudah menyelesaikan semua target review hari ini. Otak kamu sekarang lebih sinkron dengan materi OSP.
          </p>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Selesai untuk Hari Ini
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 perspective-1000">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
            <Brain size={20} />
          </div>
          <div>
            <div className="text-xs font-black text-text-muted uppercase tracking-widest">Flashcards Review</div>
            <div className="text-sm font-bold text-text-main">{currentCard.topic}</div>
          </div>
        </div>
        <div className="text-sm font-black text-accent bg-accent/10 px-3 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <div className="relative h-[400px] w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentCard.id + (showBack ? 'back' : 'front')}
            initial={{ rotateY: direction === 0 ? 0 : (direction > 0 ? 90 : -90), opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <div 
              onClick={() => !showBack && setShowBack(true)}
              className={cn(
                "w-full h-full p-8 flex flex-col items-center justify-center text-center rounded-[32px] shadow-2xl border-4 transition-all overflow-hidden relative cursor-pointer",
                showBack ? "bg-white border-accent" : "bg-bg border-white"
              )}
            >
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />

              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-muted bg-accent/5 px-2 py-1 rounded-full border border-accent/10">
                  {showBack ? 'JAWABAN' : 'PERTANYAAN'}
                </span>
              </div>

              <div className={cn(
                "text-2xl font-black leading-tight tracking-tight",
                showBack ? "text-text-main" : "text-accent"
              )}>
                {showBack ? currentCard.back : currentCard.front}
              </div>

              {!showBack && (
                <div className="mt-8 flex items-center gap-2 text-text-muted animate-pulse">
                  <RefreshCw size={16} />
                  <span className="text-xs font-bold">Tap untuk melihat jawaban</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showBack && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => handleResponse(false)}
              className="group flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-3xl transition-all"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                <XCircle size={24} />
              </div>
              <span className="text-xs font-black text-red-600 uppercase tracking-widest">Lupa / Sulit</span>
              <span className="text-[10px] text-red-400 font-bold italic">Review dalam 1 hari</span>
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="group flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-3xl transition-all"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Hafal / Mudah</span>
              <span className="text-[10px] text-emerald-400 font-bold italic">Review dalam {Math.ceil(currentCard.interval * currentCard.easeFactor)} hari</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 p-4 bg-white/50 backdrop-blur-xl border border-border rounded-2xl">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-accent mt-0.5" />
          <p className="text-[11px] text-text-muted font-medium leading-relaxed">
            Sistem Spaced Repetition (Anki) akan menjadwalkan kartu ini berdasarkan tingkat kemudahan yang kamu pilih. Semakin mudah, semakin lama jeda review berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
});

Flashcards.displayName = 'Flashcards';
