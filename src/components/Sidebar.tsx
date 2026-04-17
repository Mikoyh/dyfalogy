import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Brain, 
  Search as SearchIcon, 
  Mic, 
  BookOpen, 
  Archive, 
  Users, 
  MessageSquare, 
  User, 
  Zap, 
  LifeBuoy 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LESSONS, Lesson } from '../constants/data';

export const Sidebar = memo(({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  onClose,
  quizHistory,
  onSelectLesson,
  onSearch,
  searchQuery,
  setSearchQuery,
  startListening,
  isListening
}: { 
  activeTab: string, 
  setActiveTab: (t: string) => void, 
  isOpen: boolean, 
  onClose: () => void,
  quizHistory: any[],
  onSelectLesson: (l: Lesson) => void,
  onSearch: (q: string) => void,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  startListening: () => void,
  isListening: boolean
}) => {
  const groups = [
    {
      label: 'Kurikulum',
      items: [
        { id: 'dashboard', icon: Brain, label: 'Dashboard' },
        { id: 'lessons', icon: BookOpen, label: 'Mulai Belajar' },
        { id: 'osn-archive', icon: Archive, label: 'Arsip OSN' },
      ]
    },
    {
      label: 'Interaksi',
      items: [
        { id: 'forum', icon: Users, label: 'Forum Komunitas' },
        { id: 'chat', icon: MessageSquare, label: 'Dyfa AI' },
      ]
    },
    {
      label: 'Personal',
      items: [
        { id: 'profile', icon: User, label: 'Profil Saya' },
        { id: 'strategies', icon: Zap, label: 'Strategi Belajar' },
        { id: 'customer-service', icon: LifeBuoy, label: 'Pusat Bantuan' },
      ]
    }
  ];

  const content = (
    <div className="w-[280px] h-full glass-sidebar text-white flex flex-col p-6 shrink-0 relative overflow-y-auto no-scrollbar">
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-6 right-6 p-1 text-white/50 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="text-2xl font-extrabold tracking-tighter text-[#74C69D] mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-xl shadow-accent/30">
          <Brain size={22} />
        </div>
        DYFALOGY
      </div>

      <div className="mb-6 relative group lg:hidden">
        <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Cari sesuatu..." 
          className="w-full bg-white/10 border border-white/20 rounded-xl py-2 pl-9 pr-10 text-xs focus:outline-none focus:bg-white/20 focus:border-accent transition-all text-white placeholder:text-white/30"
        />
        <button 
          onClick={startListening}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all",
            isListening ? "bg-red-500 text-white animate-pulse" : "text-white/40 hover:text-accent"
          )}
        >
          <Mic size={14} />
        </button>
      </div>
      
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#40916C] opacity-60 px-3 text-left">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); onClose(); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300",
                    activeTab === item.id 
                      ? "bg-accent text-white shadow-lg shadow-accent/20" 
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon size={16} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {quizHistory.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-accent px-3 text-left">
              Materi Terakhir
            </div>
            <div className="space-y-1">
              {quizHistory.map((res) => {
                const lesson = LESSONS.find(l => l.id === res.lessonId);
                if (!lesson) return null;
                const progress = res.score || 0;
                return (
                  <button
                    key={res.lessonId}
                    onClick={() => { 
                      onSelectLesson(lesson); 
                      setActiveTab('lessons'); 
                      onClose(); 
                    }}
                    className="w-full group px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-white/80 line-clamp-1 group-hover:text-accent transition-colors">{lesson.title}</span>
                      <span className="text-[9px] font-mono text-white/40">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn("h-full transition-all", progress >= 70 ? "bg-emerald-400" : "bg-accent")}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
          <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Target OSP 2026</div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              className="h-full bg-accent"
            />
          </div>
          <div className="text-[9px] text-white/40 mt-2">65% Persiapan Selesai</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block h-full">
        {content}
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] lg:hidden"
            />
            <motion.div 
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[80] lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
