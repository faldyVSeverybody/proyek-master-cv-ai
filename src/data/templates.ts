export interface Tpl { id: number; name: string; img: string; foto: boolean; note: string; desc: string }

// "desc" dikirim ke AI sebagai gambaran tata letak template.
export const TEMPLATES: Tpl[] = [
  { id: 1, name: 'Navy Modern', img: '/media/templates/template-1.jpg', foto: true, note: 'Elegan, dua kolom',
    desc: 'dua kolom. Kolom kiri berlatar navy berisi Tentang Saya, Kontak, Keahlian, dan Bahasa; kolom kanan berisi Pengalaman, Pendidikan, dan Referensi. Nama besar di kiri atas, foto oval di kanan atas. Warna navy dan putih.' },
  { id: 2, name: 'Charcoal Profesional', img: '/media/templates/template-2.jpg', foto: true, note: 'Tegas, sidebar gelap',
    desc: 'sidebar kiri berwarna abu gelap berisi foto, nama, jabatan, kontak, dan bahasa; kolom kanan putih berisi Profil, Pengalaman, Pendidikan, dan Keahlian. Judul bagian tebal dengan garis pendek di bawahnya.' },
  { id: 3, name: 'Klasik Rapi', img: '/media/templates/template-3.jpg', foto: true, note: 'Paling aman untuk ATS',
    desc: 'satu kolom bersih. Foto kecil dan nama di kiri atas, kontak satu baris di bawahnya. Judul bagian huruf kapital tebal dengan garis tipis (Tentang Saya, Pendidikan, Pengalaman, Sertifikat dan Pelatihan, Keterampilan), isi berupa poin-poin.' },
  { id: 4, name: 'Kreatif Merah', img: '/media/templates/template-4.jpg', foto: true, note: 'Menarik, untuk bidang kreatif',
    desc: 'gaya kreatif: judul dan nama besar di atas, foto bulat dengan latar warna, label bagian berbentuk kapsul merah, dan blok warna merah di bagian bawah untuk keterampilan dan kontak. Latar krem lembut.' },
  { id: 5, name: 'Minimalis Bingkai', img: '/media/templates/template-5.jpg', foto: false, note: 'Tanpa foto, sangat bersih',
    desc: 'satu kolom dengan bingkai tipis di tepi halaman. Nama besar di tengah atas, jabatan di bawahnya, kontak satu baris di antara dua garis. Bagian: Tentang Saya, Pendidikan, Pengalaman, Keterampilan (4 kolom poin), Referensi. Tanpa foto.' },
  { id: 6, name: 'Serif Elegan', img: '/media/templates/template-6.jpg', foto: true, note: 'Klasik dan hangat',
    desc: 'foto persegi di kiri atas, nama dengan huruf serif besar di kanan atas, jabatan huruf kapital renggang. Dua kolom: kiri berisi Kontak, Pendidikan, Keahlian; kanan berisi Ringkasan Profil dan Pengalaman Kerja. Warna hitam putih dengan aksen abu.' },
]
