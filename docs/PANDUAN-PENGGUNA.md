# Panduan Pengguna LabCalibre

Panduan ini menerangkan cara menggunakan sistem **LabCalibre** langkah demi langkah bagi setiap fungsi dan peranan di makmal.

---

## 1. Memahami Peranan Pengguna (Role-Based Access Control)

Di bahagian paling atas aplikasi (pada bar status hitam), terdapat suis peranan untuk simulasi kerja:

| Peranan | Kod Sistem | Tanggungjawab Utama | Kebenaran Khas |
| :--- | :---: | :--- | :--- |
| **Lab Operator** | `OPR-L1` | Merekod verifikasi harian, muat naik sijil luar, imbas kod QR. | Boleh rekod, tetapi **tidak boleh meluluskan** rekod sendiri. |
| **Quality Supervisor** | `SPV-QA` | Menyemak barisan rekod, mengesahkan ketepatan metrologi, mengurus kuarantin. | Boleh meluluskan (*Approve*) atau menolak (*Reject*) rekod; boleh menyahkuarantin alat. |
| **Compliance Officer** | `OFF-AUDIT` | Memantau kepatuhan makmal secara makro, audit berkala, eksport laporan. | Boleh melihat semua rekod, mengeksport CSV audit, dan meluluskan semakan akhir. |

---

## 2. Papan Pemuka Makmal (Operations Center Dashboard)

Papan pemuka ialah skrin utama yang merumuskan status makmal semasa:

1. **Jalur Amaran Kuarantin (Merah):**
   - Muncul secara automatik sekiranya ada alat yang gagal ujian toleransi.
   - Menunjukkan nama alat yang dilarang daripada operasi makmal.
2. **Kadar Kepatuhan Makmal (Compliance Rate):**
   - Menunjukkan peratusan instrumen yang berada dalam tempoh sah kalibrasi.
3. **4 Butang Pintasan Operasi:**
   - **Scan QR Code Tag:** Membuka kamera pengimbas kod QR.
   - **Daily Verification:** Membuka meja ujian penentusahan harian.
   - **Upload External Cert:** Memuat naik sijil penentukuran tahunan dari makmal luar.
   - **Approval Queue:** Pergi ke senarai rekod yang menunggu tindakan penyelia.
4. **Jadual Horizon Kalibrasi (Schedule Horizon):**
   - Mengkategorikan instrumen yang menghampiri tarikh luput kalibrasi mengikut tetingkap kritikal: $\le 7$ hari (merah), $\le 14$ hari (kuning), dan $\le 30$ hari (kelabu).

---

## 3. Langkah Demi Langkah: Verifikasi Harian (Daily Routine Verification)

Gunakan modul ini setiap pagi sebelum memulakan analisis sampel.

1. Klik butang **Daily Verification** di papan pemuka atau klik butang **Verify** pada mana-mana instrumen di senarai alat.
2. **Pilih Instrumen:** Pilih alat yang ingin diuji (contoh: `Analytical Balance (Mettler Toledo) - LGM/B1`).
3. **Semak Nilai Piawai ($X_0$):**
   - Sistem akan memaparkan nilai rujukan benchmark yang telah ditetapkan (contohnya jisim standard `100.0000 g`).
   - Had toleransi yang dibenarkan turut dipaparkan (contoh: $\pm 0.0002\text{ g}$).
4. **Masukkan Bacaan Sebenar ($X_{\text{meas}}$):**
   - Letakkan jisim standard di atas penimbang. Baca nilai pada paparan alat dan taipkan nilai tersebut (contoh: `100.0001`).
5. **Perhatikan Tolok Toleransi Visual (Gauge Needle):**
   - **Zon Hijau (Dalam Had):** Jarum berada di tengah; status menunjukkan **PASS / LULUS**.
   - **Zon Merah (Luar Had):** Jarum beralih ke luar garisan sempadan $\pm \text{Limit}$; status bertukar menjadi **FAIL / GAGAL**.
6. **Catatan Operasi:** Taip nota ringkas (contoh: *Ujian rutin harian menggunakan jisim standard Kelas E2. Penimbang stabil.*).
7. **Simpan Rekod:**
   - Jika **LULUS**: Rekod disimpan dan dihantar ke barisan kelulusan Penyelia.
   - Jika **GAGAL**: Sistem serta-merta mengaktifkan amaran **Auto-Quarantine**, mengubah status alat kepada *Out of Service*, dan menghantar e-mel kecemasan kepada penyelia.

---

## 4. Langkah Demi Langkah: Muat Naik Sijil Luar (External Calibration)

Gunakan modul ini apabila instrumen telah selesai menjalani penentukuran tahunan oleh makmal luar (contohnya METCAL, SIRIM, atau NMIM).

1. Klik butang **Upload External Cert** di papan pemuka.
2. **Pilih Fail:** Muat naik fail sijil berformat PDF atau imej.
   - *Petua Pantas:* Anda boleh mengklik mana-mana satu daripada 3 butang sampel (*Preset Sample Certificates*) untuk menguji fungsi ini tanpa memerlukan fail peribadi.
3. **Pengekstrakan Berasaskan AI:**
   - Sistem memaparkan proses digitasi selama kira-kira 2 hingga 3 saat.
   - Maklumat seperti **Nombor Sijil**, **Nama Agensi Penentukuran**, **Tarikh Kalibrasi**, dan **Tarikh Luput Baharu** akan terisi secara automatik.
4. **Semakan Draf:** Operator boleh menyemak dan membetulkan sebarang maklumat sekiranya perlu.
5. **Hantar untuk Kelulusan:** Klik **Submit Certificate Record**. Apabila diluluskan oleh Penyelia, tarikh luput kalibrasi instrumen dalam senarai inventori akan dikemas kini secara automatik (+1 tahun).

---

## 5. Mengimbas & Mencetak Label Kod QR

1. **Mengimbas Kod QR:**
   - Klik **Scan QR Code Tag** di papan pemuka.
   - Benarkan pelayar mengakses kamera telefon atau komputer riba anda.
   - Halakan kamera ke arah label kod QR instrumen.
   - Sistem akan mengecam kod QR dalam masa kurang daripada 3 saat dan membuka profil alat tersebut secara terus.
   - *Alternatif:* Anda juga boleh menaip ID alat secara manual atau menekan butang tag contoh (*Instant Test Tag*) pada skrin imbasan.
2. **Mencetak Label Makmal:**
   - Buka profil instrumen.
   - Di kotak **Official Metrology Tag**, klik butang **Download PNG** untuk menyimpan gambar kod QR, atau klik **Print Tag** untuk mencetak label fizikal menggunakan pencetak label.

---

## 6. Mengurus Senarai Induk Penimbang LGM UPKS 2026

LabCalibre dilengkapi senarai induk rasmi 12 penimbang saintifik Lembaga Getah Malaysia (UPKS).

1. Pergi ke tab **Instrument Database**.
2. Di bahagian atas, terdapat bar maklumat **Official LGM UPKS Master List (2026)** yang disediakan oleh *Mohd Fandi bin Mohd Sukri (fendy)*.
3. **Lihat Lembaran Asal:** Klik butang **View Master List Sheet** untuk melihat jadual 12 penimbang asal berserta lokasi makmal dan tarikh kalibrasi METCAL.
4. **Muat Turun CSV:** Dalam tetingkap lembaran tersebut, klik **Download Master List CSV** untuk mendapatkan fail CSV mentah.
5. **Import Fail Baharu:** Klik butang **Import / Sync CSV** untuk menampal atau memuat naik fail CSV senarai induk baharu mengikut format yang ditetapkan.
6. **Segerak Semula (Re-sync):** Klik butang **Sync Master List** sekiranya anda ingin memulihkan semula rekod 12 penimbang rasmi tersebut ke dalam pangkalan data.

---

## 7. Maksud Status dan Label Penting

| Label Status | Warna | Maksud Operasi Makmal | Tindakan Diperlukan |
| :--- | :---: | :--- | :--- |
| **Active (Pass)** | Hijau | Instrumen berada dalam keadaan baik, bacaan verifikasi dalam toleransi, dan kalibrasi tahunan masih sah. | Boleh digunakan untuk ujian dan analisis harian. |
| **Due Soon / Pending Cal** | Kuning / Jingga | Tarikh penentukuran tahunan bakal luput dalam tempoh $\le 30$ hari atau belum mempunyai tarikh kalibrasi (seperti `LGM/B8`). | Hubungi vendor penentukuran (contoh: METCAL) untuk menjadualkan kalibrasi. |
| **Out of Service (Quarantined)** | Merah | Instrumen telah **gagal** ujian verifikasi toleransi harian atau sijil penentukurannya ditolak. | **DILARANG DIGUNAKAN.** Tampal label amaran fizikal dan jalankan penyelenggaraan pembetulan. |

---

## 8. Aliran Kelulusan Penyelia (Supervisor Approval Queue)

1. Tukar peranan kepada **Quality Supervisor (SPV-QA)** melalui suis peranan di bar atas.
2. Pergi ke tab **Pending Approvals**.
3. Klik **Review** pada mana-mana rekod ujian yang dihantar oleh operator.
4. Semak bacaan sebenar, nilai sisihan, dan had toleransi.
5. Klik **Approve** (Lulus) berserta ulasan ringkas, atau klik **Reject** (Tolak) sekiranya kaedah ujian tidak mematuhi Prosedur Operasi Standard (SOP).
6. Rekod kelulusan disimpan kekal dalam log jejak audit makmal.

---

## 9. Eksport Log Audit & Cetakan Laporan ISO 17025

1. Pergi ke tab **Audit Logs**.
2. Gunakan bar carian atau penapis tarikh/jenis ujian untuk mencari rekod tertentu.
3. Klik butang **Export CSV** untuk memuat turun data audit dalam format fail hamparan (*spreadsheet*) dengan format pengekodan UTF-8 BOM.
4. Klik butang **Print Report** untuk memaparkan lembaran laporan kalibrasi rasmi berformat cetakan A4 yang kemas tanpa elemen antaramuka web.

---

## 10. Penyelesaian Masalah Biasa (Troubleshooting)

- **Kamera tidak berfungsi semasa imbasan QR:** Pastikan anda telah menekan butang *Allow* pada tetingkap kebenaran pelayar web untuk mengakses kamera. Jika menggunakan komputer meja tanpa kamera, gunakan carian ID manual di bawah kotak imbasan.
- **Bacaan salah dimasukkan dan alat terkuarantin secara tidak sengaja:** Tukar peranan kepada *Quality Supervisor*, buka profil alat tersebut, dan klik butang hijau **Reactivate Instrument** selepas mengesahkan bacaan pembetulan.
- **Data hilang selepas pelayar dibersihkan:** Data demo semasa disimpan dalam simpanan tempatan pelayar (*localStorage*). Anda boleh memulihkan data asal pada bila-bila masa dengan menekan butang **Sync Master List** di tab senarai instrumen.
