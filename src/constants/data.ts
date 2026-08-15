export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: number;
  description: string;
  content: string;
  xpReward: number;
  topicId?: string;
  aiAssets?: {
    images?: { url: string; caption: string }[];
    videos?: { url: string; title: string; description: string }[];
  };
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'MULTIPLE_STATEMENTS';

export interface Statement {
  text: string;
  isCorrect: boolean; // True = Benar, False = Salah
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MULTIPLE_CHOICE
  correctAnswer?: number; // For MULTIPLE_CHOICE (index)
  statements?: Statement[]; // For MULTIPLE_STATEMENTS (exactly 4)
  explanation: string;
  optionExplanations?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
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
    id: 'cell-structure-1',
    title: 'Struktur dan Organel Sel',
    category: 'Biologi Sel & Molekuler',
    difficulty: 'easy',
    level: 1,
    description: 'Eksplorasi mendalam tentang unit terkecil kehidupan, mulai dari membran hingga sitoskeleton.',
    content: `
### 1. Teori Sel dan Klasifikasi Organisme
Sel adalah unit struktural dan fungsional terkecil dari makhluk hidup. Berdasarkan ada tidaknya membran inti, sel dibedakan menjadi:
- **Prokariotik**: Tidak memiliki membran inti (nukleoid). Contoh: Bakteri dan Archaea.
- **Eukariotik**: Memiliki membran inti dan organel bermembran. Contoh: Hewan, Tumbuhan, Fungi, dan Protista.

### 2. Membran Sel (Model Mosaik Fluida)
Membran sel bersifat *selektif permeabel*. Struktur utamanya terdiri dari:
- **Fosfolipid Bilayer**: Kepala hidrofilik (suka air) menghadap luar/dalam, ekor hidrofobik (benci air) di tengah.
- **Protein Membran**: Integral (menembus bilayer) dan Perifer (di permukaan).
- **Kolesterol**: Menjaga fluiditas membran pada berbagai suhu.
- **Glikoliks (Glikoprotein/Glikolipid)**: Berperan dalam pengenalan sel.

### 3. Organel-Organel Utama
Setiap organel memiliki fungsi spesifik (divisi kerja):
- **Nukleus**: Pusat kendali sel, mengandung materi genetik (DNA). Memiliki nukleolus untuk sintesis ribosom.
- **Ribosom**: Tempat sintesis protein. Bisa bebas di sitosol atau menempel pada RE Kasar.
- **Retikulum Endoplasma (RE)**:
  - **RE Kasar**: Memiliki ribosom, berperan dalam sintesis protein sekretori/membran.
  - **RE Halus**: Sintesis lipid (steroid), metabolisme karbohidrat, dan detoksifikasi racun.
- **Badan Golgi**: "Pusat pengiriman/logistik". Memodifikasi, menyortir, dan mengemas protein untuk disekresikan.
- **Mitokondria**: Tempat respirasi seluler untuk menghasilkan ATP. Memiliki DNA sendiri (semi-otonom).
- **Kloroplas (Tumbuhan)**: Tempat fotosintesis. Mengandung klorofil dan memiliki DNA sendiri.
- **Lisosom (Hewan)**: Kantong enzim hidrolitik untuk pencernaan intraseluler (autofagi).
- **Vakuola**: Pada tumbuhan berukuran besar (vakuola sentral) untuk tekanan turgor dan penyimpanan cadangan makanan.

### 4. Sitoskeleton
Jaringan serat protein yang menjaga bentuk sel dan memfasilitasi pergerakan:
- **Mikrotubulus**: Paling tebal (tubulin), untuk transport organel dan pembelahan sel (sentriol).
- **Mikrofilamen**: Paling tipis (aktin), untuk kontraksi otot dan aliran sitoplasma.
- **Filamen Intermediet**: Kekuatan mekanis (keratin).

> **Tip OSN**: Pahami perbedaan sel hewan dan tumbuhan secara mendalam. Tumbuhan memiliki dinding sel (selulosa), kloroplas, dan vakuola besar, tetapi biasanya tidak memiliki sentriol (kecuali sel sperma tumbuhan rendah).
    `,
    xpReward: 300,
    topicId: 'cell-structure',
    aiAssets: {
      images: [
        { 
          url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1000', 
          caption: 'Visualisasi 3D Struktur Sel Eukariotik dengan Detail Organel Utama (AI Generated Visualization)' 
        },
        {
          url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1000',
          caption: 'Detail Mikroskopis Membran Sel dan Protein Integral (High Fidelity Render)'
        }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/embed/URUJD5NEXC8', // Standard high quality bio video as placeholder
          title: 'Perjalanan ke Dalam Sel',
          description: 'Animasi kinematik yang menunjukkan interaksi dinamik antar organel sel dalam waktu nyata.'
        }
      ]
    }
  },
  {
    id: 'macromolecules-1',
    title: 'Makromolekul: Protein dan Asam Nukleat',
    category: 'Biologi Sel & Molekuler',
    difficulty: 'medium',
    level: 1,
    description: 'Mempelajari struktur polimer biologis: dari asam amino hingga heliks DNA.',
    content: `
### 1. Protein: Polimer Asam Amino
Protein adalah makromolekul paling beragam. Terdiri dari polimer asam amino yang dihubungkan oleh **ikatan peptida**.
- **Struktur Primer**: Urutan linear asam amino.
- **Struktur Sekunder**: Lipatan lokal (Alpha-helix dan Beta-sheet) akibat ikatan hidrogen pada tulang punggung polipeptida.
- **Struktur Tersier**: Bentuk 3D keseluruhan akibat interaksi rantai samping (R-group) seperti ikatan disulfida, interaksi hidrofobik, dan ikatan ionik.
- **Struktur Kuartener**: Penggabungan dua atau lebih rantai polipeptida (Contoh: Hemoglobin).

### 2. Asam Nukleat: Penyimpan Informasi
DNA dan RNA adalah polimer dari **nukleotida**. Setiap nukleotida terdiri dari: Gula pentosa, Gugus Fosfat, dan Basa Nitrogen.
- **DNA (Deoxyribonucleic Acid)**: Double helix, gula deoksiribosa, basa A, T, C, G.
- **RNA (Ribonucleic Acid)**: Single strand, gula ribosa, basa A, U, C, G.

> **OSN Insight**: Ingat bahwa ikatan hidrogen antara C-G (3 ikatan) lebih kuat daripada A-T (2 ikatan). DNA dengan kandungan GC tinggi memiliki titik didih (T_m) yang lebih tinggi.
    `,
    xpReward: 350,
    topicId: 'macromolecules',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1579033390033-247b3399086e?auto=format&fit=crop&q=80&w=1000', caption: 'Struktur Heliks Ganda DNA (High-Resolution AI Render)' },
        { url: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?auto=format&fit=crop&q=80&w=1000', caption: 'Visualisasi Lipatan Protein pada Tingkat Tersier' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/o_-6JZisHwA', title: 'Mekanisme Replikasi DNA', description: 'Animasi detail tentang bagaimana enzim bekerja secara sinkron untuk menggandakan untai DNA.' }
      ]
    }
  },
  {
    id: 'metabolism-1',
    title: 'Prinsip Bioenergetika & Enzim',
    category: 'Biologi Sel & Molekuler',
    difficulty: 'medium',
    level: 2,
    description: 'Bagaimana sel mengelola energi melalui reaksi kimia dan katalis enzim.',
    content: `
### 1. Hukum Termodinamika dalam Biologi
- **Hukum I**: Energi tidak dapat diciptakan/dimusnahkan, hanya diubah bentuknya.
- **Hukum II**: Setiap transfer energi meningkatkan entropi (ketidakteraturan) alam semesta.

### 2. Enzim sebagai Biokatalisator
Enzim menurunkan **energi aktivasi** reaksi tanpa ikut bereaksi.
- **Sisi Aktif**: Tempat substrat menempel (*Induced Fit Model*).
- **Kofaktor & Koenzim**: Komponen non-protein penunjang fungsi enzim (Contoh: ion logam, vitamin).
- **Inhibisi**:
  - **Kompetitif**: Menempel pada sisi aktif.
  - **Non-Kompetitif**: Menempel pada sisi alosterik, mengubah bentuk sisi aktif.

### 3. Jalur Katabolik: Glikolisis
Langkah awal respirasi seluler di sitosol. Mengubah 1 molekul Glukosa menjadi 2 molekul Piruvat, menghasilkan 2 ATP dan 2 NADH. Bersifat anaerobik.
    `,
    xpReward: 450,
    topicId: 'metabolism',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1628595305749-982393bc6741?auto=format&fit=crop&q=80&w=1000', caption: 'Struktur Kompleks Enzim-Substrat dan Energi Aktivasi' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/AFh77660NNo', title: 'Glikolisis: Visualisasi 3D', description: 'Perjalanan molekul glukosa saat dipecah menjadi energi dalam sitosol sel.' }
      ]
    }
  },
  {
    id: 'molecular-genetics-1',
    title: 'Genetika Molekuler: Dogma Sentral',
    category: 'Biologi Sel & Molekuler',
    difficulty: 'hard',
    level: 4,
    description: 'Bagaimana informasi genetik mengalir dari DNA ke Protein.',
    content: `
### 1. Replikasi DNA (Semikonservatif)
Proses penggandaan DNA yang melibatkan berbagai enzim:
- **Helikase**: Membuka rantai ganda DNA.
- **Primase**: Memasang primer RNA sebagai awal replikasi.
- **DNA Polimerase III**: Menambahkan nukleotida baru pada ujung 3'.
- **Ligase**: Menyambungkan fragmen Okazaki pada *lagging strand*.

### 2. Transkripsi (DNA -> RNA)
Pembentukan mRNA oleh **RNA Polimerase** di nukleus.
- **Promotor**: Titik awal penempelan polimerase.
- **Splicing (Eukariot)**: Pemotongan Intron (non-coding) dan penyambungan Ekson (coding).

### 3. Translasi (RNA -> Protein)
Pembacaan kode genetik (kodon) oleh ribosom di sitoplasma.
- **Stop Kodon**: UAA, UAG, UGA.
- **Start Kodon**: AUG (Metionin).
    `,
    xpReward: 500,
    topicId: 'molecular-genetics',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1579154235602-3c2c2aa94685?auto=format&fit=crop&q=80&w=1000', caption: 'Proses Transkripsi mRNA oleh RNA Polimerase (AI Molecular Flow)' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/gG7uCskUOrA', title: 'Dogma Sentral Biologi', description: 'Dari gen menjadi protein: aliran informasi genetik yang menghidupkan sel.' }
      ]
    }
  },
  {
    id: 'population-genetics-1',
    title: 'Genetika Populasi & Hardy-Weinberg',
    category: 'Biogenetika & Evolusi',
    difficulty: 'hard',
    level: 5,
    description: 'Analisis frekuensi alel dalam populasi yang tidak berevolusi.',
    content: `
### 1. Hukum Hardy-Weinberg
Menyatakan bahwa frekuensi alel dan genotip dalam suatu populasi akan tetap konstan dari generasi ke generasi selama syarat-syarat terpenuhi:
- Ukuran populasi sangat besar (tidak ada genetic drift).
- Perkawinan acak (*random mating*).
- Tidak ada mutasi.
- Tidak ada seleksi alam.
- Tidak ada aliran gen (*gene flow*).

### 2. Persamaan Matematika
- **p + q = 1** (untuk frekuensi alel).
- **p^2 + 2pq + q^2 = 1** (untuk frekuensi genotip).
  - p^2: Dominan Homozigot (AA).
  - 2pq: Heterozigot (Aa).
  - q^2: Resesif Homozigot (aa).

> **Latihan OSN**: Jika dalam populasi 100 orang terdapat 16 orang bergolongan darah rhesus negatif (aa), tentukan frekuensi pembawa sifat (*carrier*) heterozigot.
> **Solusi**: q^2 = 0.16 -> q = 0.4. Maka p = 0.6. Heterozigot (2pq) = 2 * 0.6 * 0.4 = 0.48 atau 48%.
    `,
    xpReward: 600,
    topicId: 'population-genetics',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1543269664-56ec423d249d?auto=format&fit=crop&q=80&w=1000', caption: 'Visualisasi Distribusi Alel dalam Populasi Ideal (Hardy-Weinberg Model)' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/oG7702M2R8c', title: 'Simulasi Hanyutan Genetik', description: 'Bagaimana frekuensi alel berubah secara acak dalam populasi kecil.' }
      ]
    }
  },
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
    xpReward: 200,
    topicId: 'molecular-genetics',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1579154235602-3c2c2aa94685?auto=format&fit=crop&q=80&w=1000', caption: 'Hasil Elektroforesis Gel Agarosa dengan Ladder DNA' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/mN5IvS9FrwY', title: 'Cara Kerja Elektroforesis', description: 'Animasi pergerakan fragmen DNA melalui pori-gel di bawah pengaruh medan listrik.' }
      ]
    }
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
    xpReward: 100,
    topicId: 'cell-structure',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&q=80&w=1000', caption: 'Irisan Melintang Akar Dikotil: Detail Stele dan Pita Caspary' }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/embed/PzM0yJ9i-t4',
          title: 'Anatomi Mikroskopis Akar & Batang',
          description: 'Visualisasi penampang melintang xilem, floem, dan jalur simplas-apoplas pita Caspary.'
        }
      ]
    }
  },
  {
    id: 'anfis-tum-2',
    title: 'Fisiologi Tumbuhan: Sirkulasi & Fitohormon',
    category: 'Anatomi & Fisiologi Tumbuhan',
    difficulty: 'hard',
    level: 3,
    description: 'Analisis mekanisme transportasi air, mineral, dan pengaruh hormon pada pertumbuhan tanaman.',
    content: `
### 1. Transportasi Air: Teori Kohesi-Adhesi-Tegangan
Air bergerak dari akar ke daun melalui xilem tanpa pompa jantung. Mekanisme utamanya:
- **Transpirasi**: Penguapan air melalui stomata menciptakan tarikan negatif.
- **Kohesi**: Ikatan hidrogen antar molekul air menjaga kolom air tetap kontinu.
- **Adhesi**: Interaksi air dengan dinding sel xilem melawan gravitasi.

### 2. Transportasi Hasil Fotosintesis (Translokasi)
Terjadi di floem melalui **Aliran Tekanan (Pressure Flow Hypothesis)**.
- Gula dimuat (*loading*) secara aktif ke pembuluh tapis, menurunkan potensial air.
- Air masuk dari xilem ke floem, menciptakan tekanan hidrostatik tinggi yang mendorong gula ke bagian "sink" (akar/buah).

### 3. Hormon Tumbuhan (Fitohormon)
- **Auksin**: Pemanjangan sel, dominansi apikal, fototropisme.
- **Sitokinin**: Pembelahan sel (sitokinesis), menunda penuaan daun.
- **Giberelin**: Perkecambahan biji, pemanjangan batang (bolting).
- **Asam Absisat (ABA)**: Penutupan stomata saat cekaman air, dormansi biji.
- **Etilen**: Pematangan buah, absisi (pengguguran) daun.

> **OSN Case Study**: Dalam sebuah eksperimen, tanaman yang diletakkan di tempat gelap (etiolasi) akan tumbuh sangat cepat namun pucat. Hormon apa yang paling berperan? 
> **Jawab**: Auksin. Karena auksin tidak terurai oleh cahaya di sisi gelap, konsentrasinya tinggi dan memacu pemanjangan sel secara ekstrem.
    `,
    xpReward: 500,
    topicId: 'cell-structure',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1464306303998-cb8675765169?auto=format&fit=crop&q=80&w=1000', caption: 'Visualisasi Aliran Air pada Xilem melalui Gaya Kohesi-Adhesi' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/LbeZ0a6L6T8', title: 'Mekanisme Kerja Fitohormon & Transpirasi', description: 'Bagaimana Auksin dan Giberelin memacu pertumbuhan sel tumbuhan dan mekanisme bukaan stomata.' }
      ]
    }
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
    xpReward: 150,
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&q=80&w=1000', caption: 'Struktur Jantung Mamalia: Katup dan Aliran Darah' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/f9ONVdn1KNo', title: 'Sirkulasi Darah Ganda & Siklus Jantung', description: 'Animasi 3D perjalanan darah kaya oksigen dan karbon dioksida di dalam ruang-ruang jantung.' }
      ]
    }
  },
  {
    id: 'biosystematics-1',
    title: 'Biosistematika & Filogeni',
    category: 'Biosistematika',
    difficulty: 'hard',
    level: 5,
    description: 'Mempelajari klasifikasi makhluk hidup menggunakan pendekatan Kladogram.',
    content: `
### 1. Dasar-Dasar Klasifikasi
Sistematika adalah ilmu yang mempelajari keanekaragaman makhluk hidup serta hubungan kekerabatan antar organisme.
- **Taksonomi**: Penamaan (Nomenklatur) dan klasifikasi.
- **Filogeni**: Sejarah evolusi suatu spesies atau kelompok spesies.

### 2. Kladistika (Analisis Kladogram)
Metode klasifikasi yang mengelompokkan organisme berdasarkan **Karakter Turunan Bersama** (*Shared Derived Characters*).
- **Klad**: Kelompok yang mencakup satu nenek moyang dan semua keturunannya (Monofiletik).
- **Parafiletik**: Mencakup nenek moyang tetapi tidak semua keturunan.
- **Polifiletik**: Mencakup organisme yang tidak memiliki nenek moyang bersama yang paling baru.

### 3. Pohon Filogenetik
Interpretasi hubungan kekerabatan menggunakan data morfologi dan molekuler (DNA). Organisme yang memiliki urutan DNA lebih mirip dianggap memiliki hubungan kekerabatan lebih dekat.

> **Challenge OSN**: Diberikan tabel karakter (misal: ada/tidaknya rahang, paru-paru, rambut), susunlah kladogram yang paling parsimonius (paling sederhana).
    `,
    xpReward: 500,
    topicId: 'biosystematics',
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=1000', caption: 'Pohon Filogenetik Kompleks: Jejak Evolusi Kehidupan' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/hVvO_S1B5XU', title: 'Cara Membaca Kladogram & Parsimoni', description: 'Panduan langkah demi langkah menentukan kekerabatan monofiletik antar takson.' }
      ]
    }
  },
  {
    id: 'ecology-foundation-1',
    title: 'Prinsip Dasar Ekologi',
    category: 'Ekologi',
    difficulty: 'easy',
    level: 1,
    description: 'Mempelajari interaksi makhluk hidup dengan lingkungannya, dari tingkat individu hingga biosfer.',
    content: `
### 1. Tingkatan Organisasi Biologis
Ekologi mempelajari hubungan timbal balik di berbagai tingkatan:
- **Individu**: Satu makhluk hidup tunggal.
- **Populasi**: Sekelompok individu sejenis di tempat yang sama.
- **Komunitas**: Kumpulan berbagai populasi yang berinteraksi.
- **Ekosistem**: Interaksi antara komunitas dengan faktor abiotik (air, tanah, cahaya).
- **Biosfer**: Seluruh lapisan bumi yang dihuni makhluk hidup.

### 2. Rantai dan Jaring Makanan
Energi mengalir dari **Produsen** (tumbuhan) ke **Konsumen** (hewan) dan akhirnya ke **Pengurai** (fungi/bakteri).
- **Hukum 10%**: Hanya sekitar 10% energi yang diteruskan ke trofik berikutnya.

### 3. Suksesi
Proses perubahan komposisi spesies dalam komunitas seiring waktu.
- **Suksesi Primer**: Dimulai dari lahan kosong tanpa tanah (misal: setelah letusan gunung).
- **Suksesi Sekunder**: Terjadi setelah gangguan (misal: kebakaran hutan) di lahan yang sudah memiliki tanah.
    `,
    xpReward: 300,
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000', caption: 'Interaksi Biotik dan Abiotik dalam Suatu Ekosistem Hutan' }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/embed/b0u4K2wz_rI',
          title: 'Dinamika Ekosistem & Suksesi Alam',
          description: 'Simulasi alur trofik energi dan regenerasi ekosistem dari suksesi primer hingga klimaks.'
        }
      ]
    }
  },
  {
    id: 'animal-phys-foundation-1',
    title: 'Jaringan Dasar Hewan',
    category: 'Anatomi & Fisiologi Hewan',
    difficulty: 'easy',
    level: 1,
    description: 'Mengenal empat tipe jaringan utama yang menyusun tubuh hewan.',
    content: `
### 1. Jaringan Epitel
Melapisi permukaan tubuh dan organ. Berfungsi sebagai proteksi, absorpsi, dan sekresi.
- Contoh: Epitel pipih selapis di paru-paru.

### 2. Jaringan Ikat
Menghubungkan dan menyokong jaringan lain. Terdiri dari matriks dan sel.
- Contoh: Darah, tulang, kartilago, dan lemak (adiposa).

### 3. Jaringan Otot
Berfungsi untuk pergerakan.
- **Otot Polos**: Involunter (tidak sadar), di organ dalam.
- **Otot Lurik**: Volunter (sadar), melekat pada rangka.
- **Otot Jantung**: Involunter, hanya di jantung.

### 4. Jaringan Saraf
Menerima dan menghantarkan impuls listrik. Terdiri dari neuron dan sel glia.
    `,
    xpReward: 300,
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1000', caption: 'Empat Tipe Jaringan Utama pada Tubuh Hewan (AI Comparison Map)' }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/embed/5m3l3_i39Qc',
          title: 'Struktur Histologi 4 Jaringan Hewan',
          description: 'Animasi penampang mikroskopis epitel, jaringan ikat, serat otot, dan sinapsis neuron.'
        }
      ]
    }
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
    xpReward: 100,
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1582719201990-255d88f6233d?auto=format&fit=crop&q=80&w=1000', caption: 'Visualisasi Diagram Punnett untuk Persilangan Dihibrid' }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/embed/Mehz7tCxjSE',
          title: 'Hukum Segregasi & Asortasi Bebas Mendel',
          description: 'Visualisasi 3D pembelahan meiosis dan persilangan alel rekombinan pada lalat buah.'
        }
      ]
    }
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
    xpReward: 100,
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1000', caption: 'Piramida Energi: Aliran Efisiensi 10% di Ekosistem Alami' }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/embed/lnAKICtJIA4',
          title: 'Piramida Biomassa & Aliran Kalori',
          description: 'Eksplorasi efisiensi transfer energi 10% dan bioakumulasi polutan di tingkat trofik puncak.'
        }
      ]
    }
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
    xpReward: 150,
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=1000', caption: 'Contoh Perilaku Belajar Imprinting pada Burung' }
      ],
      videos: [
        { url: 'https://www.youtube.com/embed/6hREbe98E7M', title: 'Eksperimen Pavlov & Pengondisian Operan', description: 'Bagaimana sirkuit reward otak hewan membentuk pola kebiasaan dan respon instingtual.' }
      ]
    }
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
    xpReward: 250,
    aiAssets: {
      images: [
        { url: 'https://images.unsplash.com/photo-1563200133-cfa77d598501?auto=format&fit=crop&q=80&w=1000', caption: 'Kladogram Filogeni Vertebrata: Kerabat Terdekat Manusia' }
      ],
      videos: [
        {
          url: 'https://www.youtube.com/embed/klq2751y_f8',
          title: 'Rekonstruksi Pohon Evolusi Molekuler',
          description: 'Animasi perbandingan sekuens asam amino sitokrom c untuk menentukan jarak kekerabatan takson.'
        }
      ]
    }
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
