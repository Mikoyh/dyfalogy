/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, memo, useMemo, useCallback, Suspense } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, increment, deleteDoc, where } from 'firebase/firestore';
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
  Trash2,
  CheckCheck
} from 'lucide-react';
import { LESSONS, STUDY_STRATEGIES, BADGES, Lesson, Badge, CATEGORIES } from './constants/data';
import ReactMarkdown from 'react-markdown';
import { BIOLOGY_CURRICULUM } from './constants/learning';
import { getGeminiResponse, generateQuiz, generateTTS } from './lib/gemini';
import { useGamification } from './hooks/useGamification';
import { cn } from './lib/utils';
const Navbar = React.lazy(() => import('./components/Navbar').then(module => ({ default: module.Navbar })));
const Sidebar = React.lazy(() => import('./components/Sidebar').then(module => ({ default: module.Sidebar })));
const ChatInterface = React.lazy(() => import('./components/ChatInterface').then(module => ({ default: module.ChatInterface })));
const Quiz = React.lazy(() => import('./components/Quiz').then(module => ({ default: module.Quiz })));
const LandingPage = React.lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));
const ProfilePage = React.lazy(() => import('./components/ProfilePage').then(module => ({ default: module.ProfilePage })));
const AuthPage = React.lazy(() => import('./components/AuthPage').then(module => ({ default: module.AuthPage })));
const Forum = React.lazy(() => import('./components/Forum').then(module => ({ default: module.Forum })));
const OsnArchive = React.lazy(() => import('./components/OsnArchive').then(module => ({ default: module.OsnArchive })));
const CustomerService = React.lazy(() => import('./components/CustomerService').then(module => ({ default: module.CustomerService })));
const ChatSidebar = React.lazy(() => import('./components/ChatSidebar').then(module => ({ default: module.ChatSidebar })));
const LearningPath = React.lazy(() => import('./components/LearningPath').then(module => ({ default: module.LearningPath })));
import { Conversation } from './components/ChatSidebar';
const Flashcards = React.lazy(() => import('./components/Flashcards').then(module => ({ default: module.Flashcards })));
const Analytics = React.lazy(() => import('./components/Analytics').then(module => ({ default: module.Analytics })));
const ProPage = React.lazy(() => import('./components/ProPage').then(module => ({ default: module.ProPage })));

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDanger = false
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  confirmText?: string,
  cancelText?: string,
  isDanger?: boolean
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm glass-card rounded-3xl p-8 border border-white/50 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-accent/20">
            <div className={cn("h-full", isDanger ? "bg-red-500" : "bg-accent")} style={{ width: '100%' }} />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tight">{title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{message}</p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/50 border border-border hover:bg-white transition-all"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95",
                  isDanger ? "bg-red-600 shadow-red-500/20 hover:bg-red-700" : "bg-accent shadow-accent/20 hover:bg-[#1A4331]"
                )}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Feature Components Extracted ---

// --- Forum Components ---

// --- Forum Helpers ---
const ReactionButton = ({ count, icon, active, onClick }: { count: number, icon: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
      active ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-white/40 text-text-muted hover:bg-white/60"
    )}
  >
    <span>{icon}</span>
    {count > 0 && <span>{count}</span>}
  </button>
);

// --- Main App ---

export default function App() {
  const [user, loading] = useAuthState(auth);
  const { userData, addXp, updateTopicMastery, reviewFlashcard, isPro, upgradeToPro } = useGamification(user);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
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
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [reviewingCards, setReviewingCards] = useState<any[]>([]);

  // Audio state
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showQuizCloseConfirm, setShowQuizCloseConfirm] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number, correct: number } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync User Data with Firestore
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then(snap => {
        if (!snap.exists()) {
          setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            level: 1,
            xp: 0,
            unlockedTopics: ['cell-structure', 'macromolecules'],
            topicStats: {},
            dailyStreak: 0,
            badges: [],
            createdAt: new Date().toISOString()
          });
        }
      });
    }
  }, [user]);

  // Conversations Listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convs = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data() as Conversation;
        data.id = d.id;
        
        if (data.type === 'p2p') {
          const otherId = data.participants.find(p => p !== user.uid);
          if (otherId) {
            const userSnap = await getDoc(doc(db, 'users', otherId));
            if (userSnap.exists()) {
              data.otherUser = userSnap.data() as any;
            }
          }
        }
        return data;
      }));
      setConversations(convs);
      
      // Select first chat if none selected and on chat tab
      if (activeTab === 'chat' && !activeChatId && convs.length > 0) {
        setActiveChatId(convs[0].id);
      }
    });
    return () => unsubscribe();
  }, [user, activeTab]);

  // Active Chat Message Listener
  useEffect(() => {
    if (!user || !activeChatId) {
      setChatMessages([]);
      return;
    }
    const q = query(
      collection(db, 'conversations', activeChatId, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChatMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user, activeChatId]);

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
    if (user) {
      const cardsRef = collection(db, 'users', user.uid, 'flashcards');
      const q = query(cardsRef, where('nextReview', '<=', new Date().toISOString()));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setReviewingCards(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Optimized memoized functions
  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || !user) return;

    let currentChatId = activeChatId;

    // Create new AI chat if none active and user sends message
    if (!currentChatId) {
      const convRef = await addDoc(collection(db, 'conversations'), {
        type: 'ai',
        participants: [user.uid],
        title: inputMessage.slice(0, 30) || 'Diskusi Biologi',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastMessage: inputMessage
      });
      currentChatId = convRef.id;
      setActiveChatId(convRef.id);
    }

    const userMsg = inputMessage;
    const userImg = selectedImage;
    setInputMessage('');
    setSelectedImage(null);
    setIsAiLoading(true);

    try {
      const activeConv = conversations.find(c => c.id === currentChatId);
      const msgRef = collection(db, 'conversations', currentChatId!, 'messages');
      const participants = activeConv?.participants || [user.uid];
      
      await addDoc(msgRef, {
        senderId: user.uid,
        role: 'user',
        content: userMsg,
        imageUrl: userImg,
        timestamp: serverTimestamp(),
        participants // Denormalized for security rules
      });

      // Update last message in conversation
      await updateDoc(doc(db, 'conversations', currentChatId!), {
        lastMessage: userMsg,
        updatedAt: serverTimestamp()
      });

      if (!activeConv || activeConv.type === 'ai') {
        const history = chatMessages.map(m => ({
          role: m.role || 'user',
          parts: [{ text: m.content }]
        }));

        const aiResponse = await getGeminiResponse(userMsg || "Tolong jelaskan gambar ini", history, userImg || undefined, isPro);

        await addDoc(msgRef, {
          role: 'model',
          content: aiResponse,
          timestamp: serverTimestamp(),
          participants
        });

        await updateDoc(doc(db, 'conversations', currentChatId!), {
          lastMessage: aiResponse,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
    } finally {
      setIsAiLoading(false);
    }
  }, [user, inputMessage, selectedImage, activeChatId, chatMessages, conversations]);

  const createNewAiChat = async () => {
    if (!user) return;
    try {
      const convRef = await addDoc(collection(db, 'conversations'), {
        type: 'ai',
        participants: [user.uid],
        title: 'Percakapan Baru',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastMessage: 'Halo! Ada yang bisa Dyfa bantu?'
      });
      setActiveChatId(convRef.id);
      setActiveTab('chat');
    } catch (err) {
      console.error(err);
    }
  };

  const startPrivateChat = async (otherUserId: string) => {
    if (!user) return;
    try {
      // Check if existing
      const existing = conversations.find(c => 
        c.type === 'p2p' && c.participants.includes(otherUserId)
      );
      if (existing) {
        setActiveChatId(existing.id);
        setActiveTab('chat');
        return;
      }

      const convRef = await addDoc(collection(db, 'conversations'), {
        type: 'p2p',
        participants: [user.uid, otherUserId],
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        lastMessage: 'Baru saja ditambahkan'
      });
      setActiveChatId(convRef.id);
      setActiveTab('chat');
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const handleStartQuiz = useCallback(async (lesson: Lesson) => {
    setIsQuizLoading(true);
    setQuizResult(null);
    try {
      const weakTopics = userData?.topicStats 
        ? Object.entries(userData.topicStats)
            .filter(([_, score]: [any, any]) => score < 70)
            .map(([id]) => BIOLOGY_CURRICULUM.find(t => t.id === id)?.title || id)
        : [];

      const questions = await generateQuiz(
        lesson.title, 
        lesson.content, 
        quizConfig.count, 
        false, 
        weakTopics,
        isPro
      );
      setQuizQuestions(questions);
      setIsQuizActive(true);
    } catch (error) {
      console.error("Quiz generation error:", error);
      alert('Gagal membuat quiz. Pastikan API Key Gemini sudah terpasang.');
    } finally {
      setIsQuizLoading(false);
    }
  }, [quizConfig.count]);

  const handleFinishQuiz = useCallback(async (score: number, correct: number) => {
    if (!user || !selectedLesson) return;
    
    setQuizResult({ score, correct });
    setIsQuizActive(false);

    await addDoc(collection(db, 'users', user.uid, 'quizResults'), {
      userId: user.uid,
      lessonId: selectedLesson.id,
      score,
      totalQuestions: quizQuestions.length,
      correctAnswers: correct,
      timestamp: serverTimestamp()
    });

    if (selectedLesson.topicId) {
      await updateTopicMastery(selectedLesson.topicId, score);
    }

    if (score >= 70) {
      await addXp(selectedLesson.xpReward);
    }
  }, [user, selectedLesson, quizQuestions.length, updateTopicMastery, addXp]);

  // Optimized Search with Debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!q.trim()) {
      setSearchResults({ lessons: [], strategies: [] });
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
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
    }, 300);
  }, []);

  const recommendations = useMemo(() => {
    if (!userData) return [];
    const completed = userData.completedLessons || [];
    return LESSONS.filter(l => !completed.includes(l.id))
      .sort((a, b) => {
        const diffA = Math.abs(a.level - userData.level);
        const diffB = Math.abs(b.level - userData.level);
        return diffA - diffB;
      })
      .slice(0, 3);
  }, [userData]);

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
      return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-bg"><Brain className="animate-pulse text-accent" size={48} /></div>}>
          <AuthPage onBack={() => setShowAuth(false)} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-bg"><Brain className="animate-pulse text-accent" size={48} /></div>}>
        <LandingPage onLogin={() => setShowAuth(true)} />
      </Suspense>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-bg relative">
      <div className="atmosphere" />      <Suspense fallback={<div className="h-full w-[280px] bg-sidebar animate-pulse shrink-0" />}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setShowSearchResults(false);
          }} 
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
      </Suspense>
      
      <div className="flex-1 flex flex-col min-w-0 border-r border-border relative z-10">
        <Suspense fallback={<div className="h-16 bg-white/20 animate-pulse" />}>
          <Navbar 
            user={userData || user} 
            onLogout={logout} 
            activeTab={activeTab} 
            onToggleAi={() => activeTab !== 'chat' && setShowAiPanel(!showAiPanel)} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onProfileClick={() => {
              setActiveTab('profile');
              setShowSearchResults(false);
            }}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isListening={isListening}
            startListening={startListening}
          />
        </Suspense>

        
        <main className={cn(
          "flex-1 relative min-w-0",
          activeTab === 'chat' ? "h-full overflow-hidden p-0" : "overflow-y-auto p-4 md:p-6"
        )}>
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
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Brain className="animate-pulse text-accent" size={48} /></div>}>
                  <ProfilePage 
                    userId={viewingProfileId} 
                    isOwnProfile={viewingProfileId === user.uid} 
                    onClose={() => setViewingProfileId(null)}
                    onStartChat={startPrivateChat}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'pro-model' && (
              <motion.div 
                key="pro-model"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Sparkles className="animate-pulse text-accent" size={48} /></div>}>
                  <ProPage user={userData} isPro={isPro} onUpgrade={upgradeToPro} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Brain className="animate-pulse text-accent" size={48} /></div>}>
                  <ProfilePage userId={user.uid} isOwnProfile={true} onStartChat={startPrivateChat} />
                </Suspense>
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

                    <div className="glass-card rounded-2xl p-6 bg-accent text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap size={100} />
                      </div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Misi Harian</div>
                        <h3 className="text-xl font-black mb-4">Daily Active Recall ⚡</h3>
                        <p className="text-xs text-white/70 mb-6 leading-relaxed">Kerjakan 3 soal acak dari materi yang sudah kamu pelajari untuk menjaga ingatan jangka panjang.</p>
                        <button 
                          onClick={() => {
                            const completed = LESSONS.filter(l => (userData?.completedLessons || []).includes(l.id));
                            if (completed.length > 0) {
                              const randomLesson = completed[Math.floor(Math.random() * completed.length)];
                              setSelectedLesson(randomLesson);
                              setQuizConfig({ count: 3, timer: 60 });
                              setActiveTab('lessons');
                            } else {
                              setActiveTab('lessons');
                            }
                          }}
                          className="bg-white text-accent px-6 py-2.5 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all active:scale-95"
                        >
                          Mulai Recall (3 Soal)
                        </button>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                      <div className="text-base font-bold mb-4 flex items-center gap-2">
                        <Star size={18} className="text-gold" /> Rekomendasi Untukmu
                      </div>
                      <div className="grid gap-3">
                        {recommendations.map((lesson) => (
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

                    <Suspense fallback={<div className="h-40 glass-card animate-pulse" />}>
                      <Analytics topicStats={userData?.topicStats || {}} />
                    </Suspense>
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
                  <Suspense fallback={<div className="h-full flex items-center justify-center"><Sparkles className="animate-pulse text-accent" size={48} /></div>}>
                    <Quiz 
                      questions={quizQuestions} 
                      timerSeconds={quizConfig.timer}
                      onFinish={handleFinishQuiz} 
                      onCancel={() => setShowQuizCloseConfirm(true)} 
                    />
                    <ConfirmationModal 
                      isOpen={showQuizCloseConfirm}
                      onClose={() => setShowQuizCloseConfirm(false)}
                      onConfirm={() => {
                        setIsQuizActive(false);
                        setShowQuizCloseConfirm(false);
                      }}
                      title="Akhiri Quiz?"
                      message="Progress quiz ini tidak akan disimpan dan anda akan mengulang dari awal jika kembali."
                      confirmText="Ya, Akhiri"
                      isDanger={true}
                    />
                  </Suspense>
                ) : selectedLesson ? (
                  <div className="max-w-3xl mx-auto space-y-5">
                    <div className="flex justify-between items-center px-2">
                      <button 
                        onClick={() => { setSelectedLesson(null); setQuizResult(null); }}
                        className="text-accent text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        ← DAFTAR MATERI
                      </button>
                      <button 
                        onClick={() => setActiveTab('learning-path')}
                        className="text-accent text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        PETA BELAJAR →
                      </button>
                    </div>
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

                      {selectedLesson.topicId && (
                        <div className="mt-8 p-6 bg-accent/5 rounded-[32px] border border-accent/10">
                          <h4 className="text-sm font-black text-accent uppercase tracking-[0.2em] mb-4">🔗 Koneksi Materi</h4>
                          <div className="flex flex-wrap gap-2">
                            {BIOLOGY_CURRICULUM.find(t => t.id === selectedLesson.topicId)?.prerequisites.map(preId => (
                              <div key={preId} className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-bold text-text-muted border border-border shadow-sm">
                                Membutuhkan: {BIOLOGY_CURRICULUM.find(t => t.id === preId)?.title}
                              </div>
                            ))}
                            {BIOLOGY_CURRICULUM.filter(t => t.prerequisites.includes(selectedLesson.topicId || '')).map(next => (
                              <div key={next.id} className="px-3 py-1.5 bg-emerald-50 rounded-xl text-[10px] font-black text-emerald-600 border border-emerald-100 shadow-sm">
                                Lanjut ke: {next.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
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

            {activeTab === 'learning-path' && (
              <motion.div 
                key="learning-path"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Zap className="animate-pulse text-accent" size={48} /></div>}>
                  <LearningPath 
                    userLevel={userData?.level || 1}
                    xp={userData?.xp || 0}
                    unlockedTopics={userData?.unlockedTopics || ['cell-structure', 'macromolecules']}
                    topicStats={userData?.topicStats || {}}
                    isPro={isPro}
                    onUpgradeClick={() => setActiveTab('pro-model')}
                    onSelectTopic={(id) => {
                      const topic = BIOLOGY_CURRICULUM.find(t => t.id === id);
                      if (topic) {
                        // Find the first lesson mapped to this topicId
                        const mappedLesson = LESSONS.find(l => l.topicId === id);
                        if (mappedLesson) {
                          setSelectedLesson(mappedLesson);
                        } else {
                          // Fallback to category if no specific lesson found
                          setActiveCategory('All'); 
                        }
                        setActiveTab('lessons');
                      }
                    }}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'flashcards' && (
              <motion.div 
                key="flashcards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Brain className="animate-pulse text-accent" size={48} /></div>}>
                  <Flashcards 
                    cards={reviewingCards}
                    onReview={reviewFlashcard}
                    onClose={() => setActiveTab('dashboard')}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'forum' && (
              <motion.div 
                key="forum"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Brain className="animate-pulse text-accent" size={48} /></div>}>
                  <Forum 
                    user={userData} 
                    onProfileClick={(uid) => setViewingProfileId(uid)} 
                    isListening={isListening}
                    startListening={startListening}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'osn-archive' && (
              <motion.div 
                key="osn-archive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Archive className="animate-pulse text-accent" size={48} /></div>}>
                  <OsnArchive />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'customer-service' && (
              <motion.div 
                key="customer-service"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Suspense fallback={<div className="h-full flex items-center justify-center"><LifeBuoy className="animate-pulse text-accent" size={48} /></div>}>
                  <CustomerService user={userData} />
                </Suspense>
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
                <div className="flex-1 flex overflow-hidden lg:rounded-[40px] glass-card shadow-2xl relative">
                  <div className="w-[320px] hidden md:block shrink-0 border-r border-white/20">
                    <Suspense fallback={<div className="h-full flex items-center justify-center animate-pulse"><Sparkles /></div>}>
                      <ChatSidebar 
                        conversations={conversations}
                        activeId={activeChatId}
                        onSelect={setActiveChatId}
                        onNewChat={createNewAiChat}
                        isLoading={false}
                      />
                    </Suspense>
                  </div>

                  <div className="flex-1 h-full min-w-0 bg-transparent flex flex-col relative">
                    {/* Current Chat Mobile Header */}
                    <div className="md:hidden p-4 border-b border-white/10 flex items-center gap-3 bg-white/20">
                      <button onClick={() => setActiveChatId(null)} className="p-2 bg-white/40 rounded-full shrink-0"><Plus className="rotate-45" size={16}/></button>
                      <span className="text-xs font-black truncate">
                        {conversations.find(c => c.id === activeChatId)?.title || "Dyfa AI"}
                      </span>
                    </div>

                    <Suspense fallback={<div className="h-full flex items-center justify-center"><Sparkles className="animate-pulse text-accent" size={48} /></div>}>
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
                        activeConv={conversations.find(c => c.id === activeChatId)}
                        isPro={isPro}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* AI Panel (Persistent on Desktop, Toggleable on Mobile) */}
      <AnimatePresence>
        {activeTab !== 'chat' && showAiPanel && (
          <aside className={cn(
            "w-[340px] flex flex-col shrink-0 border-l border-white/20 transition-all duration-500 z-[60] shadow-2xl",
            "fixed inset-y-0 right-0 xl:static chat-gradient"
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 -z-10" />
            
            <div className="p-5 border-b border-white/20 flex justify-between items-center bg-white/10 shrink-0">
              <div>
                <div className="text-sm font-black text-text-main flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                  Dyfa AI Assistant
                </div>
                <div className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">
                  Ready to help you
                </div>
              </div>
              <button 
                onClick={() => setShowAiPanel(false)} 
                className="p-1.5 hover:bg-white/40 rounded-full text-text-muted transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 min-h-0 relative">
              <Suspense fallback={<div className="h-full flex items-center justify-center"><Sparkles className="animate-pulse text-accent" size={48} /></div>}>
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
              </Suspense>
            </div>
          </aside>
        )}
      </AnimatePresence>
    </div>
  );
}
