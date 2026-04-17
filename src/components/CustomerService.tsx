import React, { useState, memo } from 'react';
import { motion } from 'motion/react';
import { Info, FileText, ShieldCheck, LifeBuoy, Zap, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

export const CustomerService = memo(({ user }: { user: any }) => {
  const [activeSubTab, setActiveSubTab] = useState('help');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userName: user.displayName,
        content: feedback,
        createdAt: serverTimestamp()
      });
      setFeedback('');
      alert('Terima kasih! Masukan/Laporan kamu sangat berharga bagi kami.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tight">Pusat Bantuan & Layanan</h2>
        <p className="text-text-muted italic leading-relaxed">Kami di sini untuk mendengar sobat pejuang olimpiade biologi.</p>
      </div>

      <div className="flex justify-center flex-wrap gap-2">
        {['help', 'terms', 'privacy', 'feedback'].map(t => (
          <button 
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeSubTab === t ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-white/40 text-text-muted hover:bg-white/60"
            )}
          >
            {t === 'help' ? 'Info Web' : t === 'terms' ? 'Ketentuan' : t === 'privacy' ? 'Keamanan' : 'Request & Bug'}
          </button>
        ))}
      </div>

      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[32px] p-8 md:p-12 space-y-8"
      >
        {activeSubTab === 'help' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Info className="text-accent" /> Tentang dyfalogy
            </h3>
            <div className="prose prose-sm prose-emerald text-text-muted leading-[1.8]">
              <p>dyfalogy adalah platform pembelajaran inovatif yang dirancang khusus untuk membantu para siswa di Indonesia dalam menghadapi Olimpiade Sains Nasional (OSN) di bidang Biologi.</p>
              <p>Misi utama kami adalah demokratisasi akses materi pendidikan olimpiade yang berkualitas, dengan memanfaatkan teknologi AI terkini untuk personalisasi pembelajaran.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 text-left">
                  <h4 className="font-bold text-accent mb-2">Kurikulum Terupdate</h4>
                  <p className="text-[11px]">Selalu menyesuaikan dengan silabus terakhir dari Pusprenas dan standar International Biology Olympiad (IBO).</p>
                </div>
                 <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 text-left">
                  <h4 className="font-bold text-accent mb-2">AI-Powered Learning</h4>
                  <p className="text-[11px]">Dukungan asisten AI 24/7 yang mampu menjawab pertanyaan teknis hingga simulasi quiz adaptif.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'terms' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3 text-left">
              <FileText className="text-accent" /> Ketentuan Penggunaan
            </h3>
            <div className="space-y-4 text-sm text-text-muted leading-relaxed text-left">
              <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl">
                 <p className="font-bold mb-1">1. Penggunaan Akun</p>
                 <p>Satu akun dyfalogy hanya boleh digunakan oleh satu individu. Berbagi akun dapat menyebabkan penangguhan akses otomatis oleh sistem keamanan kami.</p>
              </div>
              <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl">
                 <p className="font-bold mb-1">2. Konten & Hak Cipta</p>
                 <p>Seluruh materi pembelajaran, teks, dan struktur quiz adalah hak kekayaan intelektual dyfalogy atau mitra penyedia konten kami.</p>
              </div>
              <div className="p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl">
                 <p className="font-bold mb-1">3. Kebijakan Komunitas</p>
                 <p>Interaksi di forum harus mengedepankan etika, kesopanan, dan sportivitas tinggi khas pejuang olimpiade.</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'privacy' && (
          <div className="space-y-6 text-left">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-accent" /> Jaminan Keamanan Data
            </h3>
            <div className="prose prose-sm text-text-muted">
              <p>Kami sangat serius dalam menjaga keamanan data sobat. Berikut adalah langkah-langkah yang kami terapkan:</p>
              <ul>
                <li><strong>Enkripsi End-to-End:</strong> Seluruh komunikasi menggunakan protokol HTTPS dengan enkripsi tinggi.</li>
                <li><strong>Firebase Infrastructure:</strong> Kami menggunakan infrastruktur Google Cloud & Firebase standar enterprise.</li>
                <li><strong>No Party Access:</strong> Data personal tidak akan pernah dibagikan ke pihak ketiga mana pun tanpa seizin eksplisit.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSubTab === 'feedback' && (
          <div className="space-y-8 text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Punya Ide atau Menemukan Bug?</h3>
              <p className="text-sm text-text-muted">Laporan dari lu bakal ngebantu banget perkembangan platform ini kedepannya!</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tuliskan saran, bug, atau request fitur di sini..."
                className="w-full bg-white/50 border border-border rounded-2xl p-6 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent min-h-[150px]"
              />
              <button 
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="bg-accent text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-accent/20 liquid-button disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
});
