import React, { useState, memo } from 'react';
import { Archive, FileText } from 'lucide-react';

export const OsnArchive = memo(() => {
  const [selectedYear, setSelectedYear] = useState('2025');

  const papers = [
    { year: '2025', title: 'OSN-K Biologi 2025', difficulty: 'Easy', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2025', title: 'OSN-P Biologi 2025', difficulty: 'Medium', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2024', title: 'OSN-K Biologi 2024', difficulty: 'Easy', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2024', title: 'OSN-P Biologi 2024', difficulty: 'Medium', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2024', title: 'OSN Nasional Biologi 2024', difficulty: 'Hard', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
    { year: '2023', title: 'Olimpiade Biologi 2023 Full Pack', difficulty: 'Varies', link: 'https://drive.google.com/drive/folders/1fwxIyR-yEt3k7Iv7b2OV2fFgxIasxKfx' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Arsip Soal OSN Biology</h2>
          <p className="text-text-muted text-sm italic">Kumpulan soal-soal kompetisi sains nasional dari tahun ke tahun.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white/40 border border-white/50 rounded-xl px-4 py-2 text-sm focus:outline-none"
          >
            {['2025', '2024', '2023', '2022', '2021', '2020'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.filter(p => p.year === selectedYear).map((paper, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col justify-between group hover:border-accent transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded tracking-widest">{paper.year}</span>
                <span className="text-[10px] font-bold text-text-muted italic">{paper.difficulty}</span>
              </div>
              <h3 className="text-base font-bold text-text-main group-hover:text-accent transition-colors">{paper.title}</h3>
            </div>
            <a 
              href={paper.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 hover:bg-white/40 border border-white/50 rounded-xl text-xs font-bold transition-all"
            >
              <FileText size={14} /> LIHAT DRIVE
            </a>
          </div>
        ))}
      </div>

      <div className="p-8 bg-blue-500/10 rounded-[32px] border border-blue-500/20 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
          <Archive size={40} />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-bold">Punya Soal Lainnya?</h4>
          <p className="text-sm text-text-muted">Gua tau lu punya koleksi soal maut pendahulu lu, kirim sini biar bermanfaat buat anak biologi lainnya se-Indonesia!</p>
        </div>
      </div>
    </div>
  );
});
