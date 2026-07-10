// =============================================
// BENCHMARKS — FPS + real benchmark data
// =============================================

function BenchmarksSection() {
  const { fps, benchmarks, fpsNote } = window.BUILD_DATA;
  const [visible, setVisible] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(null); // { game } | null
  const ref = React.useRef();

  React.useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const maxFps = Math.max(...fps.map(g => g.avg || 0)) * 1.05;

  return (
    <section id="bench" ref={ref}>
      <div className="container">

        <div className="section-header reveal">
          <span className="eyebrow">05 / Продуктивність</span>
          <h2 className="section-title">FPS + <span className="glow-cyan">Бенчмарки</span></h2>
          <p className="section-sub">
            Ігрові результати для RTX 5060 + Ryzen 5 5600 у Full HD. Натисни на гру, щоб
            побачити скріни налаштувань — постав такі самі й отримаєш ту саму картинку × кадри.
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
                <span className="mono">AVG FPS · %/°C</span>
              </div>
            </div>

            {fpsNote && (
              <div className="fps-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16"/>
                </svg>
                <span>{fpsNote}</span>
              </div>
            )}

            {fps.map((g, i) => {
              const untested = g.tested === false;
              const pct = (visible && g.avg) ? Math.min(100, (g.avg / maxFps) * 100) : 0;
              return (
                <button className={`fps-row is-clickable ${untested ? 'is-untested' : ''}`} key={i}
                  onClick={() => setLightbox({ game: g })}
                  title={`Налаштування · ${g.name}`}>
                  <div className="fps-game">
                    <span className="game-name">{g.name}</span>
                    <span className="game-meta mono">
                      {untested ? (
                        <span className="temp untested">Ще не тестувалась</span>
                      ) : (
                        <React.Fragment>
                          <span className="temp cpu">
                            CPU {g.lCpu != null ? `${g.lCpu}%` : '—'} · {g.tCpu != null ? `${g.tCpu}°` : '—'}
                          </span>
                          <span className="temp gpu">
                            GPU {g.lGpu != null ? `${g.lGpu}%` : '—'} · {g.tGpu != null ? `${g.tGpu}°` : '—'}
                          </span>
                        </React.Fragment>
                      )}
                      <span className="settings-hint">Налаштування ↗</span>
                    </span>
                  </div>
                  <div className="fps-bar-col">
                    <div className={`fps-bar-track ${g.cyan ? 'cyan' : ''}`}>
                      <div className="fps-bar-fill"
                        style={{ inset: `0 ${100 - pct}% 0 0`, transitionDelay: `${i * 0.09}s` }} />
                    </div>
                    <div className="fps-bar-nums mono">
                      {g.capped
                        ? <span className="fps-lo">FPS-ліміт</span>
                        : <span className="fps-lo">AVG</span>}
                      <span className="fps-avg">
                        {g.avg != null ? (
                          <React.Fragment>
                            <span className={`fps-num ${g.cyan ? 'cyan' : 'red'}`}>{g.avg}</span>
                            {' FPS'}
                          </React.Fragment>
                        ) : (
                          <span className="fps-num muted">—</span>
                        )}
                      </span>
                    </div>
                  </div>
                </button>
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

      {lightbox && (
        <SettingsLightbox game={lightbox.game} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}

// =============================================
// SETTINGS LIGHTBOX — галерея скрінів налаштувань гри
// =============================================
function SettingsLightbox({ game, onClose }) {
  const shots = Array.from({ length: game.shots || 0 },
    (_, i) => `images/settings/${game.slug}/${String(i + 1).padStart(2, '0')}.png`);
  const [idx, setIdx] = React.useState(0);
  const total = shots.length;

  const go = React.useCallback((d) => {
    if (!total) return;
    setIdx(i => (((i + d) % total) + total) % total);
  }, [total]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [go, onClose]);

  return (
    <div className="settings-lb" onClick={onClose}>
      <div className="settings-lb-inner" onClick={(e) => e.stopPropagation()}>
        <div className="settings-lb-head">
          <div className="settings-lb-title">
            <span className="game-name">{game.name}</span>
            <span className="mono">Налаштування графіки · 1080p</span>
          </div>
          <button className="settings-lb-close" onClick={onClose} aria-label="Закрити">×</button>
        </div>

        <div className="settings-lb-stage">
          {total > 0 ? (
            <React.Fragment>
              <img src={shots[idx]} alt={`${game.name} — налаштування ${idx + 1}`} draggable="false" />
              {total > 1 && (
                <React.Fragment>
                  <button className="settings-lb-nav prev" onClick={() => go(-1)} aria-label="Попередній">‹</button>
                  <button className="settings-lb-nav next" onClick={() => go(1)} aria-label="Наступний">›</button>
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <div className="settings-lb-empty mono">Скріни налаштувань ще не додано</div>
          )}
        </div>

        {total > 1 && (
          <div className="settings-lb-thumbs">
            {shots.map((url, i) => (
              <button key={url} className={`settings-lb-thumb ${i === idx ? 'active' : ''}`}
                onClick={() => setIdx(i)}>
                <img src={url} alt="" draggable="false" />
              </button>
            ))}
          </div>
        )}

        <div className="settings-lb-foot mono">
          {total > 0 && <span>{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>}
          <span>Постав ці ж налаштування — і отримаєш таку саму картинку × кадри</span>
        </div>
      </div>
    </div>
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
window.SettingsLightbox = SettingsLightbox;
