import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, AlertTriangle, User, Camera, Trash2, Terminal, Volume2, VolumeX, Ghost } from 'lucide-react';
import { cn } from '../lib/utils';

export const DeathNotePage = () => {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [executionPhase, setExecutionPhase] = useState<'idle' | 'writing' | 'glitch' | 'death'>('idle');
  const [hasEntered, setHasEntered] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const execute = async () => {
    if (!name || !image) return;
    
    setIsExecuting(true);
    setExecutionPhase('writing');
    
    const lines = [
      "INITIALIZING JUSTICE PROTOCOL...",
      "SYNCING WITH THE NEW WORLD ORDER.",
      `NAME REGISTERED: ${name.toUpperCase()}`,
      "CHECKING VISUAL TEMPLATE...",
      "BIOMETRIC LOCK ACQUIRED.",
      "THE SENTENCE IS ABSOLUTE.",
      "ELIMINATING IN 4... 3... 2... 1..."
    ];

    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setTerminalLines(prev => [...prev, lines[i]]);
    }

    setExecutionPhase('glitch');
    await new Promise(r => setTimeout(r, 2000));
    setExecutionPhase('death');
    await new Promise(r => setTimeout(r, 4000));
    
    // Reset
    setIsExecuting(false);
    setExecutionPhase('idle');
    setTerminalLines([]);
    setName('');
    setImage(null);
  };

  const enterWorld = () => {
    setHasEntered(true);
    setIsAudioLoaded(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#555] relative flex flex-col items-center py-12 px-6 overflow-y-auto death-note-theme selection:bg-zinc-900 selection:text-zinc-600">
      {/* Background Audio - Kira Theme */}
      {isAudioLoaded && (
        <div className="absolute inset-0 pointer-events-none opacity-0">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/tAMhUyLwD4k?autoplay=1&loop=1&playlist=tAMhUyLwD4k&controls=0" 
            title="Kira Theme" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          />
        </div>
      )}

      {/* Realistic Fog/Smoke & Particles */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden opacity-30">
        <div className="smoke-container">
          <div className="smoke-layer smoke-1" />
          <div className="smoke-layer smoke-2" />
          <div className="smoke-layer smoke-3" />
        </div>
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i % 5}`} style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {!hasEntered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center py-20 px-8 text-center overflow-y-auto"
          >
            <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl mx-auto relative z-10">
              <div className="space-y-6 w-full py-16 px-6 border-y border-zinc-900 relative overflow-hidden bg-zinc-950/40 backdrop-blur-sm">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent animate-shimmer pointer-events-none" />
               <motion.h2 
                 animate={{ opacity: [0.8, 1, 0.8] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="text-4xl lg:text-6xl font-black uppercase tracking-[0.3em] gothic-font text-zinc-600"
               >
                 The Legend of Kira
               </motion.h2>
               <h3 className="text-xl lg:text-2xl font-bold text-zinc-800 italic tracking-[0.5em] uppercase">
                 The Saviour
               </h3>
               <div className="h-px w-24 bg-zinc-900 mx-auto my-8" />
               <p className="text-[10px] lg:text-xs font-mono tracking-[0.3em] leading-loose text-zinc-700 opacity-80 max-w-lg mx-auto">
                 CRIMINALS WORLDWIDE HAVE BEEN WARNED.<br/>
                 BECAUSE KIRA IS AMONG US AGAIN.<br/>
                 HE IS THE ONE WHO WILL TOLERATE NO WICKEDNESS.<br/>
                 OUR MESSENGER FROM THE ABYSS.<br/>
                 ONLY THOSE WHO BELIEVE SHALL SURVIVE THE JUDGEMENT.
               </p>
            </div>
            
            <button 
              onClick={enterWorld}
              className="mt-12 px-16 py-5 border border-zinc-800 text-zinc-600 font-black uppercase tracking-[0.6em] text-sm hover:bg-zinc-900 hover:text-zinc-400 transition-all hover:tracking-[0.8em] relative group bg-black/50 backdrop-blur-md"
            >
              <span className="relative z-10 transition-all duration-500 group-hover:scale-110 block">ENTER THE NEW WORLD</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.02] transition-opacity" />
            </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extreme Glitch Layers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute inset-0 glitch-pixels opacity-10" />
        <div className={cn(
          "absolute inset-0 bg-white/5 transition-opacity duration-100",
          executionPhase === 'glitch' ? "opacity-30" : "opacity-0"
        )} />
      </div>

      <AnimatePresence>
        {executionPhase === 'glitch' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-400/20 mix-blend-difference pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full space-y-12 relative z-[20]"
      >
        {/* Header - Monochrome Grey */}
        <div className="text-center space-y-6">
          <motion.div 
            animate={{ 
              scale: isExecuting ? [1, 1.2, 0.9, 1.1, 1] : 1,
              filter: isExecuting ? ["grayscale(1) contrast(0.5)", "grayscale(1) contrast(2)", "grayscale(1) contrast(0.5)"] : "grayscale(1) contrast(0.8)"
            }}
            transition={{ repeat: isExecuting ? Infinity : 0, duration: 0.1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-zinc-800 text-zinc-600 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-[#0a0a0a] relative"
          >
            <Skull size={48} className="relative z-10 opacity-30" />
            <div className="absolute inset-0 animate-pulse bg-zinc-800/10 rounded-full blur-xl" />
          </motion.div>
          <div className="space-y-2">
            <h1 className={cn(
              "text-7xl font-black uppercase tracking-tighter leading-none gothic-font text-zinc-700 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]",
              executionPhase === 'glitch' && "animate-glitch-absurd"
            )}>
              KIRA'S JUDGMENT
            </h1>
            <p className="text-zinc-800 font-mono text-[10px] tracking-[0.4em] uppercase opacity-40">
              The God of the New World is watching
            </p>
          </div>
        </div>

        {/* Notebook UI - Absurd Grey Minimalist */}
        <div className={cn(
          "bg-[#0a0a0a] border border-zinc-900 rounded-none p-10 shadow-2xl relative overflow-hidden transition-all duration-1000",
          executionPhase === 'writing' && "scale-[1.01] border-zinc-800 bg-[#0c0c0c]",
          executionPhase === 'death' && "bg-zinc-800 scale-[1.05] opacity-0 blur-3xl"
        )}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 pointer-events-none invert" />
          
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-800">
                Identify the Unworthy
              </label>
              <div className="relative group">
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isExecuting}
                  placeholder="Insert Name..."
                  className="w-full bg-transparent border-b border-zinc-900 py-4 px-2 text-3xl font-black focus:outline-none focus:border-zinc-700 transition-all uppercase tracking-tighter placeholder:text-zinc-900 text-zinc-600"
                />
                <User className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-900 group-focus-within:text-zinc-700 transition-colors" size={24} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-800">
                Visual Biometrics
              </label>
              {image ? (
                <div className="relative group aspect-square max-w-[200px] mx-auto bg-black border border-zinc-900 overflow-hidden">
                  <img src={image} alt="Target" className="w-full h-full object-cover grayscale brightness-50 contrast-75 group-hover:brightness-100 transition-all duration-700" />
                  {!isExecuting && (
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 p-2 bg-zinc-900 text-zinc-500 hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {isExecuting && (
                    <motion.div 
                      animate={{ y: ["0%", "100%", "0%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute left-0 right-0 h-px bg-zinc-800 z-20"
                    />
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square max-w-[200px] mx-auto border border-dashed border-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/10 cursor-pointer transition-all group">
                  <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                  <Camera className="text-zinc-900 group-hover:text-zinc-700 transition-colors mb-3" size={40} />
                  <span className="text-[9px] text-zinc-800 font-bold uppercase tracking-widest text-center px-4">Subject Visualization Required</span>
                </label>
              )}
            </div>

            <button 
              disabled={!name || !image || isExecuting}
              onClick={execute}
              className={cn(
                "w-full py-6 rounded-none font-black text-xs uppercase tracking-[0.4em] transition-all relative overflow-hidden group",
                !name || !image ? "bg-zinc-950 text-zinc-900 cursor-not-allowed border border-zinc-900" : 
                isExecuting ? "bg-zinc-900/50 text-zinc-600 animate-pulse border border-zinc-800" : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800"
              )}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isExecuting ? (
                  <>PURGING DATA <Ghost size={14} className="animate-bounce" /></>
                ) : (
                  "ADMINISTER JUSTICE"
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
          </div>
        </div>

        {/* System Log - Absurd Grey */}
        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 border-b border-zinc-900 pb-2">
              <Terminal size={12} /> LOG_STREAM_K
            </div>
            <div className="space-y-2 h-[80px] overflow-hidden">
              {terminalLines.map((line, i) => (
                <div key={i} className="opacity-40 animate-fade-in truncate">
                  {`[${new Date().toLocaleTimeString()}] ${line}`}
                </div>
              ))}
              {isExecuting && <div className="h-2 w-1 bg-zinc-800 animate-blink" />}
            </div>
          </div>
          <div className="space-y-4 opacity-20 hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2 text-zinc-700 border-b border-zinc-900 pb-2">
                <AlertTriangle size={12} /> DIRECTIVES
             </div>
             <p className="leading-relaxed">Access strictly monitored by the New World Order. Every entry is a contract. Every name is a debt paid in shadow.</p>
          </div>
        </div>
      </motion.div>

      {/* Extreme Visual Noises */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
         <div className="absolute inset-0 bg-transparent shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
         <div className="scanline-absurd" />
         <div className="vignette-noise" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap');
        
        .gothic-font {
          font-family: 'UnifrakturMaguntia', cursive;
        }

        .death-note-theme {
          background-color: #030303;
          filter: grayscale(1) contrast(1.2) brightness(0.8);
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(30, 30, 30, 0.4) 0%, transparent 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .smoke-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .smoke-layer {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: radial-gradient(circle at center, rgba(80, 80, 80, 0.1) 0%, transparent 60%);
          filter: blur(60px);
          animation: smoke-drift linear infinite;
        }

        .smoke-1 { animation-duration: 40s; opacity: 0.15; }
        .smoke-2 { animation-duration: 55s; animation-direction: reverse; opacity: 0.1; }
        .smoke-3 { animation-duration: 70s; opacity: 0.05; }
        
        .particles-container {
          position: absolute;
          inset: 0;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: particle-float linear infinite;
        }

        .particle-1 { width: 3px; height: 3px; background: rgba(100, 100, 100, 0.3); }
        .particle-2 { width: 1px; height: 1px; background: rgba(200, 200, 200, 0.1); }
        .particle-3 { width: 2px; height: 2px; background: rgba(150, 150, 150, 0.4); filter: blur(1px); }

        @keyframes particle-float {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate(100px, -200px) rotate(360deg); opacity: 0; }
        }

        @keyframes smoke-drift {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10%, 10%) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        .glitch-pixels {
          background-image: 
            radial-gradient(circle, #222 1px, transparent 1px);
          background-size: 30px 30px;
          filter: blur(5px) contrast(50);
        }

        .animate-blink {
          animation: blink 0.5s step-end infinite;
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        .scanline-absurd {
          width: 100%;
          height: 15px;
          z-index: 100;
          background: rgba(255, 255, 255, 0.05);
          opacity: 0.5;
          position: absolute;
          bottom: 100%;
          animation: scanline 2s linear infinite;
        }

        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }

        .animate-glitch-absurd {
          animation: glitch-absurd 0.2s linear infinite;
        }

        @keyframes glitch-absurd {
          0% { transform: skew(0deg) translate(0px); filter: brightness(1); }
          20% { transform: skew(3deg) translate(-2px); filter: brightness(1.5); }
          40% { transform: skew(-3deg) translate(2px); filter: invert(0.1); }
          60% { transform: skew(1deg) translate(-1px); filter: brightness(0.8); }
          80% { transform: skew(-1deg) translate(1px); filter: contrast(2); }
          100% { transform: skew(0deg) translate(0px); }
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .vignette-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.1;
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  );
};
