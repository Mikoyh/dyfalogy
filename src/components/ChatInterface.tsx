import React, { useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Paperclip, 
  X, 
  Mic, 
  CheckCheck, 
  ChevronDown 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

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
  startListening
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
  startListening: () => void
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
      "flex flex-col h-full relative overflow-hidden",
      isSidebar ? "bg-transparent" : "glass-card lg:rounded-[32px] border-none lg:border-border"
    )}>
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar"
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
              "p-4 rounded-[24px] shadow-sm relative group max-w-full",
              msg.role === 'user' 
                ? "bg-[#2D6A4F] text-white rounded-tr-none border border-black/5" 
                : "bg-white/80 backdrop-blur-md text-text-main rounded-tl-none border border-white/50"
            )}>
              <div className={cn(
                "prose prose-sm max-w-none break-words leading-relaxed text-left",
                msg.role === 'user' ? "prose-invert" : "prose-emerald"
              )}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
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
      <div className="p-4 md:p-1 shrink-0 bg-white/10 border-t border-white/20 backdrop-blur-xl">
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-3 flex items-center gap-3 bg-accent/5"
            >
              <div className="relative w-12 h-12 shrink-0">
                <img src={selectedImage} className="w-full h-full object-cover rounded-xl border-2 border-accent" alt="Preview" />
                <button 
                  onClick={onClearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={10} />
                </button>
              </div>
              <div className="text-[10px] font-bold text-text-muted italic">Gambar siap dianalisis...</div>
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={(e) => { e.preventDefault(); onSend(); }}
          className="flex items-end gap-2 p-3"
        >
          <div className="flex-1 bg-white/50 rounded-[28px] p-1.5 flex items-end shadow-inner gap-1 group focus-within:ring-2 focus-within:ring-accent/20 transition-all">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-text-muted hover:text-accent hover:bg-white rounded-full transition-all"
            >
              <Paperclip size={20} />
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
              className="flex-1 bg-transparent border-none focus:ring-0 p-2 text-sm max-h-[150px] min-h-[40px] resize-none leading-relaxed text-left"
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
                "p-2.5 rounded-full transition-all",
                isListening ? "bg-red-500 text-white animate-pulse" : "text-text-muted hover:text-accent hover:bg-white"
              )}
            >
              <Mic size={20} />
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-90 liquid-button disabled:opacity-50",
              (input.trim() || selectedImage) ? "bg-accent text-white shadow-accent/30" : "bg-white/40 text-text-muted"
            )}
          >
            <Send size={20} className={cn(input.trim() || selectedImage ? "translate-x-0.5" : "")} />
          </button>
        </form>
      </div>

      {!isSidebar && (
        <div className="hidden lg:flex justify-center p-2">
           <div className="p-1 px-3 bg-white/30 rounded-full flex items-center gap-2 cursor-pointer hover:bg-white/50 transition-all group">
              <ChevronDown size={14} className="text-text-muted group-hover:text-accent transition-colors" />
              <span className="text-[9px] font-black uppercase text-text-muted tracking-widest">Scroll Untuk Pesan Baru</span>
           </div>
        </div>
      )}
    </div>
  );
});
