/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  User, 
  LogOut, 
  ChevronRight, 
  Award, 
  Zap, 
  Search,
  Menu,
  X,
  Send,
  Sparkles,
  Users,
  Plus,
  MessageCircle,
  Trophy,
  Star,
  Mic,
  Volume2,
  HelpCircle,
  Archive,
  Search as SearchIcon,
  ChevronDown,
  Info,
  ShieldCheck,
  LifeBuoy,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2
} from 'lucide-react';
import { LESSONS, STUDY_STRATEGIES, BADGES, Lesson, Badge, CATEGORIES } from './constants/data';
import { getGeminiResponse, generateQuiz, generateTTS } from './lib/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { AuthPage } from './components/AuthPage';
import { ProfilePage } from './components/ProfilePage';

// --- Components ---

const Navbar = ({ 
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
}) => (
  <nav className="h-16 glass-nav flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
    <div className="flex items-center gap-3">
      <button 
        onClick={onToggleSidebar}
        className="lg:hidden p-2 text-accent hover:bg-accent/10 rounded-full transition-all"
      >
        <Menu size={20} />
      </button>
      <div className="text-sm font-medium flex items-center gap-2">
        <span className="text-text-muted hidden sm:inline">dyfalogy /</span> 
        <span className="font-bold text-accent whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-none">
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
          className="w-full bg-white/40 border border-white/50 rounded-full py-2.5 pl-11 pr-12 text-sm focus:outline-none focus:bg-white/80 focus:border-accent/40 shadow-sm transition-all"
        />
        <button 
          onClick={startListening}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
            isListening ? "bg-red-500 text-white animate-pulse" : "text-text-muted hover:bg-accent/10 hover:text-accent"
          )}
        >
          <Mic size={16} />
        </button>
      </div>
    </div>
    
    <div className="flex items-center gap-3 sm:gap-4">
      <button 
        onClick={onToggleAi}
        className="xl:hidden p-2 text-accent hover:bg-accent/10 rounded-full transition-all"
      >
        <MessageSquare size={20} />
      </button>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-main leading-none">{user.displayName}</p>
            <p className="text-[11px] text-text-muted mt-1">Rank: #12 Nasional</p>
          </div>
          <div 
            onClick={onProfileClick}
            className="relative group cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-full p-0.5"
              style={{ 
                background: user.profileBorder && user.profileBorder !== 'none' 
                  ? `conic-gradient(from 0deg, #FFD700, transparent, #FFD700)` 
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
            onClick={onLogout}
            className="p-1.5 text-text-muted hover:text-red-600 transition-colors liquid-button"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  </nav>
);

const Sidebar = ({ 
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

      {/* Sidebar Search */}
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
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#40916C] opacity-60 px-3">
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

        {/* Recent History Section */}
        {quizHistory.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-accent px-3">
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
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        {content}
      </div>

      {/* Mobile Sidebar */}
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
};

// --- Landing Page Component ---

const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  const features = [
    {
      icon: Sparkles,
      title: "AI Tutor 24/7",
      desc: "Tanya apa saja tentang Biologi Sel, Genetika, hingga Ekologi. AI kami siap menjawab dengan penjelasan mendalam."
    },
    {
      icon: Trophy,
      title: "Kurikulum OSP",
      desc: "Materi yang disusun khusus sesuai silabus Olimpiade Sains Nasional tingkat Provinsi."
    },
    {
      icon: Zap,
      title: "Quiz Adaptif",
      desc: "Latihan soal yang dibuat oleh AI untuk menguji pemahamanmu secara real-time."
    },
    {
      icon: Users,
      title: "Forum Komunitas",
      desc: "Berdiskusi dengan sesama pejuang medali dari seluruh Indonesia."
    }
  ];

  return (
    <div className="min-h-screen bg-bg text-text-main selection:bg-accent selection:text-white">
      <div className="atmosphere fixed inset-0 opacity-40" />
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-20 glass-nav z-[100] flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-accent">
          <Brain className="w-8 h-8" />
          DYFALOGY
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onLogin} className="hidden md:block text-sm font-bold hover:text-accent transition-colors">Masuk</button>
          <button 
            onClick={onLogin}
            className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-bold liquid-button shadow-lg shadow-accent/20"
          >
            Mulai Belajar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-6 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-widest uppercase mb-4">
            <Star size={14} className="fill-accent" />
            Platform Persiapan OSP Biologi #1
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-text-main">
            Kuasai Biologi,<br />
            <span className="text-accent">Taklukkan Medali.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Platform belajar paling powerful untuk persiapan Olimpiade Biologi. Dilengkapi AI Tutor, Quiz Adaptif, dan Komunitas Pejuang Medali.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto bg-accent text-white px-10 py-5 rounded-2xl text-lg font-black liquid-button shadow-2xl shadow-accent/30 flex items-center justify-center gap-3"
            >
              Daftar Gratis Sekarang
              <ChevronRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl text-lg font-bold border border-border bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all">
              Lihat Demo
            </button>
          </div>
        </motion.div>

        {/* Hero Preview Image/Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 w-full max-w-6xl mx-auto relative"
        >
          <div className="aspect-video rounded-3xl overflow-hidden border border-white/60 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] liquid-glass relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent" />
            <img 
              src="https://picsum.photos/seed/biology/1920/1080" 
              className="w-full h-full object-cover opacity-80 mix-blend-overlay"
              alt="Dashboard Preview"
              referrerPolicy="no-referrer"
            />
            {/* Floating UI Elements for effect */}
            <div className="absolute top-10 left-10 w-64 h-32 glass-card rounded-2xl p-4 hidden lg:block animate-bounce [animation-duration:4s]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Live Quiz</span>
              </div>
              <div className="text-sm font-bold">Struktur Sel & Organel</div>
              <div className="mt-2 h-1 bg-accent/20 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-accent" />
              </div>
            </div>
            <div className="absolute bottom-10 right-10 w-72 h-40 glass-card rounded-2xl p-4 hidden lg:block animate-bounce [animation-duration:5s] [animation-delay:1s]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">AI Assistant</span>
              </div>
              <p className="text-xs italic text-text-muted">"Elektroforesis DNA bekerja berdasarkan perbedaan muatan dan ukuran molekul..."</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Semua yang Kamu Butuhkan.</h2>
          <p className="text-text-muted max-w-xl mx-auto">Dirancang untuk efektivitas belajar maksimal dengan teknologi AI terbaru.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="glass-card p-8 rounded-3xl space-y-4 border border-white/60"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-bold">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tester / Preview Section */}
      <section className="py-32 px-6 bg-accent/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">Coba Tester Materi & Quiz AI.</h2>
            <p className="text-lg text-text-muted leading-relaxed">
              Jangan hanya percaya kata kami. Lihat bagaimana AI kami merangkum materi kompleks seperti <span className="text-accent font-bold italic">Biologi Sel Molekuler</span> menjadi poin-poin yang mudah dipahami.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Award size={20} />
                </div>
                <span className="font-bold">Materi Terupdate Sesuai Silabus IBO</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60">
                <div className="w-10 h-10 bg-gold/20 text-gold rounded-xl flex items-center justify-center">
                  <Trophy size={20} />
                </div>
                <span className="font-bold">Latihan Soal Setara Tingkat Nasional</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass-card rounded-3xl p-8 border border-white/80 shadow-2xl relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                  <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Contoh Soal AI</div>
                  <p className="text-sm font-bold leading-relaxed">Manakah dari berikut ini yang merupakan fungsi utama dari Retikulum Endoplasma Kasar?</p>
                </div>
                <div className="grid gap-2">
                  {['Sintesis Lipid', 'Sintesis Protein', 'Detoksifikasi Racun', 'Modifikasi Karbohidrat'].map((opt, i) => (
                    <div key={i} className="p-3 rounded-xl border border-white/50 bg-white/20 text-xs font-medium flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[8px]">{String.fromCharCode(65+i)}</div>
                      {opt}
                    </div>
                  ))}
                </div>
                <button onClick={onLogin} className="w-full py-3 bg-accent text-white rounded-xl text-sm font-bold liquid-button">
                  Cek Jawaban & Mulai Belajar
                </button>
              </div>
            </div>
            {/* Decorative blurs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/20 rounded-full blur-[100px]" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 md:p-20 rounded-[40px] border border-white/60 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 atmosphere opacity-20" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-none">Siap Menjadi Juara Berikutnya?</h2>
            <p className="text-lg text-text-muted max-w-xl mx-auto">Bergabunglah dengan ribuan siswa lainnya dan mulai perjalananmu menuju medali emas OSP Biologi.</p>
            <button 
              onClick={onLogin}
              className="bg-accent text-white px-12 py-6 rounded-2xl text-xl font-black liquid-button shadow-2xl shadow-accent/40"
            >
              Mulai Belajar Gratis
            </button>
            <div className="pt-10 flex items-center justify-center gap-8 opacity-50 grayscale">
              <div className="font-black text-xl tracking-tighter">OSN 2026</div>
              <div className="font-black text-xl tracking-tighter">IBO 2026</div>
              <div className="font-black text-xl tracking-tighter">PUSPRESNAS</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
        <div className="flex items-center gap-2 font-black tracking-tighter text-accent">
          <Brain size={20} />
          DYFALOGY
        </div>
        <div className="text-xs font-medium">© 2026 Dyfalogy Platform. All rights reserved.</div>
        <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          <a href="#" className="hover:text-accent transition-colors">Terms</a>
          <a href="#" className="hover:text-accent transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

// --- Quiz Component ---

const Quiz = ({ questions, timerSeconds, onFinish, onCancel }: { questions: any[], timerSeconds?: number, onFinish: (score: number, correct: number) => void, onCancel: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds || 0);

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
          <button onClick={onCancel} className="text-text-muted hover:text-red-500 transition-colors"><X size={18} /></button>
        </div>
      </div>
      
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
          if (!showExplanation) setShowExplanation(true);
          else handleNext();
        }}
        className="w-full bg-accent text-white py-4 rounded-xl font-bold text-sm liquid-button disabled:opacity-30"
      >
        {!showExplanation ? 'Periksa Jawaban' : (currentIndex === questions.length - 1 ? 'Selesai Quiz' : 'Pertanyaan Berikutnya')}
      </button>
    </div>
  );
};

// --- Forum Components ---

const ReactionButton = ({ count, icon, active, onClick }: { count: number, icon: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all border",
      active ? "bg-accent/10 border-accent text-accent scale-105" : "bg-white/20 border-white/50 text-text-muted hover:bg-white/40"
    )}
  >
    <span>{icon}</span>
    {count > 0 && <span>{count}</span>}
  </button>
);

const Forum = ({ user, onProfileClick }: { user: any, onProfileClick: (uid: string) => void }) => {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  
  // Context Menu States
  const [contextMenuRef, setContextMenuRef] = useState<any>(null);
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null); // Reply ID
  const longPressTimer = useRef<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'forumTopics'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTopics(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      const q = query(collection(db, 'forumTopics', selectedTopic.id, 'replies'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setReplies(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsubscribe();
    }
  }, [selectedTopic]);

  const handleReplyLongPress = (reply: any) => {
    setActiveContextMenu(reply.id);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const handleReaction = async (itemId: string, reactionType: string, isTopic: boolean = false) => {
    if (!user) return;
    const path = isTopic ? `forumTopics/${itemId}` : `forumTopics/${selectedTopic.id}/replies/${itemId}`;
    const docRef = doc(db, path);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const currentReactions = data.reactions || {};
    const userReactions = currentReactions[reactionType] || [];
    
    let newUserReactions;
    if (userReactions.includes(user.uid)) {
      newUserReactions = userReactions.filter((id: string) => id !== user.uid);
    } else {
      newUserReactions = [...userReactions, user.uid];
    }

    await updateDoc(docRef, {
      [`reactions.${reactionType}`]: newUserReactions
    });
    setActiveContextMenu(null);
  };

  const promoteToTopic = async (reply: any) => {
    if (!user) return;
    await addDoc(collection(db, 'forumTopics'), {
      title: `Diskusi Lanjutan: ${reply.content.substring(0, 30)}...`,
      content: `Diskusi diangkat dari balasan ${reply.authorName}:\n\n"${reply.content}"\n\nLanjutkan diskusi di sini.`,
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      replyCount: 0,
      createdAt: serverTimestamp(),
      isPromoted: true,
      originalTopicId: selectedTopic.id
    });
    setSelectedTopic(null);
    setActiveContextMenu(null);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !user) return;

    await addDoc(collection(db, 'forumTopics'), {
      title: newTopicTitle,
      content: newTopicContent,
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      replyCount: 0,
      createdAt: serverTimestamp(),
      reactions: { '❤️': [] }
    });

    await updateDoc(doc(db, 'users', user.uid), {
      'stats.forumPosts': increment(1)
    });

    setNewTopicTitle('');
    setNewTopicContent('');
    setIsCreating(false);
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !user || !selectedTopic) return;

    const replyData = {
      topicId: selectedTopic.id,
      content: newReplyContent,
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      parentId: replyingTo ? replyingTo.id : null,
      parentAuthor: replyingTo ? replyingTo.authorName : null,
      createdAt: serverTimestamp(),
      reactions: { '👍': [] }
    };

    await addDoc(collection(db, 'forumTopics', selectedTopic.id, 'replies'), replyData);

    await updateDoc(doc(db, 'forumTopics', selectedTopic.id), {
      replyCount: increment(1)
    });

    setNewReplyContent('');
    setReplyingTo(null);
  };

  const renderReplies = (parentId: string | null = null, depth: number = 0) => {
    const filtered = replies.filter(r => r.parentId === parentId);
    if (filtered.length === 0) return null;

    return filtered.map(reply => (
      <div key={reply.id} className={cn("space-y-4", depth > 0 ? "ml-4 border-l-2 border-accent/10 pl-4 py-2" : "")}>
        <motion.div 
          layout
          onPointerDown={() => {
            longPressTimer.current = setTimeout(() => handleReplyLongPress(reply), 600);
          }}
          onPointerUp={() => clearTimeout(longPressTimer.current)}
          onPointerLeave={() => clearTimeout(longPressTimer.current)}
          className={cn(
            "glass-card rounded-2xl p-4 space-y-2 relative transition-all duration-500",
            activeContextMenu === reply.id ? "scale-105 z-50 ring-2 ring-accent/30" : "hover:border-accent/10"
          )}
        >
          {activeContextMenu === reply.id && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute -top-16 left-0 right-0 flex justify-center gap-2 z-[60]"
            >
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-2 shadow-2xl flex gap-1 items-center">
                {['❤️', '🔥', '👏', '😮', '💡'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={(e) => { e.stopPropagation(); handleReaction(reply.id, emoji); }}
                    className="p-1.5 hover:bg-accent/10 rounded-lg text-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-[1px] h-6 bg-border mx-1" />
                <button 
                  onClick={() => { setReplyingTo(reply); setActiveContextMenu(null); }}
                  className="px-3 py-1.5 text-[10px] font-black uppercase text-accent hover:bg-accent/10 rounded-lg"
                >
                  Reply
                </button>
                <button 
                  onClick={() => promoteToTopic(reply)}
                  className="px-3 py-1.5 text-[10px] font-black uppercase text-blue-500 hover:bg-blue-500/10 rounded-lg"
                >
                  Discuss
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <div 
              onClick={() => onProfileClick(reply.authorId)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src={reply.authorPhoto} className="w-6 h-6 rounded-full border border-white/50" alt="" referrerPolicy="no-referrer" />
              <div>
                <span className="text-xs font-bold hover:text-accent transition-colors">{reply.authorName}</span>
                {reply.parentAuthor && (
                  <span className="text-[10px] text-text-muted ml-1">membalas <span className="text-accent font-medium">@{reply.parentAuthor}</span></span>
                )}
              </div>
            </div>
            <div className="text-[9px] text-text-muted">{reply.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <p className="text-sm text-text-main leading-relaxed">{reply.content}</p>
          
          <div className="flex gap-2">
            {reply.reactions && Object.entries(reply.reactions).map(([emoji, uids]: [string, any]) => (
              uids.length > 0 && (
                <ReactionButton 
                  key={emoji}
                  icon={emoji} 
                  count={uids.length} 
                  active={uids.includes(user?.uid)}
                  onClick={() => handleReaction(reply.id, emoji)}
                />
              )
            ))}
          </div>
        </motion.div>
        {renderReplies(reply.id, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      <AnimatePresence>
        {activeContextMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveContextMenu(null)}
            className="fixed inset-0 bg-white/20 backdrop-blur-md z-40 transition-all duration-500"
          />
        )}
      </AnimatePresence>

      {selectedTopic ? (
        <div className="space-y-6">
          <button onClick={() => setSelectedTopic(null)} className="text-accent text-xs font-bold flex items-center gap-1 hover:underline">
            ← KEMBALI KE FORUM
          </button>
          
          <div className="glass-card rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div 
                onClick={() => onProfileClick(selectedTopic.authorId)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img src={selectedTopic.authorPhoto} className="w-10 h-10 rounded-full border border-white/50 group-hover:scale-110 transition-transform" alt="" referrerPolicy="no-referrer" />
                <div>
                  <div className="text-sm font-bold group-hover:text-accent transition-colors">{selectedTopic.authorName}</div>
                  <div className="text-[10px] text-text-muted">{selectedTopic.createdAt?.toDate().toLocaleDateString()}</div>
                </div>
              </div>
              <button 
                onClick={() => setReplyingTo(selectedTopic)}
                className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
              >
                Balas Topik
              </button>
            </div>
            <h2 className="text-xl font-black text-accent leading-tight">{selectedTopic.title}</h2>
            <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{selectedTopic.content}</p>
            
            <div className="flex gap-2 pt-2">
               {selectedTopic.reactions && Object.entries(selectedTopic.reactions).map(([emoji, uids]: [string, any]) => (
                <ReactionButton 
                  key={emoji}
                  icon={emoji} 
                  count={uids.length} 
                  active={uids.includes(user?.uid)}
                  onClick={() => handleReaction(selectedTopic.id, emoji, true)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-sm font-bold flex items-center gap-2">
              <MessageCircle size={16} /> Balasan ({selectedTopic.replyCount})
            </div>
            {renderReplies(null)}
          </div>

          <form onSubmit={handleCreateReply} className="sticky bottom-6 glass-card rounded-2xl p-4 flex flex-col gap-3 shadow-2xl z-30">
            {replyingTo && (
              <div className="flex justify-between items-center bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20">
                <span className="text-[10px] font-bold text-accent">Membalas @{replyingTo.authorName}</span>
                <button onClick={() => setReplyingTo(null)} className="text-text-muted hover:text-red-500"><X size={12} /></button>
              </div>
            )}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder={replyingTo ? "Balas diskusi..." : "Tulis balasan publik..."}
                className="flex-1 bg-white/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all"
              />
              <button type="submit" className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-bold liquid-button">
                Kirim
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight">Diskusi Komunitas</h2>
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 liquid-button shadow-lg shadow-accent/20"
            >
              {isCreating ? <X size={16} /> : <Plus size={16} />}
              {isCreating ? 'Batal' : 'Topik Baru'}
            </button>
          </div>

          {isCreating && (
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleCreateTopic} 
              className="glass-card rounded-3xl p-8 space-y-4 border border-accent/10"
            >
              <input 
                type="text" 
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Judul Topik yang Menarik"
                className="w-full bg-white/50 border border-border rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-accent"
              />
              <textarea 
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                placeholder="Deskripsikan apa yang ingin kamu diskusikan atau tanyakan..."
                rows={5}
                className="w-full bg-white/50 border border-border rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-accent resize-none"
              />
              <button type="submit" className="w-full bg-accent text-white py-4 rounded-xl font-bold liquid-button text-sm">
                Posting ke Komunitas
              </button>
            </motion.form>
          )}

          <div className="grid gap-4">
            {topics.map((topic) => (
              <motion.div
                layout
                key={topic.id}
                className="glass-card rounded-2xl p-6 text-left hover:border-accent/40 transition-all group relative overflow-hidden"
              >
                {topic.isPromoted && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                    HOT DISCUSSION
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div 
                    onClick={() => onProfileClick(topic.authorId)}
                    className="flex items-center gap-3 cursor-pointer z-10"
                  >
                    <img src={topic.authorPhoto} className="w-8 h-8 rounded-full border border-white/50" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-accent transition-colors block">{topic.authorName}</span>
                      <span className="text-[9px] text-text-muted mt-0.5 block">{topic.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div onClick={() => setSelectedTopic(topic)} className="cursor-pointer space-y-2">
                  <h3 className="text-lg font-bold text-text-main group-hover:text-accent transition-colors leading-snug">{topic.title}</h3>
                  <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">{topic.content}</p>
                </div>
                <div className="flex items-center gap-5 mt-6 pt-4 border-t border-white/20">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <MessageCircle size={14} className="text-accent" /> {topic.replyCount} Balasan
                  </span>
                  <div className="flex gap-1">
                    {topic.reactions && Object.entries(topic.reactions).slice(0, 3).map(([emoji, uids]: [string, any]) => (
                      uids.length > 0 && <span key={emoji} className="text-[10px]">{emoji}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Archive Component ---
const OsnArchive = () => {
  const [selectedYear, setSelectedYear] = useState('2025');

  const papers = [
    { year: '2025', title: 'OSN-K Biologi 2025', difficulty: 'Easy', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2025', title: 'OSN-P Biologi 2025', difficulty: 'Medium', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2024', title: 'OSN-K Biologi 2024', difficulty: 'Easy', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2024', title: 'OSN-P Biologi 2024', difficulty: 'Medium', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2024', title: 'OSN Nasional Biologi 2024', difficulty: 'Hard', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2023', title: 'Olimpiade Biologi 2023 Full Pack', difficulty: 'Varies', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Arsip Soal OSN Biology</h2>
          <p className="text-text-muted text-sm italic">Kumpulan soal-soal kompetisi sains nasional dari tahun ke tahun.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white/40 border border-white/50 rounded-xl px-4 py-2 text-sm focus:outline-none"
          >
            {['2025', '2024', '2023', '2022', '2021', '2020'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.filter(p => p.year === selectedYear).map((paper, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col justify-between group hover:border-accent transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded tracking-widest">{paper.year}</span>
                <span className="text-[10px] font-bold text-text-muted italic">{paper.difficulty}</span>
              </div>
              <h3 className="text-base font-bold text-text-main group-hover:text-accent transition-colors">{paper.title}</h3>
            </div>
            <a 
              href={paper.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 hover:bg-white/40 border border-white/50 rounded-xl text-xs font-bold transition-all"
            >
              <FileText size={14} /> LIHAT DRIVE
            </a>
          </div>
        ))}
      </div>

      <div className="p-8 bg-blue-500/10 rounded-[32px] border border-blue-500/20 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
          <Archive size={40} />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-bold">Punya Soal Lainnya?</h4>
          <p className="text-sm text-text-muted">Gua tau lu punya koleksi soal maut pendahulu lu, kirim sini biar bermanfaat buat anak biologi lainnya se-Indonesia!</p>
        </div>
      </div>
    </div>
  );
};

// --- Customer Service Component ---
const CustomerService = ({ user }: { user: any }) => {
  const [activeSubTab, setActiveSubTab] = useState('help');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userName: user.displayName,
        content: feedback,
        createdAt: serverTimestamp()
      });
      setFeedback('');
      alert('Terima kasih! Masukan/Laporan kamu sangat berharga bagi kami.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tight">Pusat Bantuan & Layanan</h2>
        <p className="text-text-muted italic leading-relaxed">Kami di sini untuk mendengar sobat pejuang olimpiade biologi.</p>
      </div>

      <div className="flex justify-center flex-wrap gap-2">
        {['help', 'terms', 'privacy', 'feedback'].map(t => (
          <button 
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeSubTab === t ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-white/40 text-text-muted hover:bg-white/60"
            )}
          >
            {t === 'help' ? 'Info Web' : t === 'terms' ? 'Ketentuan' : t === 'privacy' ? 'Keamanan' : 'Request & Bug'}
          </button>
        ))}
      </div>

      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[32px] p-8 md:p-12 space-y-8"
      >
        {activeSubTab === 'help' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Info className="text-accent" /> Tentang dyfalogy
            </h3>
            <div className="prose prose-sm prose-emerald text-text-muted leading-[1.8]">
              <p>dyfalogy adalah platform pembelajaran inovatif yang dirancang khusus untuk membantu para siswa di Indonesia dalam menghadapi Olimpiade Sains Nasional (OSN) di bidang Biologi.</p>
              <p>Misi utama kami adalah demokratisasi akses materi pendidikan olimpiade yang berkualitas, dengan memanfaatkan teknologi AI terkini untuk personalisasi pembelajaran.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 text-left">
                  <h4 className="font-bold text-accent mb-2">Kurikulum Terupdate</h4>
                  <p className="text-[11px]">Selalu menyesuaikan dengan silabus terakhir dari Pusprenas dan standar International Biology Olympiad (IBO).</p>
                </div>
                 <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 text-left">
                  <h4 className="font-bold text-accent mb-2">AI-Powered Learning</h4>
                  <p className="text-[11px]">Dukungan asisten AI 24/7 yang mampu menjawab pertanyaan teknis hingga simulasi quiz adaptif.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'terms' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3 text-left">
              <FileText className="text-accent" /> Ketentuan Penggunaan
            </h3>
            <div className="space-y-4 text-sm text-text-muted leading-relaxed text-left">
              <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl">
                 <p className="font-bold mb-1">1. Penggunaan Akun</p>
                 <p>Satu akun dyfalogy hanya boleh digunakan oleh satu individu. Berbagi akun dapat menyebabkan penangguhan akses otomatis oleh sistem keamanan kami.</p>
              </div>
              <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl">
                 <p className="font-bold mb-1">2. Konten & Hak Cipta</p>
                 <p>Seluruh materi pembelajaran, teks, dan struktur quiz adalah hak kekayaan intelektual dyfalogy atau mitra penyedia konten kami.</p>
              </div>
              <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl">
                 <p className="font-bold mb-1">3. Kebijakan Komunitas</p>
                 <p>Interaksi di forum harus mengedepankan etika, kesopanan, dan sportivitas tinggi khas pejuang olimpiade.</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'privacy' && (
          <div className="space-y-6 text-left">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-accent" /> Jaminan Keamanan Data
            </h3>
            <div className="prose prose-sm text-text-muted">
              <p>Kami sangat serius dalam menjaga keamanan data sobat. Berikut adalah langkah-langkah yang kami terapkan:</p>
              <ul>
                <li><strong>Enkripsi End-to-End:</strong> Seluruh komunikasi menggunakan protokol HTTPS dengan enkripsi tinggi.</li>
                <li><strong>Firebase Infrastructure:</strong> Kami menggunakan infrastruktur Google Cloud & Firebase standar enterprise.</li>
                <li><strong>No Party Access:</strong> Data personal tidak akan pernah dibagikan ke pihak ketiga mana pun tanpa seizin eksplisit.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSubTab === 'feedback' && (
          <div className="space-y-8 text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Punya Ide atau Menemukan Bug?</h3>
              <p className="text-sm text-text-muted">Masukkan sobat sangat membantu kami untuk terus berkembang lebih baik.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Bagikan ide fitur baru, laporan bug, atau sekadar sapaan hangat untuk developer..."
                className="w-full bg-white/40 border border-white/50 rounded-2xl p-6 text-sm focus:outline-none focus:border-accent min-h-[150px] resize-none"
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !feedback.trim()}
                className="w-full py-4 bg-accent text-white rounded-xl font-bold tracking-tight liquid-button disabled:opacity-50"
              >
                {isSubmitting ? 'MENGIRIM...' : 'KIRIM FEEDBACK SEKARANG'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Chat Component ---

const ChatInterface = ({ 
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
  setInput: (v: string) => void, 
  onSend: (e: React.FormEvent) => void, 
  isLoading: boolean,
  isSidebar?: boolean,
  selectedImage: string | null,
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onClearImage: () => void,
  isListening: boolean,
  startListening: () => void
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn(
      "flex flex-col h-full w-full", 
      isSidebar ? "" : "max-w-4xl mx-auto glass-card rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-white/5 md:bg-white/10"
    )}>
      {!isSidebar && (
        <div className="p-4 md:p-6 border-b border-border bg-white/10 flex items-center justify-between shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Sparkles size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <div className="text-sm md:text-base font-black text-text-main">Dyfa AI</div>
              <div className="text-[9px] md:text-[11px] text-emerald-500 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Online & Siap Menjawab
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 min-h-0 bg-black/5 backdrop-blur-sm">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40 px-6">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
              <Brain size={40} className="text-accent" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black tracking-tight text-text-main">Dyfa AI Biology Assistant</p>
              <p className="text-sm text-text-muted max-w-xs">Kirimkan pertanyaan Biologi, foto soal, atau gunakan suara untuk belajar bersama.</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            key={idx} 
            className={cn(
              "flex flex-col gap-1 w-full",
              msg.role === 'user' ? "items-end" : "items-start"
            )}
          >
            <div 
              className={cn(
                "p-4 text-sm leading-relaxed shadow-md max-w-[90%] md:max-w-[80%] relative",
                msg.role === 'user' 
                  ? "bg-[#2D6A4F] text-white rounded-[22px] rounded-tr-none shadow-accent/10 border border-white/10" 
                  : cn(
                    "bg-white/90 text-text-main rounded-[22px] rounded-tl-none border border-white/40 shadow-xl backdrop-blur-xl",
                    msg.isError && "bg-red-50/90 border-red-200 text-red-700"
                  )
              )}
            >
              {msg.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-xl border border-white/20 shadow-inner">
                  <img src={msg.imageUrl} alt="User Upload" className="max-w-full hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className={cn(
                "prose prose-sm max-w-none leading-relaxed", 
                msg.role === 'user' 
                  ? "prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white selection:bg-white/30" 
                  : "prose-emerald selection:bg-accent/20"
              )}>
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
              
              <div className={cn(
                "text-[10px] mt-1 opacity-50 font-medium",
                msg.role === 'user' ? "text-right" : "text-left"
              )}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="bg-white/40 p-4 rounded-2xl border-l-4 border-accent mr-auto flex gap-1.5 w-fit backdrop-blur-sm">
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0s]" />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 md:p-6 bg-white/20 border-t border-border shrink-0 backdrop-blur-xl">
        {selectedImage && (
          <div className="mb-4 relative w-24 h-24 group">
            <img src={selectedImage} className="w-full h-full object-cover rounded-xl border-2 border-accent" />
            <button 
              onClick={onClearImage}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <form onSubmit={onSend} className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative bg-white/40 rounded-2xl border border-white/60 shadow-inner group transition-all focus-within:bg-white/60 focus-within:border-accent">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan kamu di sini..."
                className="w-full bg-transparent px-5 py-4 text-sm focus:outline-none text-text-main pr-10"
              />
              <button 
                type="button"
                onClick={startListening}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all",
                  isListening ? "bg-red-500 text-white animate-pulse" : "text-text-muted hover:text-accent"
                )}
              >
                <Mic size={18} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-white/40 text-text-muted rounded-2xl border border-white/60 hover:bg-white/60 transition-all"
              >
                <ImageIcon size={20} />
              </button>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/*"
                onChange={onImageSelect}
              />
              <button 
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="bg-accent text-white p-4 rounded-2xl hover:bg-[#1A4331] transition-all disabled:opacity-30 shadow-lg shadow-accent/20 flex items-center justify-center min-w-[56px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [quizConfig, setQuizConfig] = useState({ count: 10, timer: 60 });
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchResults, setSearchResults] = useState<{lessons: Lesson[], strategies: any[]}>({ lessons: [], strategies: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Chat Image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // History state
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  // Audio state
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number, correct: number } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync User Data with Firestore
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          const newData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            level: 1,
            xp: 0,
            completedLessons: [],
            badges: [],
            createdAt: new Date().toISOString()
          };
          setDoc(userRef, newData);
          setUserData(newData);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Chat History Listener
  useEffect(() => {
    if (user) {
      const chatRef = collection(db, 'users', user.uid, 'chatHistory');
      const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(d => d.data());
        setChatMessages(msgs);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Quiz History Listener
  useEffect(() => {
    if (user) {
      const historyRef = collection(db, 'users', user.uid, 'quizResults');
      const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => doc.data());
        // Unique by lessonId to get latest progress
        const unique: any[] = [];
        const seen = new Set();
        for (const res of results) {
          if (!seen.has(res.lessonId)) {
            seen.add(res.lessonId);
            unique.push(res);
          }
        }
        setQuizHistory(unique.slice(0, 5));
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || !user) return;

    const userMsg = inputMessage;
    const userImg = selectedImage;
    setInputMessage('');
    setSelectedImage(null);
    setIsAiLoading(true);

    try {
      const chatRef = collection(db, 'users', user.uid, 'chatHistory');
      await addDoc(chatRef, {
        userId: user.uid,
        role: 'user',
        content: userMsg,
        imageUrl: userImg,
        timestamp: serverTimestamp()
      });

      const history = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const aiResponse = await getGeminiResponse(userMsg || "Tolong jelaskan gambar ini", history, userImg || undefined);

      await addDoc(chatRef, {
        userId: user.uid,
        role: 'model',
        content: aiResponse,
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      // Add error message to chat
      const chatRef = collection(db, 'users', user.uid, 'chatHistory');
      await addDoc(chatRef, {
        userId: user.uid,
        role: 'model',
        content: "Maaf, terjadi kesalahan saat menghubungi Dyfa AI. Mohon pastikan koneksi internet sobat stabil atau coba beberapa saat lagi.",
        timestamp: serverTimestamp(),
        isError: true
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartQuiz = async (lesson: Lesson) => {
    setIsQuizLoading(true);
    setQuizResult(null);
    try {
      const questions = await generateQuiz(lesson.title, lesson.content, quizConfig.count);
      setQuizQuestions(questions);
      setIsQuizActive(true);
    } catch (error) {
      console.error("Quiz generation error:", error);
      alert('Gagal membuat quiz. Pastikan API Key Gemini sudah terpasang.');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleFinishQuiz = async (score: number, correct: number) => {
    if (!user || !userData || !selectedLesson) return;
    
    setQuizResult({ score, correct });
    setIsQuizActive(false);

    // Save quiz result
    await addDoc(collection(db, 'users', user.uid, 'quizResults'), {
      userId: user.uid,
      lessonId: selectedLesson.id,
      score,
      totalQuestions: quizQuestions.length,
      correctAnswers: correct,
      timestamp: serverTimestamp()
    });

    // If score is good enough (e.g. > 70%), complete the lesson
    if (score >= 70) {
      const userRef = doc(db, 'users', user.uid);
      const newCompleted = [...(userData.completedLessons || [])];
      if (!newCompleted.includes(selectedLesson.id)) {
        newCompleted.push(selectedLesson.id);
        
        const newXp = (userData.xp || 0) + selectedLesson.xpReward;
        const newLevel = Math.floor(newXp / 500) + 1;
        
        const newBadges = [...(userData.badges || [])];
        if (newCompleted.length === 1 && !newBadges.includes('first-lesson')) {
          newBadges.push('first-lesson');
        }
        const molBioLessons = LESSONS.filter(l => l.category === 'Biologi Sel & Molekuler').map(l => l.id);
        if (molBioLessons.every(id => newCompleted.includes(id)) && !newBadges.includes('mol-master')) {
          newBadges.push('mol-master');
        }
        if (newLevel >= 5 && !newBadges.includes('level-5')) {
          newBadges.push('level-5');
        }

        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel,
          completedLessons: newCompleted,
          badges: newBadges
        });
      }
    }
  };

  const completeLesson = async (lesson: Lesson) => {
    // This is now handled by quiz completion
  };

  // Personalized Recommendations
  const getRecommendations = () => {
    if (!userData) return [];
    const completed = userData.completedLessons || [];
    return LESSONS.filter(l => !completed.includes(l.id))
      .sort((a, b) => {
        // Prefer lessons close to user level
        const diffA = Math.abs(a.level - userData.level);
        const diffB = Math.abs(b.level - userData.level);
        return diffA - diffB;
      })
      .slice(0, 3);
  };

  // Search Logic
  const handleSearch = (q: string) => {
    if (!q.trim()) {
      setSearchResults({ lessons: [], strategies: [] });
      setShowSearchResults(false);
      return;
    }
    const filteredLessons = LESSONS.filter(l => 
      l.title.toLowerCase().includes(q.toLowerCase()) || 
      l.description.toLowerCase().includes(q.toLowerCase()) ||
      l.category.toLowerCase().includes(q.toLowerCase())
    );
    const filteredStrategies = STUDY_STRATEGIES.filter(s => 
      s.title.toLowerCase().includes(q.toLowerCase()) || 
      s.description.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults({ lessons: filteredLessons, strategies: filteredStrategies });
    setShowSearchResults(true);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser kamu tidak mendukung pencarian suara.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      handleSearch(transcript);
    };
    recognition.start();
  };

  const playTTSContent = async (text: string) => {
    if (isTtsPlaying) return;
    setIsTtsPlaying(true);
    try {
      const base64 = await generateTTS(text);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsTtsPlaying(false);
      source.start();
    } catch (error) {
      console.error("TTS error:", error);
      setIsTtsPlaying(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-accent"
      >
        <Brain size={48} />
      </motion.div>
    </div>
  );

  if (!user) {
    if (showAuth) {
      return <AuthPage onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onLogin={() => setShowAuth(true)} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-bg relative">
      <div className="atmosphere" />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        quizHistory={quizHistory}
        onSelectLesson={setSelectedLesson}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        startListening={startListening}
        isListening={isListening}
      />
      
      <div className="flex-1 flex flex-col min-w-0 border-r border-border relative z-10">
        <Navbar 
          user={userData} 
          onLogout={logout} 
          activeTab={activeTab} 
          onToggleAi={() => setShowAiPanel(!showAiPanel)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onProfileClick={() => setActiveTab('profile')}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isListening={isListening}
          startListening={startListening}
        />
        
        <main className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence>
            {showSearchResults && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-[60] bg-bg/95 backdrop-blur-xl p-6 overflow-y-auto"
              >
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black">Hasil Pencarian untuk "{searchQuery}"</h2>
                    <button onClick={() => { setShowSearchResults(false); setSearchQuery(''); }} className="p-2 hover:bg-black/5 rounded-full"><X size={24}/></button>
                  </div>

                  {searchResults.lessons.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-accent uppercase tracking-widest px-2">Materi ({searchResults.lessons.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.lessons.map(lesson => (
                          <div key={lesson.id} className="glass-card p-5 rounded-2xl flex justify-between items-center group">
                            <div>
                              <div className="text-[10px] font-bold text-accent uppercase">{lesson.category}</div>
                              <div className="text-lg font-black">{lesson.title}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => playTTSContent(`${lesson.title}. ${lesson.description}`)}
                                disabled={isTtsPlaying}
                                className="p-2.5 text-accent hover:bg-accent/10 rounded-xl transition-all disabled:opacity-30"
                              >
                                {isTtsPlaying ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <Volume2 size={18} />}
                              </button>
                              <button 
                                onClick={() => { setSelectedLesson(lesson); setActiveTab('lessons'); setShowSearchResults(false); }}
                                className="bg-accent text-white p-2.5 rounded-xl transition-all"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.strategies.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-accent uppercase tracking-widest px-2">Strategi ({searchResults.strategies.length})</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {searchResults.strategies.map((strategy, i) => (
                          <div key={i} className="glass-card p-5 rounded-2xl flex justify-between items-center">
                            <div>
                                <div className="text-lg font-black">{strategy.title}</div>
                                <div className="text-sm text-text-muted">{strategy.description}</div>
                            </div>
                            <button 
                              onClick={() => { setActiveTab('strategies'); setShowSearchResults(false); }}
                              className="text-accent hover:bg-accent/10 p-2.5 rounded-xl transition-all"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.lessons.length === 0 && searchResults.strategies.length === 0 && (
                    <div className="text-center py-20 bg-white/20 rounded-3xl border border-white/50 border-dashed">
                      <div className="text-4xl mb-4">🔍</div>
                      <div className="text-lg font-bold text-text-muted">Tidak ada hasil ditemukan.</div>
                      <p className="text-sm text-text-muted">Coba gunakan kata kunci lain atau tanya AI!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {viewingProfileId && (
              <motion.div
                key="viewing-profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fixed inset-0 z-[100] bg-bg overflow-y-auto p-6"
              >
                <ProfilePage 
                  userId={viewingProfileId} 
                  isOwnProfile={viewingProfileId === user.uid} 
                  onClose={() => setViewingProfileId(null)}
                />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ProfilePage userId={user.uid} isOwnProfile={true} />
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-2xl p-6 flex flex-col">
                      <div className="text-base font-bold mb-4 flex justify-between items-center">
                        Progress Belajar <span className="text-xs text-accent">Level {userData?.level}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-white/30 rounded-xl border border-white/50">
                          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">XP Total</div>
                          <div className="font-mono text-xl font-black text-accent">{userData?.xp}</div>
                        </div>
                        <div className="text-center p-3 bg-white/30 rounded-xl border border-white/50">
                          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Materi</div>
                          <div className="font-mono text-xl font-black text-accent">{userData?.completedLessons?.length}</div>
                        </div>
                        <div className="text-center p-3 bg-white/30 rounded-xl border border-white/50">
                          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Lencana</div>
                          <div className="font-mono text-xl font-black text-accent">{userData?.badges?.length}</div>
                        </div>
                        <div className="text-center p-3 bg-white/30 rounded-xl border border-white/50">
                          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Rank</div>
                          <div className="font-mono text-xl font-black text-accent">#12</div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(100, ((userData?.xp % 500) / 500) * 100)}%` }} 
                        />
                      </div>
                      <div className="text-[10px] text-right mt-2 font-bold text-text-muted">
                        {500 - (userData?.xp % 500)} XP lagi untuk Level {userData?.level + 1}
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                      <div className="text-base font-bold mb-4 flex items-center gap-2">
                        <Star size={18} className="text-gold" /> Rekomendasi Untukmu
                      </div>
                      <div className="grid gap-3">
                        {getRecommendations().map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => { setSelectedLesson(lesson); setActiveTab('lessons'); }}
                            className="flex items-center justify-between p-4 bg-white/20 hover:bg-white/40 border border-white/50 rounded-xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                                <BookOpen size={16} />
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-bold">{lesson.title}</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-wider">{lesson.category} • LVL {lesson.level}</div>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6">
                      <div className="text-base font-bold mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-gold" /> Lencana Pencapaian
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {BADGES.map((badge) => {
                          const isOwned = userData?.badges?.includes(badge.id);
                          return (
                            <div 
                              key={badge.id} 
                              className={cn(
                                "aspect-square rounded-xl flex flex-col items-center justify-center text-center p-2 transition-all",
                                isOwned ? "bg-gold/10 border border-gold/30 badge-glow" : "bg-gray-100/50 border border-transparent opacity-30 grayscale"
                              )}
                              title={badge.description}
                            >
                              <div className="text-2xl mb-1">{badge.icon}</div>
                              <div className="text-[8px] font-black uppercase tracking-tighter leading-none">{badge.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                      <div className="text-base font-bold mb-4">Statistik Global</div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-muted">Akurasi</span>
                          <span className="text-xs font-bold">88%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100/50 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-muted">Soal Terjawab</span>
                          <span className="text-xs font-bold">1.240</span>
                        </div>
                        <div className="h-1.5 bg-gray-100/50 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'lessons' && (
              <motion.div 
                key="lessons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isQuizActive ? (
                  <Quiz 
                    questions={quizQuestions} 
                    timerSeconds={quizConfig.timer}
                    onFinish={handleFinishQuiz} 
                    onCancel={() => setIsQuizActive(false)} 
                  />
                ) : selectedLesson ? (
                  <div className="max-w-3xl mx-auto space-y-5">
                    <button 
                      onClick={() => { setSelectedLesson(null); setQuizResult(null); }}
                      className="text-accent text-xs font-bold flex items-center gap-1 hover:underline px-2"
                    >
                      ← KEMBALI KE DAFTAR
                    </button>
                    <div className="glass-card rounded-3xl p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-black rounded uppercase tracking-widest">
                            {selectedLesson.category}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-widest",
                            selectedLesson.difficulty === 'easy' ? "bg-emerald-100 text-emerald-600" :
                            selectedLesson.difficulty === 'medium' ? "bg-amber-100 text-amber-600" :
                            "bg-red-100 text-red-600"
                          )}>
                            {selectedLesson.difficulty}
                          </span>
                        </div>
                        <span className="text-text-muted text-[11px] font-mono font-bold tracking-tighter">{selectedLesson.xpReward} XP</span>
                      </div>
                      <h2 className="text-3xl font-black text-text-main tracking-tight leading-tight">{selectedLesson.title}</h2>
                      <div className="prose prose-emerald max-w-none text-text-main leading-relaxed">
                        <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
                      </div>
                      
                      <div className="pt-6 border-t border-white/20">
                        <div className="text-sm font-bold mb-4 flex items-center gap-2">
                          <Zap size={18} className="text-accent" /> Kustomisasi Quiz AI
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Jumlah Soal</label>
                            <select 
                              value={quizConfig.count}
                              onChange={(e) => setQuizConfig({...quizConfig, count: parseInt(e.target.value)})}
                              className="w-full bg-white/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                            >
                              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Soal</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Timer per Soal</label>
                            <select 
                              value={quizConfig.timer}
                              onChange={(e) => setQuizConfig({...quizConfig, timer: parseInt(e.target.value)})}
                              className="w-full bg-white/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                            >
                              <option value="0">Tanpa Waktu</option>
                              <option value="30">30 Detik</option>
                              <option value="60">60 Detik</option>
                              <option value="120">120 Detik</option>
                            </select>
                          </div>
                        </div>

                        {quizResult ? (
                          <div className={cn(
                            "p-6 rounded-2xl text-center space-y-4 shadow-xl",
                            quizResult.score >= 70 ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
                          )}>
                            <div className="text-3xl font-black">{quizResult.score.toFixed(0)}%</div>
                            <p className="text-sm font-medium">Kamu menjawab {quizResult.correct} dari {quizConfig.count} soal dengan benar.</p>
                            {quizResult.score >= 70 ? (
                              <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">MASTERED! +{selectedLesson.xpReward} XP</p>
                            ) : (
                              <p className="text-xs text-red-600 font-bold uppercase tracking-widest">Ayo coba lagi untuk menguasai materi!</p>
                            )}
                            <button 
                              onClick={() => handleStartQuiz(selectedLesson)}
                              className="bg-accent text-white px-8 py-3 rounded-2xl text-sm font-black liquid-button shadow-lg shadow-accent/20"
                            >
                              Coba Quiz Lagi
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleStartQuiz(selectedLesson)}
                            disabled={isQuizLoading}
                            className="w-full py-5 rounded-2xl font-black text-sm tracking-tight transition-all liquid-button bg-accent text-white hover:bg-[#1A4331] shadow-xl shadow-accent/30 flex items-center justify-center gap-3"
                          >
                            {isQuizLoading ? (
                              <>
                                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                Menyiapkan Quiz AI Khusus...
                              </>
                            ) : (
                              <>
                                <Sparkles size={20} />
                                MULAI QUIZ AI ({quizConfig.count} SOAL)
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-2xl font-black tracking-tight">Kurikulum OSP 2026</div>
                      <div className="flex flex-wrap gap-2">
                         {['All', ...CATEGORIES].map(cat => (
                           <button
                             key={cat}
                             onClick={() => setActiveCategory(cat)}
                             className={cn(
                               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                               activeCategory === cat ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-white/40 text-text-muted hover:bg-white/60 border border-white/50"
                             )}
                           >
                             {cat}
                           </button>
                         ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {LESSONS.filter(l => activeCategory === 'All' || l.category === activeCategory).map((lesson) => {
                        const isCompleted = userData?.completedLessons?.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className="glass-card p-6 rounded-3xl hover:border-accent/40 transition-all text-left group relative overflow-hidden"
                          >
                            {isCompleted && (
                              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg">
                                Mastered
                              </div>
                            )}
                            <div className="mb-4">
                              <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1 block">{lesson.category}</span>
                              <h4 className="text-lg font-black text-text-main leading-tight group-hover:text-accent transition-colors">{lesson.title}</h4>
                            </div>
                            <p className="text-xs text-text-muted line-clamp-2 mb-6 leading-relaxed">{lesson.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest px-2 py-1 bg-white/30 rounded-lg">LVL {lesson.level}</span>
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                  lesson.difficulty === 'easy' ? "text-emerald-600 bg-emerald-50" :
                                  lesson.difficulty === 'medium' ? "text-amber-600 bg-amber-50" :
                                  "text-red-600 bg-red-50"
                                )}>{lesson.difficulty}</span>
                              </div>
                              <div className="text-[10px] font-bold text-accent group-hover:translate-x-1 transition-transform">PELAJARI SEKARANG →</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'forum' && (
              <motion.div 
                key="forum"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Forum user={userData} onProfileClick={(uid) => setViewingProfileId(uid)} />
              </motion.div>
            )}

            {activeTab === 'osn-archive' && (
              <motion.div 
                key="osn-archive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OsnArchive />
              </motion.div>
            )}

            {activeTab === 'customer-service' && (
              <motion.div 
                key="customer-service"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CustomerService user={userData} />
              </motion.div>
            )}

            {activeTab === 'strategies' && (
              <motion.div 
                key="strategies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                <div className="text-3xl font-black tracking-tight mb-8">Strategi Belajar Efektif</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {STUDY_STRATEGIES.map((strategy, idx) => (
                    <div key={idx} className="glass-card p-8 rounded-[32px] space-y-4 group relative overflow-hidden active:scale-[0.98] transition-all">
                      <div className="absolute top-4 right-4 z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); playTTSContent(`${strategy.title}. ${strategy.description}`); }}
                          disabled={isTtsPlaying}
                          className="p-3 bg-accent text-white rounded-2xl shadow-lg shadow-accent/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50"
                        >
                          <Volume2 size={20} />
                        </button>
                      </div>
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                        <Zap size={24} />
                      </div>
                      <h4 className="text-xl font-black text-text-main leading-tight">{strategy.title}</h4>
                      <p className="text-sm text-text-muted leading-relaxed italic">"{strategy.description}"</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-sidebar/90 backdrop-blur-xl rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl mt-12 border border-white/10 group">
                  <div className="relative z-10 space-y-6 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-[10px] font-black uppercase tracking-widest text-accent">
                      <Sparkles size={12}/> AI Study Planner
                    </div>
                    <h3 className="text-4xl font-black tracking-tight leading-none group-hover:text-accent transition-colors">Butuh Rencana Belajar Kustom?</h3>
                    <p className="text-base text-white/70 leading-relaxed">Tanyakan pada BioMaster AI untuk membuatkan jadwal belajar yang sesuai dengan target medali emas OSP kamu.</p>
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="bg-accent text-white px-10 py-4 rounded-2xl text-base font-black hover:bg-[#1A4331] transition-all liquid-button shadow-2xl shadow-accent/30 flex items-center gap-3 w-fit"
                    >
                      Buka Konsultasi AI
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <Brain className="absolute right-[-40px] bottom-[-40px] w-80 h-80 text-white/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />
                </div>
              </motion.div>
            )}
            
            {activeTab === 'chat' && (
              <div className="fixed inset-0 lg:static flex flex-col pt-16 lg:pt-0 pb-0 lg:h-[calc(100vh-120px)] bg-bg lg:bg-transparent z-40 overflow-hidden">
                <div className="flex-1 min-h-0 lg:p-0">
                  <ChatInterface 
                    messages={chatMessages}
                    input={inputMessage}
                    setInput={setInputMessage}
                    onSend={handleSendMessage}
                    isLoading={isAiLoading}
                    selectedImage={selectedImage}
                    onImageSelect={handleImageSelect}
                    onClearImage={() => setSelectedImage(null)}
                    isListening={isListening}
                    startListening={startListening}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* AI Panel (Persistent on Desktop, Toggleable on Mobile) */}
      <aside className={cn(
        "w-[300px] glass-nav flex flex-col shrink-0 border-l border-border transition-all duration-300 z-[60]",
        "fixed inset-y-0 right-0 xl:static bg-white/90 backdrop-blur-2xl",
        showAiPanel ? "translate-x-0" : "translate-x-full xl:translate-x-0"
      )}>
        <div className="p-5 border-b border-border flex justify-between items-center bg-white/10 shrink-0">
          <div>
            <div className="text-sm font-black text-text-main">Dyfa AI</div>
            <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online & Siap Menjawab
            </div>
          </div>
          <button onClick={() => setShowAiPanel(false)} className="xl:hidden p-1 text-text-muted"><X size={18} /></button>
        </div>

        <div className="flex-1 min-h-0">
          <ChatInterface 
            messages={chatMessages}
            input={inputMessage}
            setInput={setInputMessage}
            onSend={handleSendMessage}
            isLoading={isAiLoading}
            isSidebar={true}
            selectedImage={selectedImage}
            onImageSelect={handleImageSelect}
            onClearImage={() => setSelectedImage(null)}
            isListening={isListening}
            startListening={startListening}
          />
        </div>
      </aside>
    </div>
  );
}
