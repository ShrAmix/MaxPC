// =============================================
// PRICING — breakdown + animated total
// =============================================

function PricingSection() {
  const parts = window.BUILD_DATA.parts;
  const total = parts.reduce((s, p) => s + p.price, 0);

  // Group by category bucket
  const groups = {
    'Core': ['cpu', 'mobo', 'ram', 'gpu'],
    'Cooling + TIM': ['cooler', 'fans', 'tim'],
    'Storage': ['ssd1', 'ssd2'],
    'Power + Case': ['psu', 'case'],
  };
  const groupTotals = Object.entries(groups).map(([name, ids]) => ({
    name,
    total: parts.filter(p => ids.includes(p.id)).reduce((s, p) => s + p.price, 0),
  }));

  return (
    <section id="price">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">04 / Бюджет</span>
          <h2 className="section-title">Скільки <span className="glow-red">це коштувало</span></h2>
          <p className="section-sub">
            Усі ціни в гривнях, на момент замовлення (травень 2026). RTX 4060 — приблизна вартість, скоригуємо після покупки.
          </p>
        </div>

        <div className="pricing-grid">

          {/* TABLE */}
          <div className="price-table corners reveal">
            <div className="br-tr"></div><div className="br-bl"></div>
            {parts.map((p, i) => (
              <div className="price-row" key={p.id}>
                <span className="idx mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="name">
                  {p.name}
                  <small>{p.cat}{p.qty > 1 ? ` · ${p.qty} шт.` : ''}</small>
                </span>
                <span className="qty">×{p.qty}</span>
                <span className="amt">{p.price.toLocaleString('uk-UA')} ₴</span>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="price-summary corners reveal">
            <div className="br-tr"></div><div className="br-bl"></div>

            <h3>Загальна вартість</h3>
            <div className="total mono">
              <window.CountUp to={total} duration={2200} />
              <span className="currency">₴</span>
            </div>

            <div style={{ marginTop: 8 }}>
              {groupTotals.map(g => {
                const pct = Math.round((g.total / total) * 100);
                return (
                  <div className="subtotal" key={g.name}>
                    <span>{g.name} <small style={{opacity:0.6, marginLeft:6}}>{pct}%</small></span>
                    <span className="mono">{g.total.toLocaleString('uk-UA')} ₴</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16, height: 8, background: 'var(--bg-3)', display: 'flex', overflow: 'hidden' }}>
              {groupTotals.map((g, i) => {
                const colors = ['var(--red)', 'var(--cyan)', 'var(--violet)', 'var(--amber)'];
                return (
                  <div key={g.name} style={{
                    width: `${(g.total / total) * 100}%`,
                    background: colors[i],
                    boxShadow: `0 0 12px ${colors[i]}`,
                    transition: 'width 1.4s cubic-bezier(0.2,0.7,0.2,1)',
                  }} />
                );
              })}
            </div>

            <div className="footnote">
              * Ціна RTX 4060 — Asus Dual поки що плейсхолдер.<br/>
              * Без урахування Windows ліцензії та периферії.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

window.PricingSection = PricingSection;
