# Status Pembangunan & Perancangan Masa Depan (Status & Roadmap)

Dokumen ini menyatakan secara telus tahap kesiapan sistem **LabCalibre**, membezakan perkara yang telah dibina, perkara yang telah diuji, batasan semasa, dan perancangan masa hadapan.

---

## 1. Status Pembangunan Semasa (Tahap MVP / Fasa 1)

Sistem kini berada pada status **MVP Lengkap & Berfungsi Sepenuhnya (Production-Ready Prototype)** untuk kegunaan stesen kerja makmal (*lab workstation*).

```
[✓] Reka Bentuk Workstation Klinikal (UI/UX)
[✓] Log Masuk & Kawalan Kuasa Pengguna (RBAC)
[✓] Kalkulator Toleransi Metrologi Harian
[✓] Kuarantin Automatik & Amaran Kecemasan
[✓] Aliran Kelulusan Penyelia (Approval Queue)
[✓] Imbasan & Penjanaan Kod QR Tag Makmal
[✓] Pengekstrakan Sijil AI (Server API Endpoint)
[✓] Integrasi Senarai Induk Penimbang LGM UPKS (12 Balances)
[✓] Log Jejak Audit & Eksport CSV / Cetakan Laporan
```

---

## 2. Perincian: Dibina vs Diuji

Bagi memastikan integriti dokumentasi teknikal, status dibahagikan kepada dua kategori:

### A. Komponen yang Telah Dibina & Telah Diuji (Verified & Tested)
1. **Pengiraan Sisihan & Had Toleransi Metrologi:**
   - *Status Ujian:* Lulus ujian pengiraan automatik $\Delta = |X_{\text{meas}} - X_0|$. Bacaan melebihi had (contoh: meter pH $7.08$ vs standard $7.00 \pm 0.02$) terbukti mengunci status kepada `FAIL` tanpa peluang campur tangan manual.
2. **Penguatkuasaan Kuarantin Serta-Merta (*Auto-Quarantine Trigger*):**
   - *Status Ujian:* Lulus. Apabila ujian gagal, lencana instrumen serta-merta bertukar menjadi *Out of Service (Quarantined)*, jalur amaran merah dipaparkan di papan pemuka, dan rekod kuarantin dicatat dalam log audit.
3. **Penyekatan Kuasa Peranan (*RBAC Enforcement*):**
   - *Status Ujian:* Lulus. Pemegang peranan Operator tidak mempunyai akses kepada butang *Approve* atau *Reject* dalam barisan kelulusan. Percubaan meluluskan rekod sendiri disekat.
4. **Pencegahan Rekod Berganda (*Anti-Duplicate Check*):**
   - *Status Ujian:* Lulus. Percubaan mendaftarkan rekod verifikasi atau sijil yang sama bagi instrumen dan tarikh yang serupa disekat dengan notis ralat yang jelas.
5. **Integrasi Senarai Induk LGM UPKS 2026:**
   - *Status Ujian:* Lulus. 12 unit penimbang rasmi (`LGM/SW1`, `LGM/B1` hingga `LGM/B11`) berjaya diekstrak daripada fail lampiran dan dimuatkan ke dalam pangkalan data sistem.
6. **Penjanaan & Imbasan Kod QR:**
   - *Status Ujian:* Lulus imbasan kamera langsung pada pelayar web serta sokongan muat turun fail imej PNG untuk label fizikal.
7. **Pengekodan Eksport CSV:**
   - *Status Ujian:* Lulus. Fail CSV yang dimuat turun mengandungi pengekodan UTF-8 BOM dan dibuka dengan betul di Microsoft Excel tanpa aksara rosak.

### B. Komponen yang Masih Disimulasikan / Belum Disahkan Sepenuhnya (Simulated / Unverified)
1. **Penghantaran E-mel Luar Sebenar (Outbound Corporate SMTP Relay):**
   - *Status Semasa:* Notifikasi amaran kecemasan diproses melalui endpoint backend Express (`/api/notifications/emergency-email`) dan disimpan dalam log sistem. Penghantaran ke peti mel luar sebenar (`lab-supervisors@syarikat.com` / `@lgm.gov.my`) memerlukan konfigurasi pelayan SMTP atau integrasi API Google Workspace Gmail dengan kelayakan produksi.
2. **Pengekstrakan Fail PDF Berimbas Rendah (OCR Raw Image Quality):**
   - *Status Semasa:* Telah disahkan berfungsi lancar dengan dokumen teks PDF dan preset sampel SIRIM/METCAL. Ujian ke atas imej sijil tulisan tangan atau imbasan beresolusi rendah masih belum dijalankan secara menyeluruh.

---

## 3. Isu Diketahui & Batasan Teknikal (Known Limitations)

1. **Penyimpanan Data Tempatan Pelayar (*Browser LocalStorage*):**
   - Buat masa ini, data instrumen dan rekod verifikasi disimpan di dalam memori pelayar peranti pengguna. Sekiranya pelayar dibersihkan (*clear cache*), data akan kembali ke data lalai (senarai induk LGM asal).
   - Pengguna berbilang peranti belum berkongsi data secara masa nyata tanpa penyambungan pangkalan data berpusat.
2. **Kamera Web Bergantung pada Kebenaran Pelayar:**
   - Imbasan kod QR memerlukan peranti yang dilengkapi kamera dan pengguna mesti membenarkan akses kamera (*browser camera permission*).

---

## 4. Perancangan Masa Hadapan (Roadmap)

Perancangan ini tidak terikat dengan tarikh siap yang direka-reka, sebaliknya disusun mengikut keutamaan teknikal:

### Fasa 2: Pengukuhan Pangkalan Data Berpusat & Integrasi Cloud
- [ ] Menyambungkan pangkalan data berpusat (Cloud SQL PostgreSQL atau Firebase Firestore) untuk penyelarasan merentas semua komputer makmal secara masa nyata.
- [ ] Mengaktifkan integrasi Google Workspace OAuth rasmi untuk log masuk automatik akaun staf `@lgm.gov.my`.
- [ ] Menghubungkan servis penghantaran e-mel sebenar (Google Workspace Gmail API / SendGrid) bagi notifikasi amaran kuarantin dalam tempoh $\le 1$ minit.

### Fasa 3: Kesalinghubungan Perkakasan Makmal (Hardware & IoT Integration)
- [ ] Menyokong sambungan langsung port bersiri (RS232 / USB) daripada penimbang analitikal (Mettler Toledo, Sartorius) ke pelayar menggunakan Web Serial API bagi merekod bacaan tanpa sentuhan manual (*direct data acquisition*).
- [ ] Sokongan mod luar talian (*Progressive Web App - PWA*) bagi membolehkan operator makmal merekod bacaan di bilik kebuk bersih tanpa sambungan internet.

### Fasa 4: Analitis Metrologi & Trend Drift
- [ ] Menjana graf garis sisihan sejarah (*Historical Drift Chart*) bagi memantau kemerosotan kestabilan penimbang dari semasa ke semasa mengikut garis panduan OIML R76.
