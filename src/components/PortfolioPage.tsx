import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Github, 
  Globe, 
  Code2, 
  Sparkles, 
  ArrowLeft,
  ExternalLink,
  Cpu,
  Layers,
  Palette
} from 'lucide-react';
import { cn } from '../lib/utils';

export const PortfolioPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-bg text-text-main p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto flex justify-between items-center mb-16 relative z-10"
      >
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 hover:bg-white transition-all text-sm font-bold"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dyfalogy
        </button>
        <div className="text-sm font-black tracking-widest text-accent flex items-center gap-2">
          <Sparkles size={16} /> PORTFOLIO
        </div>
      </motion.nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Intro */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-black text-accent uppercase tracking-widest"
            >
              <Cpu size={14} /> Fullstack Developer & Designer
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-text-main"
            >
              Halo, Saya <br />
              <span className="text-accent underline decoration-accent/20">Depalen.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-text-muted leading-relaxed max-w-2xl font-medium"
            >
              Arsitek di balik Dyfalogy. Saya fokus membangun pengalaman digital yang menggabungkan estetika modern dengan logika pemrograman yang kuat.
            </motion.p>
          </section>

          {/* Experience/Skills Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                icon: Layers, 
                title: "Frontend Mastery", 
                desc: "Expert dalam React, Tailwind CSS, dan Framer Motion untuk UI yang interaktif.",
                color: "text-blue-500"
              },
              { 
                icon: Code2, 
                title: "Backend Architect", 
                desc: "Membangun sistem serverless dan API yang skalabel dengan Node.js & Firebase.",
                color: "text-emerald-500"
              },
              { 
                icon: Palette, 
                title: "UI/UX Design", 
                desc: "Menciptakan desain yang user-centric dengan visual yang polish dan distinctive.",
                color: "text-purple-500"
              },
              { 
                icon: Globe, 
                title: "Product Growth", 
                desc: "Berpengalaman mengelola siklus hidup produk dari ide hingga deployment.",
                color: "text-orange-500"
              }
            ].map((skill, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="glass-card p-8 rounded-[40px] border-white/50 hover:bg-white transition-all group"
              >
                <div className={cn("w-12 h-12 rounded-2xl bg-current opacity-10 flex items-center justify-center mb-6", skill.color)}>
                  <skill.icon className={skill.color} size={24} />
                </div>
                <h3 className="text-xl font-black mb-3">{skill.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed font-medium">{skill.desc}</p>
              </motion.div>
            ))}
          </section>
        </div>

        {/* Right Column: Contact/Links */}
        <div className="lg:col-span-4 space-y-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="glass-card p-10 rounded-[48px] border-accent/20 bg-accent text-white shadow-2xl shadow-accent/20 relative overflow-hidden group"
           >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <User size={120} />
             </div>
             <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-black tracking-tight">Mari Berkolaborasi</h2>
                <p className="text-white/80 text-sm leading-relaxed font-medium">
                  Saya selalu terbuka untuk proyek menarik atau diskusi seputar teknologi dan desain.
                </p>
                <div className="space-y-3">
                  <a href="mailto:depalen@example.com" className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                    <Mail size={20} />
                    <span className="text-sm font-bold truncate">depalen@example.com</span>
                  </a>
                  <a href="https://github.com/depalen" target="_blank" className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                    <Github size={20} />
                    <span className="text-sm font-bold">@depalen</span>
                  </a>
                </div>
                <button className="w-full py-4 bg-white text-accent rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gold transition-colors">
                  Check Resume <ExternalLink size={16} />
                </button>
             </div>
           </motion.div>

           <div className="glass-card p-8 rounded-[40px] border-white/50 space-y-6">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Latest Project</div>
              <div className="space-y-4">
                <div className="aspect-video bg-bg rounded-3xl border border-white/50 overflow-hidden relative group cursor-pointer">
                   <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-white px-4 py-2 rounded-xl text-xs font-black text-accent shadow-xl">VIEW CASE STUDY</span>
                   </div>
                   <div className="p-6 h-full flex flex-col justify-end">
                      <div className="text-lg font-black leading-none mb-2">Dyfalogy OSN Platform</div>
                      <div className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Edu-tech / Gamification</div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-24 pt-12 border-t border-white/50 text-center flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-all">
         <div className="text-[10px] font-black tracking-[0.2em] uppercase">© 2026 DEPALEN. Built with AI Studio.</div>
         <div className="flex gap-6 text-[10px] font-black tracking-[0.2em] uppercase">
            <span className="cursor-pointer hover:text-accent transition-colors">Digital Craftsman</span>
            <span className="cursor-pointer hover:text-accent transition-colors">Arsitek Dyfalogy</span>
         </div>
      </footer>
    </div>
  );
};
