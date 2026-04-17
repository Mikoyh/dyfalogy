import React, { memo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Target, Brain, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { BIOLOGY_CURRICULUM } from '../constants/learning';

interface AnalyticsProps {
  topicStats: Record<string, number>;
}

export const Analytics: React.FC<AnalyticsProps> = memo(({ topicStats }) => {
  const stats = useMemo(() => {
    const entries = Object.entries(topicStats);
    if (entries.length === 0) return null;

    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const strengths = sorted.slice(0, 2);
    const weaknesses = sorted.slice(-2).filter(s => s[1] < 70);

    return { strengths, weaknesses };
  }, [topicStats]);

  if (!stats) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-border">
        <Brain className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-text-muted font-medium">Lengkapi kuis untuk melihat analisis kekuatan dan kelemahanmu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-card p-6 rounded-3xl border-emerald-100 bg-emerald-50/50">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <TrendingUp size={20} />
            <h3 className="font-black uppercase tracking-widest text-xs">Puncak Kekuatan</h3>
          </div>
          <div className="space-y-4">
            {stats.strengths.map(([id, score]) => {
              const topic = BIOLOGY_CURRICULUM.find(t => t.id === id);
              return (
                <div key={id} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                  <span className="text-sm font-bold text-text-main">{topic?.title}</span>
                  <span className="text-sm font-black text-emerald-600">{score}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-6 rounded-3xl border-red-100 bg-red-50/50">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <TrendingDown size={20} />
            <h3 className="font-black uppercase tracking-widest text-xs">Butuh Perhatian Elit</h3>
          </div>
          <div className="space-y-4">
            {stats.weaknesses.length > 0 ? stats.weaknesses.map(([id, score]) => {
              const topic = BIOLOGY_CURRICULUM.find(t => t.id === id);
              return (
                <div key={id} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                  <span className="text-sm font-bold text-text-main">{topic?.title}</span>
                  <span className="text-sm font-black text-red-600">{score}%</span>
                </div>
              );
            }) : (
              <div className="text-xs text-text-muted font-medium py-3 italic">Belum ada titik lemah yang terdeteksi. Keren!</div>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="glass-card p-8 rounded-[32px] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Target size={120} />
        </div>
        <h3 className="text-xl font-black text-text-main mb-6">Radar Penguasaan Materi 🧬</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {BIOLOGY_CURRICULUM.map(topic => {
            const score = topicStats[topic.id] || 0;
            return (
              <div 
                key={topic.id}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all border-2",
                  score === 0 ? "bg-gray-50 border-gray-100" :
                  score < 50 ? "bg-red-50 border-red-100" :
                  score < 80 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                )}
              >
                <div className="text-[8px] font-black uppercase tracking-tighter line-clamp-2 mb-1 opacity-60">
                  {topic.title}
                </div>
                <div className={cn(
                  "text-lg font-black",
                  score === 0 ? "text-gray-300" :
                  score < 50 ? "text-red-500" :
                  score < 80 ? "text-amber-500" : "text-emerald-500"
                )}>
                  {score > 0 ? `${score}%` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

import { useMemo } from 'react';
Analytics.displayName = 'Analytics';
