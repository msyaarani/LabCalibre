# Rekod Perubahan (Changelog)

Semua perubahan ketara pada projek **LabCalibre** direkodkan secara kronologi dalam dokumen ini. Format rekod berpandukan prinsip [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.2.0] - 2026-11-12

### Ditambah (Added)
- **Integrasi Senarai Induk Penimbang LGM UPKS (2026):**
  - Mengekstrak dan menyepadukan 12 instrumen penimbang rasmi daripada fail `2026_Masterlist_Balance_-_Periodic_Verification__Backup_1__1__b4243024`.
  - Menetapkan kod rujukan rasmi `LGM/SW1`, `LGM/B1` hingga `LGM/B11`, nama operator bertugas *(Abid, Hisyam, Nuar, Mahfuzah, Zaidi, Fendy)*, lokasi bilik makmal *(B123, B159, B033, B042, B048, B039, B055, B035, GF/R001)*, dan agensi penentukuran *METCAL*.
- **Tetingkap Lembaran Dokumen Master List:**
  - Menambah modal paparan dokumen jadual penuh 12 penimbang berserta kotak pengesahan tandatangan penyedia *(Mohd Fandi bin Mohd Sukri - fendy)*.
  - Butang muat turun fail CSV rasmi `2026_Masterlist_Balance_UPKS_LGM.csv`.
- **Alat Import & Segerak Master List CSV:**
  - Menyediakan butang *1-Click Preset* untuk memuatkan fail lampiran serta borang import data CSV luaran.
- **Set Dokumentasi Lengkap Repositori GitHub:**
  - Menyediakan `README.md`, `docs/PANDUAN-PENGGUNA.md`, `docs/KEPERLUAN-PRODUK.md`, `docs/STATUS-DAN-ROADMAP.md`, `docs/DATA-DAN-PRIVASI.md`, dan `docs/SETUP-DAN-PENYELENGGARAAN.md` dalam Bahasa Melayu Malaysia yang mudah difahami oleh orang awam.

### Ditambah Baik (Improved)
- Pengendalian instrumen `LGM/B8` di SMR Lab 2 yang belum mempunyai tarikh penentukuran ditandakan sebagai `Action Required / Due Soon` secara pintar dalam tetingkap pemantauan jadual.

---

## [1.1.0] - 2026-11-11

### Ditambah Baik (Improved)
- **Penyeragaman Antaramuka Teknikal Metrologi ke Bahasa Inggeris:**
  - Menyelaraskan seluruh label borang, lajur jadual, mesej amaran, dan status ke istilah metrologi Bahasa Inggeris antarabangsa mengikut standard ISO/IEC 17025.
- **Reka Bentuk Semula UI/UX Stesen Kerja Klinikal (*Clinical Lab Workstation*):**
  - Menghapuskan elemen gaya generik ("AI-slop"), gradien neon, dan kad berbuih yang berlebihan.
  - Menguatkuasakan reka bentuk berketumpatan maklumat tinggi dengan tipografi angka tabular berasaskan font `JetBrains Mono` dan `Plus Jakarta Sans`.
  - Menambah tolok visual jarum toleransi dinamik (*Interactive Tolerance Range Gauge Needle*) pada skrin verifikasi harian.

---

## [1.0.0] - 2026-11-11

### Versi Awal (Initial MVP Release)
- **Pengesahan & Peranan (RBAC):**
  - Sokongan log masuk korporat domain `@syarikat.com` dan `@lgm.gov.my`.
  - Tiga peringkat pengguna: *Lab Operator*, *Quality Supervisor*, dan *Compliance Officer*.
- **Kalkulator Toleransi Metrologi Harian:**
  - Pengiraan sisihan automatik $\Delta = |X_{\text{meas}} - X_0|$.
  - Pengesanan status Lulus/Gagal automatik yang tidak boleh dipintas.
- **Kuarantin Automatik (*Auto-Quarantine*):**
  - Penguncian status alat kepada *Out of Service* serta-merta apabila ujian gagal.
  - Amaran kecemasan visual dan penghantaran endpoint e-mel.
- **Sijil Kalibrasi Luar dengan Ekstraksi AI:**
  - Endpoint pelayan Express menggunakan model Gemini untuk mendigitalkan dokumen sijil penentukuran.
- **Penjana & Pengimbas Kod QR:**
  - Penjanaan kod QR masa nyata untuk setiap instrumen dan pengimbas kamera langsung.
- **Aliran Kelulusan Penyelia (*Approval Queue*):**
  - Semakan rekod ujian dengan ulasan audit dan pengesahan status kelulusan.
- **Log Jejak Audit & Eksport Laporan:**
  - Log aktiviti kekal, muat turun fail CSV berformat UTF-8 BOM, dan reka letak cetakan A4 ISO 17025.
