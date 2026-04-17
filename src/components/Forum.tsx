import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  Plus, 
  X, 
  Mic, 
  Image as ImageIcon 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  increment, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { cn } from '../lib/utils';

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

export const Forum = memo(({ 
  user, 
  onProfileClick,
  isListening,
  startListening
}: { 
  user: any, 
  onProfileClick: (uid: string) => void,
  isListening: boolean,
  startListening: () => void
}) => {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
  const longPressTimer = useRef<any>(null);

  const [forumImage, setForumImage] = useState<string | null>(null);
  const forumFileRef = useRef<HTMLInputElement>(null);

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

  const handleReplyLongPress = useCallback((reply: any) => {
    setActiveContextMenu(reply.id);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  }, []);

  const handleReaction = useCallback(async (itemId: string, reactionType: string, isTopic: boolean = false) => {
    if (!user) return;
    const path = isTopic ? `forumTopics/${itemId}` : `forumTopics/${selectedTopic?.id}/replies/${itemId}`;
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
  }, [user, selectedTopic?.id]);

  const promoteToTopic = useCallback(async (reply: any) => {
    if (!user || !selectedTopic) return;
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
  }, [user, selectedTopic]);

  const handleForumImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB ya!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setForumImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCreateTopic = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !user) return;

    await addDoc(collection(db, 'forumTopics'), {
      title: newTopicTitle,
      content: newTopicContent,
      imageUrl: forumImage,
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
    setForumImage(null);
    setIsCreating(false);
  }, [newTopicTitle, newTopicContent, forumImage, user]);

  const handleCreateReply = useCallback(async (e: React.FormEvent) => {
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
  }, [newReplyContent, user, selectedTopic, replyingTo]);

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
              <img 
                loading="lazy" 
                src={reply.authorPhoto} 
                className="w-6 h-6 rounded-full border border-white/50" 
                alt="" 
                referrerPolicy="no-referrer" 
              />
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
                <img 
                  loading="lazy" 
                  src={selectedTopic.authorPhoto} 
                  className="w-10 h-10 rounded-full border border-white/50 group-hover:scale-110 transition-transform" 
                  alt="" 
                  referrerPolicy="no-referrer" 
                />
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

          <form onSubmit={handleCreateReply} className="sticky bottom-4 glass-card rounded-2xl md:rounded-3xl p-2 md:p-4 flex flex-col gap-2 md:gap-3 shadow-2xl z-[100] mx-0 md:mx-auto max-w-full border-t border-white/20">
            {replyingTo && (
              <div className="flex justify-between items-center bg-accent/10 px-3 py-1 rounded-xl border border-accent/20">
                <span className="text-[9px] md:text-[10px] font-bold text-accent truncate">Membalas @{replyingTo.authorName}</span>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-text-muted hover:text-red-500 shrink-0"><X size={12} /></button>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={newReplyContent}
                  onChange={(e) => setNewReplyContent(e.target.value)}
                  placeholder={replyingTo ? "Balas diskusi..." : "Tulis balasan publik..."}
                  className="w-full bg-white/50 border border-border rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-[11px] md:text-sm focus:outline-none focus:border-accent transition-all pr-10"
                />
                <button 
                  type="button"
                  onClick={startListening}
                  className={cn(
                    "absolute right-1 md:right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-xl transition-all",
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-text-muted hover:text-accent"
                  )}
                >
                  <Mic size={14} className="md:w-[16px] md:h-[16px]" />
                </button>
              </div>
              <button type="submit" className="bg-accent text-white p-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-bold shadow-lg shadow-accent/20 shrink-0 active:scale-95 transition-all">
                <span className="hidden md:inline">Kirim</span>
                <Send size={14} className="md:hidden" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          <div className="flex justify-between items-center px-2 md:px-0">
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
              className="glass-card rounded-3xl p-6 md:p-8 space-y-4 border border-accent/10 mx-2 md:mx-0"
            >
              <input 
                type="text" 
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Judul Topik yang Menarik"
                className="w-full bg-white/50 border border-border rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-accent"
              />
              
              <div className="relative">
                <textarea 
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder="Deskripsikan apa yang ingin kamu diskusikan atau tanyakan..."
                  rows={4}
                  className="w-full bg-white/50 border border-border rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-accent resize-none pr-12"
                />
                <button 
                  type="button"
                  onClick={startListening}
                  className={cn(
                    "absolute right-3 top-3 p-2 rounded-xl transition-all",
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-text-muted hover:text-accent"
                  )}
                >
                  <Mic size={18} />
                </button>
              </div>

              {forumImage && (
                <div className="relative w-24 h-24 group">
                  <img src={forumImage} className="w-full h-full object-cover rounded-xl border-2 border-accent" />
                  <button 
                    onClick={() => setForumImage(null)}
                    type="button"
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => forumFileRef.current?.click()}
                  className="flex-1 py-3 bg-white/40 text-text-muted rounded-xl border border-white/60 hover:bg-white/60 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <ImageIcon size={16} /> Lampirkan Gambar
                </button>
                <input type="file" hidden ref={forumFileRef} accept="image/*" onChange={handleForumImageSelect} />
                <button type="submit" className="flex-[2] bg-accent text-white py-3 rounded-xl font-bold liquid-button text-sm">
                  Posting Topik
                </button>
              </div>
            </motion.form>
          )}

          <div className="grid gap-4 px-2 md:px-0">
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
                    <img 
                      loading="lazy" 
                      src={topic.authorPhoto} 
                      className="w-8 h-8 rounded-full border border-white/50" 
                      alt="" 
                      referrerPolicy="no-referrer" 
                    />
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-accent transition-colors block">{topic.authorName}</span>
                      <span className="text-[9px] text-text-muted mt-0.5 block">{topic.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div onClick={() => setSelectedTopic(topic)} className="cursor-pointer space-y-3">
                  <h3 className="text-lg font-bold text-text-main group-hover:text-accent transition-colors leading-snug">{topic.title}</h3>
                  {topic.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/20 max-h-48">
                      <img 
                        loading="lazy" 
                        src={topic.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt="" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  )}
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
});
