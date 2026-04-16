import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Github, 
  Chrome, 
  AlertCircle,
  Brain,
  ChevronLeft
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from '../lib/firebase';
import { cn } from '../lib/utils';

interface AuthPageProps {
  onBack: () => void;
}

export const AuthPage = ({ onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal masuk dengan Google.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="atmosphere fixed inset-0 opacity-40" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Kembali ke Beranda</span>
        </button>

        <div className="liquid-glass border border-white/60 rounded-[32px] p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-xl shadow-accent/30 mb-6">
              <Brain size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-text-main">
              {isLogin ? 'Selamat Datang!' : 'Gabung Dyfalogy'}
            </h2>
            <p className="text-text-muted mt-2 text-sm">
              {isLogin 
                ? 'Masuk untuk melanjutkan perjalanan olimpiademu.' 
                : 'Mulai persiapan OSP Biologi dengan platform terbaik.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[11px] font-black uppercase tracking-widest text-accent px-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama kamu"
                      className="w-full bg-white/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-accent px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-white/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-accent">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-bold text-text-muted hover:text-accent transition-colors">Lupa Password?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-medium"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-accent/20 hover:shadow-accent/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : (isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang')}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white/50 backdrop-blur-sm px-4 text-text-muted">Atau masuk dengan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-4 bg-white border border-border rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Chrome size={18} className="text-blue-500" />
              Google
            </button>
          </div>

          <p className="text-center mt-10 text-sm text-text-muted">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-accent font-black hover:underline"
            >
              {isLogin ? 'Daftar Gratis' : 'Masuk di sini'}
            </button>
          </p>
        </div>

        <p className="text-center mt-8 text-[10px] text-text-muted font-medium uppercase tracking-widest">
          &copy; 2026 Dyfalogy. All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
};
