// Load fonts non-blocking (avoids render-blocking stylesheet)
(function () {
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap';
  document.head.appendChild(l);
})();

document.addEventListener('DOMContentLoaded', function () {

  // Scroll to top on fresh load only (not when arriving via anchor link)
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  // ─── MOBILE MENU ───
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ─── HEADER SCROLL EFFECT ───
  const header = document.querySelector('.header-nav');
  function updateHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', throttle(updateHeader, 16));

  // Cache header height to avoid forced reflow on every click
  let cachedHeaderHeight = header ? header.offsetHeight : 70;
  window.addEventListener('resize', throttle(function () {
    if (header) cachedHeaderHeight = header.offsetHeight;
  }, 200));

  // ─── SMOOTH SCROLL ───
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - cachedHeaderHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── BACK TO TOP ───
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', throttle(function () {
      backToTopBtn.classList.toggle('show', window.scrollY > 300);
    }, 100));
    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── SCROLL-REVEAL (data-aos) ───
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.getAttribute('data-aos-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('[data-aos]').forEach(function (el) {
    observer.observe(el);
  });

  // ─── EXTERNAL LINKS ───
  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (!link.href.includes(window.location.hostname)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ─── THROTTLE UTILITY ───
  function throttle(fn, limit) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }
});
