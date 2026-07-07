// =============================================
// HERO
// =============================================

const { useState, useEffect, useRef, useMemo } = React;

function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalParts = window.BUILD_DATA.parts.length;
  const totalPrice = window.BUILD_DATA.parts.reduce((s,p) => s + p.price, 0);
  const avgFps = Math.round(
    window.BUILD_DATA.fps.reduce((s,g) => s + g.avg, 0) / window.BUILD_DATA.fps.length
  );

  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-grid">

          {/* LEFT */}
          <div>
            <div className="hero-eyebrow">
              <span className="pulse"></span>
              <span>Build #001 · Surprise edition · 2026</span>
            </div>

            <h1 className="hero-title display">
              <span className="line">PC MAX</span>
              <span className="line"><span className="glitch">EDITION</span></span>
            </h1>

            <div className="hero-edition">
              ДЛЯ <span>МАКСИМА</span> · ВІД БРАТА
            </div>

            <p className="hero-desc">
              Кастомна збірка на AMD Ryzen&nbsp;5&nbsp;5600&nbsp;+&nbsp;RTX&nbsp;5060,
              заточена під 1080p ultra. Зібрана спеціально для тебе — і це твоя машина.
            </p>

            <div className="hero-cta">
              <a href="#build" className="btn btn-primary">
                Розібрати ПК
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#arsenal" className="btn btn-outline">
                Подивитись деталі
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">
                  <CountUp to={totalParts} /><span className="unit">шт</span>
                </div>
                <div className="hero-stat-label">Комплектуючих</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">
                  <CountUp to={totalPrice} /><span className="unit">₴</span>
                </div>
                <div className="hero-stat-label">Загальна вартість</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">
                  ~<CountUp to={avgFps} /><span className="unit">fps</span>
                </div>
                <div className="hero-stat-label">Середній FPS 1080p</div>
              </div>
            </div>
          </div>

          {/* RIGHT — case visual */}
          <div className="hero-visual">
            <div className="hero-case-stage" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
              <div className="hero-ring"></div>
              <div className="hero-ring-2"></div>

              <HeroCase />

              {/* corner crosshairs */}
              <div className="hero-cross" style={{ top: 0, left: 0 }}></div>
              <div className="hero-cross" style={{ top: 0, right: 0, transform: 'scaleX(-1)' }}></div>
              <div className="hero-cross" style={{ bottom: 0, left: 0, transform: 'scaleY(-1)' }}></div>
              <div className="hero-cross" style={{ bottom: 0, right: 0, transform: 'scale(-1)' }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-hint">
        <div className="hero-scroll-line"></div>
        <span>scroll</span>
      </div>
    </section>
  );
}

// Mini-case SVG for hero
function HeroCase() {
  return (
    <svg className="hero-case" viewBox="0 0 160 260" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* glass panel gradient — cyan tint */}
        <linearGradient id="hc-glass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,230,255,0.13)" />
          <stop offset="40%"  stopColor="rgba(0,230,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,46,61,0.06)" />
        </linearGradient>
        {/* body gradient */}
        <linearGradient id="hc-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#1c1c24" />
          <stop offset="100%" stopColor="#0a0a0f" />
        </linearGradient>
        {/* mobo gradient */}
        <linearGradient id="hc-mobo" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%"   stopColor="#0b1a10" />
          <stop offset="100%" stopColor="#090d0b" />
        </linearGradient>
        {/* GPU gradient */}
        <linearGradient id="hc-gpu" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#1c0a0d" />
          <stop offset="100%" stopColor="#0f0609" />
        </linearGradient>
        {/* PSU gradient */}
        <linearGradient id="hc-psu" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#141008" />
          <stop offset="100%" stopColor="#0a0905" />
        </linearGradient>
        {/* glow filter */}
        <filter id="hc-glow-r" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="hc-glow-c" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* mesh dot pattern for front panel */}
        <pattern id="hc-mesh" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.7" fill="rgba(255,255,255,0.18)" />
        </pattern>
        {/* cooler fin pattern */}
        <pattern id="hc-fin" x="0" y="0" width="4" height="1" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0.5" x2="4" y2="0.5" stroke="#3a3a50" strokeWidth="0.5"/>
        </pattern>
        {/* glass glare */}
        <linearGradient id="hc-glare" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.07)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* ── OUTER SHELL ── */}
      {/* Main body */}
      <rect x="4" y="4" width="152" height="252" rx="2" fill="url(#hc-body)" stroke="#252530" strokeWidth="1.2" />

      {/* ── FRONT MESH PANEL (left strip, ~20% width) ── */}
      <rect x="4" y="4" width="26" height="252" rx="2" fill="#0c0c10" stroke="#252530" strokeWidth="0.8" />
      <rect x="5" y="5" width="24" height="250" fill="url(#hc-mesh)" />

      {/* front mesh highlight edges */}
      <line x1="30" y1="4" x2="30" y2="256" stroke="#2a2a38" strokeWidth="0.8"/>

      {/* ── I/O STRIP (top-right area) ── */}
      <rect x="32" y="6" width="80" height="10" rx="1" fill="#0d0d14" stroke="#1e1e28" strokeWidth="0.6"/>
      {/* power button */}
      <circle cx="40" cy="11" r="3" fill="#0a0a10" stroke="#252530" strokeWidth="0.8"/>
      <circle cx="40" cy="11" r="1.5" fill="#ff2e3d" className="hc-led-power" filter="url(#hc-glow-r)"/>
      {/* USB-A */}
      <rect x="50" y="8" width="5" height="6" rx="0.5" fill="#0033aa" opacity="0.9"/>
      <rect x="57" y="8" width="5" height="6" rx="0.5" fill="#111118" opacity="0.7"/>
      {/* audio jack */}
      <circle cx="69" cy="11" r="2.2" fill="#0a0a12" stroke="#1e1e28" strokeWidth="0.5"/>
      <circle cx="69" cy="11" r="1" fill="#151520"/>

      {/* ── RGB STRIP (top edge, under I/O) ── */}
      <rect x="32" y="17" width="124" height="2.5" fill="#ff2e3d" opacity="0.9" className="hc-rgb-strip" filter="url(#hc-glow-r)"/>

      {/* ── GLASS PANEL ── */}
      <rect x="32" y="21" width="120" height="216" fill="url(#hc-glass)" stroke="#1c2228" strokeWidth="0.6"/>
      {/* glass glare diagonal */}
      <rect x="33" y="22" width="30" height="214" fill="url(#hc-glare)"/>

      {/* ── INTERNALS (visible through glass) ── */}
      <g opacity="0.92">

        {/* MOTHERBOARD */}
        <rect x="50" y="28" width="90" height="120" rx="1" fill="url(#hc-mobo)" stroke="#2bff88" strokeWidth="0.7" opacity="0.7"/>
        {/* mobo trace lines */}
        <line x1="50" y1="60"  x2="140" y2="60"  stroke="#1a3020" strokeWidth="0.4"/>
        <line x1="50" y1="90"  x2="140" y2="90"  stroke="#1a3020" strokeWidth="0.4"/>
        <line x1="90" y1="28"  x2="90"  y2="148" stroke="#1a3020" strokeWidth="0.4"/>

        {/* CPU SOCKET area */}
        <rect x="54" y="32" width="28" height="28" rx="1" fill="#0f1a12" stroke="#2bff88" strokeWidth="0.5" opacity="0.5"/>

        {/* CPU COOLER — tower fins */}
        <rect x="54" y="30" width="28" height="34" rx="1" fill="#1a1a26" stroke="#aaaacc" strokeWidth="0.7"/>
        <rect x="55" y="31" width="26" height="32" fill="url(#hc-fin)"/>
        {/* cooler fan circle */}
        <circle cx="67" cy="47" r="10" fill="none" stroke="#252538" strokeWidth="1.2"/>
        <circle cx="67" cy="47" r="6"  fill="none" stroke="#303048" strokeWidth="0.8"/>
        <circle cx="67" cy="47" r="2"  fill="#1a1a26" stroke="#454560" strokeWidth="0.6"/>
        {/* fan blades hint */}
        <line x1="67" y1="38" x2="67" y2="41" stroke="#404055" strokeWidth="1"/>
        <line x1="67" y1="53" x2="67" y2="56" stroke="#404055" strokeWidth="1"/>
        <line x1="58" y1="47" x2="61" y2="47" stroke="#404055" strokeWidth="1"/>
        <line x1="73" y1="47" x2="76" y2="47" stroke="#404055" strokeWidth="1"/>

        {/* RAM STICKS — 2× vertical beside cooler */}
        <rect x="88" y="30" width="7" height="30" rx="0.5" fill="#0a1018" stroke="#00e6ff" strokeWidth="0.7"/>
        <rect x="97" y="30" width="7" height="30" rx="0.5" fill="#0a1018" stroke="#00e6ff" strokeWidth="0.7"/>
        {/* RAM RGB top bar */}
        <rect x="88" y="30" width="7" height="5" fill="#00e6ff" opacity="0.4" filter="url(#hc-glow-c)"/>
        <rect x="97" y="30" width="7" height="5" fill="#00e6ff" opacity="0.4" filter="url(#hc-glow-c)"/>
        {/* RAM chips */}
        <rect x="89" y="38" width="5" height="3" rx="0.3" fill="#0d2030" stroke="#005577" strokeWidth="0.3"/>
        <rect x="89" y="43" width="5" height="3" rx="0.3" fill="#0d2030" stroke="#005577" strokeWidth="0.3"/>
        <rect x="98" y="38" width="5" height="3" rx="0.3" fill="#0d2030" stroke="#005577" strokeWidth="0.3"/>
        <rect x="98" y="43" width="5" height="3" rx="0.3" fill="#0d2030" stroke="#005577" strokeWidth="0.3"/>

        {/* PCIE slot */}
        <rect x="50" y="102" width="90" height="3" rx="0.5" fill="#1a1028" stroke="#333" strokeWidth="0.4" opacity="0.8"/>

        {/* GPU CARD — horizontal, long */}
        <rect x="36" y="108" width="104" height="36" rx="1" fill="url(#hc-gpu)" stroke="#ff2e3d" strokeWidth="0.8"/>
        {/* GPU heatsink fins */}
        <rect x="38" y="110" width="96" height="32" rx="0.5" fill="#130810" stroke="#2a1015" strokeWidth="0.4"/>
        {/* GPU fans — 2 large */}
        <circle cx="62"  cy="126" r="13" fill="none" stroke="#2a1010" strokeWidth="1"/>
        <circle cx="62"  cy="126" r="8"  fill="none" stroke="#351010" strokeWidth="0.8"/>
        <circle cx="62"  cy="126" r="3"  fill="#200810" stroke="#ff2e3d" strokeWidth="0.5" opacity="0.8"/>
        <circle cx="100" cy="126" r="13" fill="none" stroke="#2a1010" strokeWidth="1"/>
        <circle cx="100" cy="126" r="8"  fill="none" stroke="#351010" strokeWidth="0.8"/>
        <circle cx="100" cy="126" r="3"  fill="#200810" stroke="#ff2e3d" strokeWidth="0.5" opacity="0.8"/>
        {/* GPU fan LED centers */}
        <circle cx="62"  cy="126" r="1.2" fill="#ff2e3d" className="hc-led-gpu"   filter="url(#hc-glow-r)"/>
        <circle cx="100" cy="126" r="1.2" fill="#ff2e3d" className="hc-led-gpu-2" filter="url(#hc-glow-r)"/>
        {/* GPU RGB underglow strip */}
        <rect x="38" y="143" width="96" height="1.5" fill="#ff2e3d" opacity="0.6" className="hc-rgb-strip" filter="url(#hc-glow-r)"/>

        {/* NVMe SSD — under mobo area */}
        <rect x="54" y="152" width="42" height="8" rx="0.5" fill="#0d0d1c" stroke="#a87bff" strokeWidth="0.6" opacity="0.85"/>
        <text x="57" y="158" fill="#a87bff" fontSize="4.5" fontFamily="monospace" opacity="0.9" letterSpacing="0.3">NVMe SSD</text>
        {/* SSD chips */}
        <rect x="100" y="153" width="6" height="6" rx="0.5" fill="#0d0a18" stroke="#7060cc" strokeWidth="0.4" opacity="0.7"/>
        <rect x="108" y="153" width="6" height="6" rx="0.5" fill="#0d0a18" stroke="#7060cc" strokeWidth="0.4" opacity="0.7"/>

      </g>

      {/* ── PSU SHROUD (bottom zone) ── */}
      <rect x="32" y="196" width="124" height="4" fill="#1a1a24" stroke="#252530" strokeWidth="0.5"/>
      <rect x="32" y="200" width="124" height="52" rx="1" fill="url(#hc-psu)" stroke="#332800" strokeWidth="0.8"/>
      {/* PSU fan */}
      <circle cx="54"  cy="226" r="18" fill="none" stroke="#2a2208" strokeWidth="1"/>
      <circle cx="54"  cy="226" r="12" fill="none" stroke="#332a08" strokeWidth="0.8"/>
      <circle cx="54"  cy="226" r="4"  fill="#1a1505" stroke="#ffb547" strokeWidth="0.6" opacity="0.8"/>
      {/* fan blades */}
      <line x1="54"  y1="210" x2="54"  y2="215" stroke="#3a3010" strokeWidth="1.2"/>
      <line x1="54"  y1="237" x2="54"  y2="242" stroke="#3a3010" strokeWidth="1.2"/>
      <line x1="38"  y1="226" x2="43"  y2="226" stroke="#3a3010" strokeWidth="1.2"/>
      <line x1="65"  y1="226" x2="70"  y2="226" stroke="#3a3010" strokeWidth="1.2"/>
      {/* PSU label */}
      <rect x="80" y="212" width="64" height="24" rx="1" fill="#0f0c05" stroke="#2a2008" strokeWidth="0.5"/>
      <text x="112" y="223" fill="#ffb547" fontSize="6" fontFamily="monospace" textAnchor="middle" opacity="0.9" letterSpacing="0.8">550W</text>
      <text x="112" y="231" fill="#ffb547" fontSize="3.5" fontFamily="monospace" textAnchor="middle" opacity="0.5" letterSpacing="0.3">80+ BRONZE</text>

      {/* ── TOP PANEL ── */}
      <rect x="4" y="4" width="152" height="5" rx="1" fill="#222230" stroke="#2a2a3a" strokeWidth="0.5"/>

      {/* ── RUBBER FEET ── */}
      <rect x="14" y="252" width="10" height="5" rx="2" fill="#111116"/>
      <rect x="136" y="252" width="10" height="5" rx="2" fill="#111116"/>
    </svg>
  );
}

// Count-up animation
function CountUp({ to, duration = 1600 }) {
  const [v, setV] = useState(0);
  const ref = useRef();

  useEffect(() => {
    let raf, t0;
    const start = () => {
      t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setV(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        start();
        io.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [to, duration]);

  return <span ref={ref}>{v.toLocaleString('uk-UA')}</span>;
}

window.Hero = Hero;
window.CountUp = CountUp;
