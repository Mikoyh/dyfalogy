import React, { useRef, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Paperclip, 
  X, 
  Mic, 
  CheckCheck, 
  ChevronDown,
  ChevronUp,
  Trophy,
  MessageSquare,
  Zap,
  Brain,
  Film,
  Crown,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  FastForward,
  Terminal
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { Conversation } from './ChatSidebar';
import { VeoVideoModal } from './VeoVideoModal';

// Strips markdown tokens to produce clean, human-readable text for copying
export function cleanMarkdownForCopy(md: string): string {
  if (!md) return '';
  return md
    // Clean block math ($$...$$) -> formula content
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    // Clean inline math ($...$) -> formula content
    .replace(/\$([^\$\n]+)\$/g, '$1')
    // Clean markdown headings (# Title -> Title)
    .replace(/^#{1,6}\s*(.+)$/gm, '$1')
    // Clean bold and italic markers (***text***, **text**, *text*, ___text___, __text__, _text_)
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/___([^_]+)___/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Clean strikethrough (~~text~~ -> text)
    .replace(/~~([^~]+)~~/g, '$1')
    // Clean blockquotes (> quote -> quote)
    .replace(/^>\s?/gm, '')
    // Clean code block fences (```lang\n...``` -> ...)
    .replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, '$1')
    // Clean inline backticks (`code` -> code)
    .replace(/`([^`]+)`/g, '$1')
    // Clean links: [Text](URL) -> Text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Clean images: ![alt](url) -> ""
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Clean list markers (*, -, + -> • )
    .replace(/^[\*\-\+]\s+/gm, '• ')
    // Normalize excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Custom CodeBlock Component with horizontal scrolling & dedicated copy button
const ChatCodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const rawContent = String(children).replace(/\n$/, '');

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-emerald-100/90 text-emerald-950 font-mono text-[11px] font-bold border border-emerald-300/50 break-words chat-selectable" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-3 w-full max-w-full rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/90 border-b border-slate-800 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
          <span className="font-semibold text-emerald-400 uppercase tracking-wider truncate">
            {language ? language : "Diagram Alur / Format Konsep"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all active:scale-95 text-[10px] shrink-0 font-medium"
          title="Salin diagram ini"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Salin Diagram</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Smooth Horizontal Scroll & Non-clipping */}
      <div className="overflow-x-auto p-3.5 sm:p-4 text-xs font-mono leading-relaxed custom-scrollbar whitespace-pre scroll-smooth text-emerald-300/90 select-text chat-selectable max-w-full">
        <code className="!bg-transparent !p-0 !m-0 !text-inherit font-mono block min-w-fit" {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

const LIVE_THINKING_STAGES = [

  { icon: "🔍", text: "Menganalisis pertanyaan & konsep biologi utama..." },
  { icon: "🧬", text: "Menelusuri database silabus OSN & referensi Campbell Biology..." },
  { icon: "🧪", text: "Memeriksa mekanisme molekuler, reaksi & rumus relevan..." },
  { icon: "✍️", text: "Menyusun penjelasan sistematis, analogi visual & kesimpulan..." }
];

export const ChatInterface = memo(({ 
  messages, 
  input, 
  setInput, 
  onSend, 
  isLoading, 
  isSidebar = false,
  selectedImage,
  onImageSelect,
  onClearImage,
  isListening,
  startListening,
  activeConv,
  isPro = false,
  onOpenMobileSidebar,
  onQuickAnswer,
  aiMode = 'standard',
  setAiMode,
  onPlayTTS,
  onUpgradePro
}: { 
  messages: any[], 
  input: string, 
  setInput: (s: string) => void, 
  onSend: (mode?: 'standard' | 'fast' | 'pro') => void, 
  isLoading: boolean,
  isSidebar?: boolean,
  selectedImage?: string | null,
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onClearImage: () => void,
  isListening: boolean,
  startListening: () => void,
  activeConv?: Conversation,
  isPro?: boolean,
  onOpenMobileSidebar?: () => void,
  onQuickAnswer?: () => void,
  aiMode?: 'standard' | 'fast' | 'pro',
  setAiMode?: (mode: 'standard' | 'fast' | 'pro') => void,
  onPlayTTS?: (text: string) => void,
  onUpgradePro?: () => void
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showVeoModal, setShowVeoModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<number, boolean>>({});

  // Dynamic Thinking Progress Simulation
  const [currentThoughtStage, setCurrentThoughtStage] = useState(0);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);

  useEffect(() => {
    let stageTimer: NodeJS.Timeout;
    let secTimer: NodeJS.Timeout;

    if (isLoading) {
      setCurrentThoughtStage(0);
      setThinkingSeconds(0);

      secTimer = setInterval(() => {
        setThinkingSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);

      stageTimer = setInterval(() => {
        setCurrentThoughtStage((prev) => (prev + 1) % LIVE_THINKING_STAGES.length);
      }, 1500);
    }

    return () => {
      clearInterval(stageTimer);
      clearInterval(secTimer);
    };
  }, [isLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentThoughtStage]);

  const handleCopyText = (text: string, idx: number) => {
    const cleanText = cleanMarkdownForCopy(text);
    navigator.clipboard.writeText(cleanText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleThought = (idx: number) => {
    setExpandedThoughts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className={cn(
      "flex flex-col h-full w-full max-w-full min-w-0 relative overflow-hidden",
      isSidebar ? "bg-transparent" : "glass-card lg:rounded-[40px] border-none shadow-2xl overflow-hidden chat-gradient"
    )}>
      {/* Header Info */}
      {activeConv && !isSidebar && (
        <div className="px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-white/20 bg-white/40 backdrop-blur-md z-20 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onOpenMobileSidebar && (
              <button 
                type="button"
                onClick={onOpenMobileSidebar}
                className="md:hidden p-2 text-accent bg-white/60 hover:bg-white rounded-xl transition-all shadow-sm border border-white/60 active:scale-95 flex items-center gap-1.5 font-bold text-xs shrink-0"
                title="Buka Daftar Obrolan"
              >
                <MessageSquare size={18} />
                <span className="hidden xs:inline">Obrolan</span>
              </button>
            )}

            {activeConv.type === 'ai' ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20 shrink-0">
                <Sparkles size={18} className="sm:w-5 sm:h-5 text-emerald-200" />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
                <img src={activeConv.otherUser?.photoURL || `https://picsum.photos/seed/${activeConv.id}/100/100`} className="w-full h-full object-cover" alt="User" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm font-black text-text-main leading-tight truncate">
                  {activeConv.type === 'ai' ? (activeConv.title || "Dyfa Super AI") : activeConv.otherUser?.displayName}
                </div>
                {isPro && activeConv.type === 'ai' && (
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shrink-0">
                    <Trophy size={8} /> PRO
                  </span>
                )}
              </div>
              <div className="text-[9px] sm:text-[10px] text-accent font-bold tracking-wider uppercase flex items-center gap-1.5 min-w-0">
                <span className="truncate">{activeConv.type === 'ai' ? "Gemini Super AI Engine" : "Sobat Olimpiade"}</span>
                {activeConv.type === 'ai' && (
                  <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Mode Selector & Veo Video Tool Header Button */}
          {activeConv.type === 'ai' && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Veo 3 Video Generator Button */}
              <button
                type="button"
                onClick={() => setShowVeoModal(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-md border border-emerald-500/30 transition-all active:scale-95"
                title="Buka Generator Video AI Veo 3"
              >
                <Film size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">Buat Video AI</span>
                <span className="sm:hidden">Video</span>
                <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1 rounded-sm">PRO</span>
              </button>

              {/* Mode Selector */}
              {setAiMode && (
                <div className="hidden xs:flex items-center bg-white/70 p-0.5 rounded-xl border border-white/60 shadow-inner text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setAiMode('fast')}
                    className={cn(
                      "px-2 py-1 rounded-lg transition-all flex items-center gap-1",
                      aiMode === 'fast' ? "bg-emerald-600 text-white shadow-sm" : "text-text-muted hover:text-text-main"
                    )}
                    title="Respon kilat tanpa penalaran panjang"
                  >
                    <Zap size={11} />
                    <span>Cepat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiMode('standard')}
                    className={cn(
                      "px-2 py-1 rounded-lg transition-all flex items-center gap-1",
                      aiMode === 'standard' ? "bg-emerald-600 text-white shadow-sm" : "text-text-muted hover:text-text-main"
                    )}
                    title="Gemini 3.7 Super AI"
                  >
                    <Sparkles size={11} />
                    <span>Super AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiMode('pro')}
                    className={cn(
                      "px-2 py-1 rounded-lg transition-all flex items-center gap-1",
                      aiMode === 'pro' ? "bg-emerald-600 text-white shadow-sm" : "text-text-muted hover:text-text-main"
                    )}
                    title="Penalaran Mendalam OSN"
                  >
                    <Brain size={11} />
                    <span>Pro Analisis</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Background */}
      {!isSidebar && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 -z-10" />
      )}
      
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 no-scrollbar pb-4"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-75 px-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-base font-black uppercase tracking-wider text-text-main">Dyfa Super AI Siap Membantu</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Tanyakan materi biologi, minta penjelasan konsep rumit, analisis gambar mikroskopis, hingga pembuatan animasi video Veo 3!
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md pt-2">
              {[
                "Jelaskan jalur glikolisis dan ATP",
                "Bagaimana hukum Hardy-Weinberg bekerja?",
                "Perbedaan sel prokariotik dan eukariotik",
                "Buat analogi mudah untuk Dogma Sentral"
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(sample);
                    setTimeout(() => onSend(aiMode), 50);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-accent border border-accent/20 shadow-xs hover:shadow-md transition-all active:scale-95"
                >
                  ✨ {sample}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex flex-col max-w-[88%] sm:max-w-[82%] animate-in fade-in slide-in-from-bottom-2",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            {msg.role === 'user' && msg.image && (
              <div className="mb-2 rounded-2xl overflow-hidden border-2 border-accent shadow-lg max-w-[220px]">
                <img src={msg.image} className="w-full h-auto" alt="User upload" />
              </div>
            )}
            
            <div className={cn(
              "p-3.5 sm:p-5 rounded-[26px] shadow-sm relative group max-w-full min-w-0 break-words border chat-selectable select-text",
              msg.role === 'user' 
                ? "bg-[#2D6A4F] text-white rounded-tr-none border-emerald-700/50" 
                : "bg-white/90 backdrop-blur-md text-text-main rounded-tl-none border-white/80 shadow-md"
            )}>
              {/* Optional Thinking Process Disclosure for Model Responses */}
              {msg.role !== 'user' && msg.thoughtSteps && msg.thoughtSteps.length > 0 && (
                <div className="mb-3 pb-3 border-b border-emerald-950/10">
                  <button
                    type="button"
                    onClick={() => toggleThought(i)}
                    className="flex items-center justify-between w-full text-[11px] font-bold text-accent/80 hover:text-accent bg-emerald-50/80 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Brain size={13} className="text-accent" />
                      <span>Proses Berpikir Dyfa Super AI</span>
                    </span>
                    {expandedThoughts[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <AnimatePresence>
                    {expandedThoughts[i] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 space-y-1 pl-2 text-[10px] text-text-muted font-mono"
                      >
                        {msg.thoughtSteps.map((step: string, sIdx: number) => (
                          <div key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-accent font-bold">✓</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Main Content Markdown */}
              <div className={cn(
                "prose prose-sm max-w-none break-words leading-relaxed text-left overflow-wrap-break-word chat-selectable select-text",
                msg.role === 'user' ? "prose-invert" : "prose-emerald"
              )}>
                <ReactMarkdown 
                  remarkPlugins={[remarkMath, remarkGfm]} 
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    pre: ({ node, children, ...props }) => (
                      <div className="w-full max-w-full overflow-hidden my-1">{children}</div>
                    ),
                    code: ChatCodeBlock,
                    table: ({ node, ...props }) => (
                      <div className="relative my-3.5 w-full max-w-full overflow-hidden rounded-2xl border-2 border-accent/20 bg-white/95 shadow-md">
                        <div className="overflow-x-auto max-w-full custom-scrollbar scroll-smooth">
                          <table className="w-full text-left text-xs border-collapse min-w-[360px]" {...props} />
                        </div>
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-emerald-100/90 text-accent font-black uppercase tracking-wider text-[11px]" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="px-3.5 py-2.5 font-bold border-b-2 border-accent/20 border-r border-accent/15 last:border-r-0 whitespace-nowrap text-text-main bg-emerald-100/90" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-3.5 py-2 text-xs border-t border-r border-emerald-900/10 last:border-r-0 whitespace-nowrap sm:whitespace-normal text-text-main" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr className="hover:bg-accent/10 transition-colors odd:bg-emerald-50/30 even:bg-white" {...props} />
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              
              {/* Message Bottom Toolbar */}
              <div className={cn(
                "flex items-center gap-2 mt-2 pt-1 border-t border-black/5 text-[9px] font-bold tracking-tighter select-none",
                msg.role === 'user' ? "justify-end text-white/70" : "justify-between text-text-muted/60"
              )}>
                {msg.role !== 'user' && (
                  <div className="flex items-center gap-1.5">
                    {onPlayTTS && (
                      <button
                        type="button"
                        onClick={() => onPlayTTS(msg.content)}
                        className="p-1 hover:bg-emerald-100/60 rounded-md text-accent transition-all flex items-center gap-1"
                        title="Dengarkan Suara"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.content, i)}
                      className="px-1.5 py-0.5 hover:bg-emerald-100/70 rounded-md text-accent transition-all flex items-center gap-1 active:scale-95"
                      title="Salin Teks Bersih (Tanpa Simbol Markdown)"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-[9px] text-emerald-700 font-bold">Disalin (Teks Bersih)</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span className="text-[9px] text-text-muted">Salin Teks</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.role === 'user' && <CheckCheck size={11} className="text-white" />}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Live Thinking Indicator with Stage Explanation & Instant Answer Button */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-emerald-500/30 shadow-xl max-w-md mr-auto space-y-3"
          >
            {/* Thinking Status Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
                  <Sparkles size={16} className="animate-spin text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <span>Dyfa Super AI Sedang Berpikir</span>
                    <span className="text-[10px] font-mono text-emerald-600">({thinkingSeconds}s)</span>
                  </div>
                  <div className="text-[10px] text-text-muted">Menganalisis dengan penalaran mendalam</div>
                </div>
              </div>

              {/* Jawab Sekarang (Answer Now) Button */}
              {onQuickAnswer && (
                <button
                  type="button"
                  onClick={onQuickAnswer}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md active:scale-95 transition-all shrink-0"
                  title="Lewati proses berpikir dan dapatkan jawaban langsung"
                >
                  <FastForward size={12} />
                  <span>Jawab Sekarang</span>
                </button>
              )}
            </div>

            {/* Current Dynamic Thinking Stage */}
            <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 flex items-center gap-2 text-xs font-medium text-emerald-900 animate-pulse">
              <span className="text-base">{LIVE_THINKING_STAGES[currentThoughtStage].icon}</span>
              <span className="text-[11px] leading-tight">{LIVE_THINKING_STAGES[currentThoughtStage].text}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className={cn(
        "p-2.5 sm:p-4 shrink-0 w-full max-w-full min-w-0 bg-white/40 backdrop-blur-2xl border-t border-white/40 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        isSidebar ? "rounded-none" : "lg:rounded-b-[40px]"
      )}>
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3 py-2 flex items-center gap-2 bg-accent/5 rounded-xl mb-2 border border-white/50"
            >
              <div className="relative w-10 h-10 shrink-0">
                <img src={selectedImage} className="w-full h-full object-cover rounded-lg border border-accent" alt="Preview" />
                <button 
                  onClick={onClearImage}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-lg"
                >
                  <X size={8} />
                </button>
              </div>
              <div className="text-[9px] font-bold text-text-muted italic">Gambar siap dianalisis dengan visi Gemini Super AI...</div>
            </motion.div>
          )}
        </AnimatePresence>
 
        <form 
          onSubmit={(e) => { e.preventDefault(); onSend(aiMode); }}
          className="flex items-center gap-1.5 sm:gap-2 w-full max-w-full min-w-0"
        >
          <div className="flex-1 min-w-0 bg-white/90 backdrop-blur-md rounded-[26px] px-2.5 sm:px-3 py-1 flex items-center shadow-inner gap-1 border-2 border-white/60 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20 focus-within:bg-white transition-all duration-300 ease-in-out min-h-[44px] sm:min-h-[48px]">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 sm:w-9 sm:h-9 text-text-muted hover:text-accent hover:bg-white/80 rounded-full transition-all shrink-0 outline-none focus:outline-none flex items-center justify-center my-auto"
              title="Lampirkan Gambar untuk Analisis"
            >
              <Paperclip size={18} />
            </button>
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={onImageSelect}
            />
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya Dyfa Super AI apa saja..."
              className="flex-1 min-w-0 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none px-2 pt-[9px] pb-[7px] sm:pt-[10px] sm:pb-[8px] text-sm sm:text-base max-h-[120px] min-h-[36px] resize-none leading-normal text-left text-text-main placeholder:text-text-muted/60 my-auto font-normal align-middle"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend(aiMode);
                }
              }}
              rows={1}
            />

            <button 
              type="button"
              onClick={startListening}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all shrink-0 outline-none focus:outline-none flex items-center justify-center my-auto",
                isListening ? "bg-red-500 text-white animate-pulse" : "text-text-muted hover:text-accent hover:bg-white/80"
              )}
              title="Input Suara"
            >
              <Mic size={18} />
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 liquid-button disabled:opacity-50 shrink-0 outline-none focus:outline-none my-auto",
              (input.trim() || selectedImage) ? "bg-accent text-white shadow-accent/30 hover:shadow-accent/50" : "bg-white/40 text-text-muted"
            )}
            title="Kirim ke Super AI"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Veo Video Modal */}
      <VeoVideoModal
        isOpen={showVeoModal}
        onClose={() => setShowVeoModal(false)}
        isPro={isPro}
        initialPrompt={input ? `3D animation explaining: ${input}` : undefined}
        onUpgradePro={onUpgradePro}
      />
    </div>
  );
});
