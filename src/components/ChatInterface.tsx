import React, { useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Paperclip, 
  X, 
  Mic, 
  CheckCheck, 
  ChevronDown,
  Trophy,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';

import { Conversation } from './ChatSidebar';

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
  onOpenMobileSidebar
}: { 
  messages: any[], 
  input: string, 
  setInput: (s: string) => void, 
  onSend: () => void, 
  isLoading: boolean,
  isSidebar?: boolean,
  selectedImage?: string | null,
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onClearImage: () => void,
  isListening: boolean,
  startListening: () => void,
  activeConv?: Conversation,
  isPro?: boolean,
  onOpenMobileSidebar?: () => void
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={cn(
      "flex flex-col h-full w-full max-w-full min-w-0 relative overflow-hidden",
      isSidebar ? "bg-transparent" : "glass-card lg:rounded-[40px] border-none shadow-2xl overflow-hidden chat-gradient"
    )}>
      {/* Header Info */}
      {activeConv && !isSidebar && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-md z-20 shrink-0 gap-2">
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20 shrink-0">
                <Sparkles size={18} className="sm:w-5 sm:h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0">
                <img src={activeConv.otherUser?.photoURL || `https://picsum.photos/seed/${activeConv.id}/100/100`} className="w-full h-full object-cover" alt="User" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm font-black text-text-main leading-tight truncate">
                  {activeConv.type === 'ai' ? (activeConv.title || "Dyfa AI Support") : activeConv.otherUser?.displayName}
                </div>
                {isPro && activeConv.type === 'ai' && (
                  <span className="bg-gold/10 text-gold text-[8px] font-black px-1.5 py-0.5 rounded border border-gold/20 flex items-center gap-1 shadow-sm shrink-0">
                    <Trophy size={8} /> PRO
                  </span>
                )}
              </div>
              <div className="text-[9px] sm:text-[10px] text-accent font-bold tracking-widest uppercase truncate">
                {activeConv.type === 'ai' ? (isPro ? "Generative AI Premium" : "AI Learning Model") : "Sobat Olimpiade"}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Dynamic Background for Full Page */}
      {!isSidebar && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 -z-10" />
      )}
      
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6 no-scrollbar pb-4"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 px-6">
            <div className="w-16 h-16 bg-accent/20 rounded-3xl flex items-center justify-center text-accent">
              <Sparkles size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black uppercase tracking-widest">Siap Membantu Sobat!</p>
              <p className="text-[10px] leading-relaxed max-w-[200px]">Tanyakan apa saja tentang Biologi, mulai dari Genetika sampai Ekologi.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            {msg.role === 'user' && msg.image && (
              <div className="mb-2 rounded-2xl overflow-hidden border-2 border-accent shadow-lg max-w-[200px]">
                <img src={msg.image} className="w-full h-auto" alt="User upload" />
              </div>
            )}
            
            <div className={cn(
              "p-3.5 sm:p-4 rounded-[24px] shadow-sm relative group max-w-full min-w-0 break-words overflow-hidden",
              msg.role === 'user' 
                ? "bg-[#2D6A4F] text-white rounded-tr-none border border-black/5" 
                : "bg-white/80 backdrop-blur-md text-text-main rounded-tl-none border border-white/50"
            )}>
              <div className={cn(
                "prose prose-sm max-w-none break-words leading-relaxed text-left overflow-wrap-break-word",
                msg.role === 'user' ? "prose-invert" : "prose-emerald"
              )}>
                <ReactMarkdown 
                  remarkPlugins={[remarkMath, remarkGfm]} 
                  rehypePlugins={[rehypeKatex]}
                  components={{
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
              
              <div className={cn(
                "flex items-center gap-1 mt-1 text-[8px] font-bold uppercase tracking-tighter",
                msg.role === 'user' ? "justify-end text-white/60" : "justify-start text-text-muted/40"
              )}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'user' && <CheckCheck size={10} className="text-white" />}
              </div>

              {/* Liquid Bubble Tip */}
              <div className={cn(
                "absolute top-0 w-4 h-4 overflow-hidden",
                msg.role === 'user' ? "-right-2" : "-left-2"
              )}>
                 <div className={cn(
                   "w-full h-full transform",
                    msg.role === 'user' ? "bg-[#2D6A4F] rotate-45 translate-y-[-50%] translate-x-[-50%]" : "bg-white/80 rotate-45 translate-y-[-50%] translate-x-[50%]"
                 )} />
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white/40 rounded-2xl border border-white/50 w-fit animate-pulse">
            <Sparkles size={14} className="text-accent animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-widest text-accent">Dyfa sedang berpikir...</div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={cn(
        "p-2.5 sm:p-4 shrink-0 w-full max-w-full min-w-0 bg-white/30 backdrop-blur-2xl border-t border-white/40 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
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
              <div className="text-[9px] font-bold text-text-muted italic">Gambar siap dianalisis...</div>
            </motion.div>
          )}
        </AnimatePresence>
 
        <form 
          onSubmit={(e) => { e.preventDefault(); onSend(); }}
          className="flex items-center gap-1.5 sm:gap-2 w-full max-w-full min-w-0"
        >
          <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-md rounded-[26px] px-2.5 sm:px-3 py-1 flex items-center shadow-inner gap-1 border-2 border-white/60 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20 focus-within:shadow-[0_0_25px_rgba(45,106,79,0.3)] focus-within:bg-white transition-all duration-300 ease-in-out min-h-[44px] sm:min-h-[48px]">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 sm:w-9 sm:h-9 text-text-muted hover:text-accent hover:bg-white/80 rounded-full transition-all shrink-0 outline-none focus:outline-none flex items-center justify-center my-auto"
              title="Lampirkan Gambar"
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
              placeholder="Tanya Dyfa AI..."
              className="flex-1 min-w-0 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none px-2 pt-[9px] pb-[7px] sm:pt-[10px] sm:pb-[8px] text-sm sm:text-base max-h-[120px] min-h-[36px] resize-none leading-normal text-left text-text-main placeholder:text-text-muted/60 my-auto font-normal align-middle"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
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
            title="Kirim Pesan"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
});
