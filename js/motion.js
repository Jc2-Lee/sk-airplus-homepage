/* SK airplus — 공통 모션 레이어
   - prefers-reduced-motion 이면 아무 연출도 붙이지 않는다(내용은 모두 그대로 보임).
   - 스크롤 핸들러는 rAF 한 번으로 묶고, 화면 밖 요소는 계산하지 않는다. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOK = !reduce.matches;
  if (motionOK) root.classList.add('motion-ok');

  /* ---------- 진행 바 + 헤더 숨김 ---------- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  const header = document.querySelector('.global-header');

  /* ---------- 줄 단위 텍스트 분할 ---------- */
  function splitLines(el) {
    if (el.dataset.splitDone) return;
    // <br>로 나뉜 줄을 각각 마스크 안에 넣는다. 스크린리더는 원문을 그대로 읽게 aria-label 유지.
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const parts = el.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
    el.innerHTML = parts.map((p, i) => `<span class="split-line" aria-hidden="true" style="--l:${i}"><span>${p}</span></span>`).join('');
    el.setAttribute('aria-label', label);
    el.classList.add('split-ready');
    el.dataset.splitDone = '1';
  }
  document.querySelectorAll('[data-split], .minimal-page .ph-head h1').forEach(el => {
    if (!motionOK) return;
    splitLines(el);
    if (!el.closest('[data-reveal]') && !el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'fade');
  });

  /* ---------- 등장(reveal) ---------- */
  const autoReveal = '.minimal-page .block > h2, .minimal-page .block > .desc, .pdetail, .cert, .selected-product-copy, .period-events li, .company-facts > div, .policy, .org, .form > div, .tbl-box';
  if (motionOK) {
    document.querySelectorAll(autoReveal).forEach((el, i, list) => {
      if (el.hasAttribute('data-reveal')) return;
      el.setAttribute('data-reveal', '');
      // 같은 부모 안 형제 순서로 스태거
      const sibs = [...el.parentElement.children].filter(c => c.matches(autoReveal));
      el.style.setProperty('--i', Math.min(sibs.indexOf(el), 6));
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll('.split-ready').forEach(s => s.classList.add('is-in'));
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    // 숨겨진 탭 패널 안 요소는 열릴 때 바로 보이게
    document.addEventListener('click', ev => {
      if (!ev.target.closest('[role="tab"], summary')) return;
      requestAnimationFrame(() => document.querySelectorAll('[role="tabpanel"]:not([hidden]) [data-reveal]:not(.is-in), details[open] [data-reveal]:not(.is-in)').forEach(el => el.classList.add('is-in')));
    });
    window.addEventListener('hashchange', () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    }));
  }

  /* ---------- 숫자 카운트업 ---------- */
  const counters = [...document.querySelectorAll('[data-count]')];
  if (counters.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target; cio.unobserve(el);
        const end = parseFloat(el.dataset.count);
        if (!motionOK) { el.textContent = el.dataset.count; return; }
        const t0 = performance.now(), dur = 1400;
        const step = t => {
          const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(end * k).toString();
          if (p < 1) requestAnimationFrame(step); else el.textContent = el.dataset.count;
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- 스크롤 연동 값(진행률, 패럴랙스, 섹션 진행) ---------- */
  const parallax = [...document.querySelectorAll('.page-hero img, .esg-hero img, [data-parallax]')];
  const progressEls = [...document.querySelectorAll('[data-scroll-progress]')];
  const footMark = document.querySelector('.ft-mark');
  let lastY = scrollY, ticking = false;

  function frame() {
    ticking = false;
    const y = scrollY, h = root.scrollHeight - innerHeight;
    bar.style.setProperty('--progress', h > 0 ? (y / h).toFixed(4) : 0);

    if (header) {
      const goingDown = y > lastY + 4, goingUp = y < lastY - 4;
      if (goingDown && y > 240) { header.classList.add('is-hidden'); document.body.classList.add('header-hidden'); }
      if (goingUp || y < 120) { header.classList.remove('is-hidden'); document.body.classList.remove('header-hidden'); }
    }
    lastY = y;
    if (!motionOK) return;

    parallax.forEach(img => {
      const box = (img.closest('figure') || img).getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      const speed = parseFloat(img.dataset.parallax || '0.18');
      const center = box.top + box.height / 2 - innerHeight / 2;
      img.style.setProperty('--py', (-center * speed).toFixed(1) + 'px');
    });
    progressEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : (r.top < innerHeight ? 1 : 0);
      el.style.setProperty('--p', p.toFixed(4));
      el.dispatchEvent(new CustomEvent('scrollprogress', { detail: p }));
    });
    if (footMark) {
      const r = footMark.getBoundingClientRect();
      if (r.top < innerHeight) footMark.style.setProperty('--fx', Math.max(0, (r.top - (innerHeight - r.height)) * 0.6).toFixed(1) + 'px');
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* ---------- 서브페이지 바로가기 scrollspy ---------- */
  document.querySelectorAll('.content-shortcuts').forEach(nav => {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const targets = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    if (!targets.length) return;
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => {
          const on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
          if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - 24, behavior: motionOK ? 'smooth' : 'auto' });
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    targets.forEach(t => sio.observe(t));
  });

  /* 사용자가 OS 설정을 바꾸면 즉시 반영 */
  reduce.addEventListener?.('change', () => location.reload());
})();
