import type { Toolkit } from '../data/toolkits'
import { TEMPLATES } from '../data/templates'

export type Style = 'sederhana' | 'profesional'
export interface Opt { style: Style; tpl: number; foto: boolean }
export const DEF: Opt = { style: 'sederhana', tpl: 3, foto: true }
// Toolkit yang menghasilkan CV jadi (memakai template + PDF)
export const HAS_TEMPLATE = new Set([5, 6])

const STYLE: Record<Style, string> = {
  sederhana: 'Gaya bahasa: sederhana. Pakai kalimat pendek dan kata sehari-hari yang mudah dipahami anak muda, hindari istilah rumit, tetap sopan dan jelas.',
  profesional: 'Gaya bahasa: profesional. Pakai bahasa Indonesia formal seperti di dunia kerja, padat, dan percaya diri tanpa berlebihan.',
}

export function buildPrompt(t: Toolkit, v: Record<string, string>, o: Opt): string {
  let p = t.role + '\n\n' + t.lead
  if (t.tasks.length) {
    p += (t.id === 1 || t.id === 2 ? '\n\nTugas:\n' : '\n') + t.tasks.map((x, i) => i + 1 + '. ' + x).join('\n')
  }
  if (t.extra) p += '\n\n' + t.extra
  p += '\n\nKetentuan:\n' + [...t.rules, STYLE[o.style]].map((r) => '- ' + r).join('\n')
  p += '\n\n' + t.dh + ':\n' + t.f.map((f) => f.k + ':\n' + ((v[f.k] || '').trim() || '(belum diisi)')).join('\n\n')
  p += '\n\n' + t.tail
  if (HAS_TEMPLATE.has(t.id)) {
    const tp = TEMPLATES.find((x) => x.id === o.tpl) ?? TEMPLATES[0]
    const showFoto = o.foto && tp.foto
    p += '\n\nFormat hasil akhir (PDF):\nSetelah isi CV selesai, ubah menjadi file PDF siap kirim dengan ketentuan:\n'
      + '- Ukuran A4, 1 halaman (maksimal 2 halaman jika pengalaman banyak).\n'
      + '- Desain simpel dan elegan, mengikuti template "' + tp.name + '": ' + tp.desc + '\n'
      + (showFoto ? '- Sediakan area foto profil (beri tanda [Foto] karena saya akan menambahkan fotonya sendiri).\n' : '- Jangan tampilkan foto. Susun tata letak tanpa kotak foto.\n')
      + '- Teks harus berupa teks asli (bukan gambar), font bersih, ukuran minimal 10 pt, agar mudah dibaca dan ramah ATS. Hindari tabel rumit.\n'
      + '- Jika kamu bisa membuat file, berikan PDF yang bisa diunduh. Jika tidak bisa, buatkan satu halaman HTML lengkap dengan CSS cetak ukuran A4 yang bisa saya simpan sebagai PDF lewat Cetak > Simpan sebagai PDF.\n'
      + '- Jangan menambah informasi yang tidak saya berikan. Jika ada data kosong, lewati bagian itu.'
  }
  return p
}
