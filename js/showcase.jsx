// =============================================
// ARSENAL — combined showcase + parts grid
// =============================================

function ArsenalSection() {
  const parts = window.BUILD_DATA.parts;
  const [activeId, setActiveId] = React.useState(parts[0]?.id);
  const active = parts.find(p => p.id === activeId) || parts[0];
  const sectionRef = React.useRef(null);

  const handleSelect = (id) => {
    if (id === activeId) return;
    setActiveId(id);
    const viewer = sectionRef.current?.querySelector('.arsenal-viewer');
    if (viewer) {
      const top = viewer.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="arsenal-section" id="arsenal" ref={sectionRef}>
      <div className="container">

        <div className="section-header reveal">
          <span className="eyebrow">03 / Арсенал</span>
          <h2 className="section-title">Усе <span className="glow-red">залізо</span></h2>
          <p className="section-sub">
            Реальні фото з різних ракурсів + повні характеристики кожної деталі.
            Натисни <strong style={{color:'var(--red)'}}>будь-яку картку нижче</strong> — вгорі побачиш деталь у повному розмірі.
          </p>
        </div>

        <div className="arsenal-viewer reveal">
          <PhotoViewer key={active.id} part={active} />
          <DetailPanel part={active} index={parts.findIndex(p => p.id === active.id)} total={parts.length} />
        </div>

        <div className="arsenal-strip-head reveal">
          <span className="eyebrow" style={{color: 'var(--text-mute)'}}>↓ Усі {parts.length} компонентів</span>
        </div>

        <div className="arsenal-grid reveal-stagger">
          {parts.map((p, i) => (
            <PartCard
              key={p.id}
              part={p}
              index={i}
              isActive={p.id === activeId}
              onClick={() => handleSelect(p.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}


function PhotoViewer({ part }) {
  const [idx, setIdx] = React.useState(0);
  const [autoSpin, setAutoSpin] = React.useState(false);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const stageRef = React.useRef(null);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    setIdx(0);
    setAutoSpin(false);
  }, [part?.id]);

  React.useEffect(() => {
    if (!autoSpin || !part?.photos?.length) return;
    const id = setInterval(() => {
      setIdx(i => (i + 1) % part.photos.length);
    }, 800);
    return () => clearInterval(id);
  }, [autoSpin, part]);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x: x * 14, y: y * -10 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [part?.id]);

  // Drag-to-scrub
  React.useEffect(() => {
    const el = imgRef.current;
    if (!el || !part?.photos?.length) return;
    let dragging = false, startX = 0, startIdx = 0;
    const onDown = (e) => {
      dragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startIdx = idx;
      setAutoSpin(false);
      el.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const dx = x - startX;
      const step = Math.round(dx / 50);
      const n = part.photos.length;
      const next = ((startIdx + step) % n + n) % n;
      setIdx(next);
    };
    const onUp = () => { dragging = false; el.style.cursor = 'grab'; };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [idx, part]);

  if (!part) return null;

  const hasPhotos = part.photos && part.photos.length;
  const totalPhotos = hasPhotos ? part.photos.length : 0;

  return (
    <div className="showcase-stage corners" ref={stageRef}>
      <div className="br-tr"></div><div className="br-bl"></div>

      <div className="showcase-toolbar">
        <span className="left">◢ {part.name}</span>
        <span className="right">{hasPhotos ? `FRAME ${String(idx + 1).padStart(2, '0')}/${String(totalPhotos).padStart(2, '0')}` : 'NO IMAGES'}</span>
      </div>

      {hasPhotos ? (
        <>
          <div
            className="photo-canvas"
            ref={imgRef}
            style={{ transform: `perspective(1400px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
          >
            {part.photos.map((url, i) => (
              <img
                key={url}
                src={url}
                alt={`${part.name} — ${i + 1}`}
                className={`photo-img ${i === idx ? 'visible' : ''}`}
                draggable="false"
              />
            ))}
            <div className="photo-glow" style={{ background: glowFor(part.color) }}></div>
          </div>

          {totalPhotos > 1 && (
            <div className="photo-thumbs">
              {part.photos.map((url, i) => (
                <button
                  key={url}
                  className={`photo-thumb ${i === idx ? 'active' : ''}`}
                  onClick={() => { setIdx(i); setAutoSpin(false); }}
                  aria-label={`Frame ${i + 1}`}
                >
                  <img src={url} alt="" draggable="false" />
                </button>
              ))}
            </div>
          )}

          <div className="showcase-controls">
            {totalPhotos > 1 && (
              <button
                className={autoSpin ? 'active' : ''}
                onClick={() => setAutoSpin(v => !v)}
              >{autoSpin ? '◉ AUTO' : '◌ AUTO PLAY'}</button>
            )}
            <button onClick={() => { setIdx(0); setAutoSpin(false); }}>↺ RESET</button>
          </div>

          {totalPhotos > 1 && (
            <div className="showcase-hint">
              <span><span className="key">DRAG</span>гортати</span>
            </div>
          )}
        </>
      ) : (
        <div className="three-loading">
          <div className="stack">
            <div className="ph-icon-big">📷</div>
            <span>Фото ще немає</span>
          </div>
        </div>
      )}
    </div>
  );
}


function DetailPanel({ part, index, total }) {
  if (!part) return null;
  return (
    <div className="detail-panel corners">
      <div className="br-tr"></div><div className="br-bl"></div>

      <div className="detail-head">
        <span className="label mono">{part.cat}</span>
        <span className="idx mono">/{String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}/</span>
      </div>

      <h3 className="detail-name">{part.name}</h3>
      <div className="detail-model mono">{part.model}</div>

      <p className="detail-desc">{part.desc}</p>

      <div className="detail-specs">
        {part.specs.map(([k, v], i) => (
          <div className="spec-row" key={i}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
          </div>
        ))}
      </div>

      <div className="detail-price">
        <div>
          <div className="label mono">Ціна</div>
          {part.qty > 1 && <div className="qty mono">{part.qty} × {(part.unitPrice || (part.price / part.qty)).toLocaleString('uk-UA')} ₴</div>}
        </div>
        <div className="amount mono">{part.price.toLocaleString('uk-UA')} ₴</div>
      </div>
    </div>
  );
}


function PartCard({ part, index, isActive, onClick }) {
  const hasPhoto = part.photos && part.photos.length;
  return (
    <div className={`part-card ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className={`part-image ${hasPhoto ? 'has-photo' : ''}`}>
        <div className="part-index mono">/{String(index + 1).padStart(2, '0')}/</div>
        <div className="part-cat">
          <span className={`tag ${part.placeholder ? 'cyan' : 'red'}`}>
            {part.placeholder ? 'TBD' : (part.cat.split(/[ \u00b7\u2014\-#]/)[0])}
          </span>
        </div>
        {hasPhoto ? (
          <img src={part.photos[0]} alt={part.name} className="part-photo" draggable="false" />
        ) : (
          <div className="ph-label">
            <div className="ph-icon" style={{ color: part.color }}>{window.ICONS[part.icon]}</div>
            <span>{part.cat}</span>
          </div>
        )}
      </div>
      <div className="part-body">
        <div className="part-name">{part.name}</div>
        <div className="part-model mono">{part.model}</div>
        <div className="part-footer">
          <div className="part-price mono">
            {part.price.toLocaleString('uk-UA')}<span className="currency">₴</span>
          </div>
          {part.qty > 1 && <div className="part-qty mono">×{part.qty}</div>}
        </div>
      </div>
    </div>
  );
}


// Map part color → glow rgba
function glowFor(color) {
  const map = {
    'var(--red)': 'radial-gradient(ellipse at center, rgba(255,46,61,0.5), rgba(255,46,61,0.15) 40%, transparent 70%)',
    'var(--cyan)': 'radial-gradient(ellipse at center, rgba(0,230,255,0.5), rgba(0,230,255,0.15) 40%, transparent 70%)',
    'var(--green)': 'radial-gradient(ellipse at center, rgba(43,255,136,0.45), rgba(43,255,136,0.13) 40%, transparent 70%)',
    'var(--violet)': 'radial-gradient(ellipse at center, rgba(168,123,255,0.5), rgba(168,123,255,0.15) 40%, transparent 70%)',
    'var(--amber)': 'radial-gradient(ellipse at center, rgba(255,181,71,0.5), rgba(255,181,71,0.15) 40%, transparent 70%)',
  };
  return map[color] || map['var(--red)'];
}


window.ArsenalSection = ArsenalSection;
window.PhotoViewer = PhotoViewer;
