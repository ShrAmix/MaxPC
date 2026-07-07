// =============================================
// BENCHMARKS — FPS + real benchmark data
// =============================================

function BenchmarksSection() {
  const { fps, benchmarks } = window.BUILD_DATA;
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const maxFps = Math.max(...fps.map(g => g.avg)) * 1.05;

  return (
    <section id="bench" ref={ref}>
      <div className="container">

        <div className="section-header reveal">
          <span className="eyebrow">05 / Продуктивність</span>
          <h2 className="section-title">FPS + <span className="glow-cyan">Бенчмарки</span></h2>
          <p className="section-sub">
            Ігрові результати — реалістичні цифри для RTX 5060 + Ryzen 5 5600 у Full HD.
            Синтетичні тести — виміряні на реальному залізі, де позначено.
          </p>
        </div>

        {/* FPS grid */}
        <div className="bench-fps-grid reveal">
          <div className="fps-panel corners">
            <div className="br-tr"></div><div className="br-bl"></div>
            <div className="panel-head">
              <h3>Ігри · 1080p</h3>
              <div className="panel-head-badge">
                <span className="badge-dot" />
                <span className="mono">AVG · 1% LOW</span>
              </div>
            </div>

            {fps.map((g, i) => {
              const pct = visible ? Math.min(100, (g.avg / maxFps) * 100) : 0;
              return (
                <div className="fps-row" key={i}>
                  <div className="fps-game">
                    <span className="game-name">{g.name}</span>
                    <span className="game-meta mono">{g.preset}</span>
                  </div>
                  <div className="fps-bar-col">
                    <div className={`fps-bar-track ${g.cyan ? 'cyan' : ''}`}>
                      <div className="fps-bar-fill"
                        style={{ inset: `0 ${100 - pct}% 0 0`, transitionDelay: `${i * 0.09}s` }} />
                    </div>
                    <div className="fps-bar-nums mono">
                      <span className="fps-lo">1% LOW {g.lo}</span>
                      <span className="fps-avg">
                        <span className={`fps-num ${g.cyan ? 'cyan' : 'red'}`}>{g.avg}</span>
                        {' FPS'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benchmark cards */}
        <div className="bench-cards-grid reveal-stagger">
          {benchmarks.map((b, i) => (
            <BenchCard key={i} b={b} visible={visible} delay={i * 0.08} />
          ))}
        </div>

      </div>
    </section>
  );
}

function BenchCard({ b, visible, delay }) {
  const isReal = b.real;
  return (
    <div className="bench-card corners">
      <div className="br-tr"></div><div className="br-bl"></div>

      {/* real/target badge */}
      <div className={`bench-status mono ${isReal ? 'measured' : 'target'}`}>
        {isReal ? (
          <>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="3" fill="var(--green)" opacity="0.9"/>
            </svg>
            ВИМІРЯНО
          </>
        ) : (
          <>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="3" stroke="var(--cyan)" strokeWidth="1"/>
            </svg>
            ОЧІКУЄТЬСЯ
          </>
        )}
      </div>

      <div className="bench-label mono">{b.label}</div>
      <div className="bench-title">{b.title}</div>

      <div className="bench-score mono">
        {b.score}
        {b.scoreUnit && <span className="bench-unit"> {b.scoreUnit}</span>}
      </div>

      <div className="bench-delta mono">{b.delta}</div>

      {/* radial progress */}
      <div className="bench-radial-wrap">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="22" fill="none" stroke="var(--line)" strokeWidth="3"/>
          <circle cx="26" cy="26" r="22" fill="none"
            stroke={isReal ? 'var(--cyan)' : 'var(--red)'}
            strokeWidth="3"
            strokeDasharray={`${(visible ? b.percent : 0) * 138.2} 138.2`}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
            style={{ transition: `stroke-dasharray 1.4s cubic-bezier(0.2,0.7,0.2,1) ${delay}s` }}
          />
          <text x="26" y="30" textAnchor="middle"
            fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)">
            {Math.round(b.percent * 100)}%
          </text>
        </svg>
      </div>
    </div>
  );
}

window.BenchmarksSection = BenchmarksSection;
