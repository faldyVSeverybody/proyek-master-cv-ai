# AI CV MASTER TOOLKIT

Web pendamping e-book AI CV MASTER GUIDE: 7 AI Toolkit, 6 template CV, mode putih/gelap, dan halaman e-book gratis. Tanpa server, data tidak dikirim ke mana pun.

## Menjalankan
1. Pasang Node.js LTS. 2. `npm install` 3. `npm run dev` lalu buka http://localhost:5173
Build untuk publikasi: `npm run build` (hasil di folder `dist`). Publikasi: seret `dist` ke https://app.netlify.com/drop, atau impor repo GitHub ke Vercel.

## Di mana menaruh gambar, video, dan e-book
| Isi | Folder | Nama file |
|---|---|---|
| Video bagian atas | `public/media/videos/` | `video4.mp4` |
| Gambar | `public/media/images/` | `logo.png`, `pict1.jpg` (pengenalan), `pict2.jpg` (e-book) |
| Pratinjau template CV | `public/media/templates/` | `template-1.jpg` ... `template-6.jpg` |
| E-book PDF | `public/media/ebook/` | `ebook-cv-ats-friendly.pdf` |

Ingin memakai nama file lain? Ubah di `src/data/videos.ts` dan `src/data/media.ts`. Jika file belum ada, situs tetap tampil normal dengan tampilan cadangan.

## Mengubah isi
| Yang diubah | File |
|---|---|
| Prompt, kolom formulir, tujuh toolkit | `src/data/toolkits.ts` |
| Template CV (nama, gambaran tata letak) | `src/data/templates.ts` |
| Susunan prompt, gaya bahasa, instruksi PDF | `src/lib/prompt.ts` |
| Teks halaman | `src/App.tsx` |
| Warna putih/gelap | `src/index.css` (bagian atas `:root`) |
