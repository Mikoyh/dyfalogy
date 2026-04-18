export interface Topic {
  id: string;
  title: string;
  description: string;
  level: 1 | 2 | 3 | 4; // Foundation, Analysis, Olympic Grade, Elite
  prerequisites: string[];
  minMasteryToUnlockNext: number; // e.g., 80
  xpReward: number;
  isProOnly?: boolean;
}

export const BIOLOGY_CURRICULUM: Topic[] = [
  // ... basic nodes ...
  {
    id: 'cell-structure',
    title: 'Struktur & Organel Sel',
    description: 'Dasar kehidupan: Membran sel, Nukleus, dan Organel.',
    level: 1,
    prerequisites: [],
    minMasteryToUnlockNext: 80,
    xpReward: 500
  },
  {
    id: 'macromolecules',
    title: 'Makromolekul & Air',
    description: 'Protein, Lipid, Karbohidrat, dan Asam Nukleat.',
    level: 1,
    prerequisites: [],
    minMasteryToUnlockNext: 80,
    xpReward: 500
  },
  {
    id: 'metabolism',
    title: 'Metabolisme Dasar',
    description: 'Enzim, ATP, dan jalur glikolisis.',
    level: 2,
    prerequisites: ['cell-structure', 'macromolecules'],
    minMasteryToUnlockNext: 85,
    xpReward: 1000
  },
  {
    id: 'molecular-genetics',
    title: 'Genetika Molekuler',
    description: 'Replikasi DNA, Transkripsi, dan Translasi.',
    level: 2,
    prerequisites: ['metabolism', 'macromolecules'],
    minMasteryToUnlockNext: 85,
    xpReward: 1200
  },
  {
    id: 'population-genetics',
    title: 'Genetika Populasi',
    description: 'Hukum Hardy-Weinberg dan Evolusi Mikro.',
    level: 3,
    prerequisites: ['molecular-genetics'],
    minMasteryToUnlockNext: 90,
    xpReward: 2000
  },
  {
    id: 'biosystematics',
    title: 'Biosistematika',
    description: 'Kladistika, Filogeni, dan Klasifikasi Makhluk Hidup.',
    level: 3,
    prerequisites: ['population-genetics'],
    minMasteryToUnlockNext: 90,
    xpReward: 2000
  },
  // --- PRO ONLY NODES ---
  {
    id: 'advanced-photosynthesis',
    title: 'Photosynthesis Deep Dive (Pro)',
    description: 'Analisis C3, C4, CAM, dan efisiensi kuantum fotofosforilasi.',
    level: 4,
    prerequisites: ['metabolism'],
    minMasteryToUnlockNext: 90,
    xpReward: 3000,
    isProOnly: true
  },
  {
    id: 'quantitative-genetics',
    title: 'Quantitative Genetics (Pro)',
    description: 'Heritabilitas, ANOVA dalam genetika, dan pemetaan QTL.',
    level: 4,
    prerequisites: ['population-genetics'],
    minMasteryToUnlockNext: 90,
    xpReward: 3500,
    isProOnly: true
  },
  {
    id: 'neurobiology',
    title: 'Neurobiology & Signaling (Pro)',
    description: 'Potensial aksi, transmisi sinaptik, dan sistem sensorik kompleks.',
    level: 4,
    prerequisites: ['molecular-genetics'],
    minMasteryToUnlockNext: 90,
    xpReward: 4000,
    isProOnly: true
  }
];

export const calculateLevel = (xp: number): number => {
  // Simple quadratic level scaling
  // Level 1 = 0 XP
  // Level 2 = 1000 XP
  // Level 3 = 2500 XP...
  return Math.floor(Math.sqrt(xp / 250)) + 1;
};

export const getXpForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 250;
};
