import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock, CheckCircle2, Star, Zap, Trophy, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { BIOLOGY_CURRICULUM, Topic } from '../constants/learning';
import { ConceptMap } from './ConceptMap';

interface LearningPathProps {
  userLevel: number;
  xp: number;
  unlockedTopics: string[];
  topicStats: Record<string, number>;
  onSelectTopic: (topicId: string) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

const TopicNode = memo(({ 
  topic, 
  isUnlocked, 
  isCompleted, 
  mastery,
  index,
  isProUser,
  onClick 
}: { 
  topic: Topic; 
  isUnlocked: boolean; 
  isCompleted: boolean; 
  mastery: number;
  index: number;
  isProUser: boolean;
  onClick: () => void;
}) => {
  const levelColors = {
    1: "from-blue-500 to-indigo-600",
    2: "from-purple-500 to-pink-600",
    3: "from-orange-500 to-red-600",
    4: "from-amber-500 to-yellow-600"
  };

  const isLockedByPro = topic.isProOnly && !isProUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className={cn(
        "relative p-6 rounded-3xl border-2 transition-all duration-300",
        isUnlocked && !isLockedByPro
          ? "bg-white border-border shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer" 
          : "bg-gray-100 border-dashed border-gray-300 opacity-60 grayscale cursor-not-allowed"
      )}
      onClick={(isUnlocked && !isLockedByPro) ? onClick : undefined}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg relative",
            isUnlocked && !isLockedByPro ? `bg-gradient-to-br ${levelColors[topic.level as 1|2|3|4]}` : "bg-gray-400"
          )}>
            {isLockedByPro ? <Trophy size={24} className="text-white/40" /> : (isCompleted ? <CheckCircle2 size={24} /> : (isUnlocked ? <Unlock size={24} /> : <Lock size={24} />))}
            {topic.isProOnly && (
              <div className="absolute -top-2 -right-2 bg-gold text-white p-1 rounded-full shadow-lg">
                <Sparkles size={10} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1",
              topic.level === 1 ? "bg-blue-100 text-blue-600" : 
              topic.level === 2 ? "bg-purple-100 text-purple-600" : 
              topic.level === 3 ? "bg-orange-100 text-orange-600" : "bg-amber-100 text-amber-600"
            )}>
              LEVEL {topic.level}
            </span>
            {isUnlocked && !isLockedByPro && (
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold">{mastery}%</span>
              </div>
            )}
            {isLockedByPro && (
              <span className="text-[9px] font-black text-gold uppercase animate-pulse">PRO ONLY</span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-black text-text-main mb-2 leading-tight">{topic.title}</h3>
        <p className="text-xs text-text-muted line-clamp-2">{topic.description}</p>

        {isUnlocked && !isLockedByPro && (
          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${mastery}%` }}
              className={cn("h-full", mastery >= 80 ? "bg-emerald-500" : "bg-accent")}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

export const LearningPath: React.FC<LearningPathProps> = memo(({
  userLevel,
  xp,
  unlockedTopics,
  topicStats,
  onSelectTopic,
  isPro,
  onUpgradeClick
}) => {
  const levels = [
    { id: 1, name: "FOUNDATION", label: "Fundamental Concepts", icon: <Brain size={20} />, color: "text-blue-600" },
    { id: 2, name: "ANALYSIS", label: "Mechanisms & Logic", icon: <Zap size={20} />, color: "text-purple-600" },
    { id: 3, name: "OLYMPIC GRADE", label: "Advanced Mastery", icon: <Trophy size={20} />, color: "text-orange-600" },
    { id: 4, name: "ELITE TRAINING", label: "National & International Prep", icon: <Sparkles size={20} />, color: "text-amber-600" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8">
      <header className="mb-12 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-2xl text-accent font-black text-xs uppercase tracking-widest mb-4">
            <Star size={16} className="fill-accent" />
            DYFA LEARNING PATH
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-text-main tracking-tight mb-4">
            Journey to Gold Medal 🧬
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Selesaikan materi dasar untuk membuka tantangan tingkat lanjut. Gunakan pendekatan Bloom's Taxonomy untuk penguasaan materi yang sempurna.
          </p>
        </div>
        
        {!isPro && (
          <button 
            onClick={onUpgradeClick}
            className="shrink-0 bg-sidebar text-white px-6 py-4 rounded-3xl flex items-center gap-3 shadow-xl hover:scale-105 transition-all group"
          >
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-accent">Upgrade Member</div>
              <div className="text-sm font-black">Buka Level Elite</div>
            </div>
            <ArrowRight size={20} className="ml-2 text-white/40" />
          </button>
        )}
      </header>

      <div className="space-y-16 pb-20">
        {levels.map((lvl) => (
          <section key={lvl.id} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className={cn("p-3 rounded-2xl bg-white shadow-lg border border-border", lvl.color)}>
                {lvl.icon}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  {lvl.name}
                  <span className="text-xs font-bold text-text-muted bg-gray-100 px-2 py-0.5 rounded-lg uppercase">Lvl {lvl.id}</span>
                </h2>
                <div className="flex items-center gap-2">
                   <span className="hidden sm:inline text-gray-300">|</span>
                   <p className="text-sm text-text-muted font-medium">{lvl.label}</p>
                   {lvl.id === 4 && <span className="bg-gold/10 text-gold text-[9px] font-black px-2 py-0.5 rounded border border-gold/20">PRO</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {BIOLOGY_CURRICULUM.filter(t => t.level === lvl.id).map((topic, i) => {
                const isUnlocked = unlockedTopics.includes(topic.id) || topic.prerequisites.length === 0;
                const mastery = topicStats[topic.id] || 0;
                const isCompleted = mastery >= 85;

                return (
                  <TopicNode
                    key={topic.id}
                    topic={topic}
                    index={i}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                    mastery={mastery}
                    isProUser={isPro}
                    onClick={() => onSelectTopic(topic.id)}
                  />
                );
              })}
            </div>

            {/* Path connector line (decorative) */}
            <div className="absolute top-12 left-[26px] bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent -z-0 opacity-50 hidden lg:block" />
          </section>
        ))}
      </div>

      <div className="mt-20">
        <ConceptMap />
      </div>
    </div>
  );
});

LearningPath.displayName = 'LearningPath';
