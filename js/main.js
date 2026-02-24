/**
 * MB247 Cricket Landing Page — Main JavaScript
 * Features: WhatsApp popup, FAQ accordion, scroll animations,
 *           mobile nav, progress bar animations, stat counters
 */

'use strict';

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const CONFIG = {
    whatsappNumber: '919876543210',
    popupDelay: 6000,       // 6 seconds
    popupScrollPct: 0.40,   // 40% scroll
    sessionKey: 'mb247_popup_shown',
};

/* ─────────────────────────────────────────────
   WHATSAPP POPUP
───────────────────────────────────────────── */
(function initWAPopup() {
    const overlay = document.getElementById('waPopupOverlay');
    const closeBtn = document.getElementById('waPopupClose');
    if (!overlay) return;

    // Don't show again in same session
    if (sessionStorage.getItem(CONFIG.sessionKey)) return;

    let shown = false;

    function showPopup() {
        if (shown) return;
        shown = true;
        sessionStorage.setItem(CONFIG.sessionKey, '1');
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Focus close button for accessibility
        setTimeout(() => closeBtn && closeBtn.focus(), 400);
    }

    function hidePopup() {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Time-based trigger
    const timer = setTimeout(showPopup, CONFIG.popupDelay);

    // Scroll-based trigger
    function onScroll() {
        const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (scrolled >= CONFIG.popupScrollPct) {
            clearTimeout(timer);
            showPopup();
            window.removeEventListener('scroll', onScroll);
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Close handlers
    closeBtn && closeBtn.addEventListener('click', hidePopup);

    // Close on overlay backdrop click
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) hidePopup();
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('show')) hidePopup();
    });
})();

/* ─────────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────────── */
(function initMobileNav() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const closeBtn = document.getElementById('mobileNavClose');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-nav .btn');
    if (!hamburger || !mobileNav) return;

    function openNav() {
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden';
        hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeNav() {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', openNav);
    closeBtn && closeBtn.addEventListener('click', closeNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeNav));
})();

/* ─────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────── */
(function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const q = item.querySelector('.faq-q');
        q.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all
            items.forEach(i => {
                i.classList.remove('open');
                i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            });
            // Toggle clicked
            if (!isOpen) {
                item.classList.add('open');
                q.setAttribute('aria-expanded', 'true');
            }
        });
        // Keyboard support
        q.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); q.click(); }
        });
    });
})();

/* ─────────────────────────────────────────────
   SCROLL ANIMATIONS (Intersection Observer)
───────────────────────────────────────────── */
(function initScrollAnimations() {
    const fadeEls = document.querySelectorAll('.fade-up');
    if (!fadeEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────
   PROGRESS BAR ANIMATIONS
───────────────────────────────────────────── */
(function initProgressBars() {
    const bars = document.querySelectorAll('.progress-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetWidth = el.style.width;
                el.style.width = '0%';
                requestAnimationFrame(() => {
                    setTimeout(() => { el.style.width = targetWidth; }, 80);
                });
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    bars.forEach(bar => observer.observe(bar));
})();

/* ─────────────────────────────────────────────
   STAT COUNTER ANIMATION
───────────────────────────────────────────── */
(function initStatCounters() {
    const stats = document.querySelectorAll('.stat-num');
    if (!stats.length) return;

    function animateCount(el, target, suffix, prefix) {
        const duration = 1800;
        const start = performance.now();
        const isFloat = target % 1 !== 0;

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = target * ease;
            el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const raw = el.textContent.trim();
                // Parse: "2.5L+", "98%", "500+", "24/7"
                const match = raw.match(/^([^\d]*)(\d+\.?\d*)(.*)$/);
                if (!match) return;
                const prefix = match[1];
                const num = parseFloat(match[2]);
                const suffix = match[3];
                if (!isNaN(num)) animateCount(el, num, suffix, prefix);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.7 });

    stats.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────
   SMOOTH SCROLL for nav links
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const navH = document.querySelector('.navbar')?.offsetHeight || 68;
            const top = target.getBoundingClientRect().top + window.scrollY - navH - 10;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

/* ─────────────────────────────────────────────
   NAVBAR SHADOW ON SCROLL
───────────────────────────────────────────── */
(function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.style.boxShadow = window.scrollY > 10
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : 'none';
    }, { passive: true });
})();

/* ─────────────────────────────────────────────
   FLOATING WA BUTTON — show after 2s
───────────────────────────────────────────── */
(function initFloatBtn() {
    const btn = document.getElementById('floatWa');
    if (!btn) return;
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0.5)';
    btn.style.transition = 'opacity 0.5s, transform 0.5s';
    setTimeout(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
    }, 2000);
})();

/* ─────────────────────────────────────────────
   GA / UTM TRACKING (stub — replace with real)
───────────────────────────────────────────── */
(function initTracking() {
    const ctaIds = [
        'hero-id-btn', 'hero-wa-btn', 'nav-wa-btn', 'nav-id-btn',
        'cta-id-btn', 'cta-wa-btn', 'wa-section-btn', 'popup-wa-btn',
    ];
    ctaIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', () => {
                // Replace with gtag('event', ...) call:
                // gtag('event', 'cta_click', { button_id: id });
                console.info('[MB247 Analytics] CTA clicked:', id);
            });
        }
    });
})();
