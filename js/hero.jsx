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
              Кастомна збірка на AMD Ryzen 5 5600 + RTX 4060, заточена під 1080p ultra. 
              Збирається прямо зараз, поки ти про це не знаєш. Скрол ↓
            </p>

            <div className="hero-cta">
              <a href="#build" className="btn btn-primary">
                Розібрати ПК
                <span>→</span>
              </a>
              <a href="#parts" className="btn">
                Подивитись деталі
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num mono">
                  <CountUp to={totalParts} />
                  <span className="unit">шт</span>
                </div>
                <div className="hero-stat-label">Комплектуючих</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num mono">
                  <CountUp to={totalPrice} />
                  <span className="unit">₴</span>
                </div>
                <div className="hero-stat-label">Загальна вартість</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num mono">
                  ~<CountUp to={150} />
                  <span className="unit">fps</span>
                </div>
                <div className="hero-stat-label">Середній FPS в 1080p</div>
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
    </section>
  );
}

// Mini-case SVG for hero
function HeroCase() {
  return (
    <svg className="hero-case" viewBox="0 0 100 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,230,255,0.2)" />
          <stop offset="50%" stopColor="rgba(0,230,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,46,61,0.1)" />
        </linearGradient>
        <linearGradient id="caseBg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#16161e" />
          <stop offset="100%" stopColor="#08080d" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="1.5" /></filter>
      </defs>

      {/* outer case */}
      <rect x="3" y="3" width="94" height="174" fill="url(#caseBg)" stroke="#2a2a3a" strokeWidth="1" />

      {/* mesh front strip on left */}
      <rect x="6" y="6" width="14" height="168" fill="rgba(0,0,0,0.6)" stroke="#1a1a26" strokeWidth="0.5" />
      <g opacity="0.5">
        {Array.from({ length: 28 }, (_, i) =>
          Array.from({ length: 4 }, (_, j) =>
            <circle key={`${i}-${j}`} cx={8.5 + j*3} cy={9 + i*6} r="0.6" fill="#ffffff" opacity="0.25" />
          )
        )}
      </g>

      {/* I/O top */}
      <rect x="22" y="6" width="40" height="6" fill="#0a0a12" stroke="#1a1a26" strokeWidth="0.5" />
      <circle cx="26" cy="9" r="0.8" fill="#ff2e3d">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="9" r="0.8" fill="#00e6ff" />

      {/* glass panel area */}
      <rect x="22" y="14" width="72" height="160" fill="url(#glass)" stroke="#1a1a26" strokeWidth="0.5" />

      {/* inside silhouettes */}
      <g opacity="0.85">
        {/* motherboard */}
        <rect x="40" y="20" width="50" height="100" fill="#0d1810" stroke="#2bff88" strokeWidth="0.6" opacity="0.7" />
        {/* CPU + cooler tower */}
        <rect x="48" y="26" width="22" height="32" fill="#1a1a22" stroke="#d6d6e0" strokeWidth="0.6" />
        <line x1="50" y1="28" x2="50" y2="56" stroke="#3a3a48" strokeWidth="0.3" />
        <line x1="54" y1="28" x2="54" y2="56" stroke="#3a3a48" strokeWidth="0.3" />
        <line x1="58" y1="28" x2="58" y2="56" stroke="#3a3a48" strokeWidth="0.3" />
        <line x1="62" y1="28" x2="62" y2="56" stroke="#3a3a48" strokeWidth="0.3" />
        <line x1="66" y1="28" x2="66" y2="56" stroke="#3a3a48" strokeWidth="0.3" />
        {/* RAM */}
        <rect x="74" y="26" width="14" height="22" fill="#0a1218" stroke="#00e6ff" strokeWidth="0.5" />
        <line x1="76" y1="26" x2="76" y2="48" stroke="#00e6ff" strokeWidth="0.5" opacity="0.5" />
        <line x1="80" y1="26" x2="80" y2="48" stroke="#00e6ff" strokeWidth="0.5" opacity="0.5" />
        <line x1="84" y1="26" x2="84" y2="48" stroke="#00e6ff" strokeWidth="0.5" opacity="0.5" />
        {/* GPU */}
        <rect x="40" y="68" width="50" height="14" fill="#1a0a0d" stroke="#ff2e3d" strokeWidth="0.6" />
        <circle cx="48" cy="75" r="3.5" fill="none" stroke="#ff2e3d" strokeWidth="0.4" opacity="0.7" />
        <circle cx="60" cy="75" r="3.5" fill="none" stroke="#ff2e3d" strokeWidth="0.4" opacity="0.7" />
        <circle cx="48" cy="75" r="1" fill="#ff2e3d" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="75" r="1" fill="#ff2e3d" opacity="0.9">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* PSU shroud */}
        <rect x="26" y="140" width="64" height="22" fill="#0c0c14" stroke="#ffb547" strokeWidth="0.5" opacity="0.7" />
        <circle cx="34" cy="151" r="5" fill="none" stroke="#ffb547" strokeWidth="0.4" opacity="0.7" />
        <circle cx="34" cy="151" r="2" fill="none" stroke="#ffb547" strokeWidth="0.3" opacity="0.5" />
        <text x="58" y="153" fill="#ffb547" fontSize="3.5" fontFamily="monospace" letterSpacing="0.5" opacity="0.8">550W</text>
      </g>

      {/* RGB strip glow */}
      <rect x="22" y="14" width="72" height="2" fill="#ff2e3d" opacity="0.4" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* footer pads */}
      <rect x="10" y="174" width="6" height="4" fill="#1a1a22" />
      <rect x="84" y="174" width="6" height="4" fill="#1a1a22" />
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
