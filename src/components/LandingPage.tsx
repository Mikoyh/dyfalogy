import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Brain, Star } from 'lucide-react';

export const LandingPage = memo(({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-b from-bg to-accent/5">
      <div className="atmosphere pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center space-y-12 max-w-4xl"
      >
        <div className="flex justify-center">
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-28 bg-white border border-accent/10 rounded-[32px] flex items-center justify-center text-accent shadow-2xl shadow-accent/5"
          >
            <Brain size={56} className="text-accent" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-text-main leading-[0.85]">
              BIOLOGY <br />
              <span className="text-accent underline-gold decoration-gold/30">MASTERY.</span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-text-muted font-medium max-w-2xl mx-auto leading-relaxed border-l-2 border-accent/20 pl-6 text-left"
          >
            Satu-satunya platform persiapan OSP Biologi yang menggabungkan Gamifikasi, Spaced Repetition, dan AI Personal Tutor dalam satu ekosistem canggih.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={onLogin}
            className="bg-accent text-white px-10 py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-accent/30 liquid-button flex items-center gap-3 w-full sm:w-auto"
          >
            MULAI SEKARANG <Star className="fill-white" size={20} />
          </button>
          
          <div className="p-1 px-[2px] bg-white/20 backdrop-blur-xl border border-white/50 rounded-3xl flex items-center gap-3">
             <div className="pr-4 py-3 pl-6">
               <div className="text-[10px] font-black uppercase text-accent leading-none">PEJUANG TERDAFTAR</div>
               <div className="text-[9px] text-text-muted font-medium">Bergabung dengan 5,000+ sobat lainnya.</div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
           {[
             { label: 'AI TUTOR', sub: 'Bantuan 24/7', color: 'bg-emerald-500' },
             { label: 'ADAPTIVE QUIZ', sub: 'Sesuai Levelmu', color: 'bg-blue-500' },
             { label: 'ARCHIVE', sub: 'Soal 10 Tahun+', color: 'bg-orange-500' },
             { label: 'FORUM', sub: 'Diskusi Global', color: 'bg-purple-500' }
           ].map((feat, i) => (
             <motion.div 
               key={feat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 + (i * 0.1) }}
               className="glass-card p-4 rounded-2xl border-white/40 text-left"
             >
                <div className={`w-2 h-2 rounded-full ${feat.color} mb-2`} />
                <div className="text-[10px] font-black uppercase tracking-widest">{feat.label}</div>
                <div className="text-[9px] text-text-muted leading-none mt-1">{feat.sub}</div>
             </motion.div>
           ))}
        </div>
      </motion.div>

    </div>
  );
});
