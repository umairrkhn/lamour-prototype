const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Config (tweakable) ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#f496b0",
  "grain": true,
  "parallax": true,
  "magnetic": true,
  "heroHeadline": "Duft, neu erzählt.",
  "heroEyebrow": "VOL. 04 — FRÜHLINGS-EDITION"
}/*EDITMODE-END*/;

// ---------- Category tree (German) ----------
const CATEGORIES = [
  {
    key: 'marken',
    label: 'MARKEN',
    kind: 'brands',
    groups: [
      { title: 'Luxus', items: ['Chanel','Dior','Yves Saint Laurent','Prada','Versace','Gucci','Tom Ford','Armani'] },
      { title: 'Designer', items: ['Hugo Boss','Burberry','Lancôme','Calvin Klein','Paco Rabanne','Jean Paul Gaultier','Dolce & Gabbana','Givenchy'] },
      { title: 'Nischen & Neu', items: ['Ajmal','Creed','Byredo','Maison Francis Kurkdjian','Xerjoff','Amouage','Parfums de Marly','Initio'] },
      { title: 'Pflege & Beauty', items: ['La Mer','Estée Lauder','Clinique','Clarins','Shiseido','SK-II','Biotherm','Kiehl\u2019s'] },
    ]
  },
  {
    key: 'parfum',
    label: 'PARFUM',
    kind: 'mega',
    groups: [
      { title: 'Damen', items: [
        { label: 'Eau de Parfum' },
        { label: 'Eau de Toilette' },
        { label: 'Extrait de Parfum' },
        { label: 'Duft-Sets' },
      ]},
      { title: 'Herren', items: [
        { label: 'Eau de Parfum' },
        { label: 'Eau de Toilette' },
        { label: 'Aftershave' },
        { label: 'Duft-Sets' },
      ]},
      { title: 'Unisex', items: [
        { label: 'Eau de Parfum' },
        { label: 'Eau de Cologne' },
        { label: 'Nischendüfte' },
      ]},
      { title: 'Duftfamilie', items: [
        { label: 'Blumig' },
        { label: 'Holzig' },
        { label: 'Orientalisch' },
        { label: 'Frisch & Zitrus' },
        { label: 'Gourmand' },
      ]},
    ]
  },
  {
    key: 'gesicht',
    label: 'GESICHT',
    kind: 'mega',
    groups: [
      { title: 'Gesichtspflege', items: [
        { label: 'Gesichtscreme' },
        { label: 'Gesichtsserum' },
        { label: 'Gesichtsöl' },
        { label: 'Tagespflege' },
        { label: 'Nachtpflege' },
      ]},
      { title: 'Gesichtsreinigung', items: [
        { label: 'Reinigungsschaum' },
        { label: 'Reinigungsgel' },
        { label: 'Mizellenwasser' },
        { label: 'Peeling' },
        { label: 'Tonic' },
      ]},
      { title: 'Gesichtsmasken', items: [
        { label: 'Feuchtigkeitsmaske' },
        { label: 'Klärende Maske' },
        { label: 'Sheet Mask' },
        { label: 'Anti-Aging Maske' },
      ]},
      { title: 'Augen- & Lippenpflege', items: [
        { label: 'Augencreme' },
        { label: 'Augenserum' },
        { label: 'Eye Patches' },
        { label: 'Lippenpflege' },
        { label: 'Lippenpeeling' },
      ]},
    ]
  },
  {
    key: 'haare',
    label: 'HAARE',
    kind: 'mega',
    groups: [
      { title: 'Haarpflege', items: [
        { label: 'Shampoo' },
        { label: 'Conditioner' },
        { label: 'Haarkur' },
        { label: 'Leave-In' },
      ]},
      { title: 'Haarstyling', items: [
        { label: 'Haarspray' },
        { label: 'Haarschaum' },
        { label: 'Haargel' },
        { label: 'Pomade & Wachs' },
        { label: 'Hitzeschutz' },
      ]},
      { title: 'Coloration', items: [
        { label: 'Haarfarbe' },
        { label: 'Tönung' },
        { label: 'Silbershampoo' },
        { label: 'Farbschutz' },
      ]},
      { title: 'Kopfhaut & Spezial', items: [
        { label: 'Anti-Schuppen' },
        { label: 'Haarwachstum' },
        { label: 'Haaröl' },
        { label: 'Haarparfum' },
      ]},
    ]
  },
  {
    key: 'koerper',
    label: 'KÖRPER',
    kind: 'mega',
    groups: [
      { title: 'Körperpflege', items: [
        { label: 'Bodylotion' },
        { label: 'Bodybutter' },
        { label: 'Körperöl' },
        { label: 'Handcreme' },
        { label: 'Fußpflege' },
      ]},
      { title: 'Dusche & Bad', items: [
        { label: 'Duschgel' },
        { label: 'Duschöl' },
        { label: 'Badezusatz' },
        { label: 'Seife' },
        { label: 'Peeling' },
      ]},
      { title: 'Deo & Hygiene', items: [
        { label: 'Deodorant' },
        { label: 'Antitranspirant' },
        { label: 'Parfümierte Sprays' },
        { label: 'Intimpflege' },
      ]},
      { title: 'Sonne & Rasur', items: [
        { label: 'Sonnencreme' },
        { label: 'After Sun' },
        { label: 'Selbstbräuner' },
        { label: 'Rasierschaum' },
        { label: 'Rasieröl' },
      ]},
    ]
  },
  {
    key: 'makeup',
    label: 'MAKE-UP',
    kind: 'mega',
    groups: [
      { title: 'Teint', items: [
        { label: 'Foundation' },
        { label: 'Concealer' },
        { label: 'Puder' },
        { label: 'Rouge' },
        { label: 'Highlighter' },
        { label: 'Primer' },
      ]},
      { title: 'Augen', items: [
        { label: 'Mascara' },
        { label: 'Lidschatten' },
        { label: 'Eyeliner' },
        { label: 'Augenbrauen' },
        { label: 'Wimpernzange' },
      ]},
      { title: 'Lippen', items: [
        { label: 'Lippenstift' },
        { label: 'Liquid Lipstick' },
        { label: 'Lipgloss' },
        { label: 'Lipliner' },
        { label: 'Lippenbalsam' },
      ]},
      { title: 'Nägel & Pinsel', items: [
        { label: 'Nagellack' },
        { label: 'Nagelpflege' },
        { label: 'Gel-Lack' },
        { label: 'Pinsel-Sets' },
        { label: 'Schwämme' },
      ]},
    ]
  },
];

// ---------- Icons (inline SVG — no lucide dep needed) ----------
const Icon = {
  Search: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  Bag: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>,
  User: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  Menu: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8h16M4 16h16"/></svg>,
  Arrow: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  ArrowDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M6 13l6 6 6-6"/></svg>,
  ChevronDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6"/></svg>,
  ChevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m9 6 6 6-6 6"/></svg>,
  Plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>,
  Minus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/></svg>,
  Sparkle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>,
  Scan: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3M4 12h16"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12 5 5L20 6"/></svg>,
  Droplet: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11Z"/></svg>,
  Leaf: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20c0-8 6-14 16-16 0 10-6 16-16 16ZM4 20 14 10"/></svg>,
  Flame: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3c0 4-4 5-4 10a4 4 0 0 0 8 0c0-2-1-3-1-5 3 1 4 3 4 6a7 7 0 0 1-14 0c0-6 7-7 7-11Z"/></svg>,
  Moon: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z"/></svg>,
  Sun: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>,
  Star: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.6 5.6 6 .6-4.5 4.2 1.3 6L12 16.8 6.6 19.4l1.3-6L3.4 9.2l6-.6L12 3Z"/></svg>,
  Truck: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>,
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
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e) => {
      mouse.current.x = e.clientX; mouse.current.y = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const t = e.target.closest?.('[data-hover], a, button, input[type="submit"], [role="button"]');
      document.documentElement.classList.toggle('cursor-hover', !!t && !t.hasAttribute('data-no-hover'));
    };
    const onDown = () => document.documentElement.classList.add('cursor-press');
    const onUp = () => document.documentElement.classList.remove('cursor-press');
    const tick = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove('cursor-hover', 'cursor-press');
    };
  }, []);

  return (<>
    <div ref={ringRef} className="cursor-ring" aria-hidden="true"/>
    <div ref={dotRef} className="cursor-dot" aria-hidden="true"/>
  </>);
}

// ---------- Hooks ----------
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = 0; });
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
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

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

// ---------- Announcement Bar ----------
function Announcement() {
  return (
    <div className="relative z-[55] text-center py-2 text-[12px] tracking-[0.25em] uppercase font-medium" style={{background:'var(--pink)', color:'#0a0a0a'}}>
      Kostenloser Versand ab 0 € · Versandzeit 3–6 Werktage · Rückgabe innerhalb 30 Tagen
    </div>
  );
}

// ---------- Mega Menu ----------
function MegaMenu({ cat, onClose }) {
  if (!cat) return null;
  return (
    <div className="absolute left-0 right-0 top-full pt-3">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl animate-[heroIn_.4s_ease-out]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {cat.groups.map((g, i) => (
              <div key={i}>
                <div className="font-mono text-[10px] tracking-[0.25em] mb-4 pb-2 border-b border-white/10" style={{color:'var(--pink)'}}>{g.title}</div>
                <ul className="space-y-2.5">
                  {g.items.map((it, j) => {
                    const label = typeof it === 'string' ? it : it.label;
                    return (
                      <li key={j}>
                        <a className="group text-[13.5px] text-white/70 hover:text-white transition flex items-center gap-2" onClick={onClose}>
                          <span>{label}</span>
                          <Icon.ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" style={{color:'var(--pink)'}}/>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">§ {cat.label} · ALLE KATEGORIEN</div>
            <a className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-white/80 hover:text-white" onClick={onClose}>
              Alles entdecken <Icon.Arrow className="w-4 h-4"/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Nav ----------
function Nav({ onOpenSmartMatch, onOpenCart, cartCount }) {
  const y = useScrollY();
  const scrolled = y > 40;
  const [openKey, setOpenKey] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target)) setOpenKey(null);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const openCat = openKey ? CATEGORIES.find(c => c.key === openKey) : null;

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'pt-0' : 'pt-0'}`}>
      <Announcement/>
      <div className={`py-3 transition-all duration-500`}>
        <div className="mx-auto max-w-[1400px] px-6">
          <div className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${scrolled ? 'glass-strong' : 'glass'}`}>
            <div className="flex items-center gap-8">
              <a href="#" className="flex items-center gap-2">
                <span className="font-serif text-xl tracking-tight"><span style={{color:'var(--pink)'}}>L'A</span>MOUR</span>
              </a>
              <div className="hidden lg:flex items-center gap-1 text-[12px] tracking-[0.15em] text-white/75">
                {CATEGORIES.map(c => (
                  <button key={c.key}
                    onMouseEnter={()=>setOpenKey(c.key)}
                    onClick={()=>setOpenKey(openKey === c.key ? null : c.key)}
                    className={`px-3 py-2 rounded-full transition flex items-center gap-1 hover:bg-white/5 ${openKey===c.key ? 'text-white bg-white/5' : ''}`}>
                    {c.label} <Icon.ChevronDown className={`w-3 h-3 transition-transform ${openKey===c.key?'rotate-180':''}`} style={{color:'var(--pink)'}}/>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/50 mr-2">
                <Icon.Truck className="w-4 h-4" style={{color:'var(--pink)'}}/>
                <span className="leading-tight">Versandzeit<br/>3–6 Werktage</span>
              </div>
              <button onClick={onOpenSmartMatch} className="hidden sm:flex items-center gap-2 text-[12px] tracking-wider uppercase px-3 py-2 rounded-full hover:bg-white/5 transition">
                <Icon.Sparkle className="w-4 h-4" style={{color:'var(--pink)'}}/> Duft-Finder
              </button>
              <button className="p-2 rounded-full hover:bg-white/5 transition" title="Suche"><Icon.Search className="w-5 h-5"/></button>
              <button className="p-2 rounded-full hover:bg-white/5 transition hidden sm:block" title="Mein Konto"><Icon.User className="w-5 h-5"/></button>
              <button onClick={onOpenCart} className="relative p-2 rounded-full hover:bg-white/5 transition" title="Warenkorb">
                <Icon.Bag className="w-5 h-5"/>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center" style={{background:'var(--pink)', color:'#000'}}>{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div onMouseLeave={()=>setOpenKey(null)}>
        <MegaMenu cat={openCat} onClose={()=>setOpenKey(null)}/>
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
      <div className="orb" style={{width:520, height:520, left:'-10%', top:'10%', background:'var(--pink)', opacity:0.35, transform:`translateY(${pShift*0.4}px)`}}/>
      <div className="orb" style={{width:380, height:380, right:'-8%', top:'45%', background:'#ffc8d6', opacity:0.25, transform:`translateY(${pShift*0.7}px)`}}/>
      <div className="orb" style={{width:280, height:280, left:'35%', bottom:'-10%', background:'var(--pink)', opacity:0.28, transform:`translateY(${-pShift*0.3}px)`}}/>

      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" style={{transform:`translateY(${pShift*0.15}px)`}}>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" stroke="white" strokeWidth="0.5" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 pt-40 pb-20">
        <div className="flex items-start justify-between mb-10 hero-sub">
          <div className="font-sub text-[11px] text-white/50">{eyebrow}</div>
          <div className="font-sub text-[11px] text-white/40 text-right hidden md:block leading-[1.8]">
            6 KATEGORIEN<br/>200+ MARKEN<br/>10.000+ PRODUKTE
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
            Dein Beauty-Onlineshop. Parfum, Pflege, Make-up und Haarkosmetik der größten Marken — kuratiert, schnell versendet und zu fairen Preisen.
          </p>
          <div className="flex items-center gap-3">
            <Magnetic className="group relative overflow-hidden rounded-full px-7 py-4 text-[13px] tracking-wider uppercase font-medium" style={{background:'var(--pink)', color:'#000'}}>
              <span className="relative z-10 flex items-center gap-2">Jetzt Shoppen <Icon.Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1"/></span>
            </Magnetic>
            <Magnetic className="rounded-full border border-white/20 px-7 py-4 text-[13px] tracking-wider uppercase font-medium hover:border-white/60 transition-colors">
              Highlights entdecken
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
          {Array.from({length: 2}).map((_, k) => (
            <div key={k} className="flex items-center gap-10 pr-10">
              {['Kostenloser Versand ab 0€','Originalware','3–6 Werktage','30 Tage Rückgabe','Deutschlands schönstes Beauty-Sortiment','Gutschein sichern','Top Marken','Sichere Zahlung','Käuferschutz','Neu: Duft-Finder'].map((t, i) => (
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

// ---------- Brand marquee ----------
const BRANDS = ['CHANEL','DIOR','HUGO BOSS','YVES SAINT LAURENT','LANCÔME','BURBERRY','VERSACE','PRADA','GUCCI','TOM FORD','ARMANI','AJMAL'];
function BrandStrip() {
  return (
    <section className="bg-black border-y border-white/5 py-10 overflow-hidden">
      <div className="font-mono text-[10px] tracking-[0.3em] text-white/40 text-center mb-6">§ UNSERE TOP MARKEN</div>
      <div className="flex whitespace-nowrap marquee-track">
        {Array.from({length: 2}).map((_, k) => (
          <div key={k} className="flex items-center gap-16 pr-16">
            {BRANDS.map((b, i) => (
              <span key={i} className="font-serif text-[22px] md:text-[28px] tracking-tight text-white/50 hover:text-white transition">{b}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Scrollytelling ----------
const SCIENCE_CHAPTERS = [
  { n:'01', title:'Die Kopfnote', body:'Der erste Atemzug. Bergamotte, rosa Pfeffer, Neroli — was du in den ersten drei Minuten wahrnimmst, bevor ein Duft zu sich selbst wird.' },
  { n:'02', title:'Das Herz', body:'Nach fünfzehn Minuten öffnet sich die Komposition. Rose, Jasmin, Iris — die Seele des Parfums, wo der Charakter stundenlang lebt.' },
  { n:'03', title:'Die Basis', body:'Stunden später, das Dry-Down. Vanille, Oud, Ambrette, Moschus. Das, woran man sich am nächsten Morgen erinnert.' },
  { n:'04', title:'Der Sillage', body:'Die Duftspur. Wie weit du den Raum mit dir trägst, wenn du ihn verlässt — und wie lange er dich noch wahrnimmt.' },
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
      setProgress(Math.max(0, Math.min(1, passed / total)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const active = Math.min(SCIENCE_CHAPTERS.length - 1, Math.floor(progress * SCIENCE_CHAPTERS.length));
  const imgP = progress;

  return (
    <section ref={secRef} className="relative" style={{height: `${SCIENCE_CHAPTERS.length * 90}vh`, background:`rgb(${255-Math.round(progress*255)}, ${255-Math.round(progress*255)}, ${255-Math.round(progress*255)})`, transition:'background-color 120ms linear'}}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden" style={{color: progress < 0.5 ? '#0a0a0a' : '#ffffff'}}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize:'96px 96px', opacity: 0.04
        }}/>
        <div className="absolute top-8 left-0 right-0 px-8 flex items-center justify-between font-sub text-[10px]" style={{opacity:0.55}}>
          <span>§ Anatomie eines Parfums</span>
          <span>{String(active+1).padStart(2,'0')} ⁄ {String(SCIENCE_CHAPTERS.length).padStart(2,'0')}</span>
        </div>
        <div className="mx-auto max-w-[1200px] w-full px-6 md:px-8 grid md:grid-cols-[0.9fr_1.1fr] gap-14 items-center relative">

          <div className="narrative-bg-mobile" aria-hidden="true">
            <div className="absolute inset-0" style={{background: progress < 0.5 ? 'linear-gradient(160deg, #fbeaf0 0%, #f4e8ec 50%, #efd9e1 100%)' : 'linear-gradient(160deg, #1a0e12 0%, #0a0a0a 50%, #2a1a1f 100%)', transition:'background 200ms linear'}}/>
            <div className="absolute" style={{
              left: `${30 + imgP*12}%`, top: `${40 - imgP*10}%`,
              width:'80vw', height:'80vw', maxWidth: 520, maxHeight: 520,
              transform: 'translate(-50%,-50%)',
              background:'radial-gradient(circle, rgba(244,150,176,0.55), transparent 65%)',
              filter:'blur(60px)', borderRadius:'9999px', opacity: 0.9
            }}/>
            <div className="absolute inset-0 flex items-center justify-center" style={{filter:'blur(18px)', opacity: 0.55}}>
              <div className="float" style={{transform:`scale(${1 + imgP*0.25}) rotate(${imgP*6 - 3}deg)`}}>
                <svg width="240" height="360" viewBox="0 0 220 340">
                  <path d="M40 50 L180 50 L186 90 L186 310 Q186 326 170 326 L50 326 Q34 326 34 310 L34 90 Z" fill="#0a0a0a"/>
                  <rect x="60" y="20" width="100" height="22" rx="4" fill="#0a0a0a"/>
                </svg>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-40" style={{background: progress < 0.5 ? 'linear-gradient(180deg, transparent, rgba(255,255,255,0.85))' : 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))'}}/>
          </div>

          <div className="narrative-visual-desktop relative h-[62vh] rounded-2xl overflow-hidden" style={{background: progress < 0.5 ? 'linear-gradient(135deg, #f4e8ec, #fbeaf0 60%, #efd9e1)' : 'linear-gradient(135deg, #1a0e12, #0a0a0a 60%, #2a1a1f)', transition:'background 200ms linear'}}>
            <div className="absolute inset-0 stripes" style={{opacity: 0.35}}/>
            <div className="absolute inset-0 grain"/>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative float" style={{transform:`scale(${0.9 + imgP*0.15}) rotate(${imgP*4 - 2}deg)`}}>
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
                  <text x="110" y="200" textAnchor="middle" fill="#fff" fontFamily="Fraunces" fontSize="22" fontWeight="400" letterSpacing="-0.02em">L'Amour</text>
                  <text x="110" y="220" textAnchor="middle" fill="rgba(244,150,176,0.9)" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="0.3em">PARFUM · 01</text>
                  <line x1="70" y1="240" x2="150" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4"/>
                  <text x="110" y="258" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono" fontSize="7" letterSpacing="0.2em">50 ML / 1.7 FL OZ</text>
                  <text x="110" y="290" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontFamily="JetBrains Mono" fontSize="6" letterSpacing="0.25em">EAU DE PARFUM · 22% KONZ.</text>
                </svg>
                <div className="absolute inset-0 -z-10 rounded-full blur-3xl" style={{background:'radial-gradient(circle, rgba(244,150,176,0.4), transparent 70%)'}}/>
              </div>
            </div>
            <div className="absolute top-5 left-5 font-mono text-[9px] tracking-[0.25em]" style={{color: progress < 0.5 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)'}}>
              L'AMOUR · BEWEGUNG {SCIENCE_CHAPTERS[active].n}
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2 font-mono text-[9px] tracking-widest" style={{color: progress < 0.5 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)'}}>
              <span>{(imgP*100).toFixed(0).padStart(3,'0')}</span>
              <div className="flex-1 h-[1px] relative" style={{background: progress < 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}}>
                <div className="absolute inset-y-0 left-0" style={{width:`${imgP*100}%`, background:'var(--pink)'}}/>
              </div>
              <span>100</span>
            </div>
          </div>

          <div className="narrative-text-col relative">
            <h2 className="font-display leading-[0.95] mb-10" style={{fontSize:'clamp(34px, 4.4vw, 60px)', letterSpacing:'-0.025em'}}>
              Ein Duft ist eine <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>Geschichte</em> in drei Akten.
            </h2>
            <div className="space-y-6">
              {SCIENCE_CHAPTERS.map((c, i) => (
                <div key={i} className="transition-all duration-500"
                     style={{opacity: i === active ? 1 : 0.3, transform: `translateX(${i === active ? 0 : 6}px)`}}>
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

// ---------- Categories grid ----------
function CategoryGrid() {
  const tiles = [
    { label:'Parfum', sub:'Damen · Herren · Unisex', bg:'prod-bg-1' },
    { label:'Gesicht', sub:'Pflege · Reinigung · Masken', bg:'prod-bg-5' },
    { label:'Haare', sub:'Pflege · Styling · Coloration', bg:'prod-bg-3' },
    { label:'Körper', sub:'Pflege · Dusche · Deo', bg:'prod-bg-4' },
    { label:'Make-up', sub:'Teint · Augen · Lippen', bg:'prod-bg-2' },
    { label:'Marken', sub:'Chanel · Dior · YSL · Prada', bg:'prod-bg-6' },
  ];
  return (
    <section className="relative bg-black py-28 border-t border-white/5">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex items-end justify-between mb-10 reveal">
          <div>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ Alle Kategorien</div>
            <h2 className="font-display leading-[0.9]" style={{fontSize:'clamp(42px, 6vw, 92px)', letterSpacing:'-0.03em'}}>
              Beauty,<br/><em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>sortiert</em>.
            </h2>
          </div>
          <a className="hidden md:inline-flex items-center gap-2 text-[12px] tracking-[0.25em] uppercase text-white/70 hover:text-white">Alle anzeigen <Icon.Arrow className="w-4 h-4"/></a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {tiles.map((t, i) => (
            <a key={i} className={`reveal group relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 ${t.bg} hover:border-white/30 transition cursor-pointer`}>
              <div className="absolute inset-0 stripes opacity-40"/>
              <div className="absolute inset-0 grain"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"/>
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <div className="font-mono text-[10px] tracking-[0.25em] text-white/60">0{i+1}</div>
                <div>
                  <div className="font-display text-4xl mb-1 transition-transform group-hover:-translate-y-1" style={{letterSpacing:'-0.02em'}}>{t.label}</div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-white/50 mb-4">{t.sub}</div>
                  <div className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition" style={{color:'var(--pink)'}}>
                    Entdecken <Icon.Arrow className="w-3.5 h-3.5"/>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Smart Match (Duft-Finder) ----------
const SCENT_MOODS = [
  { id:'floral', label:'Blumig', icon: Icon.Leaf, desc:'Rose, Jasmin, Tuberose' },
  { id:'woody', label:'Holzig', icon: Icon.Flame, desc:'Sandelholz, Zeder, Oud' },
  { id:'fresh', label:'Frisch', icon: Icon.Droplet, desc:'Zitrus, Meersalz, grün' },
  { id:'oriental', label:'Orientalisch', icon: Icon.Moon, desc:'Amber, Vanille, Gewürze' },
];

const CONCERNS = ['Tagsüber', 'Am Abend', 'Signatur-Duft', 'Alltagstauglich', 'Besondere Anlässe', 'Intim'];

const RECS = {
  floral: { name:'Misia — Chanel', tag:'MODERN FLORAL', note:'Rose und Veilchen über weichem Moschus. Eine Blume, die weiß, was sie will.', match:0.96, kpi:[['KOPF','BERGAMOTTE'],['HERZ','ROSE'],['BASIS','PATCHOULI']], price: 149 },
  woody: { name:'Sauvage — Dior', tag:'HOLZIG & FRISCH', note:'Bergamotte trifft auf Ambroxan. Warm, klar und nie schwer.', match:0.94, kpi:[['KOPF','BERGAMOTTE'],['HERZ','PFEFFER'],['BASIS','AMBROXAN']], price: 119 },
  fresh: { name:'Bleu de Chanel — Chanel', tag:'FRISCH & COOL', note:'Zitrus, Zedernholz, eine Prise Salz. Das Mittelmeer um sieben Uhr morgens.', match:0.91, kpi:[['KOPF','ZITRONE'],['HERZ','ZEDER'],['BASIS','SANDELHOLZ']], price: 134 },
  oriental: { name:'The Scent — Hugo Boss', tag:'ORIENTALISCHER ABEND', note:'Maninka-Frucht, Ingwer und Leder. Was man nach Einbruch der Dunkelheit greift.', match:0.98, kpi:[['KOPF','MANINKA'],['HERZ','INGWER'],['BASIS','LEDER']], price: 89 },
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
  const runScan = () => { setScanning(true); setDone(false); setTimeout(() => { setScanning(false); setDone(true); }, 2400); };

  if (!open) return null;
  const rec = mood ? RECS[mood] : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div onClick={(e)=>e.stopPropagation()} className="relative glass-strong rounded-t-3xl md:rounded-3xl w-full max-w-[1100px] max-h-[92vh] overflow-hidden flex flex-col md:flex-row">
        <div className="relative md:w-[45%] min-h-[320px] md:min-h-[560px] prod-bg-1 overflow-hidden">
          <div className="absolute inset-0 stripes"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <svg width="180" height="280" viewBox="0 0 180 280" className="opacity-90">
                <defs>
                  <linearGradient id="pfm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(244,150,176,0.45)"/>
                    <stop offset="1" stopColor="rgba(244,150,176,0.08)"/>
                  </linearGradient>
                </defs>
                <rect x="70" y="10" width="40" height="30" rx="3" fill="#0a0a0a" stroke="rgba(244,150,176,0.6)" strokeWidth="0.6"/>
                <rect x="78" y="40" width="24" height="14" fill="#0a0a0a"/>
                <path d="M40 60 L140 60 L150 100 L150 250 Q150 262 138 262 L42 262 Q30 262 30 250 L30 100 Z" fill="url(#pfm)" stroke="rgba(244,150,176,0.7)" strokeWidth="0.8"/>
                <path d="M34 150 Q 90 162 146 150 L146 246 Q146 258 136 258 L44 258 Q34 258 34 246 Z" fill="rgba(244,150,176,0.18)"/>
                {scanning && [[55,140],[125,140],[90,175],[70,210],[110,210]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="3" fill="var(--pink)">
                    <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin={`${i*0.15}s`}/>
                  </circle>
                ))}
              </svg>
              {scanning && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="scan-line absolute left-0 right-0 h-[2px]" style={{background:'linear-gradient(90deg, transparent, var(--pink), transparent)', boxShadow:'0 0 20px var(--pink)'}}/>
                </div>
              )}
              {scanning && (<>
                <div className="absolute inset-0 rounded-full border pulse-ring" style={{borderColor:'rgba(244,150,176,0.5)'}}/>
                <div className="absolute inset-0 rounded-full border pulse-ring pulse-ring-2" style={{borderColor:'rgba(244,150,176,0.4)'}}/>
                <div className="absolute inset-0 rounded-full border pulse-ring pulse-ring-3" style={{borderColor:'rgba(244,150,176,0.3)'}}/>
              </>)}
            </div>
          </div>
          <div className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.25em] text-white/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{background:'var(--pink)', boxShadow:'0 0 10px var(--pink)'}}/>
            L'AMOUR · DUFT-FINDER v2.4
          </div>
          <div className="absolute bottom-6 left-6 right-6 font-mono text-[10px] tracking-[0.2em] text-white/40 flex justify-between">
            <span>PROFILE · 14.203</span>
            <span>NOTEN · 280</span>
            <span>{scanning ? 'ANALYSE…' : done ? 'FERTIG' : 'BEREIT'}</span>
          </div>
        </div>

        <div className="relative md:w-[55%] p-8 md:p-10 overflow-y-auto">
          <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full border border-white/15 hover:border-white/50 transition flex items-center justify-center">
            <span className="text-white/70">×</span>
          </button>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <div key={i} className={`dot ${i <= step ? 'on' : ''}`}/>)}
            </div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-white/50">SCHRITT {step+1} / 3</div>
          </div>

          {step === 0 && (<>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Duft-Finder</div>
            <h3 className="font-display leading-[0.98] mb-4" style={{fontSize:'clamp(28px, 3.2vw, 40px)', letterSpacing:'-0.025em'}}>
              Verrate uns deine <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>Duft-Stimmung</em>.
            </h3>
            <p className="text-white/60 text-[14px] mb-6 max-w-md">Ein 90-Sekunden-Ritual. Wir gleichen dein Profil mit 14.000 Duftpanels ab und empfehlen dir ein Parfum.</p>
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
          </>)}

          {step === 1 && (<>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Feinabstimmung</div>
            <h3 className="font-display leading-[0.98] mb-4" style={{fontSize:'clamp(28px, 3.2vw, 40px)', letterSpacing:'-0.025em'}}>
              Wann willst du ihn <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>tragen</em>?
            </h3>
            <p className="text-white/60 text-[14px] mb-6">Wähle alles, was passt. Die Komposition wird auf deinen Anlass abgestimmt.</p>
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
          </>)}

          {step === 2 && !done && (<>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Analyse</div>
            <h3 className="font-display leading-[0.98] mb-4" style={{fontSize:'clamp(28px, 3.2vw, 40px)', letterSpacing:'-0.025em'}}>
              {scanning ? <>Lese <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>dein Profil</em>…</> : <>Bereit zum <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>Scannen</em>.</>}
            </h3>
            <p className="text-white/60 text-[14px] mb-8">
              {scanning ? 'Abgleich mit 14.203 Duftpanels. Gewichtung nach Noten, Sillage und Stimmung.' : 'Wir haben genug. Starte den Duft-Finder.'}
            </p>
            {scanning ? (
              <div className="space-y-3">
                {['Lade Duftvektoren…','Gleiche mit Duftpanels ab…','Gewichte nach Anlass…','Sortiere Empfehlungen…'].map((l,i)=>(
                  <div key={i} className="flex items-center gap-3 font-mono text-[12px] text-white/60" style={{animation:`heroIn 0.6s ${i*0.45}s both`}}>
                    <Icon.Check className="w-4 h-4" style={{color:'var(--pink)'}}/> {l}
                  </div>
                ))}
              </div>
            ) : (
              <Magnetic onClick={runScan} className="rounded-full px-7 py-4 text-[13px] tracking-wider uppercase font-medium inline-flex items-center gap-2" style={{background:'var(--pink)', color:'#000'}}>
                <Icon.Scan className="w-4 h-4"/> Analyse starten
              </Magnetic>
            )}
          </>)}

          {step === 2 && done && rec && (<>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>Deine Empfehlung · {(rec.match*100).toFixed(0)}% Treffer</div>
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
                <Magnetic onClick={() => { onAddToCart({ name: rec.name, price: rec.price, cat: 'PARFUM' }); onClose(); }} className="flex-1 rounded-full py-3.5 text-[13px] tracking-wider uppercase font-medium" style={{background:'var(--pink)', color:'#000'}}>
                  In den Warenkorb — €{rec.price}
                </Magnetic>
                <button onClick={()=>{setDone(false); setStep(0); setMood(null); setConcerns([]);}} className="rounded-full border border-white/20 px-5 py-3.5 text-[13px] tracking-wider uppercase">Neu</button>
              </div>
            </div>
          </>)}

          {!(step===2 && done) && (
            <div className="mt-8 flex items-center justify-between">
              <button onClick={()=>setStep(Math.max(0, step-1))} className="text-white/50 hover:text-white text-[12px] tracking-wider uppercase" disabled={step===0}>
                {step===0 ? '' : '← Zurück'}
              </button>
              {step < 2 && (
                <Magnetic onClick={()=>setStep(step+1)} disabled={step===0 && !mood}
                  className="rounded-full px-6 py-3 text-[12px] tracking-wider uppercase font-medium inline-flex items-center gap-2 disabled:opacity-40"
                  style={{background:'var(--pink)', color:'#000'}}>
                  Weiter <Icon.Arrow className="w-3.5 h-3.5"/>
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
  { id:1, bg:'prod-bg-1', name:'Sauvage', brand:'DIOR',        cat:'PARFUM',   price:119, notes:'Bergamotte · Ambroxan', swatch:'#f496b0' },
  { id:2, bg:'prod-bg-2', name:'Bleu de Chanel', brand:'CHANEL', cat:'PARFUM', price:134, notes:'Zitrus · Zeder',       swatch:'#ffc8d6' },
  { id:3, bg:'prod-bg-3', name:'Misia',  brand:'CHANEL',         cat:'PARFUM', price:149, notes:'Rose · Veilchen',      swatch:'#e87b98' },
  { id:4, bg:'prod-bg-4', name:'The Scent', brand:'HUGO BOSS',   cat:'PARFUM', price:89,  notes:'Maninka · Leder',      swatch:'#d46a85' },
  { id:5, bg:'prod-bg-5', name:'Opium', brand:'YVES SAINT LAURENT', cat:'PARFUM', price:129, notes:'Gewürze · Myrrhe',  swatch:'#ffa6bd' },
  { id:6, bg:'prod-bg-6', name:'La Vie Est Belle', brand:'LANCÔME', cat:'PARFUM', price:119, notes:'Iris · Patchouli',  swatch:'#f496b0' },
  { id:7, bg:'prod-bg-1', name:'Incense Wood', brand:'AJMAL',     cat:'PARFUM', price:79,  notes:'Weihrauch · Oud',      swatch:'#f07a99' },
  { id:8, bg:'prod-bg-3', name:'Her',      brand:'BURBERRY',      cat:'PARFUM', price:99,  notes:'Beeren · Moschus',     swatch:'#ffc8d6' },
];

function ProductCard({ p, onAdd }) {
  const [hover, setHover] = useState(false);
  return (
    <div data-hover="" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      className={`group shrink-0 w-[320px] md:w-[380px] rounded-3xl overflow-hidden relative transition-all duration-500 ${p.bg} ${hover ? 'glow-pink -translate-y-2' : ''}`}>
      <div className="absolute inset-0 stripes opacity-60"/>
      <div className="absolute inset-0 grain"/>
      <div className="relative aspect-[4/5] flex items-center justify-center p-8">
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
            <text x="70" y="124" textAnchor="middle" fill="#fff" fontFamily="Fraunces" fontSize="12">{p.name.length > 14 ? p.name.slice(0,13)+'…' : p.name}</text>
            <text x="70" y="142" textAnchor="middle" fill={p.swatch} fontFamily="JetBrains Mono" fontSize="6" letterSpacing="0.3em">{p.brand}</text>
            <line x1="40" y1="158" x2="100" y2="158" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4"/>
            <text x="70" y="176" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono" fontSize="5" letterSpacing="0.2em">50ML · 1.7 FL OZ</text>
          </svg>
          <div className="absolute inset-0 -z-10 blur-2xl rounded-full transition-opacity duration-500" style={{background:`radial-gradient(circle, ${p.swatch}55, transparent 70%)`, opacity: hover ? 1 : 0.5}}/>
        </div>
        <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.25em] text-white/60">{p.brand}</div>
        <div className="absolute top-4 right-4 flex items-center gap-1 text-white/70 text-[11px]">
          <Icon.Star className="w-3 h-3" style={{color:'var(--pink)'}}/> 4.9
        </div>
        <div className={`absolute left-4 right-4 bottom-4 transition-all duration-500 ${hover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <Magnetic as="button" onClick={()=>onAdd(p)} className="w-full rounded-full py-3 text-[12px] tracking-wider uppercase font-medium flex items-center justify-center gap-2" style={{background:'var(--pink)', color:'#000', boxShadow:'0 0 30px rgba(244,150,176,0.6)'}}>
            <Icon.Plus className="w-4 h-4"/> Jetzt kaufen
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
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ Highlights für dich</div>
            <h2 className="font-display leading-[0.9]" style={{fontSize:'clamp(48px, 7vw, 108px)', letterSpacing:'-0.035em'}}>
              Parfüme,<br/><em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>die bleiben</em>.
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
        <div className="font-sub text-[11px] text-white/40 mb-8">Vogue Deutschland · April 2026</div>
        <blockquote className="font-display leading-[1.08]" style={{fontSize:'clamp(28px, 3.6vw, 52px)', letterSpacing:'-0.025em'}}>
          „Der Online-Shop, der die Regeln<br/>
          <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>der modernen Beauty-Welt</em><br/>
          still neu schreibt.“
        </blockquote>
        <div className="mt-10 flex items-center justify-center gap-4 text-white/50 font-sub text-[11px]">
          <span className="w-10 h-px bg-white/20"/>
          <span>Sofia Marchetti, Beauty-Redakteurin</span>
          <span className="w-10 h-px bg-white/20"/>
        </div>
      </div>
    </section>
  );
}

// ---------- Ritual / three-category section ----------
function Ritual() {
  const steps = [
    { n:'01', title:'Parfum',   body:'Rose, Jasmin, Oud. Düfte der größten Maisons und Nischen-Labels — kuratiert für Damen, Herren und Unisex.', prod:'Chanel · Dior · YSL · Hugo Boss' },
    { n:'02', title:'Pflege',   body:'Gesicht, Körper, Haare. Hochwirksame Pflegeroutinen mit Seren, Cremes und Masken der Expertenmarken.',      prod:'La Mer · Lancôme · Kiehl\u2019s · Clinique' },
    { n:'03', title:'Make-up',  body:'Teint, Augen, Lippen. Von der unsichtbaren Foundation bis zum Signature-Rot — alles, was du brauchst.',     prod:'YSL · Dior · Chanel · Tom Ford' },
  ];
  return (
    <section className="relative bg-black py-28 border-t border-white/5">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex items-end justify-between mb-14 reveal">
          <div>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ Unsere Welt</div>
            <h2 className="font-display leading-[0.94]" style={{fontSize:'clamp(40px, 5.5vw, 84px)', letterSpacing:'-0.03em'}}>Drei Welten.<br/>Ein Onlineshop.</h2>
          </div>
          <a className="hidden md:inline-flex items-center gap-2 text-[12px] tracking-[0.25em] uppercase text-white/70 hover:text-white">Alles entdecken <Icon.Arrow className="w-4 h-4"/></a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="reveal rounded-3xl p-7 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-white/30 transition relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="font-mono text-[10px] tracking-[0.25em]" style={{color:'var(--pink)'}}>{s.n}</div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-white/30">WELT · 0{i+1}</div>
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

// ---------- FAQ ----------
function FAQ() {
  const items = [
    { q:'Dein Beauty-Onlineshop',
      a:'L\u2019Amour ist dein Online-Destination für Parfum, Pflege und Make-up. Wir kuratieren über 10.000 Produkte von mehr als 200 Marken — von Luxus bis Nische — und liefern sie schnell und sicher direkt zu dir nach Hause. Versand in 3–6 Werktagen, 30 Tage Rückgaberecht.' },
    { q:'Entdecke Deutschlands schönstes Beauty-Sortiment',
      a:'Ob Chanel, Dior, Yves Saint Laurent oder Nischenmarken wie Ajmal und Byredo — bei uns findest du das komplette Beauty-Universum. Parfüme für Damen, Herren und Unisex. Gesichtspflege, Haarstyling, Körperpflege und Make-up der führenden Häuser — alles an einem Ort.' },
    { q:'Das perfekte Produkt für deine Bedürfnisse',
      a:'Unser Duft-Finder hilft dir, dein Signature-Parfum zu finden. In unter 90 Sekunden gleichen wir deine Vorlieben mit über 14.000 Duftprofilen ab und empfehlen dir das passende Produkt — egal ob blumig, holzig, frisch oder orientalisch.' },
    { q:'Bezaubernde Duft-Momente',
      a:'Ein Duft ist mehr als ein Accessoire — er ist eine Erinnerung, eine Visitenkarte, ein Ritual. Bei L\u2019Amour findest du Parfüme, die deine Persönlichkeit unterstreichen und dich täglich begleiten. Mit originalverpackten Markenprodukten und bester Qualität.' },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="relative bg-black py-28 border-t border-white/5">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="mb-12 reveal">
          <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ Über Lamour</div>
          <h2 className="font-display leading-[0.95]" style={{fontSize:'clamp(36px, 5vw, 72px)', letterSpacing:'-0.03em'}}>
            Fragen &amp; <em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>Antworten</em>.
          </h2>
        </div>
        <div className="rounded-3xl border border-white/10 overflow-hidden reveal">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`border-b border-white/10 last:border-b-0`}>
                <button onClick={()=>setOpen(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center shrink-0" style={isOpen ? {borderColor:'var(--pink)', background:'var(--pink)', color:'#000'} : {}}>
                      {isOpen ? <Icon.Minus className="w-4 h-4"/> : <Icon.Plus className="w-4 h-4"/>}
                    </div>
                    <div className="font-serif text-[19px] md:text-[22px]">{it.q}</div>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 pl-[72px] text-white/60 text-[14.5px] leading-relaxed max-w-[720px]">{it.a}</div>
                </div>
              </div>
            );
          })}
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

  const linkCols = [
    { h:'Informationen', items:['AGB & Widerrufsrecht','Datenschutz','Impressum','Widerrufsrecht','Versandbedingungen'] },
    { h:'Weitere Fragen?', items:['FAQ','Rückgaberegelung','Zahlungsarten','Versand & Lieferung'] },
    { h:'Über Lamour',  items:['Kontakt','Über uns','Karriere','Presse'] },
    { h:'Top Marken',  items:['Chanel','Dior','Hugo Boss','Yves Saint Laurent','Prada','Versace'] },
    { h:'Top Produkte',items:['Sauvage','Bleu de Chanel','The Scent','Opium','La Vie Est Belle','Misia'] },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Newsletter panel */}
      <div className="relative bg-black pb-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative rounded-3xl p-12 md:p-16 overflow-hidden text-center" style={{background:'var(--pink)', color:'#0a0a0a'}}>
            <div className="absolute inset-0 grain opacity-30"/>
            <div className="font-sub text-[11px] text-black/60 mb-4">§ Newsletter</div>
            <h2 className="font-display leading-[0.95] mb-4" style={{fontSize:'clamp(40px, 5vw, 72px)', letterSpacing:'-0.03em'}}>
              Gutschein sichern.
            </h2>
            <p className="text-black/70 text-[15px] mb-8 max-w-md mx-auto">Jetzt anmelden und Gutschein sichern! Beauty-News, Duft-Tipps und exklusive Angebote direkt in dein Postfach.</p>
            {!subscribed ? (
              <form onSubmit={submit} className="max-w-lg mx-auto">
                <div className="rounded-full bg-white/40 flex items-center pl-6 pr-1.5 py-1.5 backdrop-blur-sm border border-white/30">
                  <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="E-Mail Adresse"
                    className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-black/50 py-3 text-black"/>
                  <Magnetic as="button" type="submit" className="rounded-full px-6 py-3 text-[12px] tracking-wider uppercase font-medium bg-black text-white">
                    Abonnieren
                  </Magnetic>
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-black/50 mt-3">MIT ANMELDUNG AKZEPTIERST DU UNSERE DATENSCHUTZERKLÄRUNG</div>
              </form>
            ) : (
              <div className="inline-flex items-center gap-3 bg-black text-white rounded-full px-6 py-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:'var(--pink)'}}>
                  <Icon.Check className="w-4 h-4 text-black"/>
                </div>
                <div>
                  <div className="font-serif text-lg">Willkommen bei L'Amour.</div>
                  <div className="text-white/70 text-[13px]">Dein Gutschein ist unterwegs.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pink link panel */}
      <div className="relative py-16 px-6" style={{background:'var(--pink)', color:'#0a0a0a'}}>
        <div className="mx-auto max-w-[1300px]">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
            {linkCols.map((col, i) => (
              <div key={i}>
                <div className="font-serif text-[20px] mb-5">{col.h}</div>
                <ul className="space-y-2.5 text-[14px]">
                  {col.items.map(it => <li key={it} className="opacity-80 hover:opacity-100 underline underline-offset-4 decoration-black/30 cursor-pointer">{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-black/20 grid md:grid-cols-3 gap-8 items-center">
            <div>
              <div className="font-serif text-2xl mb-2"><span className="font-bold">L'A</span>MOUR</div>
              <div className="text-[13px] opacity-75 max-w-xs">Dein Beauty-Onlineshop. Parfum, Pflege und Make-up.</div>
            </div>
            <div>
              <div className="font-serif text-[17px] mb-3">Zahlungsmethoden</div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {['American Express','Apple Pay','Google Pay','Maestro','Mastercard','Union Pay','Visa'].map(p => (
                  <span key={p} className="px-2.5 py-1.5 bg-white/60 rounded-md border border-black/10 font-medium">{p}</span>
                ))}
              </div>
            </div>
            <div className="md:text-right">
              <div className="font-serif text-[17px] mb-3">Folge uns</div>
              <div className="flex md:justify-end items-center gap-3">
                {[Icon.Instagram, Icon.Tiktok, Icon.Youtube].map((I, i) => (
                  <a key={i} className="w-10 h-10 rounded-full border border-black/20 hover:border-black hover:bg-black hover:text-white transition flex items-center justify-center">
                    <I className="w-4 h-4"/>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-[10px] tracking-[0.2em] opacity-70">
            <div>© 2026 L'AMOUR · ALLE RECHTE VORBEHALTEN</div>
            <div className="flex gap-4">
              <a className="hover:opacity-100 underline underline-offset-4">Impressum</a>
              <a className="hover:opacity-100 underline underline-offset-4">Datenschutz</a>
              <a className="hover:opacity-100 underline underline-offset-4">AGB</a>
            </div>
          </div>
        </div>
      </div>

      {/* Giant watermark */}
      <div className="relative bg-black overflow-hidden">
        <div className="text-center pointer-events-none select-none py-10">
          <div className="watermark" style={{fontSize:'clamp(120px, 26vw, 420px)'}}>L'AMOUR</div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Cart Drawer ----------
function Cart({ open, items, onClose, onRemove }) {
  const total = items.reduce((a,b)=>a + (b.price || 0), 0);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
      <div onClick={(e)=>e.stopPropagation()} className="relative w-full max-w-md glass-strong h-full flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-white/50">§ WARENKORB</div>
            <div className="font-serif text-2xl mt-1">Warenkorb · {items.length}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/15 hover:border-white/50">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.length === 0 ? (
            <div className="text-white/50 text-center mt-20 font-serif text-xl">Dein Warenkorb ist leer.</div>
          ) : items.map((it, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 p-3">
              <div className="w-16 h-20 rounded-xl prod-bg-1 shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[16px] truncate">{it.name}</div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-white/40 mt-1">{it.cat || 'PARFUM'}</div>
              </div>
              <div className="font-serif text-[17px]">€{it.price || 0}</div>
              <button onClick={()=>onRemove(i)} className="text-white/40 hover:text-white">×</button>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] tracking-[0.2em] text-white/50">ZWISCHENSUMME</div>
            <div className="font-serif text-2xl">€{total}</div>
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/40 flex items-center gap-2">
            <Icon.Truck className="w-4 h-4" style={{color:'var(--pink)'}}/> KOSTENLOSER VERSAND · 3–6 WERKTAGE
          </div>
          <Magnetic className="w-full rounded-full py-4 text-[13px] tracking-wider uppercase font-medium" style={{background:'var(--pink)', color:'#000'}}>
            Zur Kasse
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
    const item = typeof p === 'string' ? { name: p, price: 89, cat: 'PARFUM' } : p;
    setCart((prev) => [...prev, item]);
    setCartOpen(true);
  };

  return (
    <div className="relative">
      <CustomCursor/>
      {tw.grain && <div className="fixed inset-0 pointer-events-none z-[60] grain"/>}

      <Nav onOpenSmartMatch={()=>setSmartOpen(true)} onOpenCart={()=>setCartOpen(true)} cartCount={cart.length}/>

      <Hero headline={tw.heroHeadline || 'Duft, neu erzählt.'} eyebrow={tw.heroEyebrow} parallax={tw.parallax}/>

      <BrandStrip/>

      <CategoryGrid/>

      <Scrollytelling/>

      {/* Duft-Finder CTA band */}
      <section className="relative bg-black py-24 border-t border-white/5">
        <div className="mx-auto max-w-[1400px] px-6 grid md:grid-cols-[1.2fr,1fr] gap-10 items-center reveal">
          <div>
            <div className="font-sub text-[11px] mb-3" style={{color:'var(--pink)'}}>§ Duft-Finder</div>
            <h2 className="font-display leading-[0.9]" style={{fontSize:'clamp(48px, 7vw, 108px)', letterSpacing:'-0.035em'}}>
              Lass die<br/><em className="not-italic" style={{color:'var(--pink)', fontStyle:'italic'}}>KI</em> wählen.
            </h2>
            <p className="text-white/60 text-[15px] max-w-md mt-6">Unser Duft-Finder gleicht dein Profil mit 14.000 Duftpanels ab und empfiehlt dir das perfekte Parfum. In nur 90 Sekunden.</p>
            <div className="mt-8">
              <Magnetic onClick={()=>setSmartOpen(true)} className="rounded-full px-8 py-4 text-[13px] tracking-[0.25em] uppercase font-medium inline-flex items-center gap-2" style={{background:'var(--pink)', color:'#000'}}>
                <Icon.Scan className="w-4 h-4"/> Duft-Finder starten
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
            <div className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.25em] text-white/60">L'AMOUR · DUFT-FINDER v2.4</div>
            <div className="absolute bottom-5 left-5 right-5 flex justify-between font-mono text-[10px] tracking-[0.2em] text-white/40">
              <span>TREFFERQUOTE: 98%</span>
              <span>PROBEN: 14.203</span>
            </div>
          </div>
        </div>
      </section>

      <Bestsellers onAdd={addToCart}/>

      <EditorialQuote/>

      <Ritual/>

      <FAQ/>

      <Footer/>

      <SmartMatch open={smartOpen} onClose={()=>setSmartOpen(false)} onAddToCart={addToCart}/>
      <Cart open={cartOpen} items={cart} onClose={()=>setCartOpen(false)} onRemove={(i)=>setCart(prev => prev.filter((_,x)=>x!==i))}/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Brand">
          <TweakColor label="Akzent (pink)" value={tw.accent} onChange={(v)=>setTw('accent', v)}/>
          <TweakText label="Hero Headline" value={tw.heroHeadline} onChange={(v)=>setTw('heroHeadline', v)}/>
          <TweakText label="Eyebrow" value={tw.heroEyebrow} onChange={(v)=>setTw('heroEyebrow', v)}/>
        </TweakSection>
        <TweakSection title="Effekte">
          <TweakToggle label="Film-Grain-Overlay" value={tw.grain} onChange={(v)=>setTw('grain', v)}/>
          <TweakToggle label="Parallax im Hero" value={tw.parallax} onChange={(v)=>setTw('parallax', v)}/>
          <TweakToggle label="Magnetische Buttons" value={tw.magnetic} onChange={(v)=>setTw('magnetic', v)}/>
        </TweakSection>
        <TweakSection title="Aktionen">
          <TweakButton label="Duft-Finder öffnen" onClick={()=>setSmartOpen(true)}/>
          <TweakButton label="Warenkorb öffnen" onClick={()=>setCartOpen(true)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
