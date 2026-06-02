// =============================================
// MAIN APP
// =============================================

function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menu on link click
  const handleLink = () => setMenuOpen(false);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="nav-brand-mark">M</div>
          <span>PC MAX EDITION</span>
        </div>

        {/* Desktop links */}
        <div className="nav-links">
          <a href="#build">Build</a>
          <a href="#arsenal">Arsenal</a>
          <a href="#bench">Benchmarks</a>
          <a href="#message">Max</a>
        </div>

        {/* Mobile hamburger */}
        <button className="nav-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="nav-drawer">
          <a href="#build"     onClick={handleLink}>Build</a>
          <a href="#arsenal"   onClick={handleLink}>Arsenal</a>
          <a href="#bench"     onClick={handleLink}>Benchmarks</a>
          <a href="#message"   onClick={handleLink}>Max</a>
        </div>
      )}
    </nav>
  );
}

function App() {
  React.useEffect(() => {
    if (window.__rescanReveal) {
      requestAnimationFrame(() => window.__rescanReveal());
      setTimeout(() => window.__rescanReveal && window.__rescanReveal(), 300);
    }
  }, []);

  const {
    Hero, PCBuild, ArsenalSection,
    BenchmarksSection, MessageSection, Footer,
  } = window;

  return (
    <React.Fragment>
      <Nav />
      <Hero />
      <PCBuild />
      <ArsenalSection />
      <BenchmarksSection />
      <MessageSection />
      <Footer />
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
