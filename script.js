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

  // ─── CALL / TEXT TRACKING ───
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-track') === 'call' ? 'click_call' : 'click_text', { link_url: el.getAttribute('href') });
    });
  });

  // ─── QUOTE FORM ───
  const form = document.getElementById('quoteForm');
  if (form) initQuoteForm(form);

  function initQuoteForm(form) {
    const DETAILS = {
      'New website': ['Brand-new site for my business', 'Landing page for an offer or campaign', 'Online store / e-commerce', 'Booking or appointment site', 'Not sure yet'],
      'Website redesign or fix': ['Refresh an outdated design', 'Make it faster and mobile-friendly', 'Get found on Google (SEO)', 'Fix something broken', 'Ongoing updates and maintenance'],
      'Social media management': ['Done-for-you posting and content', 'Grow followers and engagement', 'Set up or clean up my profiles', 'Content strategy and calendar', 'Monthly reporting'],
      'Social media ads and marketing': ['Facebook / Instagram ads', 'TikTok ads', 'Lead generation campaign', 'Promote an event or launch', 'Not sure, need advice'],
      'AI automation or chatbot': ['Chatbot for my website', 'Automate lead follow-up', 'Connect my tools (CRM, email, calendar)', 'Content automation', 'Something custom'],
      'DeFi education': ['Wallet setup and security', 'Staking and DeFi basics', 'Navigating DEXs and platforms', '1-on-1 session']
    };
    const topic = form.querySelector('#q-topic');
    const detail = form.querySelector('#q-detail');
    const detailWrap = form.querySelector('#q-detail-wrap');
    const status = form.querySelector('#quoteStatus');
    const submit = form.querySelector('#quoteSubmit');
    const ts = form.querySelector('#q-ts');
    if (ts) ts.value = String(Date.now());
    let started = false;

    function fillDetails() {
      const opts = DETAILS[topic.value] || [];
      detail.innerHTML = '<option value="">Choose one (optional)</option>';
      opts.forEach(function (o) {
        const op = document.createElement('option');
        op.value = o; op.textContent = o;
        detail.appendChild(op);
      });
      detailWrap.hidden = opts.length === 0;
    }
    topic.addEventListener('change', fillDetails);

    // Pre-select topic from ?topic= (used by "Get Started" buttons on other pages)
    const preset = new URLSearchParams(window.location.search).get('topic');
    if (preset && Array.prototype.some.call(topic.options, function (o) { return o.value === preset; })) {
      topic.value = preset;
      fillDetails();
    }

    form.addEventListener('input', function () {
      if (!started) { started = true; track('form_start', { form_id: 'quote' }); }
    }, { once: false });

    function setError(field, msg) {
      field.setAttribute('aria-invalid', 'true');
      let err = document.getElementById(field.id + '-err');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        err.id = field.id + '-err';
        field.insertAdjacentElement('afterend', err);
      }
      err.textContent = msg;
      field.setAttribute('aria-describedby', err.id);
    }
    function clearError(field) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      const err = document.getElementById(field.id + '-err');
      if (err) err.remove();
    }
    ['q-name', 'q-email', 'q-topic', 'q-message'].forEach(function (id) {
      const f = document.getElementById(id);
      f.addEventListener('input', function () { clearError(f); });
      f.addEventListener('change', function () { clearError(f); });
    });

    function validate() {
      let first = null;
      const name = form.querySelector('#q-name');
      const email = form.querySelector('#q-email');
      const msg = form.querySelector('#q-message');
      [name, email, topic, msg].forEach(clearError);
      if (!name.value.trim()) { setError(name, 'Please enter your name.'); first = first || name; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, 'Please enter a valid email so I can reply.'); first = first || email; }
      if (!topic.value) { setError(topic, 'Pick the closest topic.'); first = first || topic; }
      if (msg.value.trim().length < 5) { setError(msg, 'A sentence or two about what you need helps a lot.'); first = first || msg; }
      if (first) first.focus();
      return !first;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      status.className = 'form-status';
      status.textContent = 'Sending…';
      submit.disabled = true;
      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            track('generate_lead', { form_id: 'quote', topic: topic.value });
            const firstName = (form.querySelector('#q-name').value.trim().split(' ')[0] || '').slice(0, 40);
            const box = document.createElement('div');
            box.className = 'quote-success';
            box.setAttribute('role', 'status');
            box.tabIndex = -1;
            const h = document.createElement('h2');
            h.textContent = 'Thanks' + (firstName ? ', ' + firstName : '') + '!';
            const p = document.createElement('p');
            p.textContent = 'Your request is in. Cody will reach out soon. Need it faster? Call or text 740-319-2431.';
            const a = document.createElement('a');
            a.href = 'tel:+17403192431'; a.className = 'btn-primary'; a.textContent = 'Call Now';
            box.append(h, p, a);
            form.replaceChildren(box);
            box.focus();
          } else {
            throw new Error((res && res.error) || 'send failed');
          }
        })
        .catch(function (err) {
          submit.disabled = false;
          status.className = 'form-status err';
          status.textContent = (err && err.message && err.message !== 'send failed' && err.message.length < 160)
            ? err.message
            : 'Sorry, that didn’t send. Please call or text 740-319-2431, or email cody@grhwebsolutions.com.';
        });
    });

    initAiHelper(form);
  }

  // ─── AI HELPER (optional, server-side DeepAI proxy) ───
  function initAiHelper(form) {
    const toggle = document.getElementById('aiToggle');
    const panel = document.getElementById('aiPanel');
    const log = document.getElementById('aiLog');
    const input = document.getElementById('aiInput');
    const send = document.getElementById('aiSend');
    const use = document.getElementById('aiUse');
    if (!toggle || !panel) return;
    const history = [];

    // Only show the helper when the server says it's switched on
    fetch('chat.php?status=1', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (res) { if (res && res.enabled) toggle.hidden = false; })
      .catch(function () {});

    toggle.addEventListener('click', function () {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) { input.focus(); track('ai_chat_open', {}); }
    });

    function addMsg(text, who) {
      const p = document.createElement('p');
      p.className = 'ai-msg ' + (who === 'user' ? 'ai-user' : 'ai-bot');
      p.textContent = text;
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
      return p;
    }

    function ask() {
      const text = input.value.trim();
      if (!text || send.disabled) return;
      input.value = '';
      addMsg(text, 'user');
      history.push({ role: 'user', content: text });
      const typing = addMsg('Thinking…', 'bot');
      typing.classList.add('ai-typing');
      send.disabled = true;
      const body = new FormData();
      body.append('history', JSON.stringify(history.slice(-8)));
      body.append('topic', form.querySelector('#q-topic').value || '');
      fetch('chat.php', { method: 'POST', body: body, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          typing.remove();
          if (res && res.reply) {
            addMsg(res.reply, 'bot');
            history.push({ role: 'assistant', content: res.reply });
            use.hidden = false;
          } else {
            addMsg((res && res.error) || 'The helper is unavailable right now. You can still send your request below.', 'bot');
          }
        })
        .catch(function () {
          typing.remove();
          addMsg('The helper is unavailable right now. You can still send your request below.', 'bot');
        })
        .finally(function () { send.disabled = false; input.focus(); });
    }
    send.addEventListener('click', ask);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); ask(); }
    });

    use.addEventListener('click', function () {
      const transcript = history.map(function (m) {
        return (m.role === 'user' ? 'Me: ' : 'AI helper: ') + m.content;
      }).join('\n');
      form.querySelector('#q-chat').value = transcript.slice(0, 4000);
      const msg = form.querySelector('#q-message');
      const mine = history.filter(function (m) { return m.role === 'user'; }).map(function (m) { return m.content; }).join(' ');
      if (!msg.value.trim()) msg.value = mine.slice(0, 2000);
      msg.dispatchEvent(new Event('input', { bubbles: true }));
      use.textContent = 'Added. The full chat will be included with your request.';
      use.disabled = true;
      msg.focus();
    });
  }

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

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
