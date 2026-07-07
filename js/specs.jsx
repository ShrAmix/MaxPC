// =============================================
// SPECS — compact technical specs grid
// =============================================

function SpecsSection() {
  const specs = [
    { label: 'CPU', value: 'Ryzen 5 5600', meta: '6C / 12T · до 4.4 GHz · 65W', icon: '◢' },
    { label: 'GPU', value: 'RTX 5060', meta: '8 GB GDDR7 · DLSS 4.0 · 145W', icon: '◤' },
    { label: 'RAM', value: '32 GB DDR4', meta: '3200 MHz · CL16 · Dual-channel', icon: '▤' },
    { label: 'Storage', value: '512 GB + 1 TB', meta: 'NVMe M.2 · ~1.5 TB total', icon: '◉' },
    { label: 'PSU', value: '550W Bronze', meta: 'MSI MAG A550BN · 80+', icon: '⚡' },
    { label: 'Cooling', value: 'Air Tower', meta: 'ID-COOLING + 2× Arctic F12', icon: '❄' },
    { label: 'OS', value: 'Windows 11', meta: '64-bit · Pro · фреш інсталяція', icon: '▦' },
    { label: 'Target', value: '1080p Ultra', meta: '60-300 FPS залежно від гри', icon: '◈' },
  ];

  return (
    <section id="specs" style={{ padding: '80px 0 100px' }}>
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">05 / Технічні характеристики</span>
          <h2 className="section-title">Усі <span className="glow-red">цифри</span> на місці</h2>
        </div>

        <div className="specs-grid reveal-stagger">
          {specs.map((s, i) => (
            <div className="spec-card corners" key={i}>
              <div className="br-tr"></div><div className="br-bl"></div>
              <div className="accent">{s.icon}</div>
              <div className="label">{s.label}</div>
              <div className="value">{s.value}</div>
              <div className="meta">{s.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.SpecsSection = SpecsSection;
