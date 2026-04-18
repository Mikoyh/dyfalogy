import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  Award, 
  Star, 
  Zap, 
  BookOpen, 
  MessageCircle, 
  Settings,
  ChevronRight,
  Shield,
  Trophy,
  Heart,
  Share2,
  Edit3,
  Check,
  MessageSquare
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface ProfilePageProps {
  userId: string;
  isOwnProfile: boolean;
  onClose?: () => void;
  onStartChat?: (userId: string) => void;
}

const BORDERS = [
  { id: 'none', name: 'Tanpa Border', color: 'transparent', minLevel: 1 },
  { id: 'bronze', name: 'Bronze Warrior', color: '#CD7F32', minLevel: 5 },
  { id: 'silver', name: 'Silver Scholar', color: '#C0C0C0', minLevel: 10 },
  { id: 'gold', name: 'Gold Master', color: '#FFD700', minLevel: 20 },
  { id: 'emerald', name: 'Emerald Legend', color: '#50C878', minLevel: 35 },
  { id: 'diamond', name: 'Diamond Biologist', color: '#B9F2FF', minLevel: 50 },
];

export const ProfilePage = memo(({ userId, isOwnProfile, onClose, onStartChat }: ProfilePageProps) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [selectedBorder, setSelectedBorder] = useState('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
        setNewName(data.displayName || '');
        setNewBio(data.bio || '');
        setNewPhoto(data.photoURL || '');
        setSelectedBorder(data.profileBorder || 'none');
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        displayName: newName,
        bio: newBio,
        photoURL: newPhoto,
        profileBorder: selectedBorder
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) return null;

  const currentBorder = BORDERS.find(b => b.id === (profileData.profileBorder || 'none'));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header / Banner */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-[#1A4331]" />
        <div className="absolute inset-0 atmosphere opacity-30" />
        {onClose && (
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all">
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Profile Info Card */}
      <div className="relative -mt-24 px-6">
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/60 relative">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Avatar with Border */}
            <div className="relative shrink-0">
              <div 
                className="w-32 h-32 rounded-full p-1.5 transition-all duration-500"
                style={{ 
                  background: currentBorder?.color !== 'transparent' 
                    ? `conic-gradient(from 0deg, ${currentBorder?.color}, transparent, ${currentBorder?.color})` 
                    : 'transparent',
                  boxShadow: currentBorder?.color !== 'transparent' ? `0 0 20px ${currentBorder?.color}40` : 'none'
                }}
              >
                <img 
  loading="lazy" 
  src={profileData.photoURL || 'https://picsum.photos/seed/user/200/200'} 
  className="w-full h-full rounded-full object-cover border-4 border-white shadow-inner"
  alt={profileData.displayName}
  referrerPolicy="no-referrer"
/>
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-1 p-2 bg-accent text-white rounded-full shadow-lg hover:scale-110 transition-all border-2 border-white"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-text-main">
                  {profileData.displayName}
                </h1>
                <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black text-accent uppercase tracking-widest">
                  LVL {profileData.level || 1}
                </div>
              </div>
              <p className="text-text-muted text-sm max-w-lg leading-relaxed">
                {profileData.bio || 'Belum ada bio. Pejuang medali OSP Biologi 2026!'}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Award size={14} className="text-gold" />
                  {profileData.badges?.length || 0} Lencana
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Zap size={14} className="text-accent" />
                  {profileData.xp || 0} XP
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <MessageCircle size={14} className="text-blue-500" />
                  {profileData.stats?.forumPosts || 0} Diskusi
                </div>
              </div>
            </div>

            {isOwnProfile && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white/50 hover:bg-white/80 border border-border px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Profil
              </button>
            )}

            {!isOwnProfile && onStartChat && (
              <button 
                onClick={() => onStartChat(userId)}
                className="bg-accent text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 liquid-button"
              >
                <MessageSquare size={16} />
                Kirim Pesan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 md:px-0">
        {/* Left Column: Stats & Badges */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <Trophy size={16} /> Statistik Belajar
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/30 rounded-xl border border-white/50">
                <span className="text-xs font-bold text-text-muted">Quiz Selesai</span>
                <span className="font-mono font-black text-accent">{profileData.stats?.quizzesTaken || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/30 rounded-xl border border-white/50">
                <span className="text-xs font-bold text-text-muted">Akurasi Jawaban</span>
                <span className="font-mono font-black text-accent">
                  {profileData.stats?.quizzesTaken > 0 
                    ? Math.round((profileData.stats?.correctAnswers / (profileData.stats?.quizzesTaken * 10)) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/30 rounded-xl border border-white/50">
                <span className="text-xs font-bold text-text-muted">Materi Dikuasai</span>
                <span className="font-mono font-black text-accent">{profileData.completedLessons?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
              <Award size={16} /> Koleksi Lencana
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {profileData.badges?.map((badgeId: string) => (
                <div key={badgeId} className="aspect-square bg-accent/5 rounded-xl flex items-center justify-center border border-accent/10 group relative cursor-help">
                  <Star size={20} className="text-gold" />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {badgeId}
                  </div>
                </div>
              ))}
              {(!profileData.badges || profileData.badges.length === 0) && (
                <div className="col-span-4 py-8 text-center text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-40">
                  Belum ada lencana
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity / About */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <Zap size={16} /> Aktivitas Terakhir
              </h3>
              <button className="text-[10px] font-black text-text-muted hover:text-accent uppercase tracking-widest">
                Lihat Semua
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-white/20 rounded-2xl border border-white/50">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">Menyelesaikan Materi: Biologi Sel</div>
                  <div className="text-[10px] text-text-muted mt-0.5">2 jam yang lalu • +50 XP</div>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-white/20 rounded-2xl border border-white/50">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">Memposting di Forum: Tips Genetika</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Kemarin • +10 XP</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto">
              <Share2 size={24} />
            </div>
            <h3 className="text-lg font-black tracking-tight">Bagikan Profilmu!</h3>
            <p className="text-sm text-text-muted max-w-xs mx-auto">Tunjukkan pencapaianmu kepada teman-teman pejuang olimpiade lainnya.</p>
            <button className="bg-accent text-white px-8 py-3 rounded-2xl text-sm font-bold liquid-button shadow-lg shadow-accent/20">
              Salin Link Profil
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Settings className="text-accent" /> Pengaturan Profil
                </h2>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronRight className="rotate-90" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-accent px-1">Nama Tampilan</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-accent px-1">URL Foto Profil</label>
                    <input 
                      type="text" 
                      value={newPhoto}
                      onChange={(e) => setNewPhoto(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-accent px-1">Bio Singkat</label>
                  <textarea 
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Ceritakan sedikit tentang dirimu..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-accent px-1">Pilih Border Profil (Kosmetik)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BORDERS.map((border) => {
                      const isLocked = (profileData.level || 1) < border.minLevel;
                      return (
                        <button
                          key={border.id}
                          disabled={isLocked}
                          onClick={() => setSelectedBorder(border.id)}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group",
                            selectedBorder === border.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/30",
                            isLocked && "opacity-50 grayscale cursor-not-allowed"
                          )}
                        >
                          <div className="text-[10px] font-black mb-1" style={{ color: border.color !== 'transparent' ? border.color : 'inherit' }}>
                            {border.name}
                          </div>
                          <div className="text-[9px] text-text-muted font-bold">Min. Level {border.minLevel}</div>
                          {isLocked && <Shield size={14} className="absolute top-2 right-2 text-text-muted" />}
                          {selectedBorder === border.id && <Check size={14} className="absolute top-2 right-2 text-accent" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-sm border border-border hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex-1 bg-accent text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-accent/20 liquid-button disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
