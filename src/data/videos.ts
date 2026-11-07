// Video dekoratif. Taruh file MP4 di public/media/videos lalu tulis nama file di sini.
// Jika file belum ada, situs otomatis memakai tampilan cadangan (tidak error).
export interface VideoItem { src?: string; poster?: string }

export const VIDEOS: Record<string, VideoItem> = {
  hero: { src: '/media/videos/video4.mp4' },
  penutup: {},
}
