// ============================================
// PARPAY ACADEMY — Scroll & Entry Animations
// ============================================

// 0. Smooth scroll with Lenis — perf optimized (desktop only)
let lenis = null;
const setupSmoothScrollLib = () => {
    if (typeof Lenis === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Skip on mobile - native scroll is more performant + sticky elements work better
    if (window.matchMedia('(max-width: 768px)').matches) return;

    lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        syncTouch: false,
    });

    let rafId;
    function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    document.documentElement.style.scrollBehavior = 'auto';
};

// 1. Scroll reveal with multiple variants
const setupReveal = () => {
    // Default reveal: feature cards, band items, lists
    const fadeUpEls = document.querySelectorAll(
        '.feature-mini, .band__item, .autonomia__list li, .pp-card, .pp-mini-card, .pp-chart-card, .pp-products-card'
    );
    fadeUpEls.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 6) * 70}ms`;
    });

    // Recurso & Bento cards: scale-up effect
    const scaleEls = document.querySelectorAll('.recurso-card, .bento');
    scaleEls.forEach((el, i) => {
        el.classList.add('reveal-scale');
        el.style.transitionDelay = `${(i % 6) * 80}ms`;
    });

    // Section titles: fade up
    const titles = document.querySelectorAll('.section-title, .eyebrow, .section-lead');
    titles.forEach((el) => {
        if (!el.closest('.hero')) el.classList.add('reveal');
    });

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .reveal-scale, .reveal-fade, .reveal-left, .reveal-right')
        .forEach((el) => io.observe(el));
};

// 2-3. Dashboard parallax/tilt — disabled for performance
const setupDashboardParallax = () => {};
const setupMouseTilt = () => {};

// 4. Nav scroll state (rAF-throttled for perf)
const setupNavScroll = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;
    let lastScrolled = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrolled = window.scrollY > 16;
            if (scrolled !== lastScrolled) {
                nav.classList.toggle('nav--scrolled', scrolled);
                lastScrolled = scrolled;
            }
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
};

// 5. Smooth scroll to anchors (uses Lenis if available)
const setupSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            if (lenis) {
                lenis.scrollTo(target, { offset: -76, lerp: 0.08 });
            } else {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
};

// 6.5. Trigger card animations when they enter view (one-shot)
const setupCardAnimations = () => {
    const cards = document.querySelectorAll('.recurso-card, .bento');
    if (!cards.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-animated');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3, rootMargin: '0px 0px -80px 0px' });

    cards.forEach((c) => io.observe(c));
};

// 6. Counter animation when stats come into view
const setupCounters = () => {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const animate = (el) => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const val = target * eased;
            el.textContent = val.toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animate(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach((el) => io.observe(el));
};

document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScrollLib();
    setupReveal();
    setupDashboardParallax();
    setupMouseTilt();
    setupNavScroll();
    setupSmoothScroll();
    setupCounters();
    setupCardAnimations();
});
