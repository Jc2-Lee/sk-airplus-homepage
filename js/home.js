(() => {
  'use strict';

  const products = {
    o2: { name: '산소', english: 'OXYGEN', formula: 'O₂', lead: '연소와 산화 공정의 효율을 높이는 가스', description: '산소는 다른 물질의 연소와 산화 반응을 돕습니다. 철강 제강, 유리 용해, 화학 공정 등 다양한 산업에서 사용됩니다.', industries: '철강 · 유리 · 화학 · 정유 및 가스 · 금속가공', supply: '파이프라인 · Bulk', source: '공기분리장치(ASU)' },
    n2: { name: '질소', english: 'NITROGEN', formula: 'N₂', lead: '정밀한 공정을 지키는 불활성 가스', description: '질소는 산소와 수분을 밀어내 공정에 필요한 불활성 분위기를 만듭니다. 반도체·디스플레이 공정의 퍼지부터 화학·금속 공정까지 사용됩니다.', industries: '반도체 · 2차전지 · LCD·OLED · 화학 · 금속가공 등', supply: '파이프라인 · On-site · Bulk', source: '공기분리장치(ASU)' },
    ar: { name: '아르곤', english: 'ARGON', formula: 'Ar', lead: '고온·정밀 공정의 보호 분위기를 만드는 가스', description: '아르곤은 반응성이 매우 낮은 비활성 가스입니다. 반도체 박막 공정과 금속 용접·정련 등에서 공기와의 접촉을 막는 역할을 합니다.', industries: '반도체 · LCD·OLED · 철강 · 금속가공 · 2차전지', supply: '파이프라인 · Bulk', source: '공기분리장치(ASU)' },
    h2: { name: '수소', english: 'HYDROGEN', formula: 'H₂', lead: '환원과 수소화 반응의 핵심 가스', description: '수소는 정유 탈황, 화학 수소화 반응, 반도체와 금속 열처리 등에 쓰입니다. 사용량·순도·압력과 안전 조건을 함께 검토해 공급방식을 설계합니다.', industries: '반도체 · 정유 및 가스 · 화학 · 금속가공 · 유리', supply: '현장 조건에 따른 맞춤 공급', source: '외부 조달' },
    co2: { name: '액화탄산', english: 'CARBON DIOXIDE', formula: 'CO₂', lead: '산업의 세정·냉각 공정에 활용되는 가스', description: '이산화탄소를 회수·정제해 액화한 제품입니다. 반도체 웨이퍼 세정과 정전기 제어, 금속 용접 등 다양한 공정에 사용됩니다.', industries: '반도체 · 금속가공 · 화학', supply: 'Bulk · 실제 공급 범위는 상담 시 확인', source: '공정 부산물 회수·정제' }
  };

  const dialogs = [...document.querySelectorAll('dialog')];
  let returnFocus = null;

  function openDialog(dialog, trigger) {
    const activeDialog = dialogs.find(item => item.open);
    if (activeDialog) activeDialog.close();
    returnFocus = trigger;
    document.body.classList.add('dialog-open');
    dialog.showModal();
  }

  dialogs.forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialogs.some(item => item.open)) return;
      document.body.classList.remove('dialog-open');
      if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    });
  });

  function showProduct(key, trigger) {
    const product = products[key];
    if (!product) return;
    document.querySelector('#modal-title').textContent = product.name;
    document.querySelector('#modal-en').textContent = product.english;
    document.querySelector('#modal-formula').textContent = product.formula;
    document.querySelector('#modal-lead').textContent = product.lead;
    document.querySelector('#modal-copy').textContent = product.description;
    document.querySelector('#modal-industries').textContent = product.industries;
    document.querySelector('#modal-supply').textContent = product.supply;
    document.querySelector('#modal-source').textContent = product.source;
    const image = document.querySelector('#modal-image');
    image.src = 'images/product-' + key + '-molecule.webp';
    image.alt = product.name + (key === 'ar' ? ' 단원자 3D 개념도' : ' 3D 분자 구조 개념도');
    document.querySelector('#modal-detail').href = 'business-products.html#' + key;
    const parentDialog = trigger.closest('dialog');
    const focusTarget = parentDialog ? (document.querySelector('[data-open="catalog"]') || trigger) : trigger;
    openDialog(document.querySelector('#product-modal'), focusTarget);
  }

  document.addEventListener('click', event => {
    const productTrigger = event.target.closest('[data-product]');
    if (productTrigger) {
      showProduct(productTrigger.dataset.product, productTrigger);
      return;
    }
    const openTrigger = event.target.closest('[data-open]');
    if (openTrigger) openDialog(document.getElementById(openTrigger.dataset.open), openTrigger);
    const closeTrigger = event.target.closest('[data-close]');
    if (closeTrigger) closeTrigger.closest('dialog').close();
  });

  const video = document.querySelector('#hero-video');
  const playButton = document.querySelector('#video-toggle');
  const videoStatus = document.querySelector('#video-status');
  const videoMessage = document.querySelector('#video-message');
  video.controls = false;
  let userPaused = false;
  let heroVisible = true;

  function updateVideoControl() {
    const paused = video.paused;
    playButton.setAttribute('aria-label', paused ? '메인 영상 재생' : '메인 영상 일시정지');
    playButton.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
  }

  function tryPlay() {
    if (userPaused || document.hidden || !heroVisible) return;
    video.play().catch(error => {
      updateVideoControl();
      if (error.name === 'NotAllowedError') {
        showVideoMessage('자동 재생이 제한되었습니다. ▶ 버튼을 눌러 재생해 주세요.');
      }
    });
  }

  function showVideoMessage(message) {
    videoMessage.textContent = message;
    videoStatus.hidden = false;
  }

  video.autoplay = true;
  video.defaultMuted = true;
  video.muted = true;
  video.addEventListener('play', updateVideoControl);
  video.addEventListener('pause', updateVideoControl);
  function showPoster() {
    video.hidden = true;
    showVideoMessage('영상을 불러오지 못했습니다. 영상 파일을 직접 열어 확인해 주세요.');
  }
  video.addEventListener('playing', () => {
    video.hidden = false;
    videoStatus.hidden = true;
  });
  video.addEventListener('stalled', () => {
    if (video.readyState < 2) showVideoMessage('영상을 불러오는 중입니다. 계속 멈춰 있으면 영상 파일을 직접 열어 주세요.');
  });
  const videoSources = [...video.querySelectorAll('source')];
  let fallbackAttempted = false;
  video.addEventListener('error', () => {
    const fallback = videoSources.find(source => source.type === 'video/webm');
    if (!fallbackAttempted && fallback && video.canPlayType(fallback.type)) {
      fallbackAttempted = true;
      video.src = fallback.src;
      video.load();
      tryPlay();
      return;
    }
    showPoster();
  });
  videoSources.forEach(source => {
    source.addEventListener('error', () => {
      source.dataset.failed = 'true';
      if (videoSources.every(item => item.dataset.failed)) showPoster();
    });
  });
  updateVideoControl();
  playButton.addEventListener('click', () => {
    if (video.hidden || video.error) {
      video.hidden = false;
      video.load();
      userPaused = false;
      tryPlay();
      return;
    }
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else tryPlay();
  });

  const scenes = {
    industry: { title: ['보이지 않는 가스로,', '산업의 가능성을 넓힙니다.'], eyebrow: 'GAS FOR INDUSTRY', copy: ['공기에서 시작해 고객의 공정까지.', '산업에 필요한 가스를 생산하고 공급합니다.'], link: '#industries', linkText: '우리의 사업 만나보기' },
    sustainability: { title: ['안전한 오늘을 지키고,', '지속가능한 내일을 잇습니다.'], eyebrow: 'GAS FOR TOMORROW', copy: ['환경과 사람을 생각하는 운영.', '산업의 성장을 더 오래, 더 건강하게.'], link: '#sustainability', linkText: '지속가능경영 만나보기' }
  };

  function setLines(element, lines) {
    // 리빌드: 제목은 줄 마스크 애니메이션으로 교체(home-motion.js)
    if (element.id === 'hero-title' && window.airplusSetLines) { window.airplusSetLines(element, lines); return; }
    element.replaceChildren(document.createTextNode(lines[0]), document.createElement('br'), document.createTextNode(lines[1]));
  }

  document.querySelectorAll('[data-scene]').forEach(button => {
    button.addEventListener('click', () => {
      const scene = scenes[button.dataset.scene];
      document.querySelectorAll('[data-scene]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      document.querySelector('.hero').dataset.mood = button.dataset.scene;
      setLines(document.querySelector('#hero-title'), scene.title);
      setLines(document.querySelector('#hero-copy'), scene.copy);
      document.querySelector('#hero-eyebrow').textContent = scene.eyebrow;
      const link = document.querySelector('#hero-link');
      link.href = scene.link;
      const arrow = link.querySelector('span');
      link.replaceChildren(document.createTextNode(scene.linkText + ' '), arrow);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else tryPlay();
  });
  const heroObserver = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible) tryPlay();
    else video.pause();
  }, { threshold: 0.05 });
  heroObserver.observe(document.querySelector('.hero'));
  updateVideoControl();
  tryPlay();


  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  document.documentElement.classList.add('js-ready');
})();
