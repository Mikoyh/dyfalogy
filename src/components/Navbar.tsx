import React, { useState, memo } from 'react';
import { 
  Menu, 
  Search as SearchIcon, 
  Mic, 
  MessageSquare, 
  LogOut 
} from 'lucide-react';
import { cn } from '../lib/utils';

// Dummy ConfirmationModal for local use
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
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl overflow-hidden border border-white/50">
         <div className="space-y-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-sm">Batal</button>
            <button onClick={onConfirm} className={cn("flex-1 py-3 rounded-xl font-bold text-sm text-white", isDanger ? "bg-red-500" : "bg-accent")}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Navbar = memo(({ 
  user, 
  onLogout, 
  activeTab, 
  onToggleAi, 
  onToggleSidebar,
  onProfileClick,
  onSearch,
  searchQuery,
  setSearchQuery,
  isListening,
  startListening
}: { 
  user: any, 
  onLogout: () => void, 
  activeTab: string, 
  onToggleAi: () => void, 
  onToggleSidebar: () => void,
  onProfileClick: () => void,
  onSearch: (q: string) => void,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  isListening: boolean,
  startListening: () => void
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  return (
    <>
      <nav className="h-16 glass-nav flex items-center justify-between px-4 md:px-6 shrink-0 z-50 sticky top-0 border-b border-white/10 lg:border-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-accent hover:bg-accent/10 rounded-full transition-all"
          >
            <Menu size={20} />
          </button>
          <div className="text-sm font-medium flex items-center gap-2">
            <span className="text-text-muted hidden sm:inline">dyfalogy /</span> 
            <span className="font-bold text-accent whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-none text-left">
              {activeTab === 'dashboard' ? 'Overview' : 
               activeTab === 'lessons' ? 'Mulai Belajar' : 
               activeTab === 'strategies' ? 'Strategi Belajar' : 
               activeTab === 'forum' ? 'Komunitas' : 
               activeTab === 'profile' ? 'Profil Saya' : 
               activeTab === 'osn-archive' ? 'Arsip OSN' :
               activeTab === 'customer-service' ? 'Layanan Pelanggan' : 'Dyfa AI'}
            </span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-6 hidden md:block relative group">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Cari materi, strategi, atau topik..." 
              className="w-full bg-white/40 border border-white/50 rounded-full py-2.5 pl-11 pr-12 text-sm focus:outline-none focus:bg-white/80 focus:border-accent/40 shadow-sm transition-all text-left"
            />
            <button 
              onClick={startListening}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
                isListening ? "bg-red-500 text-white animate-pulse" : "text-text-muted hover:text-accent/10 hover:text-accent"
              )}
            >
              <Mic size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          {activeTab !== 'chat' && (
            <button 
              onClick={onToggleAi}
              className="xl:hidden p-2 text-accent hover:bg-accent/10 rounded-full transition-all"
            >
              <MessageSquare size={20} />
            </button>
          )}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-main leading-none">{user.displayName}</p>
                <p className="text-[11px] text-text-muted mt-1">Rank: #{user.rank || '12'} Nasional</p>
              </div>
              <div 
                onClick={onProfileClick}
                className="relative group cursor-pointer"
              >
                <div 
                  className="w-10 h-10 rounded-full p-0.5"
                  style={{ 
                    background: user.profileBorder && user.profileBorder !== 'none' 
                      ? (user.profileBorder.includes('gradient') ? user.profileBorder : `conic-gradient(from 0deg, #FFD700, transparent, #FFD700)`)
                      : 'transparent' 
                  }}
                >
                  <img 
                    src={user.photoURL || 'https://picsum.photos/seed/user/100/100'} 
                    className="w-full h-full rounded-full border border-white/50 shadow-sm object-cover"
                    alt="Profile"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-1 -right-1 bg-gold text-[9px] font-black px-1.5 py-0.5 rounded border border-white badge-glow">
                  LVL {user.level || 1}
                </div>
              </div>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="p-1.5 text-text-muted hover:text-red-600 transition-colors liquid-button"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </nav>

      <ConfirmationModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={onLogout}
        title="Keluar dari Dyfalogy?"
        message="Kamu akan mengakhiri sesi belajar saat ini. Pastikan progresmu sudah tersimpan."
        confirmText="Ya, Keluar"
        isDanger={true}
      />
    </>
  );
});
