import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, TrendingUp, AlertTriangle, Info, Coins, Dices, Trophy, HelpCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Notification {
  id: number;
  user: string;
  amount: string;
}

export const SecretScamPage = ({ onClose }: { onClose?: () => void }) => {
  const [balance, setBalance] = useState(500000);
  const [bet, setBet] = useState(50000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fake winning notifications
  useEffect(() => {
    const names = ['Budi_88', 'Siti_Cantik', 'Andi_JP', 'Rina_Hoki', 'MegaSlot', 'Joko_Gacor', 'Dewi_777', 'LuckyUser777', 'SlotMaster_ID'];
    const interval = setInterval(() => {
      const newNotif = {
        id: Date.now(),
        user: names[Math.floor(Math.random() * names.length)],
        amount: (Math.random() * 25000000 + 500000).toLocaleString('id-ID')
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 5)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDeposit = () => {
    const val = parseInt(amount);
    if (!isNaN(val) && val > 0) {
      setBalance(prev => prev + val);
      setShowDeposit(false);
      setAmount('');
    }
  };

  const handleWithdraw = () => {
    const val = parseInt(amount);
    if (!isNaN(val) && val > 0 && val <= balance) {
      setBalance(prev => prev - val);
      setShowWithdraw(false);
      setAmount('');
    }
  };

  const handleSpin = () => {
    if (balance < bet) return;
    setIsSpinning(true);
    setBalance(prev => prev - bet);
    setLastWin(null);

    // Simulated outcome - biased towards losing but with "tease" wins
    setTimeout(() => {
      const winChance = Math.random();
      let winAmount = 0;

      if (winChance > 0.92) {
        winAmount = bet * (Math.random() * 5 + 2);
        setBalance(prev => prev + Math.floor(winAmount));
        setLastWin(Math.floor(winAmount));
      }
      
      setIsSpinning(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 p-4 lg:p-8 font-sans overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#151515] p-8 rounded-3xl border border-yellow-500/20 max-w-md w-full space-y-6">
              <h2 className="text-2xl font-black uppercase text-yellow-500 italic">Deposit Saldo</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Jumlah Deposit (IDR)</label>
                  <input 
                    type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-yellow-500 outline-none text-xl font-bold"
                    placeholder="Contoh: 100000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowDeposit(false)} className="py-3 bg-zinc-900 rounded-xl font-bold hover:bg-zinc-800">Batal</button>
                  <button onClick={handleDeposit} className="py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400">Konfirmasi</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#151515] p-8 rounded-3xl border border-red-500/20 max-w-md w-full space-y-6">
              <h2 className="text-2xl font-black uppercase text-red-500 italic">Withdraw Saldo</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Jumlah Penarikan (IDR)</label>
                  <input 
                    type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-red-500 outline-none text-xl font-bold"
                    placeholder="Contoh: 50000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowWithdraw(false)} className="py-3 bg-zinc-900 rounded-xl font-bold hover:bg-zinc-800">Batal</button>
                  <button onClick={handleWithdraw} className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500">Konfirmasi</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-[#111] p-6 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500" />
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="space-y-0 text-center md:text-left">
              <h1 className="text-5xl font-black tracking-tighter uppercase italic flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600">
                <Coins className="text-yellow-500" size={40} /> LUXURY88
              </h1>
              <p className="text-yellow-500/50 text-[10px] font-mono tracking-[0.3em] uppercase pl-1">Situs Terpercaya Sejagad Raya</p>
            </div>
            <div className="h-10 w-px bg-zinc-800 hidden md:block" />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeposit(true)}
                className="px-6 py-2 bg-yellow-500 text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
              >
                Deposit
              </button>
              <button 
                onClick={() => setShowWithdraw(true)}
                className="px-6 py-2 bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-all border border-white/5"
              >
                Withdraw
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-8 py-3 bg-black border border-zinc-800 rounded-2xl flex flex-col items-center min-w-[200px] shadow-inner">
              <span className="text-[9px] uppercase text-zinc-500 tracking-widest font-bold mb-1">Total Balance (IDR)</span>
              <span className="text-2xl font-black text-yellow-500 tabular-nums">Rp {balance.toLocaleString('id-ID')}</span>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-3 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 hover:text-white hover:bg-red-600 transition-all"
              >
                <XCircle size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="aspect-video bg-black border-4 border-[#1a1a1a] rounded-[48px] relative overflow-hidden flex flex-col items-center justify-center space-y-8 shadow-[0_0_150px_rgba(234,179,8,0.1)]">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none" />
               
               {/* Reel Shine */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none z-10" />

               <div className="flex gap-4 md:gap-8 relative z-20">
                 {[1, 2, 3].map((i) => (
                   <motion.div 
                    key={i}
                    animate={isSpinning ? { y: [0, -2000] } : { y: 0 }}
                    transition={isSpinning ? { repeat: Infinity, duration: 0.15, ease: "linear" } : { type: "spring", stiffness: 200, damping: 20 }}
                    className="w-20 h-32 md:w-40 md:h-56 bg-[#0c0c0c] border-4 border-[#1a1a1a] rounded-3xl flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,0,0,1)]"
                   >
                     <span className={cn("text-6xl md:text-9xl filter drop-shadow-lg", isSpinning ? "opacity-30 blur-md scale-150" : "opacity-100")}>
                        {lastWin ? '💎' : '🍎'}
                     </span>
                   </motion.div>
                 ))}
               </div>

               <div className="flex flex-col items-center space-y-6 relative z-30">
                 <div className="flex bg-[#111] p-2 rounded-2xl border border-white/5 shadow-2xl">
                    {[10000, 50000, 100000, 500000].map(val => (
                      <button 
                        key={val}
                        onClick={() => setBet(val)}
                        className={cn(
                          "px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-tighter",
                          bet === val ? "bg-gradient-to-b from-yellow-400 to-yellow-600 text-black translate-y-[-2px] shadow-lg shadow-yellow-500/20" : "text-zinc-500 hover:text-white"
                        )}
                      >
                        Rp {val.toLocaleString()}
                      </button>
                    ))}
                 </div>
                 <button 
                  disabled={isSpinning || balance < bet}
                  onClick={handleSpin}
                  className={cn(
                    "px-16 py-6 rounded-3xl font-black text-2xl uppercase tracking-widest transition-all",
                    isSpinning || balance < bet 
                    ? "bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed" 
                    : "bg-gradient-to-b from-red-500 to-red-700 text-white hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.3)] border-t-2 border-white/30"
                  )}
                 >
                   {isSpinning ? 'Sedang Memutar...' : 'SPIN SEKARANG!'}
                 </button>
               </div>

               {lastWin && (
                 <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute bottom-12 z-50 py-4 px-10 rounded-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black font-black text-3xl shadow-[0_0_100px_rgba(234,179,8,0.6)] border-4 border-white"
                 >
                   TOTAL WIN: Rp {lastWin.toLocaleString()}
                 </motion.div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-8 bg-[#111] border border-white/5 rounded-[32px] space-y-4 shadow-xl">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500"><Trophy /></div>
                  <div>
                    <h3 className="font-black uppercase text-[10px] tracking-widest text-zinc-500 mb-1">Global Jackpot</h3>
                    <p className="text-3xl font-black text-white tabular-nums">Rp 12.450.000.432</p>
                  </div>
               </div>
               <div className="p-8 bg-[#111] border border-white/5 rounded-[32px] space-y-4 shadow-xl">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500"><TrendingUp /></div>
                  <div>
                    <h3 className="font-black uppercase text-[10px] tracking-widest text-zinc-500 mb-1">Server Win Rate</h3>
                    <p className="text-3xl font-black text-green-400">97.8% GACOR</p>
                  </div>
               </div>
               <div className="p-8 bg-[#111] border border-white/5 rounded-[32px] space-y-4 shadow-xl">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500"><HelpCircle /></div>
                  <div>
                    <h3 className="font-black uppercase text-[10px] tracking-widest text-zinc-500 mb-1">Status Lisensi</h3>
                    <p className="text-3xl font-black text-white italic">REMI-X CERTIFIED</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar / Winner List */}
          <div className="space-y-6">
            <div className="p-8 bg-[#111] border border-white/5 rounded-[32px] shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <Dices className="text-yellow-500" size={18} /> LIVE WINNERS
                </h3>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase text-green-500">Live</span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-hidden relative">
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111] to-transparent z-10" />
                <AnimatePresence>
                  {notifications.map((n) => (
                    <motion.div 
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex justify-between items-center bg-black/60 p-4 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-zinc-100 group-hover:text-yellow-500 transition-colors uppercase italic">{n.user}</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">Mega Jackpot Win!</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-yellow-500">+{n.amount}</span>
                        <span className="text-[8px] text-zinc-700 italic">2s ago</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-[#1a1300] to-black border border-yellow-500/10 rounded-[32px] space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 transform rotate-12 scale-150 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-[2] transition-transform duration-700" />
               <h4 className="font-black uppercase text-lg italic text-yellow-100 tracking-tighter leading-tight relative z-10">VIP EXCLUSIVE PROMO</h4>
               <p className="text-xs text-yellow-100/50 leading-relaxed relative z-10">Double saldo untuk deposit pertama kamu hari ini! Hubungi admin melalui WhatsApp untuk klaim bonus up to 200%.</p>
               <button className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-[1.02] transition-all relative z-10">Klaim Bonus Sekarang</button>
            </div>

            <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[32px] space-y-4">
              <h3 className="font-black uppercase text-[10px] tracking-widest text-zinc-500">Metode Pembayaran</h3>
              <div className="grid grid-cols-4 gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
                <div className="h-4 bg-white/20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
