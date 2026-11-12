# Data, Keselamatan & Privasi (Data & Privacy)

Dokumen ini menerangkan pengendalian data, keselamatan maklumat, dan penggunaan servis luar dalam sistem **LabCalibre** berdasarkan pelaksanaan kod sebenar.

---

## 1. Kategori Data yang Dikumpulkan

Sistem ini hanya mengendalikan data teknikal metrologi yang berkaitan secara langsung dengan operasi makmal:

1. **Maklumat Instrumen Makmal:**
   - Nama instrumen, jenama, model (contoh: *Mettler Toledo, Sartorius*).
   - Nombor siri pengilang dan nombor rujukan dalaman (contoh: `LGM/B1`, `LGM/SW1`).
   - Lokasi fizikal bilik makmal (contoh: *UPKS Lab B159, Sungai Buloh Lab B035*).
   - Nilai rujukan piawai ($X_0$), had toleransi ($\pm\delta$), dan unit ukuran ($g, mg, \mu L, pH$).
2. **Rekod Penentusahan Harian & Kalibrasi:**
   - Nilai bacaan sebenar, nilai sisihan, tarikh ujian, dan cap masa (*timestamp*).
   - Nama operator yang mencatat dan peranan sistem (`operator`, `supervisor`, `officer`).
   - Ulasan semakan atau justifikasi penolakan daripada penyelia makmal.
3. **Maklumat Sijil Kalibrasi Luar:**
   - Nombor sijil penentukuran, nama agensi penentukuran (contoh: *METCAL, SIRIM, NMIM*).
   - Tarikh mula sah dan tarikh luput sijil penentukuran.
4. **Data Pengguna & Log Masuk:**
   - Nama staf dan alamat e-mel korporat rasmi (contoh: `syaarani@lgm.gov.my`, `fendy@lgm.gov.my`).
   - Bahagian / unit makmal.
   - *Nota Penting:* Sistem **tidak menyimpan atau meminta kata laluan peribadi pengguna**. Log masuk menggunakan mekanisme pengesahan domain Google Corporate SSO.

---

## 2. Di Mana Data Disimpan?

- **Penyimpanan Utama Semasa (Sesi Tempatan):**
  - Buat masa ini, semua instrumen, rekod ujian, log audit, dan notifikasi disimpan di dalam simpanan tempatan pelayar web pengguna (*browser localStorage*) di bawah kekunci selamat seperti `labcalibre_instruments_v2_lgm` dan `labcalibre_records_v2_lgm`.
  - Data kekal berada di dalam peranti pelayar anda dan tidak dimuat naik ke mana-mana pelayan pihak ketiga tanpa persetujuan anda.
- **Fail Konfigurasi & Kod Sumber:**
  - Tiada kata laluan, kunci API rahsia, atau rekod sulit disimpan di dalam repositori kod sumber. Semua pembolehubah sulit diuruskan melalui pembolehubah persekitaran (*environment variables*) di sisi pelayan (*server-side only*).

---

## 3. Penggunaan Kecerdasan Buatan (AI) & Servis Luar

Sistem menggunakan **Google Gemini API** (`gemini-2.5-flash`) secara eksklusif untuk satu tujuan fungsian sahaja:
- **Pengekstrakan Teks Sijil Kalibrasi (*AI Document Extraction*):**
  - Apabila operator memuat naik salinan fail sijil penentukuran luar, dokumen tersebut diproses di pelayan backend melalui endpoint `/api/gemini/extract-certificate`.
  - Model AI membaca imej/PDF tersebut untuk mengekstrak teks nombor sijil, tarikh, agensi, dan status toleransi.
  - Fail tersebut **tidak digunakan untuk melatih model AI awam** dan tidak disimpan secara kekal oleh pembekal servis.
  - Kunci API `GEMINI_API_KEY` disimpan pada peringkat pelayan selamat (Cloud Run) dan tidak pernah didedahkan kepada kod pelayar pengguna (*client-side*).

---

## 4. Kawalan Akses & Keselamatan Data (Access Control)

1. **Pengesahan Domain Ketat:**
   - Akses dihadkan secara automatik kepada akaun e-mel berdomain `@syarikat.com` dan `@lgm.gov.my`. Percubaan mendaftar menggunakan domain e-mel awam biasa (seperti gmail.com atau yahoo.com) ditolak serta-merta.
2. **Integriti Jejak Audit (Audit Trail Integrity):**
   - Rekod ujian yang telah diluluskan oleh penyelia kualiti tidak boleh dipinda atau dipadam bagi mematuhi keperluan akreditasi ISO/IEC 17025.
   - Penghapusan instrumen dari senarai inventori menggunakan kaedah pemadaman lembut (*soft delete*) supaya rekod arkib masa lalu tetap terpelihara bagi tujuan rujukan auditor.

---

## 5. Cara Memadam Data (Data Deletion)

Sekiranya anda ingin membersihkan keseluruhan rekod ujian dan data peribadi dari peranti:
1. Buka menu **Settings** pada bar navigasi atas.
2. Di bahagian bawah, klik butang **Reset All Data to Factory Default**.
3. Tindakan ini akan mengosongkan keseluruhan storan tempatan pelayar (*localStorage*) dan memulihkan senarai inventori kepada tetapan asal.
4. Anda juga boleh memadam data secara manual dengan mengosongkan *Cache & Cookies* pada pelayar web anda.

---

## 6. Batasan & Penafian

Penerangan ini mencerminkan seni bina teknikal semasa sistem LabCalibre. Pelaksanaan pangkalan data berpusat berskala penuh pada masa hadapan (Fasa 2) akan dikemas kini dengan dasar pematuhan Akta Perlindungan Data Peribadi (APDP/PDPA) rasmi organisasi.
