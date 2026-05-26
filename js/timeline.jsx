// =============================================
// TIMELINE — build steps
// =============================================

function TimelineSection() {
  const steps = window.BUILD_DATA.timeline;

  return (
    <section id="timeline">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">07 / Roadmap</span>
          <h2 className="section-title">Хроніка <span className="glow-red">збірки</span></h2>
          <p className="section-sub">
            Шлях від замовлення до моменту, коли ти відкриєш кришку корпусу і побачиш свій новий ПК. 
            Поки тут — лише дві останні крапки.
          </p>
        </div>

        <div className="timeline reveal-stagger">
          {steps.map((s, i) => (
            <div key={i} className={`t-step ${s.status}`}>
              <span className="num mono">·{s.step}·</span>
              <div>
                <div className="t-title">{s.title}</div>
                <div className="t-desc">{s.desc}</div>
              </div>
              <div className="t-tag">{s.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.TimelineSection = TimelineSection;

// =============================================
// MESSAGE — personal message + footer
// =============================================

function MessageSection() {
  return (
    <section className="msg-section" id="message">
      <div className="container">
        <div className="msg-card corners reveal">
          <div className="br-tr"></div><div className="br-bl"></div>

          <div className="msg-tag">// ПРИВАТНЕ ПОВІДОМЛЕННЯ //</div>
          <h2 className="msg-title">
            З днем, <span className="red">Максим</span>.
          </h2>
          <p className="msg-text">
            Ти про це ще не знаєш — але поки ти читаєш цей сайт, у мене вдома вже збирається твій новий ПК. 
            Кожна деталь обрана з думкою про те, у що ти граєш і чого ти хочеш від машини. 
            Хай тягне всі ігри на ультрі, не лагає у CS і дозволяє нарешті пограти Cyberpunk як треба. 
            Користуйся з кайфом 🔥
          </p>
          <div className="msg-sign mono">
            — <span>Твій брат</span>
          </div>
        </div>
      </div>
    </section>
  );
}

window.MessageSection = MessageSection;

// =============================================
// FOOTER
// =============================================
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <span>◢ PC MAX EDITION · BUILD 001 · 2026</span>
          <span className="signature">Made with ❤ and red LEDs</span>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
