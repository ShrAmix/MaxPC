// =============================================
// MAIN APP
// =============================================

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="nav-brand-mark">M</div>
          <span>PC MAX EDITION</span>
        </div>
        <div className="nav-links">
          <a href="#build">Build</a>
          <a href="#arsenal">Arsenal</a>
          <a href="#price">Price</a>
          <a href="#bench">Benchmarks</a>
          <a href="#timeline">Timeline</a>
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
    Hero, PCBuild, ArsenalSection, PricingSection,
    SpecsSection, BenchmarksSection, TimelineSection,
    MessageSection, Footer,
  } = window;

  return (
    <React.Fragment>
      <Nav />
      <Hero />
      <PCBuild />
      <ArsenalSection />
      <PricingSection />
      <SpecsSection />
      <BenchmarksSection />
      <TimelineSection />
      <MessageSection />
      <Footer />
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
