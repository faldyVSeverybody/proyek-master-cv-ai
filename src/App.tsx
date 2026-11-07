import { useEffect, useRef, useState, type ReactNode } from 'react'
import { User, Briefcase, Sparkles, Search, FileText, ClipboardCheck, ListChecks, Copy, ExternalLink, Trash2, ArrowRight, Menu, X, CheckCircle2, AlertCircle, Sun, Moon, Download, Instagram } from 'lucide-react'
import VideoFrame from './components/VideoFrame'
import { CATS, T } from './data/toolkits'
import { TEMPLATES } from './data/templates'
import { IMAGES, LOGO, EBOOK_FILE, INSTAGRAM_URL, INSTAGRAM_NAME } from './data/media'
import { buildPrompt, DEF, HAS_TEMPLATE, type Opt, type Style } from './lib/prompt'

type Vals = Record<number, Record<string, string>>
type Toast = { t: string; k: 'ok' | 'err' | 'info' }

const ICONS: Record<number, ReactNode> = {
  1: <User size={22} />, 2: <Briefcase size={22} />, 3: <Sparkles size={22} />, 4: <Search size={22} />,
  5: <FileText size={22} />, 6: <ClipboardCheck size={22} />, 7: <ListChecks size={22} />,
}
const STEPS = ['Pilih fitur yang ingin kamu pakai.', 'Isi formulir dengan informasi yang benar.', 'Periksa preview prompt.', 'Tekan tombol Salin Prompt.', 'Buka ChatGPT atau Claude.', 'Tempel prompt dan ikuti arahan AI.', 'Periksa hasilnya sebelum dipakai untuk melamar kerja.']

function Pic({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [bad, setBad] = useState(false)
  if (bad) return <div className={'pic-fb ' + className} role="img" aria-label={alt} />
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setBad(true)} />
}

function Seg<K extends string>({ label, value, onChange, items }: { label: string; value: K; onChange: (v: K) => void; items: [K, string][] }) {
  return (
    <div>
      <label>{label}</label>
      <div className="seg" role="radiogroup" aria-label={label}>
        {items.map(([k, l]) => (
          <button key={k} type="button" role="radio" aria-checked={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<'home' | 'ebook'>('home')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('acm-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
  })
  const [cat, setCat] = useState(CATS[0])
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const [mode, setMode] = useState<'info' | 'form'>('form')
  const [vals, setVals] = useState<Vals>({})
  const [opts, setOpts] = useState<Record<number, Opt>>({})
  const [msg, setMsg] = useState<Toast | null>(null)
  const [nav, setNav] = useState(false)
  const [ask, setAsk] = useState(false)
  const [lastId, setLastId] = useState<number | null>(null)
  const [dl, setDl] = useState(false)
  const prev = useRef<HTMLTextAreaElement>(null)
  const timer = useRef<number>()
  const t = T.find((x) => x.id === openId)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('acm-theme', theme) } catch { /* abaikan */ }
  }, [theme])

  const toast = (m: string, k: Toast['k'] = 'ok') => {
    setMsg({ t: m, k })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(null), 3200)
  }
  const open = (id: number, m: 'info' | 'form') => {
    setOpenId(id); setMode(m); setAsk(false); setLastId(id)
    if (m === 'form') toast('Toolkit berhasil dibuka. Isi formulir lalu salin prompt.', 'info')
  }
  const close = () => setOpenId(null)
  const goto = (id: string) => {
    setNav(false); setPage('home')
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60)
  }
  const pickTpl = (id: number) => {
    const tp = TEMPLATES.find((x) => x.id === id)
    setOpts({ ...opts, 5: { ...DEF, ...opts[5], tpl: id, foto: tp?.foto === false ? false : (opts[5]?.foto ?? true) } })
    open(5, 'form')
  }

  useEffect(() => {
    document.body.style.overflow = openId ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [openId])

  const ql = q.trim().toLowerCase()
  const list = T.filter((x) => (cat === CATS[0] || x.cat === cat) && (!ql || (x.name + ' ' + x.desc + ' ' + x.fn).toLowerCase().includes(ql)))
  const v = (t && vals[t.id]) || {}
  const o: Opt = { ...DEF, ...(t ? opts[t.id] : {}) }
  const setOpt = (p: Partial<Opt>) => t && setOpts({ ...opts, [t.id]: { ...o, ...p } })
  const tpl = TEMPLATES.find((x) => x.id === o.tpl) ?? TEMPLATES[0]
  const done = t ? t.f.filter((f) => (v[f.k] || '').trim()).length : 0
  const prompt = t ? buildPrompt(t, v, o) : ''

  const copy = async () => {
    if (done === 0) return toast('Data belum lengkap. Isi minimal satu bagian formulir dulu supaya prompt berguna.', 'info')
    const okMsg = 'Prompt berhasil disalin! Silakan tempelkan ke ChatGPT atau Claude.'
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prompt)
        return toast(okMsg)
      }
      throw new Error('no clipboard')
    } catch {
      const el = prev.current
      if (!el) return
      el.focus(); el.select(); el.setSelectionRange(0, prompt.length)
      let ok = false
      try { ok = document.execCommand('copy') } catch { /* abaikan */ }
      toast(ok ? okMsg : 'Gagal menyalin otomatis. Teks di preview sudah terpilih: tekan Ctrl+C (atau tahan lalu pilih Salin).', ok ? 'ok' : 'err')
    }
  }

  const downloadEbook = async () => {
    setDl(true)
    try {
      const r = await fetch(EBOOK_FILE, { method: 'HEAD' })
      if (!r.ok || !(r.headers.get('content-type') || '').includes('pdf')) throw new Error('missing')
      const a = document.createElement('a')
      a.href = EBOOK_FILE; a.download = 'E-book-CV-ATS-Friendly.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      toast('E-book mulai diunduh. Selamat belajar!')
    } catch {
      toast('File e-book belum tersedia. Hubungi kami lewat Instagram ya.', 'err')
    } finally { setDl(false) }
  }

  const NAV: [string, string][] = [['beranda', 'Beranda'], ['toolkit', 'AI Toolkit'], ['template', 'Template CV'], ['panduan', 'Panduan']]

  return (
    <>
      <header><div className="wrap">
        <a className="brand" href="#beranda" onClick={(e) => { e.preventDefault(); goto('beranda') }}>
          <Pic src={LOGO} alt="" className="logo" /><span>AI CV MASTER <b>TOOLKIT</b></span>
        </a>
        <nav className={nav ? 'open' : ''}>
          {NAV.map(([id, l]) => <a key={id} href={'#' + id} onClick={(e) => { e.preventDefault(); goto(id) }}>{l}</a>)}
          <a href="#ebook" className={page === 'ebook' ? 'cur' : ''} onClick={(e) => { e.preventDefault(); setPage('ebook'); setNav(false); window.scrollTo(0, 0) }}>E-book Gratis</a>
        </nav>
        <div className="hbtns">
          <button className="icon" aria-label={theme === 'dark' ? 'Ganti ke mode putih' : 'Ganti ke mode gelap'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button id="burger" className="icon" aria-label="Menu" aria-expanded={nav} onClick={() => setNav(!nav)}>{nav ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div></header>

      {page === 'home' ? (
        <>
          <div className="hero" id="beranda">
            <VideoFrame id="hero" eager><div className="orb" /></VideoFrame>
            <div className="wrap hero-in">
              <div className="tag">AI CV MASTER GUIDE</div>
              <h1>CV Profesional Dimulai dari <span>Potensi</span> yang Kamu Miliki.</h1>
              <p className="lead">Jangan bingung menyusun CV dari nol. Kenali kemampuanmu, susun pengalaman, dan buat CV yang lebih profesional dengan bantuan AI.</p>
              <p className="support">7 AI Toolkit praktis untuk membantumu mempersiapkan CV, menyesuaikan diri dengan lowongan kerja, dan memeriksa kualitas CV sebelum melamar.</p>
              <div className="row">
                <button className="btn primary" onClick={() => open(1, 'form')}>Mulai Buat CV Saya <ArrowRight className="arr" size={18} /></button>
                <button className="btn ghost" onClick={() => goto('toolkit')}>Jelajahi Semua Toolkit</button>
              </div>
              <ul className="trust">
                <li><CheckCircle2 size={16} /> 7 AI Toolkit Praktis</li>
                <li><CheckCircle2 size={16} /> Mudah Digunakan Pemula</li>
                <li><CheckCircle2 size={16} /> Terintegrasi dengan ChatGPT &amp; Claude</li>
              </ul>
            </div>
          </div>

          <section><div className="wrap split">
            <div>
              <h2>Susun CV tanpa bingung, selangkah demi selangkah</h2>
              <p className="sub">Cukup isi formulir sederhana. AI CV MASTER TOOLKIT menyusun prompt yang rapi untukmu, tinggal kamu salin ke ChatGPT atau Claude. Isi CV tetap kamu yang kendalikan.</p>
              <button className="btn primary" onClick={() => open(1, 'form')}>Coba Sekarang <ArrowRight className="arr" size={18} /></button>
            </div>
            <Pic src={IMAGES.intro} alt="Menyusun CV di laptop" className="photo" />
          </div></section>

          <section className="alt" id="toolkit"><div className="wrap">
            <h2>AI Toolkit</h2><p className="sub">Pilih toolkit, isi formulir, lalu salin prompt ke ChatGPT atau Claude.</p>
            <div className="tools"><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari toolkit berdasarkan nama atau fungsi…" aria-label="Cari toolkit" /></div>
            <div className="chips">{CATS.map((c) => <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}</div>
            <div className="grid">
              {list.map((x) => (
                <div className={'card' + (lastId === x.id ? ' sel' : '')} key={x.id}>
                  <div className="n">{ICONS[x.id]}</div><div className="cat">{x.cat}</div><h3>{x.name}</h3><p>{x.desc}</p>
                  <div className="row">
                    <button className="btn navy" onClick={() => open(x.id, 'form')}>Gunakan Toolkit <ArrowRight className="arr" size={16} /></button>
                    <button className="btn" onClick={() => open(x.id, 'info')}>Lihat Fungsi</button>
                  </div>
                </div>
              ))}
            </div>
            {!list.length && <p>Toolkit tidak ditemukan. Coba kata kunci lain.</p>}
          </div></section>

          <section id="template"><div className="wrap">
            <h2>Pilih Template CV</h2><p className="sub">Pilih desain yang kamu suka. Prompt akan meminta AI membuat CV-mu jadi PDF dengan tata letak ini.</p>
            <div className="tgrid">
              {TEMPLATES.map((x) => (
                <button key={x.id} className="tcard" onClick={() => pickTpl(x.id)} aria-label={'Pakai template ' + x.name}>
                  <Pic src={x.img} alt={'Template ' + x.name} className="timg" />
                  <b>{x.name}</b><span>{x.note}</span>
                </button>
              ))}
            </div>
          </div></section>

          <section className="band" id="panduan"><div className="wrap">
            <h2>Cara Menggunakan AI Toolkit</h2><p className="sub">Tujuh langkah mudah.</p>
            <ol className="steps">{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
            <div className="note"><b>Catatan:</b> AI Toolkit tidak menjamin CV lolos ATS atau diterima bekerja. Selalu periksa kebenaran informasi yang dihasilkan AI.</div>
          </div></section>

          <section id="tentang"><div className="wrap">
            <h2>Tentang &amp; Privasi</h2>
            <p className="sub">AI CV MASTER TOOLKIT adalah produk pendamping e-book AI CV MASTER GUIDE. Aplikasi ini tidak punya AI sendiri: ia hanya menyusun prompt dari isianmu.</p>
            <div className="stats"><div><b>7</b><span>AI Toolkit</span></div><div><b>6</b><span>Template CV</span></div><div><b>100%</b><span>diproses di browsermu</span></div></div>
            <div className="note"><b>Privasimu:</b> data yang kamu ketik hanya ada di browser. Tidak dikirim ke server mana pun, tidak dikirim otomatis ke ChatGPT atau Claude, dan tidak disimpan setelah halaman ditutup. Yang tersimpan hanya pilihan mode tampilan (putih/gelap). Jangan memasukkan password atau nomor identitas.</div>
          </div></section>
        </>
      ) : (
        <>
          <div className="hero small"><VideoFrame id="penutup"><div className="orb" /></VideoFrame>
            <div className="wrap hero-in"><div className="tag">GRATIS</div>
              <h1>E-book Panduan <span>CV ATS-Friendly</span></h1>
              <p className="lead">Pelajari cara menyusun CV yang rapi dan mudah dibaca sistem rekrutmen. Unduh gratis dalam format PDF.</p></div></div>
          <section><div className="wrap split">
            <Pic src={IMAGES.ebook} alt="E-book panduan CV" className="photo" />
            <div>
              <h2>Unduh E-book Gratis</h2>
              <p className="sub">Baca di HP atau laptop kapan saja. Setelah membaca, langsung praktik dengan 7 AI Toolkit.</p>
              <div className="row">
                <button className="btn primary" onClick={downloadEbook} disabled={dl}><Download size={18} /> {dl ? 'Memeriksa file…' : 'Unduh E-book (PDF)'}</button>
                <button className="btn" onClick={() => goto('toolkit')}>Buka AI Toolkit <ArrowRight className="arr" size={16} /></button>
              </div>
            </div>
          </div></section>
        </>
      )}

      <section className="cta"><div className="wrap cta-in">
        <h2>Mulai dari satu langkah kecil hari ini.</h2>
        <p>Pilih toolkit pertamamu dan susun CV yang lebih percaya diri.</p>
        <button className="btn primary" onClick={() => open(1, 'form')}>Mulai Buat CV Saya <ArrowRight className="arr" size={18} /></button>
      </div></section>

      <footer><div className="wrap">
        <Pic src={LOGO} alt="" className="flogo" />
        <b>AI CV MASTER TOOLKIT</b><br />Bagian dari AI CV MASTER GUIDE.<br />
        <i>“Belajar membuat CV profesional dimulai dari memahami kemampuan diri sendiri.”</i><br /><br />
        <a className="ig" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><Instagram size={16} /> {INSTAGRAM_NAME}</a><br /><br />
        <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT</a> · <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude</a><br /><br />
        <small>© 2026 AI CV MASTER GUIDE. All rights reserved.</small>
      </div></footer>

      <div id="modal" role="dialog" aria-modal="true" className={t ? 'on' : ''} onClick={(e) => e.target === e.currentTarget && close()}>
        {t && (
          <div className="sheet">
            <div className="top">
              <div><h2>{t.name}</h2><p className="sub" style={{ margin: '4px 0 0' }}>{t.fn}</p></div>
              <button className="btn" onClick={close}><X size={16} /> Tutup</button>
            </div>
            <div className="info"><b>Cara memakai:</b> isi formulir, periksa preview, tekan <b>Salin Prompt</b>, lalu tempel di ChatGPT atau Claude. Data tidak dikirim ke mana pun.</div>
            {mode === 'info' ? (
              <button className="btn primary" onClick={() => setMode('form')}>Gunakan Toolkit</button>
            ) : (
              <div className="two">
                <div>
                  <Seg<Style> label="Gaya bahasa tulisan" value={o.style} onChange={(s) => setOpt({ style: s })} items={[['sederhana', 'Sederhana'], ['profesional', 'Profesional']]} />
                  {HAS_TEMPLATE.has(t.id) && (
                    <>
                      <label>Template CV</label>
                      <div className="tpick" role="radiogroup" aria-label="Template CV">
                        {TEMPLATES.map((x) => (
                          <button key={x.id} type="button" role="radio" aria-checked={o.tpl === x.id} className={o.tpl === x.id ? 'on' : ''} onClick={() => setOpt({ tpl: x.id, foto: x.foto ? o.foto : false })} title={x.name}>
                            <Pic src={x.img} alt={x.name} className="timg" /><span>{x.name}</span>
                          </button>
                        ))}
                      </div>
                      {tpl.foto ? (
                        <Seg<'ya' | 'tidak'> label="Tampilkan foto di CV?" value={o.foto ? 'ya' : 'tidak'} onChange={(x) => setOpt({ foto: x === 'ya' })} items={[['ya', 'Dengan foto'], ['tidak', 'Tanpa foto']]} />
                      ) : <p className="sub" style={{ margin: '8px 0 0', fontSize: 14 }}>Template ini tanpa foto.</p>}
                    </>
                  )}
                  <div style={{ fontWeight: 600, marginTop: 16 }}>Data terisi {done} dari {t.f.length} bagian.</div>
                  <div className="bar"><i style={{ width: (done / t.f.length) * 100 + '%' }} /></div>
                  {t.f.map((f) => {
                    const set = (val: string) => setVals({ ...vals, [t.id]: { ...v, [f.k]: val } })
                    const id = 'f-' + t.id + '-' + f.k
                    return (
                      <div key={f.k}>
                        <label htmlFor={id}>{f.l}</label>
                        {f.a ? <textarea id={id} value={v[f.k] || ''} onChange={(e) => set(e.target.value)} /> : <input id={id} value={v[f.k] || ''} onChange={(e) => set(e.target.value)} autoComplete="off" />}
                      </div>
                    )
                  })}
                </div>
                <div>
                  <label htmlFor="prev">Preview prompt <small>(diperbarui otomatis)</small></label>
                  <textarea id="prev" ref={prev} readOnly value={prompt} />
                  <div className="acts">
                    <button className="btn primary full" onClick={copy}><Copy size={18} /> Salin Prompt</button>
                    <a className="btn navy" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Buka ChatGPT</a>
                    <a className="btn navy" href="https://claude.ai/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Buka Claude</a>
                    {ask ? (
                      <span className="full askrow">
                        Hapus semua isian?
                        <button className="btn navy" onClick={() => { setVals({ ...vals, [t.id]: {} }); setOpts({ ...opts, [t.id]: { ...DEF } }); setAsk(false); toast('Formulir dikosongkan.') }}>Ya, hapus</button>
                        <button className="btn" onClick={() => setAsk(false)}>Batal</button>
                      </span>
                    ) : (
                      <button className="btn full" onClick={() => setAsk(true)}><Trash2 size={16} /> Kosongkan Formulir</button>
                    )}
                  </div>
                  <p style={{ fontSize: 13, opacity: 0.8 }}>Tombol ChatGPT/Claude hanya membuka situsnya. Prompt tidak terkirim otomatis; tempel sendiri setelah menyalin.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {msg && (
        <div id="toast" className={msg.k} role="status" aria-live="polite">
          {msg.k === 'ok' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}<span>{msg.t}</span>
        </div>
      )}
    </>
  )
}
