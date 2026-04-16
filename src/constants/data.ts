export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: number;
  description: string;
  content: string;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const CATEGORIES = [
  'Biologi Sel & Molekuler',
  'Anatomi & Fisiologi Tumbuhan',
  'Anatomi & Fisiologi Hewan',
  'Biogenetika & Evolusi',
  'Ekologi',
  'Etologi',
  'Biosistematika'
];

export const LESSONS: Lesson[] = [
  {
    id: 'mol-bio-1',
    title: 'Elektroforesis DNA & SDS-PAGE',
    category: 'Biologi Sel & Molekuler',
    difficulty: 'medium',
    level: 3,
    description: 'Teknik pemisahan molekul berbasis ukuran dan muatan.',
    content: `
### Elektroforesis DNA
Teknik untuk memisahkan fragmen DNA berdasarkan ukurannya menggunakan medan listrik. DNA bermuatan negatif akan bergerak menuju kutub positif (anode). Fragmen yang lebih kecil bergerak lebih cepat melalui pori-pori gel agarosa.

### SDS-PAGE
Teknik untuk memisahkan protein berdasarkan berat molekulnya. SDS memberikan muatan negatif yang seragam pada protein, sehingga pemisahan murni berdasarkan ukuran saat melewati gel poliakrilamida.
    `,
    xpReward: 200
  },
  {
    id: 'anfis-tum-1',
    title: 'Struktur Akar dan Batang',
    category: 'Anatomi & Fisiologi Tumbuhan',
    difficulty: 'easy',
    level: 1,
    description: 'Jaringan penyusun organ vegetatif tumbuhan.',
    content: `
Akar dan batang tumbuhan terdiri dari tiga sistem jaringan utama: epidermis, jaringan dasar (korteks dan empulur), serta jaringan vaskuler (xilem dan floem). Akar memiliki endodermis dengan pita Caspary yang mengatur aliran air, sedangkan batang dikotil memiliki kambium vaskuler.
    `,
    xpReward: 100
  },
  {
    id: 'anfis-wan-1',
    title: 'Sistem Peredaran Darah',
    category: 'Anatomi & Fisiologi Hewan',
    difficulty: 'medium',
    level: 2,
    description: 'Mekanisme transportasi nutrisi dan gas pada hewan.',
    content: `
Sistem peredaran darah tertutup pada vertebrata melibatkan jantung sebagai pompa. Darah mengalir dari ventrikel ke arteri, kapiler (pertukaran gas), vena, dan kembali ke atrium. Pada mamalia, terdapat sirkulasi ganda: sistemik dan pulmonal.
    `,
    xpReward: 150
  },
  {
    id: 'genetik-1',
    title: 'Pewarisan Sifat Mendel',
    category: 'Biogenetika & Evolusi',
    difficulty: 'easy',
    level: 1,
    description: 'Hukum dasar pewarisan karakter genetik.',
    content: `
Hukum Mendel I (Segregasi) menyatakan alel memisah secara bebas saat pembentukan gamet. Hukum Mendel II (Asortasi Bebas) menyatakan pasangan alel memisah secara bebas dari pasangan lain. Rasio fenotip monohibrid dominan-resesif adalah 3:1.
    `,
    xpReward: 100
  },
  {
    id: 'ekologi-1',
    title: 'Aliran Energi & Jaring Makanan',
    category: 'Ekologi',
    difficulty: 'easy',
    level: 1,
    description: 'Interaksi energi antar organisme dalam ekosistem.',
    content: `
Energi masuk ke ekosistem melalui produsen (fotosintesis). Hanya sekitar 10% energi yang berpindah ke tingkat trofik berikutnya (Aturan 10%). Detritivor membantu mendaur ulang nutrisi ke tanah.
    `,
    xpReward: 100
  },
  {
    id: 'etologi-1',
    title: 'Perilaku Belajar Instingtif',
    category: 'Etologi',
    difficulty: 'medium',
    level: 3,
    description: 'Analisis perilaku hewan berdasarkan evolusi.',
    content: `
Perilaku hewan dibedakan menjadi *innate* (insting) dan *learned* (belajar). Contoh perilaku belajar meliputi pembiasaan (habituation), pengondisian klasik (classical conditioning), dan imprinting (perekaman pada fase kritis).
    `,
    xpReward: 150
  },
  {
    id: 'sistematika-1',
    title: 'Prinsip Filogeni',
    category: 'Biosistematika',
    difficulty: 'hard',
    level: 5,
    description: 'Metode klasifikasi makhluk hidup berdasarkan kekerabatan.',
    content: `
Kladistika mengelompokkan organisme berdasarkan nenek moyang bersama. Kladogram menunjukkan hubungan evolusioner menggunakan karakter sinapomorfi. Kelompok monofiletik mencakup semua keturunan dari nenek moyang yang sama.
    `,
    xpReward: 250
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
