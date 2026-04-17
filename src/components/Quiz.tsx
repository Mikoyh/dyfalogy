import React, { useState, useEffect, memo } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

// Dummy ConfirmationModal for Quiz (to avoid circular dependency during rapid extraction)
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Ya, Lanjutkan",
  isDanger = false
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  confirmText?: string,
  isDanger?: boolean
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-gray-600">{message}</p>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-sm">Batal</button>
            <button onClick={onConfirm} className={cn("flex-1 py-3 rounded-xl font-bold text-sm text-white", isDanger ? "bg-red-500" : "bg-emerald-500")}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Quiz = memo(({ questions, timerSeconds, onFinish, onCancel }: { questions: any[], timerSeconds?: number, onFinish: (score: number, correct: number) => void, onCancel: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds || 0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!timerSeconds) return;
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerSeconds]);

  const handleNext = () => {
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      if (timerSeconds) setTimeLeft(timerSeconds);
    } else {
      const finalCorrect = score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0);
      const finalScore = (finalCorrect / questions.length) * 100;
      onFinish(finalScore, finalCorrect);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 space-y-6 max-w-2xl mx-auto relative overflow-hidden">
      {timerSeconds && (
        <div className="absolute top-0 left-0 h-1 bg-accent/20 w-full">
          <motion.div 
            className="h-full bg-accent"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-accent uppercase tracking-widest">Pertanyaan {currentIndex + 1} / {questions.length}</span>
        <div className="flex items-center gap-4">
          {timerSeconds && (
            <span className={cn(
              "text-xs font-mono font-bold",
              timeLeft < 5 ? "text-red-500 animate-pulse" : "text-text-muted"
            )}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          )}
          <button onClick={() => setShowExitConfirm(true)} className="text-text-muted hover:text-red-500 transition-colors p-2"><X size={18} /></button>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={onCancel}
        title="Batalkan Kuis?"
        message="Progress kuis kamu saat ini tidak akan disimpan dan kamu harus mengulang dari awal jika keluar sekarang."
        confirmText="Ya, Keluar"
        isDanger={true}
      />
      
      <div className="h-1.5 bg-gray-100/50 rounded-full overflow-hidden">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <h3 className="text-lg font-bold text-text-main leading-relaxed">{currentQuestion.question}</h3>

      <div className="space-y-3">
        {currentQuestion.options.map((option: string, idx: number) => (
          <button
            key={idx}
            disabled={showExplanation}
            onClick={() => setSelectedOption(idx)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all text-sm group",
              selectedOption === idx 
                ? "border-accent bg-accent/5 font-bold" 
                : "border-white/50 bg-white/20 hover:bg-white/40",
              showExplanation && idx === currentQuestion.correctAnswer && "border-emerald-500 bg-emerald-50/50 [box-shadow:0_0_20px_rgba(16,185,129,0.2)]",
              showExplanation && selectedOption === idx && idx !== currentQuestion.correctAnswer && "border-red-500 bg-red-50/50"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <div className="flex-1">
                <div className="mb-1">{option}</div>
                {showExplanation && currentQuestion.optionExplanations && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className={cn(
                      "mt-2 text-[10px] font-medium leading-relaxed p-3 rounded-lg border-l-2",
                      idx === currentQuestion.correctAnswer 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700" 
                        : "bg-red-500/10 border-red-500 text-red-700"
                    )}
                  >
                    <div className="font-black uppercase tracking-tighter text-[8px] mb-1 opacity-60">Penjelasan Opsi {String.fromCharCode(65 + idx)}</div>
                    {currentQuestion.optionExplanations[idx]}
                  </motion.div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {showExplanation && !currentQuestion.optionExplanations && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-accent/5 rounded-xl border border-accent/20 text-xs text-text-muted italic"
        >
          <strong>Penjelasan:</strong> {currentQuestion.explanation}
        </motion.div>
      )}

      <button
        disabled={selectedOption === null}
        onClick={() => {
          if (!showExplanation) {
            setShowExplanation(true);
          } else {
            handleNext();
          }
        }}
        className={cn(
          "w-full py-4 rounded-xl text-sm font-bold shadow-xl transition-all",
          selectedOption === null 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-accent text-white liquid-button active:scale-95"
        )}
      >
        {!showExplanation ? "PERIKSA JAWABAN" : (currentIndex < questions.length - 1 ? "LANJUT KE PERTANYAAN BERIKUTNYA" : "SELESAIKAN KUIS")}
      </button>
    </div>
  );
});
