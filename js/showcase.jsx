// =============================================
// MEGA SECTION — Arsenal + Pricing + Specs
// =============================================

// ---- helpers ----

function glowFor(color) {
  const map = {
    'var(--red)':    'radial-gradient(ellipse at center, rgba(255,46,61,0.5), rgba(255,46,61,0.15) 40%, transparent 70%)',
    'var(--cyan)':   'radial-gradient(ellipse at center, rgba(0,230,255,0.5), rgba(0,230,255,0.15) 40%, transparent 70%)',
    'var(--green)':  'radial-gradient(ellipse at center, rgba(43,255,136,0.45), rgba(43,255,136,0.13) 40%, transparent 70%)',
    'var(--violet)': 'radial-gradient(ellipse at center, rgba(168,123,255,0.5), rgba(168,123,255,0.15) 40%, transparent 70%)',
    'var(--amber)':  'radial-gradient(ellipse at center, rgba(255,181,71,0.5), rgba(255,181,71,0.15) 40%, transparent 70%)',
    '#d6d6e0':       'radial-gradient(ellipse at center, rgba(214,214,224,0.4), rgba(214,214,224,0.1) 40%, transparent 70%)',
  };
  return map[color] || map['var(--red)'];
}

// ---- Tab nav ----

function SectionTabs({ active, onChange }) {
  const tabs = [
    { id: 'arsenal', label: 'Залізо', num: '03' },
    { id: 'price',   label: 'Бюджет', num: '04' },
  ];
  return (
    <div className="mega-tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`mega-tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="mega-tab-num mono">{t.num}</span>
          <span className="mega-tab-label">{t.label}</span>
          {active === t.id && <span className="mega-tab-bar" />}
        </button>
      ))}
    </div>
  );
}

// =============================================
// ARSENAL TAB
// =============================================

function ArsenalTab() {
  const parts = window.BUILD_DATA.parts;
  const [activeId, setActiveId] = React.useState(parts[0]?.id);
  const active = parts.find(p => p.id === activeId) || parts[0];

  return (
    <div className="arsenal-layout">
      {/* Left — part list */}
      <div className="arsenal-list">
        {parts.map((p, i) => (
          <PartListItem
            key={p.id}
            part={p}
            index={i}
            isActive={p.id === activeId}
            onClick={() => setActiveId(p.id)}
          />
        ))}
      </div>

      {/* Right — viewer + detail */}
      <div className="arsenal-main">
        <PhotoViewer key={active.id} part={active} />
        <DetailPanel
          part={active}
          index={parts.findIndex(p => p.id === active.id)}
          total={parts.length}
        />
      </div>
    </div>
  );
}

function PartListItem({ part, index, isActive, onClick }) {
  const hasPhoto = part.photos && part.photos.length;
  return (
    <button
      className={`part-list-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ '--accent': part.color === 'var(--text)' ? 'var(--text-dim)' : part.color }}
    >
      <div className="pli-thumb">
        {hasPhoto
          ? <img src={part.photos[0]} alt={part.name} draggable="false" />
          : <span className="pli-icon">{window.ICONS[part.icon]}</span>
        }
      </div>
      <div className="pli-info">
        <div className="pli-cat mono">{part.cat}</div>
        <div className="pli-name">{part.name}</div>
      </div>
      <div className="pli-price mono">{part.price.toLocaleString('uk-UA')}<span>₴</span></div>
      <div className="pli-arrow">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}

function PhotoViewer({ part }) {
  const [idx, setIdx] = React.useState(0);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const stageRef = React.useRef(null);
  const imgRef = React.useRef(null);

  React.useEffect(() => { setIdx(0); }, [part?.id]);


  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 14, y: ((e.clientY - r.top) / r.height - 0.5) * -10 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [part?.id]);

  React.useEffect(() => {
    const el = imgRef.current;
    if (!el || !part?.photos?.length) return;
    let dragging = false, startX = 0, startIdx = 0;
    const onDown  = (e) => { dragging = true; startX = e.touches ? e.touches[0].clientX : e.clientX; startIdx = idx; el.style.cursor = 'grabbing'; };
    const onMove  = (e) => { if (!dragging) return; const dx = (e.touches ? e.touches[0].clientX : e.clientX) - startX; const n = part.photos.length; setIdx((((startIdx + Math.round(dx / 50)) % n) + n) % n); };
    const onUp    = () => { dragging = false; el.style.cursor = 'grab'; };
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
  const total = hasPhotos ? part.photos.length : 0;

  return (
    <div className="showcase-stage corners" ref={stageRef}>
      <div className="br-tr"></div><div className="br-bl"></div>

      <div className="showcase-toolbar">
        <span className="left mono">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginRight:6}}>
            <polygon points="0,0 10,5 0,10" fill="currentColor" opacity="0.7"/>
          </svg>
          {part.name}
        </span>
        <span className="right mono">{hasPhotos ? `${String(idx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}` : 'NO IMAGES'}</span>
      </div>

      {hasPhotos ? (
        <>
          <div
            className="photo-canvas"
            ref={imgRef}
            style={{ transform: `perspective(1400px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
          >
            {part.photos.map((url, i) => (
              <img key={url} src={url} alt={`${part.name} — ${i+1}`}
                className={`photo-img ${i === idx ? 'visible' : ''}`} draggable="false" />
            ))}
            <div className="photo-glow" style={{ background: glowFor(part.color) }}></div>
          </div>

          {total > 1 && (
            <div className="photo-thumbs">
              {part.photos.map((url, i) => (
                <button key={url} className={`photo-thumb ${i === idx ? 'active' : ''}`}
                  onClick={() => { setIdx(i); setAutoSpin(false); }}>
                  <img src={url} alt="" draggable="false" />
                </button>
              ))}
            </div>
          )}


          {total > 1 && (
            <div className="showcase-hint">
              <span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" style={{marginRight:4}}>
                  <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="key">DRAG</span> — гортати
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="three-loading">
          <div className="stack">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--red-line)" strokeWidth="1">
              <rect x="4" y="4" width="32" height="32" rx="2"/>
              <line x1="4" y1="14" x2="36" y2="14"/>
              <circle cx="20" cy="27" r="5"/>
              <line x1="17" y1="27" x2="23" y2="27"/>
              <line x1="20" y1="24" x2="20" y2="30"/>
            </svg>
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
        <span className="idx mono">/{String(index + 1).padStart(2,'0')}/{String(total).padStart(2,'0')}/</span>
      </div>

      <h3 className="detail-name">{part.name}</h3>
      <div className="detail-model mono">{part.model}</div>

      {part.placeholder && (
        <div className="detail-badge">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--cyan)" style={{marginRight:6}}>
            <circle cx="5" cy="5" r="4"/>
            <rect x="4" y="2" width="2" height="4" fill="var(--bg-0)"/>
            <rect x="4" y="7" width="2" height="2" fill="var(--bg-0)"/>
          </svg>
          В очікуванні покупки
        </div>
      )}

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
          {part.qty > 1 && <div className="qty mono">{part.qty} × {(part.unitPrice || Math.round(part.price / part.qty)).toLocaleString('uk-UA')} ₴</div>}
        </div>
        <div className="amount mono">{part.price.toLocaleString('uk-UA')} ₴</div>
      </div>
    </div>
  );
}

// =============================================
// PRICING TAB
// =============================================

function PricingTab() {
  const parts = window.BUILD_DATA.parts;
  const total = parts.reduce((s, p) => s + p.price, 0);

  const groups = [
    { name: 'Core',          ids: ['cpu','mobo','ram','gpu'],    color: 'var(--red)' },
    { name: 'Cooling + TIM', ids: ['cooler','fans','tim'],        color: 'var(--cyan)' },
    { name: 'Storage',       ids: ['ssd1','ssd2'],                color: 'var(--violet)' },
    { name: 'Power + Case',  ids: ['psu','case'],                  color: 'var(--amber)' },
  ];
  const groupData = groups.map(g => ({
    ...g,
    total: parts.filter(p => g.ids.includes(p.id)).reduce((s, p) => s + p.price, 0),
  }));

  return (
    <div className="pricing-layout">
      {/* LEFT: itemized table */}
      <div className="price-table-wrap">
        <div className="price-table corners">
          <div className="br-tr"></div><div className="br-bl"></div>
          <div className="price-table-head mono">
            <span>#</span><span>Компонент</span><span>К-сть</span><span>Сума</span>
          </div>
          {parts.map((p, i) => (
            <div className="price-row" key={p.id}>
              <span className="idx mono">{String(i+1).padStart(2,'0')}</span>
              <span className="name">
                {p.name}
                <small className="mono">{p.cat}{p.qty > 1 ? ` · ${p.qty} шт.` : ''}</small>
              </span>
              <span className="qty mono">×{p.qty}</span>
              <span className={`amt mono${p.placeholder ? ' tbd' : ''}`}>
                {p.price.toLocaleString('uk-UA')} ₴
                {p.placeholder && <span className="tbd-mark"> TBD</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: summary */}
      <div className="price-summary-col">
        <div className="price-summary corners">
          <div className="br-tr"></div><div className="br-bl"></div>

          <div className="ps-label mono">Загальна вартість</div>
          <div className="ps-total mono">
            <window.CountUp to={total} duration={2000} />
            <span className="ps-currency">₴</span>
          </div>

          {/* Stacked bar */}
          <div className="ps-bar-wrap">
            {groupData.map(g => (
              <div key={g.name} className="ps-bar-seg" title={g.name}
                style={{ width: `${(g.total / total * 100).toFixed(1)}%`, background: g.color }} />
            ))}
          </div>

          <div className="ps-groups">
            {groupData.map(g => (
              <div className="ps-group-row" key={g.name}>
                <div className="ps-group-dot" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }} />
                <span className="ps-group-name">{g.name}</span>
                <span className="ps-group-pct mono">{Math.round(g.total / total * 100)}%</span>
                <span className="ps-group-val mono">{g.total.toLocaleString('uk-UA')} ₴</span>
              </div>
            ))}
          </div>

          <div className="ps-note mono">
            * RTX 4060 — орієнтовна ціна, скоригуємо після покупки.<br/>
            * Без Windows ліцензії та периферії.
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// SPECS TAB
// =============================================

function SpecsTab() {
  const specs = [
    {
      label: 'Процесор',
      value: 'Ryzen 5 5600',
      meta: '6C / 12T · до 4.4 GHz · 65W · Zen 3',
      color: 'var(--red)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="4" width="16" height="16" rx="1"/><rect x="8" y="8" width="8" height="8"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="1" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="20" y1="15" x2="23" y2="15"/></svg>,
    },
    {
      label: 'Відеокарта',
      value: 'RTX 4060 8 GB',
      meta: 'GDDR6 · DLSS 3.0 · Frame Gen · 115W',
      color: 'var(--red)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="7" width="22" height="10" rx="1"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><line x1="5" y1="5" x2="5" y2="7"/><line x1="12" y1="5" x2="12" y2="7"/><line x1="19" y1="5" x2="19" y2="7"/></svg>,
    },
    {
      label: 'Оперативна пам\'ять',
      value: '32 GB DDR4',
      meta: '3200 MHz · CL16 · Dual-channel · 2×16 GB',
      color: 'var(--cyan)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="6" y1="6" x2="6" y2="18"/><line x1="10" y1="6" x2="10" y2="18"/><line x1="14" y1="6" x2="14" y2="18"/><line x1="18" y1="6" x2="18" y2="18"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    },
    {
      label: 'Накопичувачі',
      value: '512 GB + 1 TB',
      meta: 'NVMe M.2 · ~1.5 TB загалом · PCIe 3 + 4',
      color: 'var(--violet)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="8" width="20" height="8" rx="1"/><circle cx="18" cy="12" r="1.5"/><line x1="6" y1="12" x2="13" y2="12"/></svg>,
    },
    {
      label: 'Блок живлення',
      value: '550W Bronze',
      meta: 'MSI MAG A550BN · 80+ Bronze · Non-modular',
      color: 'var(--amber)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><polygon points="13,2 4,14 11,14 11,22 20,10 13,10"/></svg>,
    },
    {
      label: 'Охолодження',
      value: 'Tower + 2× 120mm',
      meta: 'ID-COOLING Frozn A410 · Arctic F12 PWM',
      color: '#d6d6e0',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3C12 3 9 6 9 9M12 3C12 3 15 6 15 9M21 12C21 12 18 9 15 9M21 12C21 12 18 15 15 15M12 21C12 21 15 18 15 15M12 21C12 21 9 18 9 15M3 12C3 12 6 15 9 15M3 12C3 12 6 9 9 9"/></svg>,
    },
    {
      label: 'Термоінтерфейс',
      value: 'PTM7950',
      meta: 'Honeywell · Phase-change · 8.5 W/mK',
      color: 'var(--violet)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="6" y="4" width="12" height="16" rx="1"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="13" y2="15"/></svg>,
    },
    {
      label: 'Ціль',
      value: '1080p Ultra',
      meta: '60–300 FPS залежно від гри · DLSS увімкнено',
      color: 'var(--green)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="3" x2="12" y2="1"/><line x1="12" y1="23" x2="12" y2="21"/><line x1="3" y1="12" x2="1" y2="12"/><line x1="23" y1="12" x2="21" y2="12"/></svg>,
    },
  ];

  return (
    <div className="specs-tab-grid reveal-stagger">
      {specs.map((s, i) => (
        <div className="spec-tile" key={i} style={{ '--accent': s.color }}>
          <div className="spec-tile-icon" style={{ color: s.color }}>{s.icon}</div>
          <div className="spec-tile-label mono">{s.label}</div>
          <div className="spec-tile-value">{s.value}</div>
          <div className="spec-tile-meta mono">{s.meta}</div>
          <div className="spec-tile-line" style={{ background: s.color }} />
        </div>
      ))}
    </div>
  );
}

// =============================================
// MEGA SECTION WRAPPER
// =============================================

function ArsenalSection() {
  const [tab, setTab] = React.useState('arsenal');

  return (
    <section className="mega-section" id="arsenal">
      <div className="container">

        <div className="mega-header reveal">
          <div className="mega-header-left">
            <span className="eyebrow">03–04 / Деталі збірки</span>
            <h2 className="section-title">Кожна <span className="glow-red">деталь</span></h2>
          </div>
          <SectionTabs active={tab} onChange={setTab} />
        </div>

        <div className="divider-line" style={{ marginBottom: 40 }} />

        <div className="mega-content">
          {tab === 'arsenal' && <ArsenalTab />}
          {tab === 'price'   && <PricingTab />}
        </div>

      </div>
    </section>
  );
}

// Stub wrappers so app.jsx keeps working with empty renders
function PricingSection() { return null; }
function SpecsSection()   { return null; }

window.ArsenalSection = ArsenalSection;
window.PricingSection = PricingSection;
window.SpecsSection   = SpecsSection;
window.PhotoViewer    = PhotoViewer;
