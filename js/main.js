/* js/main.js
   Production-focused front-end utilities:
   - Theme toggle with localStorage persistence
   - Accessible keyboard handling for the toggle
   - Smooth internal scrolling with focus management
   - IntersectionObserver to reveal elements (fade-in)
   - Back-to-top visibility toggling
   - Small, documented code for maintainability
*/

/* Elements */
const docEl = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const backTop = document.getElementById('back-top');
const yearEl = document.getElementById('year');

const THEME_KEY = 'jj_theme_preference_v1';

/* Set current year */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Apply theme function */
function applyTheme(theme) {
  docEl.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(!isDark)); // pressed -> light
  themeIcon.textContent = isDark ? '☀️' : '🌙';
}

/* Initialise theme:
   1) saved preference
   2) system preference
   3) default to dark (designer choice for this portfolio)
*/
(function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
      return;
    }
  } catch (e) {
    // ignore localStorage errors (private mode)
  }
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(prefersLight ? 'light' : 'dark');
})();

/* Toggle handler */
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  /* Keyboard activation (Enter / Space) */
  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      themeToggle.click();
    }
  });
}

/* Smooth internal link scrolling + focus management for accessibility */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      window.setTimeout(() => target.removeAttribute('tabindex'), 1200);
    }
  });
});

/* IntersectionObserver to add .in-view when elements enter viewport */
const ioOptions = { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.05 };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, ioOptions);

/* Observe elements with .fade-in and major structural sections */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  ['hero','about','projects','contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('fade-in')) {
      el.classList.add('fade-in');
      io.observe(el);
    }
  });
});

/* Back-to-top button logic */
function updateBackTopVisibility() {
  const scrolled = window.scrollY || window.pageYOffset;
  if (!backTop) return;
  if (scrolled > 360) backTop.classList.add('show');
  else backTop.classList.remove('show');
}
window.addEventListener('scroll', updateBackTopVisibility);
window.addEventListener('resize', updateBackTopVisibility);
document.addEventListener('DOMContentLoaded', updateBackTopVisibility);

if (backTop) {
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('.brand')?.focus();
  });
}

/* Small defensive helpers for older browsers */
(function polyfills() {
  // requestAnimationFrame basic polyfill
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  }
})();
