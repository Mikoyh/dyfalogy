import React, { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, Sparkles, Search, Pin, Trash2, MoreVertical, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Conversation {
  id: string;
  type: 'ai' | 'p2p';
  participants: string[];
  title?: string;
  lastMessage?: string;
  updatedAt: any;
  unreadCount?: number;
  pinned?: boolean;
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
  onPinToggle?: (id: string, currentPinned: boolean) => void;
  onDelete?: (id: string) => void;
  isLoading: boolean;
}

export const ChatSidebar = memo(({ 
  conversations, 
  activeId, 
  onSelect, 
  onNewChat, 
  onPinToggle,
  onDelete,
  isLoading 
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatForOptions, setSelectedChatForOptions] = useState<Conversation | null>(null);
  const [chatToDelete, setChatToDelete] = useState<Conversation | null>(null);

  // Filter out empty/unstarted AI conversations from the sidebar history
  const isUnstartedAiChat = (c: Conversation) => {
    if (c.type !== 'ai') return false;
    const msg = c.lastMessage?.trim();
    return !msg || msg === 'Halo! Ada yang bisa Dyfa bantu?';
  };

  const filteredConvs = conversations.filter(c => {
    // Hide unstarted AI conversations
    if (isUnstartedAiChat(c)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title?.toLowerCase().includes(q);
    const msgMatch = c.lastMessage?.toLowerCase().includes(q);
    const userMatch = c.otherUser?.displayName.toLowerCase().includes(q);
    return titleMatch || msgMatch || userMatch;
  });

  const sortConvs = (list: Conversation[]) => {
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  };

  const p2pChats = sortConvs(filteredConvs.filter(c => c.type === 'p2p'));
  const aiChats = sortConvs(filteredConvs.filter(c => c.type === 'ai'));

  return (
    <div className="w-full h-full flex flex-col bg-white/20 backdrop-blur-3xl border-r border-white/20 relative">
      {/* Search & Actions */}
      <div className="p-4 space-y-3">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari chat..."
            className="w-full bg-white/40 border border-white/50 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:bg-white/60 focus:border-accent/40 shadow-sm transition-all text-text-main placeholder:text-text-muted/60"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* P2P Section */}
        {p2pChats.length > 0 && (
          <div className="px-4 py-2">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2 text-left">
              <User size={12} className="text-blue-500" /> Pesan Langsung
            </h3>
            <div className="space-y-1">
              {p2pChats.map((chat) => (
                <ChatRow 
                  key={chat.id}
                  chat={chat}
                  isActive={activeId === chat.id}
                  onClick={() => onSelect(chat.id)}
                  onOpenOptions={() => setSelectedChatForOptions(chat)}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Section */}
        <div className="px-4 py-3">
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
                onOpenOptions={() => setSelectedChatForOptions(chat)}
              />
            ))}
            {aiChats.length === 0 && (
              <div className="text-[10px] text-text-muted/60 font-medium px-4 py-3 italic text-left">
                {searchQuery ? "Tidak ada chat yang sesuai" : "Belum ada riwayat chat AI..."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Options Modal / Action Sheet */}
      <AnimatePresence>
        {selectedChatForOptions && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChatForOptions(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[90]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 bottom-6 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-80 bg-white/95 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl border border-white z-[100] space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs font-black text-text-main truncate max-w-[200px]">
                  {selectedChatForOptions.type === 'ai' ? (selectedChatForOptions.title || "Diskusi Biologi") : (selectedChatForOptions.otherUser?.displayName || "Chat")}
                </span>
                <button 
                  onClick={() => setSelectedChatForOptions(null)}
                  className="p-1 text-text-muted hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                <button 
                  type="button"
                  onClick={() => {
                    const chat = selectedChatForOptions;
                    setSelectedChatForOptions(null);
                    onPinToggle?.(chat.id, !!chat.pinned);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-2xl text-xs font-bold text-text-main transition-colors text-left"
                >
                  <Pin size={16} className={cn(selectedChatForOptions.pinned ? "text-amber-500 fill-amber-500" : "text-accent")} />
                  {selectedChatForOptions.pinned ? "Lepas Sematan Obrolan" : "Sematkan Obrolan Ke Atas"}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    const chat = selectedChatForOptions;
                    setSelectedChatForOptions(null);
                    setChatToDelete(chat);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-2xl text-xs font-bold text-red-600 transition-colors text-left"
                >
                  <Trash2 size={16} className="text-red-500" />
                  Hapus Obrolan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {chatToDelete && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white/95 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white z-[120] text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={24} />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-base font-black text-text-main">Hapus Obrolan Ini?</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Beneran mau hapus obrolan ini, bang? Semua riwayat pesan di dalamnya bakal hilang permanen dan nggak bisa dikembalikan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setChatToDelete(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-text-main font-black text-xs rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (chatToDelete) {
                      onDelete?.(chatToDelete.id);
                      setChatToDelete(null);
                    }
                  }}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-red-500/30 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

const ChatRow = ({ 
  chat, 
  isActive, 
  onClick,
  onOpenOptions
}: { 
  chat: Conversation, 
  isActive: boolean, 
  onClick: () => void,
  onOpenOptions: () => void
}) => {
  const isAi = chat.type === 'ai';
  const title = isAi ? (chat.title || "Diskusi Biologi") : (chat.otherUser?.displayName || "Sobat Pejuang");
  const sub = chat.lastMessage || (isAi ? "Tanya Dyfa tentang materi..." : "Kirim pesan...");
  const avatar = isAi 
    ? null 
    : (chat.otherUser?.photoURL || `https://picsum.photos/seed/${chat.id}/100/100`);

  const timerRef = useRef<any>(null);

  // Long press support for touch devices
  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      onOpenOptions();
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenOptions();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "w-full flex items-center gap-2.5 p-2.5 sm:p-3 rounded-[20px] transition-all relative group cursor-pointer select-none",
        isActive 
          ? "bg-accent text-white shadow-xl shadow-accent/20" 
          : "hover:bg-white/50 text-text-main"
      )}
    >
      <div className="relative shrink-0">
        {isAi ? (
          <div className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
            isActive ? "bg-white/20" : "bg-accent/10 text-accent"
          )}>
            <Sparkles size={18} />
          </div>
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-white/50 shadow-sm">
            <img src={avatar!} className="w-full h-full object-cover" alt={title} referrerPolicy="no-referrer" />
          </div>
        )}
        {chat.pinned && (
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-md border border-white">
            <Pin size={9} className="fill-amber-950" />
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
        <div className="flex items-center justify-between gap-1 overflow-hidden">
          <span className={cn(
            "text-xs font-black truncate tracking-tight transition-colors flex items-center gap-1",
            isActive ? "text-white" : "text-text-main"
          )}>
            {title}
          </span>
          {chat.updatedAt?.seconds && (
             <span className={cn(
                "text-[8px] font-bold uppercase whitespace-nowrap opacity-60 shrink-0",
                isActive ? "text-white/80" : "text-text-muted"
             )}>
              {new Date(chat.updatedAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          )}
        </div>
        <p className={cn(
          "text-[10px] truncate leading-normal transition-colors mt-0.5",
          isActive ? "text-white/80" : "text-text-muted"
        )}>
          {sub}
        </p>
      </div>

      {/* Options Button (3-dots) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenOptions();
        }}
        className={cn(
          "p-1.5 rounded-lg transition-all shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
          isActive 
            ? "hover:bg-white/20 text-white" 
            : "hover:bg-black/10 text-text-muted hover:text-accent"
        )}
        title="Opsi Obrolan"
      >
        <MoreVertical size={15} />
      </button>
    </div>
  );
};


