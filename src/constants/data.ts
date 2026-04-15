export interface Lesson {
  id: string;
  title: string;
  category: string;
  level: number;
  content: string;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const LESSONS: Lesson[] = [
  {
    id: 'mol-bio-1',
    title: 'Elektroforesis DNA & SDS-PAGE',
    category: 'Biologi Molekuler',
    level: 3,
    content: `
### Elektroforesis DNA
Teknik untuk memisahkan fragmen DNA berdasarkan ukurannya menggunakan medan listrik. DNA bermuatan negatif akan bergerak menuju kutub positif (anode). Fragmen yang lebih kecil bergerak lebih cepat melalui pori-pori gel agarosa.

### SDS-PAGE (Sodium Dodecyl Sulfate Polyacrylamide Gel Electrophoresis)
Teknik untuk memisahkan protein berdasarkan berat molekulnya. SDS memberikan muatan negatif yang seragam pada protein, sehingga pemisahan murni berdasarkan ukuran saat melewati gel poliakrilamida.
    `,
    xpReward: 200
  },
  {
    id: 'mol-bio-2',
    title: 'Blotting Techniques (Southern, Northern, Western)',
    category: 'Biologi Molekuler',
    level: 4,
    content: `
### Southern Blotting
Digunakan untuk mendeteksi urutan DNA spesifik dalam sampel DNA. Melibatkan transfer fragmen DNA dari gel ke membran, diikuti dengan hibridisasi probe.

### Northern Blotting
Mirip dengan Southern, tetapi digunakan untuk mendeteksi RNA. Berguna untuk mempelajari ekspresi gen.

### Western Blotting
Digunakan untuk mendeteksi protein spesifik menggunakan antibodi. Sangat penting dalam diagnostik dan riset biokimia.
    `,
    xpReward: 250
  },
  {
    id: 'mol-bio-3',
    title: 'PCR & RFLP',
    category: 'Biologi Molekuler',
    level: 4,
    content: `
### PCR (Polymerase Chain Reaction)
Teknik amplifikasi DNA secara in vitro. Melibatkan siklus denaturasi, annealing primer, dan ekstensi oleh DNA polimerase termostabil (seperti Taq polymerase).

### RFLP (Restriction Fragment Length Polymorphism)
Analisis variasi urutan DNA dengan memotong DNA menggunakan enzim restriksi. Perbedaan panjang fragmen menunjukkan polimorfisme genetik.
    `,
    xpReward: 300
  },
  {
    id: 'mol-bio-4',
    title: 'Kromatografi & DNA Fingerprinting',
    category: 'Biologi Molekuler',
    level: 5,
    content: `
### Kromatografi Ion Exchange & Afinitas
- **Ion Exchange**: Memisahkan molekul berdasarkan muatan listriknya.
- **Affinity**: Memisahkan molekul berdasarkan interaksi spesifik (misal: antigen-antibodi atau enzim-substrat).

### DNA Fingerprinting
Teknik identifikasi individu berdasarkan profil DNA unik mereka, seringkali menggunakan VNTR (Variable Number Tandem Repeats) atau STR (Short Tandem Repeats).
    `,
    xpReward: 350
  },
  {
    id: 'cell-bio-1',
    title: 'Struktur dan Fungsi Sel',
    category: 'Biologi Sel',
    level: 1,
    content: 'Sel adalah unit fungsional terkecil dari kehidupan. Memahami perbedaan antara sel prokariotik dan eukariotik adalah langkah pertama...',
    xpReward: 100
  },
  {
    id: 'genetics-1',
    title: 'Hukum Mendel',
    category: 'Genetika',
    level: 2,
    content: 'Genetika Mendel berfokus pada bagaimana sifat diwariskan melalui alel dominan dan resesif...',
    xpReward: 150
  }
];

export const BADGES: Badge[] = [
  { id: 'first-lesson', name: 'Langkah Awal', description: 'Menyelesaikan materi pertama', icon: '🌱' },
  { id: 'mol-master', name: 'Ahli Molekuler', description: 'Menyelesaikan semua materi Biologi Molekuler', icon: '🧬' },
  { id: 'level-5', name: 'Elite OSP', description: 'Mencapai Level 5', icon: '🏆' },
  { id: 'forum-active', name: 'Komunikator', description: 'Membuat 5 postingan di forum', icon: '💬' }
];

export const STUDY_STRATEGIES = [
  {
    title: 'Active Recall',
    description: 'Alih-alih hanya membaca ulang, cobalah untuk memanggil kembali informasi dari ingatan tanpa melihat buku.'
  },
  {
    title: 'Spaced Repetition',
    description: 'Ulangi materi dalam interval waktu yang semakin lama untuk memperkuat ingatan jangka panjang.'
  },
  {
    title: 'Feynman Technique',
    description: 'Jelaskan konsep yang sulit seolah-olah Anda sedang mengajar anak kecil.'
  }
];
