// =============================================
// MAIN APP
// =============================================

function Nav() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="nav-brand-mark">M</div>
          <span>PC MAX EDITION</span>
        </div>
        <div className="nav-links">
          <a href="#build">Build</a>
          <a href="#arsenal">Arsenal</a>
          <a href="#bench">Benchmarks</a>
          <a href="#message">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{marginRight:4}}>
              <polygon points="5,0 10,10 0,10"/>
            </svg>
            Max
          </a>
        </div>
      </div>
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
