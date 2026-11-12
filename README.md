# LabCalibre

**Sistem Pengurusan Kalibrasi & Penentusahan Instrumen Makmal (Laboratory Instrument Calibration & Verification Management System)**

LabCalibre ialah aplikasi web metrologi saintifik yang direka khas untuk makmal ujian dan analisis (seperti makmal kimia, fizikal, dan getah berakreditasi **MS ISO/IEC 17025**). Sistem ini membantu staf makmal merekodkan verifikasi harian secara digital, mengira had toleransi secara automatik, mengunci instrumen yang rosak secara automatik (*auto-quarantine*), mengimbas kod QR instrumen, dan mendigitalkan sijil kalibrasi luar menggunakan kecerdasan buatan (*AI*).

---

## Masalah yang Diselesaikan

Di kebanyakan makmal tradisional:
- **Buku log kertas sering rosak atau tercicir:** Operator mencatat bacaan verifikasi harian di atas kertas, menyebabkan data sukar dijejaki semasa sesi audit kualiti.
- **Kesilapan pengiraan manusia (*human error*):** Operator perlu mengira sendiri perbezaan bacaan (*deviation*). Bacaan yang melebihi had toleransi kadangkala terlepas pandang dan tidak dilaporkan segera.
- **Risiko instrumen rosak terus digunakan:** Apabila sesuatu alat gagal melepasi had penentukuran, alat tersebut sering tidak ditanda dengan segera, menyebabkan sampel ujian rosak dan keputusan analisis tidak sah.
- **Tarikh kalibrasi terlepas:** Pengurus makmal sukar memantau tarikh luput kalibrasi tahunan bagi puluhan alat secara serentak.

**LabCalibre menyelesaikan isu ini** dengan pengiraan automatik pintar, amaran serta-merta, penjejakan kod QR pantas, dan aliran kerja semakan (*approval workflow*) yang telus.

---

## Untuk Siapa?

1. **Operator Makmal (*Lab Operator - OPR-L1*):**
   - Mengimbas kod QR alat di meja makmal.
   - Memasukkan bacaan verifikasi rutin harian dan melihat status Lulus/Gagal serta-merta.
   - Memuat naik salinan sijil kalibrasi tahunan.
2. **Penyelia Kualiti (*Quality Supervisor - SPV-QA*):**
   - Menyemak rekod ujian harian dalam barisan kelulusan (*Approval Queue*).
   - Meluluskan (*Approve*) atau menolak (*Reject*) rekod beserta ulasan audit.
   - Menyahkuarantin atau mengaktifkan semula instrumen selepas pembaikan selesai.
3. **Pegawai Pematuhan & Audit (*Compliance Officer - OFF-AUDIT*):**
   - Memantau kepatuhan jadual kalibrasi makmal secara keseluruhan (tetingkap 30, 14, 7 hari).
   - Mengeksport log audit lengkap ke format CSV atau mencetak lembaran laporan audit ISO/IEC 17025.

---

## Apa yang Boleh Dibuat?

- **Pengiraan Toleransi Automatik (*Auto-Calc Tolerance*):** Memasukkan bacaan sebenar ($X_{\text{meas}}$) berbanding nilai rujukan standard ($X_0$). Sistem mengira $\Delta = |X_{\text{meas}} - X_0|$ dan memaparkan jarum julat toleransi secara visual.
- **Kuarantin Automatik (*Auto-Quarantine*):** Sekiranya bacaan melebihi had ralat yang dibenarkan, status alat dikunci serta-merta kepada *Out of Service (Quarantined)* dan amaran kecemasan dihantar.
- **Digitasi Sijil Kalibrasi dengan AI (*AI Certificate Extraction*):** Memuat naik fail sijil penentukuran (PDF/imej) dari makmal luar (contoh: METCAL, SIRIM, NMIM); AI mengekstrak nombor sijil, agensi, tarikh, dan ketakpastian secara automatik.
- **Pengurusan Senarai Induk LGM UPKS 2026 (*Master List Balance*):** Memuatkan senarai induk rasmi 12 penimbang saintifik Lembaga Getah Malaysia (LGM) lengkap dengan nombor rujukan (`LGM/B1` hingga `LGM/B11`, `LGM/SW1`), nama operator, dan lokasi bilik makmal.
- **Pengimbas & Penjana Kod QR (*QR Tagging*):** Setiap instrumen mempunyai kod QR unik yang boleh dicetak sebagai label fizikal dan diimbas menggunakan kamera telefon/komputer (< 3 saat).
- **Log Jejak Audit (*Audit Trail Ledger*):** Semua tindakan disimpan dengan cap masa (*timestamp*), identiti staf, dan ulasan semakan yang tidak boleh diubah tanpa kebenaran.

---

## Contoh Cara Penggunaan

> **Senario:** Abid (Operator Makmal di UPKS Lab B159) ingin melakukan verifikasi harian bagi penimbang analitikal `LGM/B1`.

1. **Buka Aplikasi:** Abid memilih instrumen **Analytical Balance (Mettler Toledo) - LGM/B1** atau mengimbas kod QR pada penimbang tersebut.
2. **Ujian Penentusahan:** Abid meletakkan jisim standard 100.0000 g di atas penimbang. Penimbang memaparkan bacaan `100.0001 g`.
3. **Kemasukan Data:** Abid memasukkan nilai `100.0001` ke dalam borang LabCalibre.
4. **Keputusan Segera:**
   - Sistem mengira sisihan $\Delta = 0.0001\text{ g}$.
   - Had toleransi yang dibenarkan ialah $\pm 0.0002\text{ g}$.
   - Jarum penunjuk berada dalam zon hijau (**LULUS / PASS**).
5. **Penyerahan:** Abid menekan butang simpan. Rekod dihantar ke barisan kelulusan Penyelia (*Supervisor*).
6. **Kelulusan:** Penyelia kualiti (*Mohd Fandi bin Mohd Sukri / Dr. Faridah*) menyemak rekod dan menekan butang **Approve** berserta ulasan audit.

---

## Cara Mencuba

Aplikasi ini telah dideploy dan boleh diakses secara langsung melalui pelayar web:
- **Pautan Aplikasi Remix Utama (Live Web App):** [https://remix-labcalibre-1780.ai.studio/](https://remix-labcalibre-1780.ai.studio/)
- **Pautan Aplikasi Sandaran (Cloud Run Preview):** [https://ais-pre-zdhlazabdvibjsyn3igrmg-858942738839.asia-northeast1.run.app](https://ais-pre-zdhlazabdvibjsyn3igrmg-858942738839.asia-northeast1.run.app)
- **Pautan Pembangunan (Dev URL):** [https://ais-dev-zdhlazabdvibjsyn3igrmg-858942738839.asia-northeast1.run.app](https://ais-dev-zdhlazabdvibjsyn3igrmg-858942738839.asia-northeast1.run.app)

*Nota: Anda boleh menguji peranan berbeza (Operator, Supervisor, Officer) secara terus melalui suis peranan di bahagian atas antaramuka, serta mencuba Virtual Test Bench dan Interactive Lab Floor Plan.*

---

## Status Projek

| Bahagian | Status Semasa | Catatan |
| :--- | :--- | :--- |
| **Antaramuka Pengguna (UI/UX)** | Siap & Berfungsi | Reka bentuk workstation klinikal berketumpatan tinggi tanpa pill-clutter. |
| **Kalkulator Toleransi Metrologi** | Siap & Diuji | Formula $\Delta = \|X - X_0\|$ disahkan mengikut logik ISO 17025. |
| **Aliran Kuarantin Automatik** | Siap & Diuji | Perubahan status ke *Out of Service* & amaran kecemasan berfungsi. |
| **Integrasi Senarai Induk LGM 2026** | Siap & Diuji | 12 instrumen penimbang UPKS LGM berjaya dimuatkan ke pangkalan data. |
| **Pengekstrakan Sijil AI** | Siap (Server API) | Menggunakan endpoint `/api/gemini/extract-certificate` dengan fail sampel. |
| **Pengimbas Kod QR** | Siap & Diuji | Imbasan kamera langsung dan butang carian pantas ID diuji berfungsi. |
| **Penyimpanan Data Berpusat (Cloud SQL/Firebase)** | Belum Diselaraskan | Data semasa disimpan secara tempatan di pelayar (*localStorage*). |

---

## Panduan Lanjut (Dokumentasi Penuh)

Untuk maklumat terperinci, sila rujuk dokumen-dokumen berikut:
- [Panduan Pengguna Lengkap](docs/PANDUAN-PENGGUNA.md) — Arahan langkah demi langkah bagi setiap skrin dan peranan.
- [Spesifikasi Keperluan Produk (PRD)](docs/KEPERLUAN-PRODUK.md) — Ringkasan objektif, peraturan bisnes, dan kriteria penerimaan.
- [Status & Perancangan (Roadmap)](docs/STATUS-DAN-ROADMAP.md) — Senarai fungsi terbina, batasan, dan fasa pembangunan akan datang.
- [Data, Keselamatan & Privasi](docs/DATA-DAN-PRIVASI.md) — Penerangan mengenai pengurusan data makmal dan kerahsiaan.
- [Panduan Pemasangan & Penyelenggaraan](docs/SETUP-DAN-PENYELENGGARAAN.md) — Arahan teknikal untuk menjalankan kod sumber di komputer anda.
- [Rekod Perubahan (Changelog)](CHANGELOG.md) — Sejarah versi dan penambahbaikan aplikasi.

---

## Ringkasan Teknologi

Aplikasi ini dibina berasaskan susunan teknologi moden yang ringan dan pantas:
- **React 19 & TypeScript:** Digunakan untuk membina komponen paparan, borang interaktif, dan memastikan ketepatan jenis data (*type safety*).
- **Tailwind CSS v4:** Digunakan untuk penggayaan antaramuka makmal klinikal yang kemas dan responsif di telefon pintar mahupun komputer meja.
- **Express & Node.js:** Pelayan belakang (*backend server*) yang mengendalikan laluan API pengekstrakan sijil dan notifikasi amaran.
- **Vite:** Alat pembina (*build tool*) berprestasi tinggi untuk pembangunan web pantas.
- **@google/genai SDK:** Pustaka rasmi untuk berinteraksi dengan model Gemini 2.5 Flash bagi mendigitalkan dokumen sijil luar.
- **QRCode:** Pustaka penjanaan kod QR pantas untuk label fizikal instrumen.
- **Lucide React:** Ikon teknikal makmal yang jelas dan seragam.

---

## Maklum Balas & Bantuan

Sekiranya anda menemui sebarang isu atau ingin mencadangkan penambahbaikan:
1. Sila buka tiket laporan melalui menu **GitHub Issues** pada repositori ini.
2. Sertakan tangkapan skrin dan langkah-langkah yang membawa kepada isu tersebut untuk memudahkan semakan teknikal.
