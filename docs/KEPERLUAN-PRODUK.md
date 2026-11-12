# Spesifikasi Keperluan Produk (Product Requirements Document - PRD)

Dokumen ini merumuskan keperluan fungsian, peraturan bisnes, dan kriteria penerimaan bagi sistem **LabCalibre**, berdasarkan dokumen PRD asal (`LabCalibre_PRD__1__49b896cf.pdf`) serta fail senarai induk penimbang rasmi (`2026_Masterlist_Balance_-_Periodic_Verification__Backup_1__1__b4243024`).

---

## 1. Tujuan Produk & Objektif

**LabCalibre** dibangunkan untuk menggantikan sistem pencatatan manual berasaskan kertas di makmal pengujian dan kalibrasi saintifik. Matlamat utamanya ialah:
1. Memastikan pematuhan piawaian **MS ISO/IEC 17025:2017** (*General requirements for the competence of testing and calibration laboratories*).
2. Menghapuskan risiko kesilapan manusia dalam pengiraan sisihan metrologi.
3. Menghalang penggunaan alat yang tidak tepat secara serta-merta melalui kuarantin automatik.
4. Menyediakan jejak audit digital (*digital audit trail*) yang kalis pertikaian semasa sesi audit kualiti akreditasi.

---

## 2. Pengguna Sasaran & Matriks Akses (RBAC)

Sistem menetapkan tiga peranan utama dengan had kuasa tertentu:

| Keupayaan Sistem | Lab Operator (`OPR-L1`) | Quality Supervisor (`SPV-QA`) | Compliance Officer (`OFF-AUDIT`) |
| :--- | :---: | :---: | :---: |
| **Log masuk berasaskan domain korporat** | Ya | Ya | Ya |
| **Merekod verifikasi harian (Internal)** | Ya | Ya | Ya |
| **Muat naik sijil kalibrasi luar (External)** | Ya | Ya | Ya |
| **Imbas kod QR instrumen** | Ya | Ya | Ya |
| **Melihat profil instrumen & sejarah ujian** | Ya | Ya | Ya |
| **Melulus / menolak rekod verifikasi** | **Tidak (Ditegah)** | **Ya** | **Ya** |
| **Mengaktifkan semula alat terkuarantin** | **Tidak (Ditegah)** | **Ya** | **Ya** |
| **Eksport data audit lengkap (CSV / Cetakan)** | Terhad | Ya | **Ya** |
| **Penyelenggaraan senarai induk instrumen** | Lihat Sahaja | Tambah / Kemas Kini | Penuh |

---

## 3. Senarai Keperluan Fungsian MVP (Functional Requirements)

### FR-001: Pengesahan Pengguna (Authentication)
- Sistem hanya membenarkan akses kepada staf yang menggunakan alamat e-mel korporat rasmi berdomain `@syarikat.com` atau `@lgm.gov.my`.
- Akses daripada domain awam luar dinafikan secara automatik.

### FR-002 & FR-003: Formula Toleransi Metrologi & Verifikasi Harian
- Nilai benchmark standard dinyatakan sebagai $X_0$ (contoh: jisim piawai $100.0000\text{ g}$).
- Operator memasukkan bacaan sebenar pada instrumen, $X_{\text{meas}}$.
- Sisihan dikira secara automatik:
  $$\Delta = |X_{\text{meas}} - X_0|$$
- **Peraturan Lulus/Gagal Automatik (FR-004):**
  - Jika $\Delta \le \text{Had Toleransi}$: Status ialah **PASS (LULUS)**.
  - Jika $\Delta > \text{Had Toleransi}$: Status ialah **FAIL (GAGAL)**.
  - *Peraturan Bisnes Kritis:* Keputusan sistem **tidak boleh diubah secara manual** oleh operator jika bacaan gagal.

### FR-005: Kuarantin Automatik & Notifikasi Amaran (Auto-Quarantine)
- Sekiranya keputusan ujian adalah **FAIL**:
  1. Status instrumen ditukar serta-merta kepada `out_of_service` (*Quarantined*).
  2. Cap masa kuarantin dan sebab kegagalan direkodkan.
  3. Amaran kecemasan dipaparkan di bahagian atas antaramuka.
  4. Amaran e-mel automatik dihantar kepada penyelia makmal dalam masa $\le 1$ minit.

### FR-006: Pengekstrakan Sijil Luar Menggunakan AI
- Membolehkan muat naik sijil penentukuran tahunan dari makmal luar terakreditasi SAMM (contoh: METCAL, SIRIM, NMIM).
- Menggunakan kecerdasan buatan (Gemini AI API) untuk mengekstrak metadata sijil: nombor sijil, agensi pengeluar, tarikh penentukuran, dan ketakpastian pengukuran.

### FR-007: Pemantauan Jadual Kalibrasi (Schedule Horizon)
- Mengira baki hari sebelum tarikh luput sijil penentukuran:
  - **$\le 7$ Hari:** Tahap Kritikal (Merah).
  - **$\le 14$ Hari:** Tahap Amaran Awal (Kuning).
  - **$\le 30$ Hari:** Tahap Peringatan Rutin (Kelabu).
  - **Instrumen Belum Dikalibrasi:** Ditandakan sebagai *Action Required / Pending Schedule* (contoh: `LGM/B8`).

### FR-008: Aliran Kelulusan Penyelia (Approval Workflow)
- Semua rekod verifikasi harian dan sijil luar masuk ke barisan `Pending Approvals`.
- Hanya Penyelia Kualiti atau Pegawai Pematuhan dibenarkan menyemak dan memberi status `Approved` atau `Rejected`.
- Sebarang penolakan memerlukan justifikasi bertulis dalam log audit.

### FR-009: Log Jejak Audit Kekal (Permanent Audit Trail)
- Rekod yang telah diluluskan tidak boleh dipadam atau diubah suai.
- Setiap entri mengandungi: ID Rekod, Tarikh/Masa, Nama Operator, Bacaan Standard, Bacaan Sebenar, Sisihan, Status, Nama Penyelia yang Meluluskan, dan Ulasan Semakan.

### FR-010: Penjejakan & Pengecaman Kod QR Makmal
- Setiap instrumen dijana kod QR khas (`LAB-QR-[ID]`).
- Pengimbas kamera mengecam tag kod QR dalam tempoh kurang dari 3 saat dan memaparkan profil teknikal alat.

### FR-011: Laporan Kepatuhan & Eksport CSV
- Membolehkan eksport log audit dalam format fail CSV dengan pengekodan UTF-8 BOM untuk keserasian Microsoft Excel.
- Menyediakan reka letak cetakan lembaran laporan A4 (*Print CSS*) mengikut format dokumentasi ISO/IEC 17025.

### FR-012: Pengurusan Inventori & Pemadaman Lembut (Soft Delete)
- Instrumen yang tidak lagi aktif tidak dipadam secara kekal dari pangkalan data bagi memelihara rekod ujian masa lalu (*soft delete* dengan bendera `isActive = false`).

### FR-013: Perlindungan Rekod Berganda (Anti-Duplicate Record Rule)
- Menghalang pendaftaran dua sijil atau verifikasi untuk instrumen yang sama pada tarikh dan jenis ujian yang serupa bagi mengelakkan kekeliruan audit.

### FR-014: Integrasi Senarai Induk LGM UPKS 2026
- Menyepadukan senarai 12 penimbang saintifik Lembaga Getah Malaysia lengkap dengan kod rujukan (`LGM/SW1`, `LGM/B1` hingga `LGM/B11`), nama operator, lokasi bilik makmal, dan agensi penentukuran METCAL.

---

## 4. Kriteria Penerimaan MVP (Acceptance Criteria)

1. **Ketepatan Metrologi:** Sisihan $\Delta$ dikira dengan ketepatan perpuluhan yang sepadan dengan resolusi alat (sehingga 5 tempat perpuluhan bagi penimbang mikro).
2. **Kekebalan Kuarantin:** Tiada kaedah memintas (*bypass*) status kuarantin tanpa campur tangan dan pengesahan semula oleh Penyelia Kualiti.
3. **Pemisahan Kuasa:** Percubaan meluluskan rekod sendiri oleh pemegang peranan Operator disekat dengan mesej *Access Denied*.
4. **Keterbacaan Audit:** Semua data audit boleh dieksport tanpa aksara rosak (*mojibake*) menggunakan pengekodan UTF-8.

---

## 5. Dokumen Rujukan Asal

- **Spesifikasi PRD Lengkap:** Disimpan dalam fail PDF di `/public/assets/aistudio/LabCalibre_PRD__1__49b896cf.pdf` *(LabCalibre PRD (1).pdf)*.
- **Fail Senarai Induk Penimbang:** Disimpan di `/public/assets/aistudio/2026_Masterlist_Balance_-_Periodic_Verification__Backup_1__1__b4243024` *(UPKS LGM Balance Masterlist)*.
