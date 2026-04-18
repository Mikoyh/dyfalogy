import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Plus, MessageSquare, User, Sparkles, Search, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Conversation {
  id: string;
  type: 'ai' | 'p2p';
  participants: string[];
  title?: string;
  lastMessage?: string;
  updatedAt: any;
  unreadCount?: number;
  otherUser?: {
    displayName: string;
    photoURL: string;
    level: number;
  };
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export const ChatSidebar = memo(({ conversations, activeId, onSelect, onNewChat, isLoading }: ChatSidebarProps) => {
  const p2pChats = conversations.filter(c => c.type === 'p2p');
  const aiChats = conversations.filter(c => c.type === 'ai');

  return (
    <div className="w-full h-full flex flex-col bg-white/20 backdrop-blur-3xl border-r border-white/20">
      {/* Search & Actions */}
      <div className="p-4 space-y-4">
        <button 
          onClick={onNewChat}
          className="w-full py-3 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Percakapan Baru
        </button>
        
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Cari chat..."
            className="w-full bg-white/40 border border-white/50 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:bg-white/60 focus:border-accent/40 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* P2P Section */}
        <div className="px-4 py-2">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <User size={12} className="text-blue-500" /> Pesan Langsung
          </h3>
          <div className="space-y-1">
            {p2pChats.map((chat) => (
              <ChatRow 
                key={chat.id}
                chat={chat}
                isActive={activeId === chat.id}
                onClick={() => onSelect(chat.id)}
              />
            ))}
            {p2pChats.length === 0 && (
              <div className="text-[9px] text-text-muted/60 font-medium px-4 py-2 italic text-left">Belum ada teman...</div>
            )}
          </div>
        </div>

        {/* AI Section */}
        <div className="px-4 py-6">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2 text-left">
            <Sparkles size={12} className="text-accent" /> Dyfa AI Sessions
          </h3>
          <div className="space-y-1">
            {aiChats.map((chat) => (
              <ChatRow 
                key={chat.id}
                chat={chat}
                isActive={activeId === chat.id}
                onClick={() => onSelect(chat.id)}
              />
            ))}
            {aiChats.length === 0 && (
              <div className="text-[9px] text-text-muted/60 font-medium px-4 py-2 italic text-left">Belum ada chat AI...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const ChatRow = ({ chat, isActive, onClick }: { chat: Conversation, isActive: boolean, onClick: () => void }) => {
  const isAi = chat.type === 'ai';
  const title = isAi ? (chat.title || "Diskusi Biologi") : (chat.otherUser?.displayName || "Sobat Pejuang");
  const sub = chat.lastMessage || (isAi ? "Tanya Dyfa tentang materi..." : "Kirim pesan...");
  const avatar = isAi 
    ? null 
    : (chat.otherUser?.photoURL || `https://picsum.photos/seed/${chat.id}/100/100`);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-[20px] transition-all relative group",
        isActive 
          ? "bg-accent text-white shadow-xl shadow-accent/20" 
          : "hover:bg-white/40 text-text-main"
      )}
    >
      <div className="relative shrink-0">
        {isAi ? (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
            isActive ? "bg-white/20" : "bg-accent/10 text-accent"
          )}>
            <Sparkles size={18} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/50 shadow-sm">
            <img src={avatar!} className="w-full h-full object-cover" alt={title} referrerPolicy="no-referrer" />
          </div>
        )}
        {chat.unreadCount ? (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-white animate-bounce">
            {chat.unreadCount}
          </div>
        ) : !isAi && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <span className={cn(
            "text-xs font-black truncate tracking-tight transition-colors",
            isActive ? "text-white" : "text-text-main"
          )}>
            {title}
          </span>
          {chat.updatedAt && (
             <span className={cn(
                "text-[7px] font-bold uppercase whitespace-nowrap opacity-60",
                isActive ? "text-white/80" : "text-text-muted"
             )}>
              {new Date(chat.updatedAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          )}
        </div>
        <p className={cn(
          "text-[10px] truncate leading-normal transition-colors",
          isActive ? "text-white/70" : "text-text-muted"
        )}>
          {sub}
        </p>
      </div>

      {isActive && (
        <motion.div 
          layoutId="chat-active-indicator"
          className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full shadow-glow"
        />
      )}
    </button>
  );
};
