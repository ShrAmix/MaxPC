// =============================================
// BENCHMARKS — FPS tests + Cinebench / 3DMark
// =============================================

function BenchmarksSection() {
  const { fps, benchmarks } = window.BUILD_DATA;
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // max FPS for bar scaling
  const maxFps = Math.max(...fps.map(g => g.avg)) * 1.05;

  return (
    <section id="bench" ref={ref}>
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">06 / Очікувана продуктивність</span>
          <h2 className="section-title">FPS-тести + <span className="glow-cyan">бенчмарки</span></h2>
          <p className="section-sub">
            Реалістичні цифри для RTX 4060 + Ryzen 5 5600 у Full HD. 
            DLSS увімкнено там, де підтримується. Цифри — це наша target, реальні зміряємо після збірки.
          </p>
        </div>

        <div className="benchmarks-grid">
          {/* FPS */}
          <div className="fps-panel corners reveal">
            <div className="br-tr"></div><div className="br-bl"></div>
            <div className="panel-head">
              <h3>Ігри · 1080p</h3>
              <span className="badge">AVG · 1% LOW</span>
            </div>

            <div>
              {fps.map((g, i) => {
                const pct = visible ? Math.min(100, (g.avg / maxFps) * 100) : 0;
                return (
                  <div className="fps-row" key={i}>
                    <div className="game">
                      <span className="game-name">{g.name}</span>
                      <span className="game-meta">{g.preset}{g.note ? ` · ${g.note}` : ''}</span>
                    </div>
                    <div className="fps-bar-wrap">
                      <div className={`fps-bar-track ${g.cyan ? 'cyan' : ''}`}>
                        <div className="fps-bar-fill" style={{ inset: `0 ${100 - pct}% 0 0`, transitionDelay: `${i * 0.1}s` }} />
                      </div>
                      <div className="fps-bar-label mono">
                        <span>1% LOW {g.lo}</span>
                        <span className="fps"><span className="v">{g.avg}</span>FPS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BENCH CARDS */}
          <div className="bench-panel corners reveal">
            <div className="br-tr"></div><div className="br-bl"></div>
            <div className="panel-head">
              <h3>Бенчмарки</h3>
              <span className="badge">TARGET</span>
            </div>

            <div className="bench-cards">
              {benchmarks.map((b, i) => (
                <div className="bench-card corners" key={i}>
                  <div className="br-tr"></div><div className="br-bl"></div>
                  <div className="bench-label">{b.label}</div>
                  <div className="bench-title">{b.title}</div>
                  <div className="bench-score mono">{b.score}</div>
                  <div className="bench-compare mono">
                    <span>{b.delta.startsWith('+') ? 'PERFORMANCE' : 'NOTE'}</span>
                    <span className="delta">{b.delta}</span>
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

window.BenchmarksSection = BenchmarksSection;
