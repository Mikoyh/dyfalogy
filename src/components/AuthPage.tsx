import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  Phone,
  Facebook,
  CheckCircle2
} from 'lucide-react';
import { 
  auth,
  signInWithGoogle, 
  signInWithFacebook,
  signInWithGithub,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '../lib/firebase';
import { cn } from '../lib/utils';
import { ConfirmationResult } from 'firebase/auth';

interface AuthPageProps {
  onBack: () => void;
}

type AuthMethod = 'email' | 'phone';

export const AuthPage = ({ onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  
  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Phone States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Initialize reCAPTCHA for Phone Auth
    if (authMethod === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [authMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMethod === 'email') {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: name });
        }
      } else {
        // Phone Auth Logic
        if (!verificationId) {
          const appVerifier = window.recaptchaVerifier;
          const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
          setVerificationId(confirmation);
          setSuccess('Kode OTP telah dikirim ke nomor Anda.');
        } else {
          await verificationId.confirm(otp);
        }
      }
    } catch (err: any) {
      console.error(err);
      let message = 'Terjadi kesalahan saat autentikasi.';
      if (err.code === 'auth/invalid-phone-number') message = 'Nomor telepon tidak valid.';
      if (err.code === 'auth/code-expired') message = 'Kode OTP sudah kadaluarsa.';
      if (err.code === 'auth/wrong-code') message = 'Kode OTP salah.';
      setError(err.message || message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (method: 'google' | 'facebook' | 'github') => {
    setError(null);
    setLoading(true);
    try {
      if (method === 'google') await signInWithGoogle();
      if (method === 'facebook') await signInWithFacebook();
      if (method === 'github') await signInWithGithub();
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Gagal masuk dengan ${method}.`);
    } finally {
      setLoading(false);
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
          <div className="flex flex-col items-center text-center mb-8">
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

          {/* Method Selector */}
          <div className="flex p-1 bg-white/30 backdrop-blur-md rounded-2xl mb-8 border border-white/50">
            <button 
              onClick={() => { setAuthMethod('email'); setError(null); setSuccess(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                authMethod === 'email' ? "bg-white text-accent shadow-sm" : "text-text-muted hover:text-text-main"
              )}
            >
              <Mail size={14} />
              Email
            </button>
            <button 
              onClick={() => { setAuthMethod('phone'); setError(null); setSuccess(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                authMethod === 'phone' ? "bg-white text-accent shadow-sm" : "text-text-muted hover:text-text-main"
              )}
            >
              <Phone size={14} />
              Telepon
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {authMethod === 'email' ? (
                <motion.div
                  key="email-fields"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {!isLogin && (
                    <div className="space-y-1.5">
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
                    </div>
                  )}

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
                </motion.div>
              ) : (
                <motion.div
                  key="phone-fields"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-accent px-1">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input 
                        type="tel"
                        required
                        disabled={!!verificationId}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+628123456789"
                        className="w-full bg-white/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {verificationId && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[11px] font-black uppercase tracking-widest text-accent px-1">Kode OTP</label>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input 
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full bg-white/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div id="recaptcha-container"></div>

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

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs font-medium"
              >
                <CheckCircle2 size={16} className="shrink-0" />
                {success}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-accent/20 hover:shadow-accent/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : (
                authMethod === 'phone' 
                  ? (verificationId ? 'Verifikasi OTP' : 'Kirim Kode OTP')
                  : (isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang')
              )}
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

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-3 py-4 bg-white border border-border rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center gap-2 py-4 bg-[#1877F2] text-white rounded-2xl text-xs font-bold hover:bg-[#166fe5] transition-all shadow-sm group"
              >
                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                Facebook
              </button>
              <button 
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-2 py-4 bg-[#24292e] text-white rounded-2xl text-xs font-bold hover:bg-[#1c2126] transition-all shadow-sm group"
              >
                <Github size={18} className="group-hover:scale-110 transition-transform" />
                GitHub
              </button>
            </div>
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

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
