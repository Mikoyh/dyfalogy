export interface Topic {
  id: string;
  title: string;
  description: string;
  level: 1 | 2 | 3; // Foundation, Analysis, Olympic Grade
  prerequisites: string[];
  minMasteryToUnlockNext: number; // e.g., 80
  xpReward: number;
}

export const BIOLOGY_CURRICULUM: Topic[] = [
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
