// =============================================
// MESSAGE — personal message + footer
// =============================================

function MessageSection() {
  return (
    <section className="msg-section" id="message">
      <div className="container">
        <div className="msg-card corners reveal">
          <div className="br-tr"></div><div className="br-bl"></div>

          {/* decorative grid overlay */}
          <div className="msg-grid-overlay" aria-hidden="true" />

          {/* top scanline accent */}
          <div className="msg-scanline" aria-hidden="true" />

          <div className="msg-inner">
            <div className="msg-tag mono">
              <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                <rect width="16" height="2" fill="var(--red)"/>
              </svg>
              Приватне повідомлення
              <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                <rect width="16" height="2" fill="var(--red)"/>
              </svg>
            </div>

            <h2 className="msg-title">
              З днем,{' '}
              <span className="msg-name">
                Максим
                <svg className="msg-name-underline" viewBox="0 0 200 6" preserveAspectRatio="none">
                  <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="var(--red)" strokeWidth="2" fill="none"/>
                </svg>
              </span>
            </h2>

            <div className="msg-divider">
              <div className="msg-divider-line" />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" stroke="var(--red)" strokeWidth="1" opacity="0.5"/>
                <rect x="6" y="6" width="8" height="8" stroke="var(--red)" strokeWidth="1" opacity="0.8"/>
                <circle cx="10" cy="10" r="2" fill="var(--red)"/>
              </svg>
              <div className="msg-divider-line" />
            </div>

            <p className="msg-text">
              Ти про це ще не знаєш — але поки ти читаєш цей сайт, у мене вдома вже збирається твій новий ПК.
              Кожна деталь обрана з думкою про те, у що ти граєш і чого ти хочеш від машини.
              Хай тягне всі ігри на ультрі, не лагає у CS і дозволяє нарешті пограти Cyberpunk як треба.
              Користуйся з кайфом.
            </p>

            <div className="msg-sign mono">
              <span className="msg-sign-dash">—</span>
              <span className="msg-sign-name">Твій брат</span>
            </div>
          </div>

          {/* corner accents */}
          <div className="msg-corner-tl" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M0 40 L0 0 L40 0" stroke="var(--red)" strokeWidth="1" opacity="0.3"/>
              <path d="M0 20 L0 0 L20 0" stroke="var(--red)" strokeWidth="1"/>
            </svg>
          </div>
          <div className="msg-corner-br" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M40 0 L40 40 L0 40" stroke="var(--red)" strokeWidth="1" opacity="0.3"/>
              <path d="M40 20 L40 40 L20 40" stroke="var(--red)" strokeWidth="1"/>
            </svg>
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
          <div className="footer-brand mono">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="14" stroke="var(--red)" strokeWidth="1"/>
              <text x="8" y="11.5" textAnchor="middle" fill="var(--red)" fontSize="8" fontFamily="monospace" fontWeight="700">M</text>
            </svg>
            PC MAX EDITION · BUILD 001 · 2026
          </div>
          <div className="footer-right mono">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="var(--red)" strokeWidth="1" opacity="0.5"/>
              <circle cx="6" cy="6" r="2" fill="var(--red)" opacity="0.8"/>
            </svg>
            Зроблено з холодним кулером та гарячою відеокартою
          </div>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;

// Stub — TimelineSection no longer used but kept to avoid JS errors
function TimelineSection() { return null; }
window.TimelineSection = TimelineSection;
