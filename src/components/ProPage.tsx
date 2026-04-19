import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sparkles, 
  Brain, 
  Target, 
  ShieldCheck, 
  Trophy, 
  CheckCircle2, 
  Smartphone,
  CreditCard,
  QrCode,
  ArrowRight,
  ChevronRight,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ProPageProps {
  user: any;
  isPro: boolean;
  onUpgrade: () => Promise<void>;
}

declare global {
  interface Window {
    snap: any;
  }
}

export const ProPage = ({ user, userData, isPro, onUpgrade, onCancelSubscription }: { 
  user: any; 
  userData: any;
  isPro: boolean; 
  onUpgrade: () => Promise<void>; 
  onCancelSubscription: () => Promise<void>;
}) => {
  const [step, setStep] = useState<'benefits' | 'payment-method' | 'processing' | 'success'>('benefits');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2>(0); // 0: none, 1: first check, 2: final check

  const benefits = [
    {
      icon: <Sparkles className="text-amber-500" />,
      title: "Dyfa AI Pro",
      desc: "Akses ke model AI yang lebih pintar, mampu menganalisis soal gambar dan memberikan penjelasan lebih mendalam semudah ngobrol di WA."
    },
    {
      icon: <Target className="text-emerald-500" />,
      title: "Simulasi OSN Realistis",
      desc: "Latihan soal yang dirancang mirip banget sama tingkat kesulitan OSP & OSN Nasional. Update berkala setiap minggu."
    },
    {
      icon: <Zap className="text-blue-500" />,
      title: "Peta Belajar Kompleks",
      desc: "Visualisasi kurikulum olimpiade yang lebih detail. Lihat jalur tercepat untuk menguasai materi Genetika atau Ekologi."
    },
    {
      icon: <ShieldCheck className="text-indigo-500" />,
      title: "Analisis Kelemahan",
      desc: "AI akan membedah statistikmu dan memberitahu topik mana yang paling kritis untuk segera kamu perbaiki."
    }
  ];

  const handlePayment = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu ya!");
      return;
    }

    setStep('processing');
    
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName
        })
      });

      if (!response.ok) throw new Error("Gagal membuat transaksi");
      
      const { token, orderId: newOrderId } = await response.json();
      setOrderId(newOrderId);

      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: async (result: any) => {
            console.log("Payment Success:", result);
            await onUpgrade();
            setStep('success');
          },
          onPending: (result: any) => {
            console.log("Payment Pending:", result);
            alert("Pembayaran kamu dalam proses. Selesaikan pembayaran ya!");
            setStep('benefits');
          },
          onError: (result: any) => {
            console.error("Payment Error:", result);
            alert("Waduh, pembayaran gagal. Coba lagi nanti ya!");
            setStep('benefits');
          },
          onClose: () => {
            setStep('benefits');
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert("Ada kendala teknis. Pastikan server aktif.");
      setStep('benefits');
    }
  };

  const handleCancelClick = () => setCancelStep(1);

  const confirmCancel = async () => {
    setIsCancelling(true);
    await onCancelSubscription();
    setIsCancelling(false);
    setCancelStep(0);
  };

  if (isPro) {
    const expiredDate = userData?.proUntil?.toDate?.() || (userData?.proUntil ? new Date(userData.proUntil) : null);

    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="glass-card rounded-[40px] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
            <Trophy size={200} />
          </div>
          <div className="w-20 h-20 bg-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl badge-glow">
            <Trophy className="text-gold" size={40} />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">Status: Pro Member</h1>
          <p className="text-lg text-text-muted mb-6 max-w-lg mx-auto leading-relaxed">
            Langganan aktif sampai: <span className="text-accent font-black">{expiredDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) || 'Selamanya'}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-12">
            {[
               { icon: <CheckCircle2 className="text-emerald-500" size={18} />, label: "Fitur AI Terbuka" },
               { icon: <CheckCircle2 className="text-emerald-500" size={18} />, label: "Materi OSN 2026" },
               { icon: <CheckCircle2 className="text-emerald-500" size={18} />, label: "Support Prioritas" }
            ].map((item, i) => (
              <div key={i} className="bg-white/40 p-4 rounded-2xl flex items-center gap-3 border border-white/50">
                {item.icon}
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={handleCancelClick}
            className="text-xs font-bold text-red-500/60 hover:text-red-500 hover:underline transition-all"
          >
            Batalkan Berlangganan
          </button>
        </div>

        {/* Double Cancellation Confirmation */}
        <AnimatePresence>
          {cancelStep > 0 && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCancelStep(0)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm glass-card rounded-3xl p-8 border border-white/50 shadow-2xl overflow-hidden text-center"
              >
                 {cancelStep === 1 ? (
                   <div className="space-y-6">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck size={32} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black">Yakin mau membatalkan?</h3>
                        <p className="text-sm text-text-muted">Kamu akan kehilangan akses ke model AI Pro dan materi simulasi OSN eksklusif.</p>
                      </div>
                      <div className="flex gap-3">
                         <button onClick={() => setCancelStep(0)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-sm">Tetap Pro</button>
                         <button onClick={() => setCancelStep(2)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm">Lanjut Batal</button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border-4 border-red-600/20 animate-pulse">
                        <Trophy size={32} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-red-600">VERIFIKASI TERAKHIR</h3>
                        <p className="text-sm text-text-muted">BENERAN MAU DICABUT STATUS PRO-NYA? Kamu harus beli lagi nanti untuk bisa akses fitur ini.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <button 
                           disabled={isCancelling}
                           onClick={confirmCancel} 
                           className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
                         >
                           {isCancelling ? "MEMPROSES..." : "YA, CABUT STATUS PRO SAYA"}
                         </button>
                         <button onClick={() => setCancelStep(0)} className="w-full py-3 text-xs font-bold text-text-muted hover:text-text-main">Jangan, Kembali Saja</button>
                      </div>
                   </div>
                 )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-6">
      <AnimatePresence mode="wait">
        {step === 'benefits' && (
          <motion.div 
            key="benefits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            {/* Header section */}
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200"
              >
                <Sparkles size={12} /> Menuju OSN 2026
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.9]">
                Berlangganan <span className="text-accent underline decoration-gold/50 decoration-4 underline-offset-8">Dyfalogy Pro</span>
              </h1>
              <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed">
                Dapatkan akses ke instrumen belajar tercanggih untuk persiapan OSN Biologi. Tingkatkan peluang medalimu hari ini.
              </p>
            </div>

            {/* Price Card */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((b, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 rounded-3xl border border-white/50 hover:border-accent/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-all">
                      {b.icon}
                    </div>
                    <h3 className="text-lg font-black mb-2">{b.title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{b.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-2">
                <div className="glass-card rounded-[40px] p-8 bg-sidebar text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={100} />
                  </div>
                  <div className="relative z-10 text-center space-y-6">
                    <div>
                      <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">LANGGANAN BULANAN</div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-5xl font-black flex items-start gap-1">
                          <span className="text-sm mt-2">Rp</span> 5.000 <span className="text-xs text-white/50 self-end mb-2 ml-1">/ Bln</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-white/50 mt-2 font-bold italic">*Bebas batal kapanpun</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <CheckCircle2 size={14} className="text-accent" />
                        AI Khusus Persiapan OSP
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <CheckCircle2 size={14} className="text-accent" />
                        Akses Full Forum Diskusi
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <CheckCircle2 size={14} className="text-accent" />
                        Statistik Grafik Performa
                      </div>
                    </div>

                    <button 
                      onClick={() => setStep('payment-method')}
                      className="w-full py-4 bg-accent text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      Beli Sekarang <ArrowRight size={18} />
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10 opacity-60">
                       <CreditCard size={20} />
                       <Smartphone size={20} />
                       <QrCode size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'payment-method' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto space-y-8"
          >
            <button 
              onClick={() => setStep('benefits')}
              className="text-accent text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              ← Kembali ke Detail
            </button>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-black">Pilih Pembayaran</h2>
              <p className="text-sm text-text-muted">Pilih metode yang paling nyaman untukmu.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'dana', name: 'DANA', color: 'bg-[#008FE3]', icon: 'https://seeklogo.com/images/D/dana-logo-F5979F93F9-seeklogo.com.png' },
                { id: 'gopay', name: 'GoPay', color: 'bg-[#00AED6]', icon: 'https://seeklogo.com/images/G/gopay-logo-D09DABB9A4-seeklogo.com.png' },
                { id: 'qris', name: 'QRIS (Semua Bank)', color: 'bg-[#EE2E24]', icon: 'https://seeklogo.com/images/Q/qris-logo-66BC8682F0-seeklogo.com.png' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={cn(
                    "p-5 rounded-2xl flex items-center justify-between border-2 transition-all",
                    selectedMethod === m.id ? "bg-white border-accent shadow-lg shadow-accent/5 ring-4 ring-accent/10" : "bg-white/40 border-transparent hover:border-white/80"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center p-2", m.color)}>
                      <img src={m.icon} alt={m.name} className="w-full h-full object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                    </div>
                    <span className="font-black text-sm">{m.name}</span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedMethod === m.id ? "border-accent bg-accent text-white" : "border-gray-200"
                  )}>
                    {selectedMethod === m.id && <CheckCircle2 size={12} />}
                  </div>
                </button>
              ))}
            </div>

            <button 
              disabled={!selectedMethod}
              onClick={handlePayment}
              className="w-full py-4 bg-accent disabled:opacity-50 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
            >
              Bayar Sekarang Rp 5.000
            </button>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone className="text-accent animate-pulse" size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Memproses Pembayaran...</h2>
              <p className="text-text-muted text-sm">Jangan tinggalkan halaman ini sampai transaksi selesai.</p>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl badge-glow">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-emerald-600">Terima Kasih!</h2>
              <p className="text-text-muted max-w-sm mx-auto">Pembayaran IDR 5.000 berhasil diverifikasi. Status Pro kamu telah aktif!</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-accent text-white rounded-full font-bold text-sm"
            >
              Masuk ke Dashboard Pro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
