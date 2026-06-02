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
              Кастомна збірка на AMD Ryzen&nbsp;5&nbsp;5600&nbsp;+&nbsp;RTX&nbsp;4060,
              заточена під 1080p ultra. Збирається прямо зараз — спеціально для тебе.
            </p>

            <div className="hero-cta">
              <a href="#build" className="btn btn-primary">
                Розібрати ПК
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#parts" className="btn btn-outline">
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
    <svg className="hero-case" viewBox="0 0 100 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hc-glass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,230,255,0.18)" />
          <stop offset="50%" stopColor="rgba(0,230,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,46,61,0.09)" />
        </linearGradient>
        <linearGradient id="hc-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#16161e" />
          <stop offset="100%" stopColor="#08080d" />
        </linearGradient>
        <filter id="hc-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        {/* mesh pattern — replaces 112 individual circles */}
        <pattern id="hc-mesh" x="0" y="0" width="3" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="3" r="0.6" fill="#ffffff" opacity="0.22" />
        </pattern>
      </defs>

      {/* outer case body */}
      <rect x="3" y="3" width="94" height="174" fill="url(#hc-bg)" stroke="#2a2a3a" strokeWidth="1" />

      {/* mesh front strip — CSS animation class instead of SVG animate */}
      <rect x="6" y="6" width="14" height="168" fill="rgba(0,0,0,0.55)" stroke="#1a1a26" strokeWidth="0.5" />
      <rect x="6" y="6" width="14" height="168" fill="url(#hc-mesh)" />

      {/* I/O panel top */}
      <rect x="22" y="6" width="40" height="6" fill="#0a0a12" stroke="#1a1a26" strokeWidth="0.5" />
      <circle cx="26" cy="9" r="0.8" fill="#ff2e3d" className="hc-led-power" />
      <circle cx="30" cy="9" r="0.8" fill="#00e6ff" opacity="0.7" />

      {/* glass side panel */}
      <rect x="22" y="14" width="72" height="160" fill="url(#hc-glass)" stroke="#1a1a26" strokeWidth="0.5" />

      {/* === internals === */}
      <g opacity="0.88">
        {/* motherboard */}
        <rect x="40" y="20" width="50" height="100" fill="#0d1810" stroke="#2bff88" strokeWidth="0.6" opacity="0.65" />

        {/* CPU cooler tower */}
        <rect x="48" y="26" width="22" height="32" fill="#1a1a22" stroke="#c8c8d8" strokeWidth="0.6" />
        <line x1="50" y1="28" x2="50" y2="56" stroke="#3a3a48" strokeWidth="0.4" />
        <line x1="54" y1="28" x2="54" y2="56" stroke="#3a3a48" strokeWidth="0.4" />
        <line x1="58" y1="28" x2="58" y2="56" stroke="#3a3a48" strokeWidth="0.4" />
        <line x1="62" y1="28" x2="62" y2="56" stroke="#3a3a48" strokeWidth="0.4" />
        <line x1="66" y1="28" x2="66" y2="56" stroke="#3a3a48" strokeWidth="0.4" />

        {/* RAM sticks */}
        <rect x="74" y="26" width="6" height="22" fill="#0a1218" stroke="#00e6ff" strokeWidth="0.5" />
        <rect x="82" y="26" width="6" height="22" fill="#0a1218" stroke="#00e6ff" strokeWidth="0.5" />
        <rect x="74" y="26" width="6" height="4" fill="#00e6ff" opacity="0.35" />
        <rect x="82" y="26" width="6" height="4" fill="#00e6ff" opacity="0.35" />

        {/* GPU */}
        <rect x="40" y="68" width="50" height="14" fill="#1a0a0d" stroke="#ff2e3d" strokeWidth="0.6" />
        <circle cx="48" cy="75" r="3.5" fill="none" stroke="#ff2e3d" strokeWidth="0.4" opacity="0.65" />
        <circle cx="60" cy="75" r="3.5" fill="none" stroke="#ff2e3d" strokeWidth="0.4" opacity="0.65" />
        {/* GPU fans — CSS animation via class */}
        <circle cx="48" cy="75" r="1" fill="#ff2e3d" className="hc-led-gpu" />
        <circle cx="60" cy="75" r="1" fill="#ff2e3d" className="hc-led-gpu-2" />

        {/* SSD slot */}
        <rect x="40" y="88" width="24" height="8" fill="#0d0d18" stroke="#a87bff" strokeWidth="0.4" opacity="0.7" />
        <text x="43" y="94" fill="#a87bff" fontSize="3" fontFamily="monospace" opacity="0.8">NVMe</text>

        {/* PSU shroud */}
        <rect x="26" y="140" width="64" height="22" fill="#0c0c14" stroke="#ffb547" strokeWidth="0.5" opacity="0.7" />
        <circle cx="34" cy="151" r="5" fill="none" stroke="#ffb547" strokeWidth="0.4" opacity="0.65" />
        <circle cx="34" cy="151" r="2" fill="none" stroke="#ffb547" strokeWidth="0.3" opacity="0.45" />
        <text x="56" y="153" fill="#ffb547" fontSize="3.5" fontFamily="monospace" letterSpacing="0.5" opacity="0.75">550W</text>
      </g>

      {/* RGB strip — CSS animation */}
      <rect x="22" y="14" width="72" height="2" fill="#ff2e3d" filter="url(#hc-glow)" className="hc-rgb-strip" />

      {/* rubber feet */}
      <rect x="10" y="174" width="6" height="4" fill="#1a1a22" rx="1" />
      <rect x="84" y="174" width="6" height="4" fill="#1a1a22" rx="1" />
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
