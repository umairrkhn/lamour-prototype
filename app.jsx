const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Config (tweakable) ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#f496b0",
  "grain": true,
  "parallax": true,
  "magnetic": true,
  "heroHeadline": "Scent, rewritten.",
  "heroEyebrow": "VOL. 04 — SPRING ÉDITION"
}/*EDITMODE-END*/;

// ---------- Icons (inline SVG — no lucide dep needed) ----------
const Icon = {
  Search: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  Bag: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>,
  User: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  Menu: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8h16M4 16h16"/></svg>,
  Arrow: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  ArrowDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M6 13l6 6 6-6"/></svg>,
  Plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>,
  Sparkle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>,
  Scan: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3M4 12h16"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12 5 5L20 6"/></svg>,
  Droplet: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11Z"/></svg>,
  Leaf: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20c0-8 6-14 16-16 0 10-6 16-16 16ZM4 20 14 10"/></svg>,
  Flame: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3c0 4-4 5-4 10a4 4 0 0 0 8 0c0-2-1-3-1-5 3 1 4 3 4 6a7 7 0 0 1-14 0c0-6 7-7 7-11Z"/></svg>,
  Moon: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z"/></svg>,
  Sun: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>,
  Star: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.6 5.6 6 .6-4.5 4.2 1.3 6L12 16.8 6.6 19.4l1.3-6L3.4 9.2l6-.6L12 3Z"/></svg>,
  Instagram: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  Tiktok: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c0 2.5 2 4.5 4.5 4.5"/></svg>,
  Youtube: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m11 10 4 2-4 2v-4Z" fill="currentColor"/></svg>,
};

// ---------- Custom Cursor ----------
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const rafRef = useRef(0);
  const mouse = useRef({x: -100, y: -100});
  const ringPos = useRef({x: -100, y: -100});

  useEffect(() => {
    // Skip on touch / no-hover devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      // Check hover target
      const t = e.target.closest?.('[data-hover], a, button, input[type="submit"], [role="button"]');
      const shouldHover = !!t && !t.hasAttribute('data-no-hover');
      document.documentElement.classList.toggle('cursor-hover', shouldHover);
    };
    const onDown = () => document.documentElement.classList.add('cursor-press');
    const onUp = () => document.documentElement.classList.remove('cursor-press');
    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const tick = () => {
      // Ring lerps toward mouse
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove('cursor-hover', 'cursor-press');
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true"/>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true"/>
    </>
  );
}

// ---------- Hooks ----------
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Magnetic button — uses pointer position relative to element
function Magnetic({ children, strength = 0.35, className = '', as: As = 'button', enabled = true, ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!enabled) return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <As ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} data-hover="" className={`magnetic ${className}`} {...props}>
      {children}
    </As>
  );
}

// ---------- Nav ----------
function Nav({ onOpenSmartMatch, onOpenCart, cartCount }) {
  const y = useScrollY();
  const scrolled = y > 40;
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className={`mx-auto max-w-[1400px] px-6 transition-all duration-500`}>
        <div className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${scrolled ? 'glass-strong' : 'glass'}`}>
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2">
              <span className="font-serif text-xl tracking-tight"><span style={{color:'var(--pink)'}}>L'A</span>MOUR</span>
            </a>
            <div className="hidden md:flex items-center gap-6 text-[13px] tracking-wide text-white/70">
              <a className="hover:text-white transition">Parfums</a>
              <a className="hover:text-white transition">Collections</a>
              <a className="hover:text-white transition">Discovery</a>
              <a className="hover:text-white transition">Journal</a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenSmartMatch} className="hidden sm:flex items-center gap-2 text-[12px] tracking-wider uppercase px-3 py-2 rounded-full hover:bg-white/5 transition">
              <Icon.Sparkle className="w-4 h-4" style={{color:'var(--pink)'}}/> Smart Match
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 transition"><Icon.Search className="w-5 h-5"/></button>
            <button className="p-2 rounded-full hover:bg-white/5 transition hidden sm:block"><Icon.User className="w-5 h-5"/></button>
            <button onClick={onOpenCart} className="relative p-2 rounded-full hover:bg-white/5 transition">
              <Icon.Bag className="w-5 h-5"/>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center" style={{background:'var(--pink)', color:'#000'}}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ---------- Hero ----------
function Hero({ headline, eyebrow, parallax }) {
  const y = useScrollY();
  const pShift = parallax ? Math.min(y * 0.35, 400) : 0;
  const pOpacity = Math.max(0, 1 - y / 600);
  return (
    <section className="relative mesh-hero grain overflow-hidden min-h-screen flex flex-col justify-center">
      {/* parallax orbs */}
      <div className="orb" style={{width:520, height:520, left:'-10%', top:'10%', background:'var(--pink)', opacity:0.35, transform:`translateY(${pShift*0.4}px)`}}/>
      <div className="orb" style={{width:380, height:380, right:'-8%', top:'45%', background:'#ffc8d6', opacity:0.25, transform:`translateY(${pShift*0.7}px)`}}/>
      <div className="orb" style={{width:280, height:280, left:'35%', bottom:'-10%', background:'var(--pink)', opacity:0.28, transform:`translateY(${-pShift*0.3}px)`}}/>

      {/* scanning grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" style={{transform:`translateY(${pShift*0.15}px)`}}>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" stroke="white" strokeWidth="0.5" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 pt-32 pb-20">
        <div className="flex items-start justify-between mb-10 hero-sub">
          <div className="font-sub text-[11px] text-white/50">{eyebrow}</div>
          <div className="font-sub text-[11px] text-white/40 text-right hidden md:block leading-[1.8]">
            12 PARFUMS<br/>3 COLLECTIONS<br/>1 SIGNATURE
          </div>
        </div>

        <h1 className="hero-title font-display leading-[0.86] text-white"
            style={{opacity:pOpacity, transform:`translateY(${pShift*0.2}px)`, fontSize:'clamp(64px, 11vw, 168px)'}}>
          {headline.split(' ').map((w, i) => (
            <span key={i} className="inline-block mr-[0.25em]">
              {i === 1 ? <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic', fontWeight:400}}>{w}</em> : w}
            </span>
          ))}
        </h1>

        <div className="hero-sub mt-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8" style={{opacity:pOpacity}}>
          <p className="max-w-md text-white/70 text-[15px] leading-relaxed">
A maison of modern perfumery. Composed in Grasse from rare naturals, pressed into crystal, and designed to be worn, not just smelled.
          </p>
          <div className="flex items-center gap-3">
            <Magnetic className="group relative overflow-hidden rounded-full px-7 py-4 text-[13px] tracking-wider uppercase font-medium" style={{background:'var(--pink)', color:'#000'}}>
              <span className="relative z-10 flex items-center gap-2">Shop the Edit <Icon.Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1"/></span>
            </Magnetic>
            <Magnetic className="rounded-full border border-white/20 px-7 py-4 text-[13px] tracking-wider uppercase font-medium hover:border-white/60 transition-colors">
              Discover Science
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
          {Array.from({length: 2}).map((_, k) => (
            <div key={k} className="flex items-center gap-10 pr-10">
              {['Composed in Grasse', 'Cruelty free', '12-hour sillage', 'Made in France', 'Waitlist: 14,203', 'As seen in Vogue', 'Refill programme', 'Carbon neutral', 'Rare naturals', 'Édition limitée'].map((t, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span>{t}</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{background:'var(--pink)'}}/>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Scrollytelling ----------
const SCIENCE_CHAPTERS = [
  { n:'01', title:'The Top Note', body:'The first breath. Bergamot from Calabria, pink pepper, neroli — what you meet in the first three minutes before the fragrance becomes itself.' },
  { n:'02', title:'The Heart', body:'At fifteen minutes, the composition opens. Centifolia rose, Egyptian jasmine, iris pallida — the soul of the perfume, where character lives for hours.' },
  { n:'03', title:'The Base', body:'Hours in, the dry-down. Madagascar vanilla, oud, ambrette, musk de nuit. What people remember on your scarf the next morning.' },
  { n:'04', title:'The Sillage', body:'The trail a fragrance leaves behind. Measured in our Grasse studio — how far you carry the room with you when you leave it.' },
];

function Scrollytelling() {
  const secRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = secRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const passed = -r.top;
      const p = Math.max(0, Math.min(1, passed / total));
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const active = Math.min(SCIENCE_CHAPTERS.length - 1, Math.floor(progress * SCIENCE_CHAPTERS.length));
  const imgP = progress;

  return (
    <section ref={secRef} className="relative" style={{height: `${SCIENCE_CHAPTERS.length * 90}vh`, background:`rgb(${255-Math.round(progress*255)}, ${255-Math.round(progress*255)}, ${255-Math.round(progress*255)})`, transition:'background-color 120ms linear'}}>
      {/* ink color inverts with progress */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden"
           style={{color: progress < 0.5 ? '#0a0a0a' : '#ffffff'}}>
        {/* fine grid overlay, subtle in both modes */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize:'96px 96px', opacity: 0.04
        }}/>
        {/* chapter index, top */}
        <div className="absolute top-8 left-0 right-0 px-8 flex items-center justify-between font-sub text-[10px]" style={{opacity:0.55}}>
          <span>§ Anatomy of a parfum</span>
          <span>{String(active+1).padStart(2,'0')} ⁄ {String(SCIENCE_CHAPTERS.length).padStart(2,'0')}</span>
        </div>
        <div className="mx-auto max-w-[1200px] w-full px-6 md:px-8 grid md:grid-cols-[0.9fr_1.1fr] gap-14 items-center relative">

          {/* ----- Mobile: blurred backdrop version of the visual ----- */}
          <div className="narrative-bg-mobile" aria-hidden="true">
            <div className="absolute inset-0" style={{background: progress < 0.5 ? 'linear-gradient(160deg, #fbeaf0 0%, #f4e8ec 50%, #efd9e1 100%)' : 'linear-gradient(160deg, #1a0e12 0%, #0a0a0a 50%, #2a1a1f 100%)', transition:'background 200ms linear'}}/>
            {/* giant soft pink orb, drifts with scroll */}
            <div className="absolute" style={{
              left: `${30 + imgP*12}%`, top: `${40 - imgP*10}%`,
              width:'80vw', height:'80vw', maxWidth: 520, maxHeight: 520,
              transform: 'translate(-50%,-50%)',
              background:'radial-gradient(circle, rgba(244,150,176,0.55), transparent 65%)',
              filter:'blur(60px)', borderRadius:'9999px', opacity: 0.9
            }}/>
            {/* bottle silhouette, blurred */}
            <div className="absolute inset-0 flex items-center justify-center" style={{filter:'blur(18px)', opacity: 0.55}}>
              <div className="float" style={{transform:`scale(${1 + imgP*0.25}) rotate(${imgP*6 - 3}deg)`}}>
                <svg width="240" height="360" viewBox="0 0 220 340">
                  <path d="M40 50 L180 50 L186 90 L186 310 Q186 326 170 326 L50 326 Q34 326 34 310 L34 90 Z" fill="#0a0a0a"/>
                  <rect x="60" y="20" width="100" height="22" rx="4" fill="#0a0a0a"/>
                </svg>
              </div>
            </div>
            {/* subtle grid */}
            <div className="absolute inset-0" style={{
              backgroundImage:`linear-gradient(to right, ${progress<0.5?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'} 1px, transparent 1px), linear-gradient(to bottom, ${progress<0.5?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'} 1px, transparent 1px)`,
              backgroundSize:'64px 64px'
            }}/>
            {/* fade to bottom so text remains readable */}
            <div className="absolute inset-x-0 bottom-0 h-40" style={{background: progress < 0.5 ? 'linear-gradient(180deg, transparent, rgba(255,255,255,0.85))' : 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))'}}/>
          </div>

          {/* Sticky "product" visual (desktop only) */}
          <div className="narrative-visual-desktop relative h-[62vh] rounded-2xl overflow-hidden" style={{background: progress < 0.5 ? 'linear-gradient(135deg, #f4e8ec, #fbeaf0 60%, #efd9e1)' : 'linear-gradient(135deg, #1a0e12, #0a0a0a 60%, #2a1a1f)', transition:'background 200ms linear'}}>
            <div className="absolute inset-0 stripes" style={{opacity: 0.35}}/>
            <div className="absolute inset-0 grain"/>
            {/* floating bottle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative float" style={{transform:`scale(${0.9 + imgP*0.15}) rotate(${imgP*4 - 2}deg)`}}>
                {/* bottle svg placeholder */}
                <svg width="220" height="340" viewBox="0 0 220 340" className="drop-shadow-2xl">
                  <defs>
                    <linearGradient id="bot" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#2a1a1f"/>
                      <stop offset="0.5" stopColor="#0a0a0a"/>
                      <stop offset="1" stopColor="#1a0e12"/>
                    </linearGradient>
                    <linearGradient id="hl" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="rgba(255,255,255,0)"/>
                      <stop offset="0.5" stopColor="rgba(255,255,255,0.3)"/>
                      <stop offset="1" stopColor="rgba(255,255,255,0)"/>
                    </linearGradient>
                  </defs>
                  <rect x="60" y="20" width="100" height="22" rx="4" fill="#0a0a0a" stroke="rgba(244,150,176,0.5)" strokeWidth="0.5"/>
                  <rect x="72" y="8" width="76" height="14" rx="2" fill="#0a0a0a"/>
                  <path d="M40 50 L180 50 L186 90 L186 310 Q186 326 170 326 L50 326 Q34 326 34 310 L34 90 Z" fill="url(#bot)" stroke="rgba(244,150,176,0.45)" strokeWidth="0.5"/>
                  <rect x="34" y="140" width="152" height="0.5" fill="url(#hl)"/>
                  {/* label */}
                  <text x="110" y="200" textAnchor="middle" fill="#fff" fontFamily="Fraunces" fontSize="22" fontWeight="400" letterSpacing="-0.02em">L'Amour</text>
                  <text x="110" y="220" textAnchor="middle" fill="rgba(244,150,176,0.9)" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="0.3em">PARFUM · 01</text>
                  <line x1="70" y1="240" x2="150" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4"/>
                  <text x="110" y="258" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono" fontSize="7" letterSpacing="0.2em">50 ML / 1.7 FL OZ</text>
                  <text x="110" y="290" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontFamily="JetBrains Mono" fontSize="6" letterSpacing="0.25em">EXTRAIT DE PARFUM · 22% CONC.</text>
                </svg>
                {/* glow */}
                <div className="absolute inset-0 -z-10 rounded-full blur-3xl" style={{background:'radial-gradient(circle, rgba(244,150,176,0.4), transparent 70%)'}}/>
              </div>
            </div>
            {/* top-left chapter badge */}
            <div className="absolute top-5 left-5 font-mono text-[9px] tracking-[0.25em]" style={{color: progress < 0.5 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)'}}>
LAMOUR GRASSE — MOVEMENT {SCIENCE_CHAPTERS[active].n}
            </div>
            {/* bottom ruler */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2 font-mono text-[9px] tracking-widest" style={{color: progress < 0.5 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)'}}>
              <span>{(imgP*100).toFixed(0).padStart(3,'0')}</span>
              <div className="flex-1 h-[1px] relative" style={{background: progress < 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}}>
                <div className="absolute inset-y-0 left-0" style={{width:`${imgP*100}%`, background:'var(--pink)'}}/>
              </div>
              <span>100</span>
            </div>
          </div>

          {/* Scrolling text */}
          <div className="narrative-text-col relative">
            <h2 className="font-display leading-[0.95] mb-10" style={{fontSize:'clamp(34px, 4.4vw, 60px)', letterSpacing:'-0.025em'}}>
              A fragrance is a <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>story</em> told in three movements.
            </h2>

            <div className="space-y-6">
              {SCIENCE_CHAPTERS.map((c, i) => (
                <div key={i} className="transition-all duration-500"
                     style={{
                       opacity: i === active ? 1 : 0.3,
                       transform: `translateX(${i === active ? 0 : 6}px)`,
                     }}>
                  <div className="flex items-start gap-4">
                    <div className="font-mono text-[10px] tracking-widest pt-[6px] w-6 shrink-0" style={{color: i === active ? 'var(--pink)' : 'currentColor', opacity: i === active ? 1 : 0.45}}>
                      {c.n}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[20px] md:text-[22px] mb-1" style={{letterSpacing:'-0.02em'}}>{c.title}</h3>
                      <p className="text-[13.5px] leading-relaxed max-w-md" style={{opacity:0.65}}>{c.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ---------- Smart Match ----------
const SCENT_MOODS = [
  { id:'floral', label:'Floral', icon: Icon.Leaf, desc:'Rose, jasmine, tuberose' },
  { id:'woody', label:'Woody', icon: Icon.Flame, desc:'Sandalwood, cedar, oud' },
  { id:'fresh', label:'Fresh', icon: Icon.Droplet, desc:'Citrus, sea salt, green' },
  { id:'oriental', label:'Oriental', icon: Icon.Moon, desc:'Amber, vanilla, spice' },
];

const CONCERNS = ['Daytime', 'After dark', 'Signature', 'Weather-proof', 'Unexpected', 'Intimate'];

const RECS = {
  floral: { name:'Parfum 03 — Rose Noire', tag:'A MODERN FLORAL', note:'Centifolia rose laid over black pepper and patchouli. A flower that knows what it wants.', match:0.96, kpi:[['TOP','BERGAMOT'],['HEART','ROSE'],['BASE','PATCHOULI']] },
  woody: { name:'Parfum 07 — Cedre Fumé', tag:'A SMOKED WOOD', note:'Atlas cedar passed through vetiver and a whisper of birch tar. Warm, but never heavy.', match:0.94, kpi:[['TOP','CARDAMOM'],['HEART','CEDAR'],['BASE','VETIVER']] },
  fresh: { name:'Parfum 02 — Sel de Mer', tag:'A COASTAL FRESH', note:'Calabrian bergamot, ambrette seed, a pinch of salt. The Mediterranean at 7 a.m.', match:0.91, kpi:[['TOP','BERGAMOT'],['HEART','AMBRETTE'],['BASE','MUSK']] },
  oriental: { name:'Parfum 05 — Nuit Ambrée', tag:'AN ORIENTAL EVENING', note:'Madagascar vanilla, labdanum, and a controlled spice that lasts into morning.', match:0.98, kpi:[['TOP','SAFFRON'],['HEART','LABDANUM'],['BASE','VANILLA']] },
};

function SmartMatch({ open, onClose, onAddToCart }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) { setStep(0); setMood(null); setConcerns([]); setScanning(false); setDone(false); }
  }, [open]);

  const toggleConcern = (c) => setConcerns((prev) => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c]);

  const runScan = () => {
    setScanning(true); setDone(false);
    setTimeout(() => { setScanning(false); setDone(true); }, 2400);
  };

  if (!open) return null;

  const rec = mood ? RECS[mood] : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div onClick={(e)=>e.stopPropagation()} className="relative glass-strong rounded-t-3xl md:rounded-3xl w-full max-w-[1100px] max-h-[92vh] overflow-hidden flex flex-col md:flex-row">

        {/* Left: scanner visual */}
        <div className="relative md:w-[45%] min-h-[320px] md:min-h-[560px] prod-bg-1 overflow-hidden">
          <div className="absolute inset-0 stripes"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* perfume bottle silhouette */}
              <svg width="180" height="280" viewBox="0 0 180 280" className="opacity-90">
                <defs>
                  <linearGradient id="pfm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(244,150,176,0.45)"/>
                    <stop offset="1" stopColor="rgba(244,150,176,0.08)"/>
                  </linearGradient>
                </defs>
                {/* cap */}
                <rect x="70" y="10" width="40" height="30" rx="3" fill="#0a0a0a" stroke="rgba(244,150,176,0.6)" strokeWidth="0.6"/>
                <rect x="78" y="40" width="24" height="14" fill="#0a0a0a"/>
                {/* flacon */}
                <path d="M40 60 L140 60 L150 100 L150 250 Q150 262 138 262 L42 262 Q30 262 30 250 L30 100 Z" fill="url(#pfm)" stroke="rgba(244,150,176,0.7)" strokeWidth="0.8"/>
                {/* liquid line */}
                <path d="M34 150 Q 90 162 146 150 L146 246 Q146 258 136 258 L44 258 Q34 258 34 246 Z" fill="rgba(244,150,176,0.18)"/>
                {/* scan dots */}
                {scanning && [[55,140],[125,140],[90,175],[70,210],[110,210]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="3" fill="var(--pink)">
                    <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin={`${i*0.15}s`}/>
                  </circle>
                ))}
              </svg>

              {/* scanner line */}
              {scanning && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="scan-line absolute left-0 right-0 h-[2px]" style={{background:'linear-gradient(90deg, transparent, var(--pink), transparent)', boxShadow:'0 0 20px var(--pink)'}}/>
                </div>
              )}

              {/* pulse rings */}
              {scanning && (
                <>
                  <div className="absolute inset-0 rounded-full border pulse-ring" style={{borderColor:'rgba(244,150,176,0.5)'}}/>
                  <div className="absolute inset-0 rounded-full border pulse-ring pulse-ring-2" style={{borderColor:'rgba(244,150,176,0.4)'}}/>
                  <div className="absolute inset-0 rounded-full border pulse-ring pulse-ring-3" style={{borderColor:'rgba(244,150,176,0.3)'}}/>
                </>
              )}
            </div>
          </div>

          <div className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.25em] text-white/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{background:'var(--pink)', boxShadow:'0 0 10px var(--pink)'}}/>
            LAMOUR · SCENT MATCH ENGINE v2.4
          </div>
          <div className="absolute bottom-6 left-6 right-6 font-mono text-[10px] tracking-[0.2em] text-white/40 flex justify-between">
            <span>LAT 48.8566</span>
            <span>LON 2.3522</span>
            <span>{scanning ? 'ANALYZING…' : done ? 'COMPLETE' : 'IDLE'}</span>
          </div>
        </div>

        {/* Right: form */}
        <div className="relative md:w-[55%] p-8 md:p-10 overflow-y-auto">
          <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full border border-white/15 hover:border-white/50 transition flex items-center justify-center">
            <span className="text-white/70">×</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <div key={i} className={`dot ${i <= step ? 'on' : ''}`}/>)}
            </div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-white/50">STEP {step+1} / 3</div>
          </div>

          {step === 0 && (
            <>
              <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Scent match</div>
              <h3 className="font-display leading-[0.98] mb-4" style={{fontSize:'clamp(28px, 3.2vw, 40px)', letterSpacing:'-0.025em'}}>
                Tell us your <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>olfactive mood</em>.
              </h3>
              <p className="text-white/60 text-[14px] mb-6 max-w-md">A 90-second ritual. We'll cross-reference your profile against 14,000 scent panels and return one parfum.</p>

              <div className="grid grid-cols-2 gap-3">
                {SCENT_MOODS.map(t => {
                  const active = mood === t.id;
                  return (
                    <button key={t.id} onClick={()=>setMood(t.id)}
                      className={`group text-left rounded-2xl p-4 border transition-all ${active ? 'border-transparent glass-pink' : 'border-white/10 hover:border-white/30 bg-white/[0.02]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? '' : 'bg-white/5'}`} style={active ? {background:'var(--pink)'} : {}}>
                          <t.icon className={`w-4 h-4 ${active ? 'text-black' : 'text-white'}`}/>
                        </div>
                        <div className="font-serif text-lg">{t.label}</div>
                        {active && <div className="ml-auto"><Icon.Check className="w-4 h-4" style={{color:'var(--pink)'}}/></div>}
                      </div>
                      <div className="text-white/50 text-[12px]">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Refine</div>
              <h3 className="font-display leading-[0.98] mb-4" style={{fontSize:'clamp(28px, 3.2vw, 40px)', letterSpacing:'-0.025em'}}>
                When will you <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>wear it</em>?
              </h3>
              <p className="text-white/60 text-[14px] mb-6">Pick any that apply. The composition is weighted to the occasion.</p>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map(c => {
                  const active = concerns.includes(c);
                  return (
                    <button key={c} onClick={()=>toggleConcern(c)}
                      className={`px-4 py-2.5 rounded-full border text-[13px] transition-all ${active ? 'border-transparent text-black' : 'border-white/15 text-white/80 hover:border-white/40'}`}
                      style={active ? {background:'var(--pink)'} : {}}>
                      {active && <Icon.Check className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5"/>}
                      {c}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && !done && (
            <>
              <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Analysis</div>
              <h3 className="font-display leading-[0.98] mb-4" style={{fontSize:'clamp(28px, 3.2vw, 40px)', letterSpacing:'-0.025em'}}>
                {scanning ? <>Reading <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>your profile</em>…</> : <>Ready to <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>scan</em>.</>}
              </h3>
              <p className="text-white/60 text-[14px] mb-8">
                {scanning ? 'Matching against 14,203 scent panels. Weighting notes, sillage, and mood.' : 'We have enough to start. Initiate the match engine.'}
              </p>

              {scanning ? (
                <div className="space-y-3">
                  {['Loading olfactive vectors…','Cross-referencing scent panels…','Weighting by occasion…','Ranking 12 parfums…'].map((l,i)=>(
                    <div key={i} className="flex items-center gap-3 font-mono text-[12px] text-white/60" style={{animation:`heroIn 0.6s ${i*0.45}s both`}}>
                      <Icon.Check className="w-4 h-4" style={{color:'var(--pink)'}}/> {l}
                    </div>
                  ))}
                </div>
              ) : (
                <Magnetic onClick={runScan} className="rounded-full px-7 py-4 text-[13px] tracking-wider uppercase font-medium inline-flex items-center gap-2" style={{background:'var(--pink)', color:'#000'}}>
                  <Icon.Scan className="w-4 h-4"/> Initiate Scan
                </Magnetic>
              )}
            </>
          )}

          {step === 2 && done && rec && (
            <>
              <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Your match · {(rec.match*100).toFixed(0)}% confidence</div>
              <div className="relative rounded-2xl p-6 glass-pink overflow-hidden mb-5">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{background:'radial-gradient(circle, rgba(244,150,176,0.4), transparent 70%)'}}/>
                <div className="font-mono text-[10px] tracking-[0.25em] text-white/50 mb-2">{rec.tag}</div>
                <h4 className="font-serif text-3xl leading-tight mb-3">{rec.name}</h4>
                <p className="text-white/70 text-[13.5px] mb-5 max-w-md">{rec.note}</p>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {rec.kpi.map(([k,v],i)=>(
                    <div key={i} className="rounded-xl border border-white/10 p-3 bg-black/30">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-white/40 mb-1">{k}</div>
                      <div className="font-serif text-xl" style={{color:'var(--pink)'}}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Magnetic onClick={() => { onAddToCart(rec.name); onClose(); }} className="flex-1 rounded-full py-3.5 text-[13px] tracking-wider uppercase font-medium" style={{background:'var(--pink)', color:'#000'}}>
                    Add to Bag — €245
                  </Magnetic>
                  <button onClick={()=>{setDone(false); setStep(0); setMood(null); setConcerns([]);}} className="rounded-full border border-white/20 px-5 py-3.5 text-[13px] tracking-wider uppercase">Re-scan</button>
                </div>
              </div>
            </>
          )}

          {/* footer nav */}
          {!(step===2 && done) && (
            <div className="mt-8 flex items-center justify-between">
              <button onClick={()=>setStep(Math.max(0, step-1))} className="text-white/50 hover:text-white text-[12px] tracking-wider uppercase" disabled={step===0}>
                {step===0 ? '' : '← Back'}
              </button>
              {step < 2 && (
                <Magnetic onClick={()=>setStep(step+1)} disabled={step===0 && !mood}
                  className="rounded-full px-6 py-3 text-[12px] tracking-wider uppercase font-medium inline-flex items-center gap-2 disabled:opacity-40"
                  style={{background:'var(--pink)', color:'#000'}}>
                  Continue <Icon.Arrow className="w-3.5 h-3.5"/>
                </Magnetic>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Bestsellers (horizontal) ----------
const PRODUCTS = [
  { id:1, bg:'prod-bg-1', name:'Parfum 01 — Rose de Nuit', cat:'FLORAL', price:245, notes:'Rose · Oud · Musk', swatch:'#f496b0' },
  { id:2, bg:'prod-bg-2', name:'Parfum 02 — Sel de Mer', cat:'FRESH', price:215, notes:'Bergamot · Ambrette', swatch:'#ffc8d6' },
  { id:3, bg:'prod-bg-3', name:'Parfum 03 — Jasmin Blanc', cat:'FLORAL', price:265, notes:'Jasmine · Tuberose', swatch:'#e87b98' },
  { id:4, bg:'prod-bg-4', name:'Parfum 04 — Cuir Fauve', cat:'LEATHER', price:295, notes:'Leather · Saffron', swatch:'#d46a85' },
  { id:5, bg:'prod-bg-5', name:'Parfum 05 — Nuit Ambrée', cat:'ORIENTAL', price:275, notes:'Vanilla · Labdanum', swatch:'#ffa6bd' },
  { id:6, bg:'prod-bg-6', name:'Parfum 06 — Iris Pallida', cat:'POWDERY', price:285, notes:'Iris · Violet · Suede', swatch:'#f496b0' },
  { id:7, bg:'prod-bg-1', name:'Parfum 07 — Cedre Fumé', cat:'WOODY', price:255, notes:'Cedar · Vetiver', swatch:'#f07a99' },
  { id:8, bg:'prod-bg-3', name:'Parfum 08 — Bois de L’Aube', cat:'WOODY', price:265, notes:'Sandalwood · Amber', swatch:'#ffc8d6' },
];

function ProductCard({ p, onAdd }) {
  const [hover, setHover] = useState(false);
  return (
    <div data-hover="" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      className={`group shrink-0 w-[320px] md:w-[380px] rounded-3xl overflow-hidden relative transition-all duration-500 ${p.bg} ${hover ? 'glow-pink -translate-y-2' : ''}`}>
      <div className="absolute inset-0 stripes opacity-60"/>
      <div className="absolute inset-0 grain"/>

      <div className="relative aspect-[4/5] flex items-center justify-center p-8">
        {/* "product" */}
        <div className={`relative transition-transform duration-700 ${hover ? 'scale-110 -rotate-2' : ''}`}>
          <svg width="140" height="220" viewBox="0 0 140 220">
            <defs>
              <linearGradient id={`pg-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1a1014"/>
                <stop offset="1" stopColor="#000"/>
              </linearGradient>
            </defs>
            <rect x="40" y="8" width="60" height="18" rx="3" fill="#0a0a0a"/>
            <path d="M25 30 L115 30 L120 60 L120 206 Q120 214 112 214 L28 214 Q20 214 20 206 L20 60 Z" fill={`url(#pg-${p.id})`} stroke={p.swatch} strokeOpacity="0.4" strokeWidth="0.5"/>
            <text x="70" y="128" textAnchor="middle" fill="#fff" fontFamily="Fraunces" fontSize="14">L'Amour</text>
            <text x="70" y="146" textAnchor="middle" fill={p.swatch} fontFamily="JetBrains Mono" fontSize="6" letterSpacing="0.3em">{p.cat}</text>
            <line x1="40" y1="160" x2="100" y2="160" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4"/>
            <text x="70" y="178" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono" fontSize="5" letterSpacing="0.2em">50ML · 1.7 FL OZ</text>
          </svg>
          <div className="absolute inset-0 -z-10 blur-2xl rounded-full transition-opacity duration-500" style={{background:`radial-gradient(circle, ${p.swatch}55, transparent 70%)`, opacity: hover ? 1 : 0.5}}/>
        </div>

        {/* top corners */}
        <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.25em] text-white/60">{p.cat}</div>
        <div className="absolute top-4 right-4 flex items-center gap-1 text-white/70 text-[11px]">
          <Icon.Star className="w-3 h-3" style={{color:'var(--pink)'}}/> 4.9
        </div>

        {/* quick add reveal */}
        <div className={`absolute left-4 right-4 bottom-4 transition-all duration-500 ${hover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <Magnetic as="button" onClick={()=>onAdd(p)} className="w-full rounded-full py-3 text-[12px] tracking-wider uppercase font-medium flex items-center justify-center gap-2" style={{background:'var(--pink)', color:'#000', boxShadow:'0 0 30px rgba(244,150,176,0.6)'}}>
            <Icon.Plus className="w-4 h-4"/> Quick Add
          </Magnetic>
        </div>
      </div>

      <div className="relative px-5 py-4 border-t border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-between">
        <div>
          <div className="font-serif text-[17px] leading-tight">{p.name}</div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/40 mt-1">{p.notes}</div>
        </div>
        <div className="font-serif text-xl">€{p.price}</div>
      </div>
    </div>
  );
}

function Bestsellers({ onAdd }) {
  const scrollerRef = useRef(null);
  const scroll = (dir) => {
    const el = scrollerRef.current; if (!el) return;
    el.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };
  return (
    <section className="relative bg-black py-28 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex items-end justify-between mb-10 reveal">
          <div>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ The collection</div>
            <h2 className="font-display leading-[0.9]" style={{fontSize:'clamp(48px, 7vw, 108px)', letterSpacing:'-0.035em'}}>
              Loved,<br/><em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>relentlessly</em>.
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={()=>scroll(-1)} className="w-12 h-12 rounded-full border border-white/15 hover:border-white/50 transition flex items-center justify-center rotate-180"><Icon.Arrow className="w-4 h-4"/></button>
            <button onClick={()=>scroll(1)} className="w-12 h-12 rounded-full border border-white/15 hover:border-white/50 transition flex items-center justify-center"><Icon.Arrow className="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar px-[max(24px,calc((100vw-1400px)/2+24px))] pb-6 snap-x snap-mandatory">
        {PRODUCTS.map(p => <div key={p.id} className="snap-start reveal"><ProductCard p={p} onAdd={onAdd}/></div>)}
        <div className="shrink-0 w-10"/>
      </div>
    </section>
  );
}

// ---------- Editorial quote block ----------
function EditorialQuote() {
  return (
    <section className="relative bg-black py-32 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 text-center reveal">
        <div className="font-sub text-[11px] text-white/40 mb-8">Vogue · April 2026</div>
        <blockquote className="font-display leading-[1.08]" style={{fontSize:'clamp(28px, 3.6vw, 52px)', letterSpacing:'-0.025em'}}>
          "The Paris atelier quietly<br/>
          <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>rewriting the rules</em><br/>
          of modern parfumerie."
        </blockquote>
        <div className="mt-10 flex items-center justify-center gap-4 text-white/50 font-sub text-[11px]">
          <span className="w-10 h-px bg-white/20"/>
          <span>Sofia Marchetti, Beauty Editor</span>
          <span className="w-10 h-px bg-white/20"/>
        </div>
      </div>
    </section>
  );
}

// ---------- Ritual / three-step section ----------
function Ritual() {
  const steps = [
    { n:'01', title:'Les Florales', body:'Rose, jasmine, tuberose. Three parfums built around a single bloom, caught at peak.', prod:'Rose de Nuit · Jasmin Blanc · Iris Pallida' },
    { n:'02', title:'Les Bois', body:'Cedar, sandalwood, vetiver. Warm architecture, pressed into crystal and worn on skin.', prod:'Cedre Fumé · Bois de L’Aube' },
    { n:'03', title:'Les Nuits', body:'Amber, oud, vanilla. What you reach for after dark, when restraint is not the point.', prod:'Nuit Ambrée · Cuir Fauve' },
  ];
  return (
    <section className="relative bg-black py-28 border-t border-white/5">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex items-end justify-between mb-14 reveal">
          <div>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ The collections</div>
            <h2 className="font-display leading-[0.94]" style={{fontSize:'clamp(40px, 5.5vw, 84px)', letterSpacing:'-0.03em'}}>Three stories.<br/>Twelve parfums.</h2>
          </div>
          <a className="hidden md:inline-flex items-center gap-2 text-[12px] tracking-[0.25em] uppercase text-white/70 hover:text-white">Discover all <Icon.Arrow className="w-4 h-4"/></a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="reveal rounded-3xl p-7 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-white/30 transition relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] tracking-[0.25em]" style={{color:'var(--pink)'}}>{s.n}</div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-white/30">STEP · 0{i+1}</div>
              </div>
              <div className="mt-14 font-serif text-4xl tracking-tight">{s.title}</div>
              <div className="mt-3 text-white/60 text-[14px]">{s.body}</div>
              <div className="hair my-6"/>
              <div className="flex items-center justify-between">
                <div className="text-white/50 text-[13px]">{s.prod}</div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 hover:border-white/60 transition"><Icon.Plus className="w-4 h-4"/></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const submit = (e) => { e.preventDefault(); if (email.includes('@')) setSubscribed(true); };
  return (
    <footer className="relative bg-black overflow-hidden border-t border-white/5 pt-28 pb-10">
      <div className="mx-auto max-w-[1400px] px-6 relative">
        <div className="grid md:grid-cols-2 gap-16 items-start mb-20 reveal">
          <div>
            <div className="font-sub text-[11px] text-white/40 mb-3">§ The dispatch</div>
            <h2 className="font-display leading-[0.92]" style={{fontSize:'clamp(40px, 5.5vw, 84px)', letterSpacing:'-0.03em'}}>
              A letter,<br/><em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>once a month</em>.
            </h2>
            <p className="text-white/60 text-[15px] mt-6 max-w-md">Olfactive notes, perfumer's diaries, and early access to éditions limitées before they leave Grasse. No noise.</p>
          </div>
          <div>
            {!subscribed ? (
              <form onSubmit={submit} className="relative">
                <div className="glass rounded-full flex items-center pl-6 pr-1.5 py-1.5">
                  <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="your@address.com"
                    className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30 py-3"/>
                  <Magnetic as="button" type="submit" className="rounded-full px-6 py-3 text-[12px] tracking-wider uppercase font-medium" style={{background:'var(--pink)', color:'#000'}}>
                    Subscribe
                  </Magnetic>
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-white/30 mt-3 ml-6">WE RESPECT INBOXES · UNSUBSCRIBE ANY TIME</div>
              </form>
            ) : (
              <div className="glass-pink rounded-2xl px-6 py-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:'var(--pink)'}}>
                  <Icon.Check className="w-4 h-4 text-black"/>
                </div>
                <div>
                  <div className="font-serif text-lg">Welcome to the list.</div>
                  <div className="text-white/60 text-[13px]">First dispatch lands in your inbox Friday.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative z-10 pb-16 border-t border-white/5 pt-10">
          <div>
            <div className="font-serif text-xl tracking-tight mb-3"><span style={{color:'var(--pink)'}}>L'A</span>MOUR</div>
            <p className="text-white/50 text-[13px] max-w-[220px]">Maison de parfum. 14 rue de Sèvres, Paris 75006.</p>
          </div>
          {[
            { h:'Shop', items:['Parfums','Collections','Discovery set','Gift sets','Refills'] },
            { h:'Maison', items:['The Grasse studio','Journal','Sourcing','Olfactive index'] },
            { h:'Care', items:['Support','Shipping','Returns','Contact'] },
          ].map((col,i)=>(
            <div key={i}>
              <div className="font-mono text-[10px] tracking-[0.25em] text-white/40 mb-4">{col.h.toUpperCase()}</div>
              <ul className="space-y-2 text-white/70 text-[13.5px]">
                {col.items.map(it => <li key={it} className="hover:text-white transition cursor-pointer">{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-t border-white/5 pt-6">
          <div className="font-mono text-[10px] tracking-[0.25em] text-white/40">© 2026 LAMOUR PARIS · ALL RIGHTS RESERVED</div>
          <div className="flex items-center gap-3">
            {[Icon.Instagram, Icon.Tiktok, Icon.Youtube].map((I, i) => (
              <a key={i} className="w-9 h-9 rounded-full border border-white/10 hover:border-white/40 transition flex items-center justify-center">
                <I className="w-4 h-4"/>
              </a>
            ))}
          </div>
        </div>

        {/* Giant watermark */}
        <div className="absolute left-0 right-0 bottom-[-40px] text-center pointer-events-none select-none">
          <div className="watermark" style={{fontSize:'clamp(120px, 26vw, 420px)'}}>L'AMOUR</div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Cart Drawer ----------
function Cart({ open, items, onClose, onRemove }) {
  const total = items.reduce((a,b)=>a + (b.price || 245), 0);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
      <div onClick={(e)=>e.stopPropagation()} className="relative glass-strong w-full max-w-[440px] h-full flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-white/50">§ YOUR BAG</div>
            <div className="font-serif text-2xl mt-1">Bag · {items.length}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/15 hover:border-white/50">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.length === 0 ? (
            <div className="text-white/50 text-center mt-20 font-serif text-xl">Your bag is a blank canvas.</div>
          ) : items.map((it, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 p-3">
              <div className="w-16 h-20 rounded-lg prod-bg-1 shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[15px] truncate">{it.name}</div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-white/40 mt-1">50ML · {it.cat || 'PARFUM'}</div>
              </div>
              <div className="font-serif text-lg">€{it.price || 245}</div>
              <button onClick={()=>onRemove(i)} className="text-white/40 hover:text-white text-lg">×</button>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-white/70">
            <span className="font-mono text-[11px] tracking-widest">SUBTOTAL</span>
            <span className="font-serif text-2xl text-white">€{total}</span>
          </div>
          <Magnetic className="w-full rounded-full py-4 text-[13px] tracking-wider uppercase font-medium" style={{background:'var(--pink)', color:'#000'}}>
            Checkout
          </Magnetic>
        </div>
      </div>
    </div>
  );
}

// ---------- App ----------
function App() {
  const [tw, setTw] = useTweaks(TWEAK_DEFAULTS);
  const [smartOpen, setSmartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useReveal();

  useEffect(() => { document.documentElement.style.setProperty('--pink', tw.accent); }, [tw.accent]);

  const addToCart = (p) => {
    const item = typeof p === 'string' ? { name: p, price: 245, cat: 'PARFUM' } : p;
    setCart((prev) => [...prev, item]);
    setCartOpen(true);
  };

  return (
    <div className="relative">
      <CustomCursor/>
      {tw.grain && <div className="fixed inset-0 pointer-events-none z-[60] grain"/>}

      <Nav onOpenSmartMatch={()=>setSmartOpen(true)} onOpenCart={()=>setCartOpen(true)} cartCount={cart.length}/>

      <Hero headline={tw.heroHeadline || 'Scent, rewritten.'} eyebrow={tw.heroEyebrow} parallax={tw.parallax}/>

      <Scrollytelling/>

      {/* Smart Match CTA band */}
      <section className="relative bg-black py-24 border-t border-white/5">
        <div className="mx-auto max-w-[1400px] px-6 grid md:grid-cols-[1.2fr,1fr] gap-10 items-center reveal">
          <div>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ Scent Match</div>
            <h2 className="font-display leading-[0.9]" style={{fontSize:'clamp(48px, 7vw, 108px)', letterSpacing:'-0.035em'}}>
              Let the<br/><em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>engine</em> choose.
            </h2>
            <p className="text-white/60 text-[15px] max-w-md mt-6">Scent Match cross-references your olfactive profile against 14,000 panels and returns a single parfum. Ninety seconds.</p>
            <div className="mt-8">
              <Magnetic onClick={()=>setSmartOpen(true)} className="rounded-full px-8 py-4 text-[13px] tracking-[0.25em] uppercase font-medium inline-flex items-center gap-2" style={{background:'var(--pink)', color:'#000'}}>
                <Icon.Scan className="w-4 h-4"/> Start Scent Match
              </Magnetic>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] prod-bg-1">
            <div className="absolute inset-0 stripes"/>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border pulse-ring" style={{borderColor:'rgba(244,150,176,0.4)'}}/>
                <div className="absolute inset-0 rounded-full border pulse-ring pulse-ring-2" style={{borderColor:'rgba(244,150,176,0.3)'}}/>
                <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{background:'radial-gradient(circle, rgba(244,150,176,0.4), transparent 70%)'}}>
                  <Icon.Sparkle className="w-12 h-12" style={{color:'var(--pink)'}}/>
                </div>
              </div>
            </div>
            <div className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.25em] text-white/60">LAMOUR · SCENT ENGINE v2.4</div>
            <div className="absolute bottom-5 left-5 right-5 flex justify-between font-mono text-[10px] tracking-[0.2em] text-white/40">
              <span>MATCH CONFIDENCE: 98%</span>
              <span>SAMPLE SIZE: 14,203</span>
            </div>
          </div>
        </div>
      </section>

      <Bestsellers onAdd={addToCart}/>

      <EditorialQuote/>

      <Ritual/>

      <Footer/>

      <SmartMatch open={smartOpen} onClose={()=>setSmartOpen(false)} onAddToCart={addToCart}/>
      <Cart open={cartOpen} items={cart} onClose={()=>setCartOpen(false)} onRemove={(i)=>setCart(prev => prev.filter((_,x)=>x!==i))}/>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Brand">
          <TweakColor label="Accent (pink)" value={tw.accent} onChange={(v)=>setTw('accent', v)}/>
          <TweakText label="Hero headline" value={tw.heroHeadline} onChange={(v)=>setTw('heroHeadline', v)}/>
          <TweakText label="Eyebrow" value={tw.heroEyebrow} onChange={(v)=>setTw('heroEyebrow', v)}/>
        </TweakSection>
        <TweakSection title="Effects">
          <TweakToggle label="Film grain overlay" value={tw.grain} onChange={(v)=>setTw('grain', v)}/>
          <TweakToggle label="Parallax on hero" value={tw.parallax} onChange={(v)=>setTw('parallax', v)}/>
          <TweakToggle label="Magnetic buttons" value={tw.magnetic} onChange={(v)=>setTw('magnetic', v)}/>
        </TweakSection>
        <TweakSection title="Actions">
          <TweakButton label="Open Smart Match" onClick={()=>setSmartOpen(true)}/>
          <TweakButton label="Open Cart" onClick={()=>setCartOpen(true)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
