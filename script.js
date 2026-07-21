(() => {
  const isDesktop = () => window.matchMedia('(min-width: 761px)').matches;

  const rootEl = document.querySelector('.root');
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const trailCanvas = document.getElementById('trailCanvas');
  const heroRight = document.getElementById('heroRight');
  const heroCanvas = document.getElementById('heroCanvas');
  const heroImg = document.getElementById('heroImg');
  const techSection = document.getElementById('techSection');
  const expSection = document.getElementById('expSection');
  const radarCanvas = document.getElementById('radarCanvas');
  const sparkCanvas = document.getElementById('sparkCanvas');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  const particleCount = 150;
  const tiltIntensity = 14;

  /* ---------- Mobile nav ---------- */
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
  });
  mobileMenu.querySelectorAll('span').forEach(item => {
    item.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* ---------- Custom cursor ---------- */
  const mouse = { x: -9999, y: -9999 };
  const ringPos = { x: -100, y: -100 };
  let trail = [];

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    trail.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (trail.length > 40) trail.shift();
    cursorDot.style.transform = `translate3d(${e.clientX - 5}px, ${e.clientY - 5}px, 0)`;
  });

  /* ---------- Hero tilt ---------- */
  const onHeroMove = e => {
    const r = heroRight.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    heroImg.style.transform = `perspective(900px) rotateY(${dx * tiltIntensity}deg) rotateX(${-dy * tiltIntensity}deg)`;
  };
  const onHeroLeave = () => {
    heroImg.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  };
  heroRight.addEventListener('mousemove', onHeroMove);
  heroRight.addEventListener('mouseleave', onHeroLeave);

  /* ---------- Hero particles ---------- */
  let particles = [];
  const initParticles = (w, h) => {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        c: i % 2 === 0 ? '0,85,255' : '0,229,255'
      });
    }
  };

  /* ---------- Spark canvas particles ---------- */
  let sparks = [];

  const resize = () => {
    if (heroCanvas && heroRight) {
      const r = heroRight.getBoundingClientRect();
      heroCanvas.width = r.width; heroCanvas.height = r.height;
      initParticles(r.width, r.height);
    }
    if (trailCanvas) {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    }
    if (sparkCanvas && expSection) {
      const r = expSection.getBoundingClientRect();
      sparkCanvas.width = r.width; sparkCanvas.height = r.height;
      if (sparks.length === 0) {
        for (let i = 0; i < 40; i++) {
          sparks.push({ x: Math.random() * r.width, y: Math.random() * r.height, vy: 0.15 + Math.random() * 0.25, r: 1 + Math.random() * 1.5, phase: Math.random() * 100 });
        }
      }
    }
  };
  window.addEventListener('resize', resize);
  resize();

  /* ---------- Reveal on scroll ---------- */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      if (en.target === techSection) { techSection.classList.add('revealed'); observer.unobserve(en.target); }
      if (en.target === expSection) { expSection.classList.add('revealed'); observer.unobserve(en.target); }
    });
  }, { threshold: 0.2 });
  observer.observe(techSection);
  observer.observe(expSection);

  /* ---------- Spec / stat hover states ---------- */
  document.querySelectorAll('.spec-card').forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('hovered'));
    card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
  });
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('hovered'));
    card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
  });

  /* ---------- Radar chart data ---------- */
  const radarAxes = 6;
  const radarLabels = ['BASS', 'MIDS', 'TREBLE', 'ANC', 'STAGE', 'BUILD'];
  const auraVals = [0.9, 0.8, 0.85, 0.95, 0.8, 0.9];
  const industryVals = [0.6, 0.65, 0.6, 0.6, 0.65, 0.65];
  const polyPoint = (cx, cy, radius, i, val) => {
    const angle = (Math.PI * 2 * i) / radarAxes - Math.PI / 2;
    return { x: cx + Math.cos(angle) * radius * val, y: cy + Math.sin(angle) * radius * val };
  };

  /* ---------- Animation loop ---------- */
  const t0 = performance.now();

  const loop = now => {
    const t = (now - t0) / 1000;

    if (isDesktop()) {
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      cursorRing.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

      const tctx = trailCanvas.getContext('2d');
      tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trail.forEach(p => {
        p.life *= 0.92;
        tctx.beginPath();
        tctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2);
        tctx.fillStyle = `rgba(0,85,255,${p.life * 0.5})`;
        tctx.fill();
      });
      trail = trail.filter(p => p.life > 0.03);
    }

    // hero canvas: rings + particles
    if (heroCanvas && particles.length) {
      const ctx = heroCanvas.getContext('2d');
      const w = heroCanvas.width, h = heroCanvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.48;
      for (let i = 0; i < 4; i++) {
        const phase = (((t * 60 + i * 90) % 360) + 360) % 360;
        const radius = Math.max(0, phase);
        const op = Math.max(0, 0.06 * (1 - radius / 300));
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,85,255,${op})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      const heroRect = heroRight.getBoundingClientRect();
      const mx = mouse.x - heroRect.left;
      const my = mouse.y - heroRect.top;
      particles.forEach(p => {
        const dxc = p.x - cx, dyc = p.y - cy;
        const dc = Math.hypot(dxc, dyc) || 1;
        p.vx += (dxc / dc) * 0.0025;
        p.vy += (dyc / dc) * 0.0025;
        const dxm = mx - p.x, dym = my - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 150 && dm > 26) { p.vx += (dxm / dm) * 0.35; p.vy += (dym / dm) * 0.35; }
        else if (dm <= 26 && dm > 0.1) { p.vx -= (dxm / dm) * 0.6; p.vy -= (dym / dm) * 0.6; }
        p.vx *= 0.95; p.vy *= 0.95;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
          if (d2 < 70 * 70) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,85,255,${0.12 * (1 - Math.sqrt(d2) / 70)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},0.85)`;
        ctx.fill();
      });
    }

    // radar chart
    if (radarCanvas) {
      const ctx = radarCanvas.getContext('2d');
      const w = radarCanvas.width, h = radarCanvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const breathe = 1 + Math.sin(t * 1.2) * 0.03;
      const maxR = (Math.min(w, h) / 2 - 26) * breathe;

      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        for (let i = 0; i <= radarAxes; i++) {
          const p = polyPoint(cx, cy, maxR * (ring / 4), i % radarAxes, 1);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(136,144,168,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (let i = 0; i < radarAxes; i++) {
        const p = polyPoint(cx, cy, maxR, i, 1);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(136,144,168,0.18)'; ctx.stroke();
        ctx.font = '11px Barlow Condensed, sans-serif';
        ctx.fillStyle = '#8890A8';
        ctx.textAlign = 'center';
        const angle = (Math.PI * 2 * i) / radarAxes - Math.PI / 2;
        ctx.fillText(radarLabels[i], cx + Math.cos(angle) * (maxR + 16), cy + Math.sin(angle) * (maxR + 16) + 4);
      }
      const drawPoly = (vals, color, fill) => {
        ctx.beginPath();
        vals.forEach((v, i) => {
          const p = polyPoint(cx, cy, maxR, i, v);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        if (fill) { ctx.fillStyle = color.replace('VAL', '0.15'); ctx.fill(); }
        ctx.strokeStyle = color.replace('VAL', '0.9');
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      drawPoly(industryVals, 'rgba(136,144,168,VAL)', false);
      drawPoly(auraVals, 'rgba(0,85,255,VAL)', true);

      const sweepAngle = (t * 0.6) % (Math.PI * 2);
      const sx = cx + Math.cos(sweepAngle) * maxR, sy = cy + Math.sin(sweepAngle) * maxR;
      const grad = ctx.createLinearGradient(cx, cy, sx, sy);
      grad.addColorStop(0, 'rgba(0,229,255,0.6)');
      grad.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();
    }

    // spark canvas
    if (sparkCanvas && sparks.length) {
      const ctx = sparkCanvas.getContext('2d');
      const w = sparkCanvas.width, h = sparkCanvas.height;
      ctx.clearRect(0, 0, w, h);
      sparks.forEach(s => {
        s.y -= s.vy;
        if (s.y < -10) s.y = h + 10;
        const op = 0.35 + 0.35 * Math.sin(t * 2 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,85,255,${Math.max(0.1, op)})`;
        ctx.fill();
      });
    }

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
