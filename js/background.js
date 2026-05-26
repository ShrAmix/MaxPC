// =============================================
// Background particles canvas — neon dust
// =============================================

(function() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, mouseX = -9999, mouseY = -9999;
  let scrollY = 0;
  const COLORS = [
    { r: 255, g: 46, b: 61 },   // red
    { r: 0, g: 230, b: 255 },   // cyan
    { r: 255, g: 255, b: 255 }, // white
  ];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = window.innerWidth * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }

  function init() {
    resize();
    const count = Math.min(80, Math.floor(window.innerWidth / 14));
    particles = [];
    for (let i = 0; i < count; i++) {
      const c = COLORS[Math.floor(Math.random() * (Math.random() < 0.8 ? 2 : 3))];
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2 - 0.05,
        size: Math.random() * 1.5 + 0.5,
        color: c,
        alpha: Math.random() * 0.5 + 0.2,
        twPhase: Math.random() * Math.PI * 2,
        twSpeed: 0.005 + Math.random() * 0.01,
        z: Math.random() * 0.8 + 0.2, // depth, 0.2..1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy - scrollY * 0.0005 * p.z;
      p.twPhase += p.twSpeed;

      // wrap
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.y > window.innerHeight + 10) p.y = -10;

      // mouse attraction subtle
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const d2 = dx*dx + dy*dy;
      if (d2 < 22500) {
        const force = (1 - d2 / 22500) * 0.4;
        p.x += (dx / Math.sqrt(d2)) * force;
        p.y += (dy / Math.sqrt(d2)) * force;
      }

      const tw = 0.5 + 0.5 * Math.sin(p.twPhase);
      const a = p.alpha * tw * p.z;
      const r = p.size * (1 + tw * 0.5);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
      grad.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.18})`);
      grad.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // subtle connecting lines for close-ish particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 12000) {
          const alpha = (1 - d2 / 12000) * 0.08;
          ctx.strokeStyle = `rgba(255, 46, 61, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { init(); });
  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  init();
  draw();
})();

// =============================================
// Reveal on scroll
// =============================================
(function() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  function scan() {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      if (!el.dataset._observed) {
        io.observe(el);
        el.dataset._observed = '1';
      }
    });
  }

  // initial + periodic in case React mounts later
  scan();
  const interval = setInterval(scan, 400);
  setTimeout(() => clearInterval(interval), 8000);

  window.__rescanReveal = scan;
})();

// =============================================
// Nav scroll
// =============================================
(function() {
  function onScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
