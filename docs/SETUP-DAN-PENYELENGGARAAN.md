# Panduan Pemasangan & Penyelenggaraan (Setup & Maintenance)

Dokumen ini menyediakan panduan teknikal langkah demi langkah untuk menjalankan kod sumber **LabCalibre** di komputer tempatan (*local machine*), membina fail pengeluaran, serta menyambungkannya ke repositori GitHub baharu.

---

## 1. Keperluan Sistem (Prerequisites)

Sebelum memulakan, pastikan komputer anda telah dipasang dengan perisian berikut:
- **Node.js:** Versi `20.x` LTS atau `22.x` ke atas ([Muat turun Node.js](https://nodejs.org/)).
- **npm:** Versi `10.x` ke atas (disertakan bersama pemasangan Node.js).
- **Git:** Versi `2.30` ke atas ([Muat turun Git](https://git-scm.com/)).
- **Pelayar Web Moden:** Google Chrome, Microsoft Edge, atau Mozilla Firefox dengan sokongan kamera web.

---

## 2. Pemasangan Pakej Bergantung (Dependencies)

Buka aplikasi terminal atau *Command Prompt* di dalam direktori projek dan jalankan:

```bash
# Memasang semua pakej yang tersenarai dalam package.json
npm install
```

Perintah ini akan memasang pakej-pakej utama seperti React 19, TypeScript, Express, Tailwind CSS, `@google/genai`, dan pustaka penjanaan kod QR.

---

## 3. Konfigurasi Pembolehubah Persekitaran (Environment Variables)

Salin fail contoh `.env.example` kepada `.env`:

```bash
cp .env.example .env
```

Buka fail `.env` menggunakan penyunting teks dan konfigurasikan pembolehubah berikut sekiranya berkaitan:

```ini
# GEMINI_API_KEY: Diperlukan untuk ekstraksi teks sijil kalibrasi AI.
# Boleh didapati secara percuma melalui Google AI Studio (https://aistudio.google.com).
GEMINI_API_KEY="kunci_api_gemini_anda_di_sini"

# APP_URL: URL hos aplikasi (lalai pembangunan tempatan ialah http://localhost:3000)
APP_URL="http://localhost:3000"
```

*Nota: Jika kunci API tidak diisi, sistem tetap berfungsi dan akan menggunakan data simulasi/sampel secara automatik.*

---

## 4. Menjalankan Pelayan Pembangunan (Development Server)

Untuk memulakan aplikasi dalam mod pembangunan dengan pelayan Express + Vite:

```bash
npm run dev
```

- Pelayan akan dimulakan pada port **3000**.
- Buka pelayar web anda dan layari: `http://localhost:3000`.

---

## 5. Ujian Kod & Semakan Jenis Data (Type-Checking & Linting)

Sebelum membuat sebarang komit atau penyerahan kod, jalankan semakan kualiti TypeScript:

```bash
# Memastikan tiada ralat sintaks atau percanggahan jenis data
npm run lint
```

---

## 6. Pembinaan Versi Pengeluaran (Production Build)

Untuk membina aset web yang dioptimumkan untuk pengeluaran:

```bash
# Membina fail statik ke dalam direktori dist/
npm run build

# Menjalankan pelayan pengeluaran
npm start
```

---

## 7. Panduan Menyambungkan Projek ke GitHub (GitHub Repository Setup)

Projek ini telah dibersihkan dan fail `.gitignore` telah dikonfigurasi untuk menghalang muat naik fail sementara seperti `node_modules/` dan fail rahsia `.env`.

Ikuti langkah mudah ini untuk mencipta repositori peribadi (*Private Repository*) anda di GitHub:

### Langkah A: Cipta Repositori di GitHub
1. Log masuk ke akaun GitHub anda di [https://github.com](https://github.com).
2. Di sudut atas kanan, klik ikon **`+`** dan pilih **New repository**.
3. **Repository name:** Taipkan `labcalibre` *(atau nama lain pilihan anda, contoh: `labcalibre-lgm`)*.
4. **Description:** `Sistem Pengurusan Kalibrasi & Penentusahan Instrumen Makmal (ISO/IEC 17025)`.
5. **Visibility:** Pilih **Private** *(disyorkan bagi melindungi data dalaman organisasi)*.
6. **Jangan** tanda kotak *Add a README file*, *Add .gitignore*, atau *Choose a license* (kerana fail-fail ini sudah disediakan dalam projek ini).
7. Klik butang hijau **Create repository**.

### Langkah B: Mulakan Git & Tolak Kod dari Komputer Anda
Di terminal komputer anda, jalankan perintah-perintah berikut:

```bash
# 1. Mulakan repositori git tempatan
git init

# 2. Tambah semua fail projek dan dokumentasi ke penjejakan git
git add .

# 3. Lakukan komit pertama
git commit -m "feat: initial commit of LabCalibre ISO 17025 metrology system and documentation"

# 4. Namakan cawangan utama sebagai main
git branch -M main

# 5. Sambungkan ke repositori GitHub anda (Gantikan USERNAME dengan nama akaun GitHub anda)
git remote add origin https://github.com/USERNAME/labcalibre.git

# 6. Muat naik kod ke GitHub
git push -u origin main
```

*Sekiranya GitHub meminta pengesahan, masukkan Personal Access Token (PAT) atau sahkan melalui pelayar web anda.*

---

## 8. Penyelesaian Masalah Biasa (Troubleshooting)

- **Ralat `Port 3000 is already in use`:**
  - Aplikasi lain sedang menggunakan port 3000. Tutup aplikasi tersebut atau hentikan proses lama sebelum memulakan semula dengan `npm run dev`.
- **Ralat `vite: command not found`:**
  - Pakej belum selesai dipasang. Jalankan `npm install` sekali lagi.
- **Ralat `node_modules` terlalu besar semasa push ke Git:**
  - Pastikan fail `.gitignore` berada di direktori punca projek. Jangan sesekali menjalankan perintah `git add node_modules/`.
