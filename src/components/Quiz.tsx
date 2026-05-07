import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, HelpCircle } from 'lucide-react';
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
  const [statementAnswers, setStatementAnswers] = useState<(boolean | null)[]>([null, null, null, null]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds || 0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!timerSeconds || showExplanation || isFinished) return;
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
      <div className="glass-card rounded-[2rem] p-8 space-y-8 max-w-4xl mx-auto border border-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-accent via-emerald-400 to-accent" />
        
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase mb-2">Quiz Selesai</div>
          <h2 className="text-4xl font-black tracking-tight">Hasil Perjuanganmu</h2>
          <p className="text-text-muted text-sm">Berikut adalah rangkuman dari setiap soal yang telah kamu kerjakan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-border/50">
          <div className="text-center space-y-1">
            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Skor Akhir</div>
            <div className="text-6xl font-black text-accent">{Math.round(finalScore)}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Benar / Total</div>
            <div className="text-6xl font-black text-emerald-500">{finalCorrect} / {questions.length}</div>
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
                "p-6 rounded-3xl border transition-all",
                res.score > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
              )}>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</span>
                    <p className="font-bold text-sm leading-relaxed">{res.question}</p>
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
                        <div key={sIdx} className="text-[10px] flex items-center justify-between p-2 rounded-lg bg-white/40">
                          <span className="text-text-muted italic truncate max-w-[70%]">{text}</span>
                          <div className="flex gap-2">
                            <span className="font-bold">Pilihan: {res.selected[sIdx] ? 'B' : 'S'}</span>
                            <span className={cn("font-bold", res.selected[sIdx] === res.correct[sIdx] ? "text-emerald-500" : "text-red-500")}>
                              Kunci: {res.correct[sIdx] ? 'B' : 'S'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] space-y-1">
                      <div className="flex justify-between p-2 rounded-lg bg-white/40">
                        <span className="text-text-muted">Jawaban Kamu:</span>
                        <span className="font-bold">{res.options[res.selected] || "Tidak Dijawab"}</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-emerald-500/10 text-emerald-700">
                        <span className="font-bold">Jawaban Benar:</span>
                        <span className="font-black">{res.options[res.correct]}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/40 rounded-2xl border border-white/50 text-[10px] leading-relaxed text-text-muted italic">
                  <span className="font-black uppercase not-italic text-[8px] block mb-1 opacity-60">Insight Pembahasan:</span>
                  {res.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onFinish(finalScore, finalCorrect)}
          className="w-full py-5 bg-accent text-white rounded-2xl font-black shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
        >
          Kembali ke Dashboard & Klaim Hadiah
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-8 max-w-2xl mx-auto shadow-2xl relative border border-white/50 animate-float translate-z-10">
      {timerSeconds && (
        <div className="absolute top-0 left-0 h-2 bg-gray-100/30 w-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-accent to-emerald-400"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}
      
      <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center font-black text-xs shadow-lg shadow-accent/20">{currentIndex + 1}</div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Soal Progres {currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="flex items-center gap-4">
          {timerSeconds && (
            <div className={cn(
              "px-4 py-1.5 rounded-full font-mono font-black text-xs border transition-all",
              timeLeft < 10 ? "bg-red-500 text-white border-red-600 animate-bounce" : "bg-white text-accent border-accent/20"
            )}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
          <button onClick={() => setShowExitConfirm(true)} className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 hover:rotate-90 transition-all duration-500">
            <X size={16} />
          </button>
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
        <h3 className="text-xl md:text-2xl font-black text-text-main leading-tight tracking-tight">{currentQuestion.question}</h3>
      </div>

      <div className="space-y-4">
        {currentQuestion.type === 'MULTIPLE_STATEMENTS' ? (
          <div className="space-y-4">
            {currentQuestion.statements.map((stmt: any, idx: number) => (
              <div key={idx} className="p-5 rounded-[2rem] border border-white bg-white/20 shadow-sm space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">{String.fromCharCode(65 + idx)}</span>
                  <p className="text-sm font-bold leading-relaxed flex-1 text-text-main">{stmt.text}</p>
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
                          "flex-1 py-3 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-wider shadow-inner",
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
                  "w-full text-left p-5 rounded-[1.5rem] border transition-all group relative overflow-hidden",
                  selectedOption === idx 
                    ? "border-accent bg-accent/5 ring-2 ring-accent/20 translate-x-2" 
                    : "border-white/80 bg-white/30 hover:bg-white/60",
                  showExplanation && idx === currentQuestion.correctAnswer && "border-emerald-500 bg-emerald-50/50 scale-[1.02] shadow-xl shadow-emerald-500/10",
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
                    <div className="text-sm font-bold leading-snug">{option}</div>
                    {showExplanation && currentQuestion.optionExplanations && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className={cn(
                          "mt-2 text-[9px] font-medium leading-relaxed p-3 rounded-xl border-l-4",
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
            <p className="text-[11px] text-text-muted leading-relaxed font-medium italic">
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
            "w-full py-5 rounded-[2rem] text-xs font-black shadow-2xl transition-all uppercase tracking-[0.3em] relative overflow-hidden active:scale-95 group",
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
  );
});
