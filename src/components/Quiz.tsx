import React, { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

// Confirmation Modal with Full Screen Gaussian Blur, Transparent Glass Aesthetic & High-Contrast Typography
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

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Full-Screen Gaussian Blur Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-slate-950/45 backdrop-blur-md" 
        />
        
        {/* Modal Card with transparent glassmorphism, gaussian blur & high-contrast crisp text */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-sm glass-card bg-white/45 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-white/70 overflow-hidden"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40">
            <div className={cn("h-full", isDanger ? "bg-red-500" : "bg-emerald-500")} style={{ width: '100%' }} />
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white/60",
                isDanger ? "bg-red-500/20 text-red-700" : "bg-emerald-500/20 text-emerald-700"
              )}>
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">{title}</h3>
            </div>

            <p className="text-sm font-bold text-slate-900 leading-relaxed drop-shadow-[0_1px_0px_rgba(255,255,255,0.7)]">{message}</p>

            <div className="flex gap-2.5 pt-2">
              <button 
                type="button"
                onClick={onClose} 
                className="flex-1 py-3 bg-white/60 hover:bg-white/90 text-slate-900 rounded-xl font-bold text-sm border border-white/80 transition-all active:scale-95 shadow-xs"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={() => { onConfirm(); onClose(); }} 
                className={cn(
                  "flex-1 py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95",
                  isDanger ? "bg-red-600 hover:bg-red-700 shadow-red-500/30" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                )}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

export const Quiz = memo(({ questions, timerSeconds, onFinish, onCancel }: { questions: any[], timerSeconds?: number, onFinish: (score: number, correct: number) => void, onCancel: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [statementAnswers, setStatementAnswers] = useState<(boolean | null)[]>([null, null, null, null]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds || 0);
  const [exitPromptActive, setExitPromptActive] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Auto-reset the first-step exit confirmation prompt after 3.5 seconds
  useEffect(() => {
    if (exitPromptActive) {
      const timer = setTimeout(() => {
        setExitPromptActive(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [exitPromptActive]);

  const handleExitButtonClick = () => {
    if (!exitPromptActive) {
      // Step 1: activate text popup prompt
      setExitPromptActive(true);
    } else {
      // Step 2: on second click, open the modal
      setExitPromptActive(false);
      setShowExitConfirm(true);
    }
  };

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!timerSeconds || showExplanation || isFinished) return;

    // Haptic vibration alert for the final 3 seconds
    if (timeLeft <= 3 && timeLeft > 0) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          // Vibrate for 200ms on each of the last 3 seconds
          navigator.vibrate(200);
        } catch (e) {
          // Ignore if vibration is not supported or blocked by browser policy
        }
      }
    }

    if (timeLeft <= 0) {
      setShowExplanation(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerSeconds, showExplanation, isFinished]);

  const calculateCorrectness = () => {
    let isCorrect = false;
    if (currentQuestion.type === 'MULTIPLE_STATEMENTS') {
      const correctCount = statementAnswers.filter((ans, idx) => ans === currentQuestion.statements[idx].isCorrect).length;
      isCorrect = correctCount === 4;
    } else {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    }
    return isCorrect;
  };

  const handleNext = () => {
    const isCorrect = calculateCorrectness();
    const currentScoreIncrement = currentQuestion.type === 'MULTIPLE_STATEMENTS' 
      ? (statementAnswers.filter((ans, idx) => ans === currentQuestion.statements[idx].isCorrect).length === 4 ? 1 : (statementAnswers.filter((ans, idx) => ans === currentQuestion.statements[idx].isCorrect).length === 3 ? 0.5 : 0))
      : (isCorrect ? 1 : 0);

    const resultItem = {
      question: currentQuestion.question,
      selected: currentQuestion.type === 'MULTIPLE_STATEMENTS' ? [...statementAnswers] : selectedOption,
      correct: currentQuestion.type === 'MULTIPLE_STATEMENTS' ? currentQuestion.statements.map((s:any) => s.isCorrect) : currentQuestion.correctAnswer,
      isCorrect,
      score: currentScoreIncrement,
      type: currentQuestion.type,
      options: currentQuestion.options,
      statements: currentQuestion.statements?.map((s:any) => s.text),
      explanation: currentQuestion.explanation
    };

    const newResults = [...quizResults, resultItem];
    setQuizResults(newResults);
    setScore(prev => prev + currentScoreIncrement);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setStatementAnswers([null, null, null, null]);
      setShowExplanation(false);
      if (timerSeconds) setTimeLeft(timerSeconds);
    } else {
      setIsFinished(true);
    }
  };

  const isAnswered = currentQuestion.type === 'MULTIPLE_STATEMENTS' 
    ? statementAnswers.every(ans => ans !== null)
    : selectedOption !== null;

  if (isFinished) {
    const finalCorrect = quizResults.reduce((acc, curr) => acc + (curr.score), 0);
    const finalScore = (finalCorrect / questions.length) * 100;

    return (
      <div className="w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-8 pb-24">
          <div className="glass-card rounded-[2.5rem] p-6 md:p-10 space-y-8 border border-white/60 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-accent via-emerald-400 to-accent" />
            
            <div className="text-center space-y-2">
              <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase mb-2">Quiz Selesai</div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Hasil Perjuanganmu</h2>
              <p className="text-text-muted text-sm">Berikut adalah rangkuman dari setiap soal yang telah kamu kerjakan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-border/50">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Skor Akhir</div>
                <div className="text-5xl md:text-6xl font-black text-accent">{Math.round(finalScore)}</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Benar / Total</div>
                <div className="text-5xl md:text-6xl font-black text-emerald-500">{finalCorrect} / {questions.length}</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <FileText size={20} className="text-accent" />
                Detail Pertanyaan
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {quizResults.map((res, idx) => (
                  <div key={idx} className={cn(
                    "p-5 md:p-6 rounded-3xl border transition-all",
                    res.score > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                  )}>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex gap-3">
                        <span className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</span>
                        <p className="font-bold text-sm md:text-base leading-relaxed">{res.question}</p>
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0",
                        res.score > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      )}>
                        {res.score > 0 ? (res.score === 1 ? "Benar" : "Sebagian") : "Salah"}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {res.type === 'MULTIPLE_STATEMENTS' ? (
                        <div className="grid grid-cols-1 gap-2">
                          {res.statements.map((text: string, sIdx: number) => (
                            <div key={sIdx} className="text-[10px] sm:text-xs flex items-center justify-between p-3 rounded-xl bg-white/40">
                              <span className="text-text-muted italic truncate max-w-[65%]">{text}</span>
                              <div className="flex gap-3">
                                <span className="font-bold">Pilihan: {res.selected[sIdx] ? 'B' : 'S'}</span>
                                <span className={cn("font-bold", res.selected[sIdx] === res.correct[sIdx] ? "text-emerald-500" : "text-red-500")}>
                                  Kunci: {res.correct[sIdx] ? 'B' : 'S'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] sm:text-xs space-y-1">
                          <div className="flex justify-between p-3 rounded-xl bg-white/40">
                            <span className="text-text-muted">Jawaban Kamu:</span>
                            <span className="font-bold">{res.options[res.selected] || "Tidak Dijawab"}</span>
                          </div>
                          <div className="flex justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-700">
                            <span className="font-bold">Jawaban Benar:</span>
                            <span className="font-black">{res.options[res.correct]}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white/40 rounded-2xl border border-white/50 text-[10px] sm:text-xs leading-relaxed text-text-muted italic">
                      <span className="font-black uppercase not-italic text-[8px] block mb-1 opacity-60">Insight Pembahasan:</span>
                      {res.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onFinish(finalScore, finalCorrect)}
              className="w-full py-5 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
            >
              Kembali ke Dashboard & Klaim Hadiah
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar relative">
      {/* Sticky Slim Progress Bar Only at the Top */}
      {timerSeconds && (
        <div className="sticky top-0 left-0 right-0 z-40 w-full bg-slate-900/10 backdrop-blur-xs">
          <div className="w-full h-2 sm:h-2.5 bg-slate-200/90 overflow-hidden shadow-xs">
            <motion.div 
              className={cn(
                "h-full transition-all duration-300",
                timeLeft <= 3 
                  ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-500 animate-pulse shadow-lg shadow-red-500/50" 
                  : timeLeft < 10 
                    ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" 
                    : "bg-gradient-to-r from-accent via-emerald-400 to-emerald-500"
              )}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      )}

      <div className="p-3 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-6 pb-28">
          <div className="glass-card rounded-2xl p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 shadow-xl relative border border-white/70">
            
            {/* Clean Non-Sticky Header Card */}
            <div className="flex justify-between items-center gap-3 bg-white/60 backdrop-blur-sm p-3.5 sm:p-4 rounded-xl border border-white/80 shadow-xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black text-xs shadow-sm shadow-accent/20 shrink-0">
                  {currentIndex + 1}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest block truncate">
                    Soal Progres {currentIndex + 1} / {questions.length}
                  </span>
                  {timeLeft <= 3 && timerSeconds && !showExplanation && (
                    <span className="text-[9px] font-black text-red-600 animate-pulse block truncate">
                      ⚠️ Sisa 3 detik! Segera selesaikan jawaban
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {timerSeconds && (
                  <div className={cn(
                    "px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-mono font-black text-xs border transition-all flex items-center gap-1.5 shadow-xs",
                    timeLeft <= 3 
                      ? "bg-red-600 text-white border-red-700 animate-bounce scale-105 shadow-md shadow-red-500/40" 
                      : timeLeft < 10 
                        ? "bg-amber-500 text-white border-amber-600 animate-pulse" 
                        : "bg-white text-accent border-accent/20"
                  )}>
                    <span>⏱️</span>
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                )}
                
                <div className="relative">
                  <button 
                    type="button"
                    onClick={handleExitButtonClick} 
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs",
                      exitPromptActive 
                        ? "bg-red-600 text-white ring-2 ring-red-400 scale-105 shadow-md shadow-red-500/30" 
                        : "bg-white/80 hover:bg-red-50 text-text-muted hover:text-red-500 border border-white/60 hover:rotate-90"
                    )}
                    title="Batalkan Kuis"
                  >
                    <X size={16} />
                  </button>

                  {/* Verifikasi Pertama: Popup Teks Ringan */}
                  <AnimatePresence>
                    {exitPromptActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        onClick={handleExitButtonClick}
                        className="absolute right-0 top-full mt-2 z-50 cursor-pointer"
                      >
                        <div className="bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-2xl border border-slate-700/80 whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition-transform">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                          <span>Klik sekali lagi untuk keluar</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
          
          <div className="space-y-4">
            {currentQuestion.type === 'MULTIPLE_STATEMENTS' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                <HelpCircle size={12} className="text-accent" />
                <span className="text-[9px] font-black text-accent uppercase tracking-tighter">Format: Analisis Benar (B) atau Salah (S)</span>
              </div>
            )}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-text-main leading-tight tracking-tight">{currentQuestion.question}</h3>
          </div>

          <div className="space-y-4">
            {currentQuestion.type === 'MULTIPLE_STATEMENTS' ? (
              <div className="space-y-4">
                {currentQuestion.statements.map((stmt: any, idx: number) => (
                  <div key={idx} className="p-5 md:p-6 rounded-[2rem] border border-white bg-white/20 shadow-sm space-y-4">
                    <div className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">{String.fromCharCode(65 + idx)}</span>
                      <p className="text-sm md:text-base font-bold leading-relaxed flex-1 text-text-main">{stmt.text}</p>
                    </div>
                    <div className="flex gap-3">
                      {[true, false].map((val) => {
                        const isSelected = statementAnswers[idx] === val;
                        const isCorrect = stmt.isCorrect === val;
                        return (
                          <button
                            key={val ? 'B' : 'S'}
                            disabled={showExplanation}
                            onClick={() => {
                              const newAns = [...statementAnswers];
                              newAns[idx] = val;
                              setStatementAnswers(newAns);
                            }}
                            className={cn(
                              "flex-1 py-3 rounded-2xl text-[10px] sm:text-xs font-black transition-all border uppercase tracking-wider shadow-inner cursor-pointer",
                              isSelected
                                ? (showExplanation 
                                    ? (isCorrect ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20" : "bg-red-500 border-red-500 text-white shadow-red-500/20")
                                    : "bg-accent border-accent text-white shadow-accent/20")
                                : (showExplanation && isCorrect 
                                    ? "border-emerald-500 text-emerald-600 bg-emerald-50" 
                                    : "bg-white/40 border-transparent text-text-muted hover:bg-white/60")
                            )}
                          >
                            {val ? 'Benar (B)' : 'Salah (S)'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => setSelectedOption(idx)}
                    className={cn(
                      "w-full text-left p-5 rounded-[1.5rem] border transition-all group relative overflow-hidden cursor-pointer",
                      selectedOption === idx 
                        ? "border-accent bg-accent/5 ring-2 ring-accent/20 translate-x-1 md:translate-x-2" 
                        : "border-white/80 bg-white/30 hover:bg-white/60",
                      showExplanation && idx === currentQuestion.correctAnswer && "border-emerald-500 bg-emerald-50/50 scale-[1.01] shadow-xl shadow-emerald-500/10",
                      showExplanation && selectedOption === idx && idx !== currentQuestion.correctAnswer && "border-red-500 bg-red-50/50"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className={cn(
                        "w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black shrink-0 transition-all",
                        selectedOption === idx ? "bg-accent text-white border-accent" : "border-gray-200 bg-white group-hover:bg-accent group-hover:text-white"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm md:text-base font-bold leading-snug">{option}</div>
                        {showExplanation && currentQuestion.optionExplanations && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className={cn(
                              "mt-2 text-[10px] md:text-xs font-medium leading-relaxed p-3 rounded-xl border-l-4",
                              idx === currentQuestion.correctAnswer 
                                ? "bg-emerald-500/5 border-emerald-500 text-emerald-700" 
                                : "bg-red-500/5 border-red-500 text-red-700"
                            )}
                          >
                            {currentQuestion.optionExplanations[idx]}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-6 bg-accent/5 rounded-3xl border border-accent/20 space-y-3 shadow-inner"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-accent rounded-full" />
                  <span className="font-black text-[10px] text-accent uppercase tracking-[0.2em]">Deep Learning Insight</span>
                </div>
                <p className="text-[11px] md:text-xs text-text-muted leading-relaxed font-medium italic">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4">
            <button
              disabled={!isAnswered && !showExplanation}
              onClick={() => {
                if (!showExplanation) {
                  setShowExplanation(true);
                } else {
                  handleNext();
                }
              }}
              className={cn(
                "w-full py-5 rounded-[2rem] text-xs font-black shadow-2xl transition-all uppercase tracking-[0.3em] relative overflow-hidden active:scale-95 group cursor-pointer",
                !isAnswered && !showExplanation 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-accent text-white liquid-button hover:bg-[#1A4331]"
              )}
            >
              <span className="relative z-10">
                {!showExplanation ? "PERIKSA JAWABAN" : (currentIndex < questions.length - 1 ? "LANJUT KE SOAL BERIKUTNYA" : "LIHAT HASIL AKHIR")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
});
