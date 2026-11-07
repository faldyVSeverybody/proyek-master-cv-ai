import { useEffect, useRef, useState, type ReactNode } from 'react'
import { VIDEOS } from '../data/videos'

interface Props { id: string; className?: string; eager?: boolean; children?: ReactNode }

// Video dekoratif: muted, loop, playsInline. Dimuat hanya jika ada file, terlihat di layar (lazy),
// tidak dimuat saat "kurangi gerakan" atau "hemat data" aktif. Jika gagal, ilustrasi cadangan tetap tampil.
export default function VideoFrame({ id, className = '', eager = false, children }: Props) {
  const v = VIDEOS[id]
  const box = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)
  const [fail, setFail] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!v?.src) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true
    if (reduce || saveData) return
    if (eager) { setLoad(true); return }
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setLoad(true); io.disconnect() }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [v, eager])

  return (
    <div ref={box} className={'vf ' + className}>
      <div className="vf-fallback" style={v?.poster ? { backgroundImage: `url(${v.poster})` } : undefined}>{children}</div>
      {load && !fail && v?.src && (
        <video className={ready ? 'on' : ''} src={v.src} poster={v.poster} muted loop autoPlay playsInline preload="none"
          aria-hidden="true" tabIndex={-1} onCanPlay={() => setReady(true)} onError={() => setFail(true)} />
      )}
    </div>
  )
}
