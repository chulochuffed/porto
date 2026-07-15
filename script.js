/* ==========================================================================
   CHULO CHUFFED — script.js
   Modular vanilla JavaScript. Each feature is wrapped in its own IIFE-style
   init function and called once the DOM is ready. No global leakage.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initCursorGlow();
  initNavbar();
  initMobileMenu();
  initActiveNavOnScroll();
  initTypingEffect();
  initMatrixBackground();
  initScrollReveal();
  initSkillBars();
  initRippleEffect();
  initBackToTop();
  initFooterYear();
});

/* -------------------------------------------------------------------------
   Loading screen — hides once the window has fully loaded (or after a
   short fallback timeout so users never get stuck on a slow connection).
------------------------------------------------------------------------- */
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const hide = () => screen.classList.add('hidden');

  window.addEventListener('load', () => setTimeout(hide, 400));
  // Fallback in case 'load' takes too long (e.g. slow external fonts/icons)
  setTimeout(hide, 3000);
}

/* -------------------------------------------------------------------------
   Cursor glow — soft radial light that follows the pointer. Skipped
   automatically on touch devices via CSS (display: none).
------------------------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  window.addEventListener('pointermove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }, { passive: true });
}

/* -------------------------------------------------------------------------
   Navbar — becomes solid/blurred once the page is scrolled past a
   threshold, and stays transparent while at the very top of the hero.
------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const toggleState = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  toggleState();
  window.addEventListener('scroll', toggleState, { passive: true });
}

/* -------------------------------------------------------------------------
   Mobile menu — hamburger toggle with an accessible expanded state and
   auto-close when a link is tapped.
------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  const closeMenu = () => {
    toggle.classList.remove('active');
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

/* -------------------------------------------------------------------------
   Active navigation — highlights the nav link matching the section
   currently in view using IntersectionObserver.
------------------------------------------------------------------------- */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* -------------------------------------------------------------------------
   Typing effect — cycles through the role list in the hero, typing and
   deleting each word. Pure timeout-based, no dependencies.
------------------------------------------------------------------------- */
function initTypingEffect() {
  const el = document.getElementById('typedRole');
  if (!el) return;

  const roles = ['Ethical Hacker', 'Security Researcher', 'Bug Hunter', 'Web Developer'];
  const TYPE_SPEED = 90;
  const DELETE_SPEED = 45;
  const HOLD_TIME = 1400;

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      charIndex++;
      el.textContent = currentRole.slice(0, charIndex);
      if (charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(tick, HOLD_TIME);
        return;
      }
    } else {
      charIndex--;
      el.textContent = currentRole.slice(0, charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(tick, isDeleting ? DELETE_SPEED : TYPE_SPEED);
  }

  tick();
}

/* -------------------------------------------------------------------------
   Matrix-style background — a subtle falling-character effect drawn on a
   canvas behind the hero content. Respects prefers-reduced-motion.
------------------------------------------------------------------------- */
function initMatrixBackground() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  const chars = '01<>/{}[]#$%&ABCDEF';
  const fontSize = 15;
  let columns = 0;
  let drops = [];
  let animationId = null;

  function resize() {
    canvas.width = hero.clientWidth;
    canvas.height = hero.clientHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -50);
  }

  function draw() {
    ctx.fillStyle = 'rgba(5, 7, 10, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = 'rgba(0, 217, 255, 0.35)';
      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }

    animationId = requestAnimationFrame(draw);
  }

  resize();
  draw();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animationId);
      resize();
      draw();
    }, 200);
  });
}

/* -------------------------------------------------------------------------
   Scroll reveal — fades/slides elements with the `.reveal` class into
   view as they enter the viewport, using IntersectionObserver.
------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* -------------------------------------------------------------------------
   Skill bars — animates progress bars to their target width only once
   their parent `.skill-card` scrolls into view.
------------------------------------------------------------------------- */
function initSkillBars() {
  const cards = document.querySelectorAll('.skill-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  cards.forEach((card) => observer.observe(card));
}

/* -------------------------------------------------------------------------
   Ripple effect — material-style click ripple for any element carrying
   the [data-ripple] attribute (buttons, cards, links).
------------------------------------------------------------------------- */
function initRippleEffect() {
  const targets = document.querySelectorAll('[data-ripple]');
  if (!targets.length) return;

  targets.forEach((target) => {
    target.style.position = target.style.position || 'relative';
    target.style.overflow = 'hidden';

    target.addEventListener('click', (e) => {
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* -------------------------------------------------------------------------
   Back to top — shows a floating button after scrolling past the hero
   and smooth-scrolls back to the top when clicked.
------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------------------
   Footer year — keeps the copyright year current automatically.
------------------------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
