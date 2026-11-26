/* 메인 전용 인터랙션: 히어로 문구 줄 애니메이션, 공기→공정 단계 전환, 산업 미리보기 */
(() => {
  'use strict';
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 히어로 제목을 줄 단위 마스크로 감싼다(home.js 의 장면 전환도 이 함수를 쓴다) */
  window.airplusSetLines = function (el, lines) {
    el.setAttribute('aria-label', lines.join(' '));
    el.innerHTML = lines.map((t, i) => `<span class="hl" aria-hidden="true" style="--l:${i}"><span>${t}</span></span>`).join('');
  };
  const title = document.querySelector('#hero-title');
  if (title) window.airplusSetLines(title, title.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()));

  /* 히어로를 지나면 QUICK 버튼을 띄운다(첫 화면은 영상 컨트롤에 집중) */
  const hero = document.querySelector('.hero');
  if (hero) {
    const qio = new IntersectionObserver(([e]) => document.body.classList.toggle('past-hero', !e.isIntersecting || e.intersectionRatio < 0.5), { threshold: [0, 0.5] });
    qio.observe(hero.querySelector('.hero-sticky') || hero);
  }

  /* 01 공기→분리→공급: 보이는 단계에 맞춰 그림 단계를 바꾼다 */
  const vis = document.querySelector('.air-vis');
  const steps = [...document.querySelectorAll('.journey-step')];
  if (vis && steps.length) {
    const setStage = n => {
      vis.dataset.stage = n;
      steps.forEach(s => s.classList.toggle('is-current', s.dataset.step === String(n)));
    };
    setStage(1);
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setStage(e.target.dataset.step); });
    }, { rootMargin: window.matchMedia('(max-width: 800px)').matches ? '-62% 0px -30% 0px' : '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  }

  /* 04 산업 인덱스: 마우스를 따라오는 미리보기 이미지(정밀 포인터 + 모션 허용 시에만) */
  const preview = document.querySelector('.ix-preview');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (preview && fine && motionOK) {
    const img = preview.querySelector('img');
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      preview.style.setProperty('--mx', x.toFixed(1) + 'px');
      preview.style.setProperty('--my', y.toFixed(1) + 'px');
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    document.querySelectorAll('.industry-index a').forEach(a => {
      a.addEventListener('mouseenter', () => {
        if (img.getAttribute('src') !== a.dataset.preview) img.src = a.dataset.preview;
        preview.classList.add('is-on');
      });
      a.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
      a.addEventListener('mousemove', ev => {
        tx = ev.clientX + 28; ty = ev.clientY - 110;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  }

  /* 원소 카드: 살짝 기울어지는 틸트(정밀 포인터 + 모션 허용 시에만) */
  if (fine && motionOK) {
    document.querySelectorAll('.element').forEach(card => {
      card.addEventListener('mousemove', ev => {
        const r = card.getBoundingClientRect();
        const rx = ((ev.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((ev.clientX - r.left) / r.width - 0.5) * 8;
        card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }
})();
