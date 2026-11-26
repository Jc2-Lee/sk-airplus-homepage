(() => {
  'use strict';

  // Older ESG tabs allowed a category hash on any ESG page.
  const esgPage = document.querySelector('[data-esg-page]');
  if (esgPage) {
    function resolveCategoryLink() {
      const category = /^#(environment|social|governance)(?:-|$)/.exec(location.hash);
      if (category && category[1] !== esgPage.id) {
        location.replace('esg-' + category[1] + '.html' + location.hash);
      }
    }
    resolveCategoryLink();
    window.addEventListener('hashchange', resolveCategoryLink);
  }

  const header = document.querySelector('.global-header');
  const toggles = [...header.querySelectorAll('[data-navigation]')];
  let activeToggle = null;

  function closeNavigation(restoreFocus = false) {
    toggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      document.getElementById(toggle.dataset.navigation).hidden = true;
    });
    header.classList.remove('navigation-open');
    if (restoreFocus && activeToggle) activeToggle.focus();
    activeToggle = null;
  }

  function openNavigation(toggle) {
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    closeNavigation();
    if (wasOpen) return;
    document.querySelectorAll('.route-picker[open]').forEach(picker => { picker.open = false; });
    toggle.setAttribute('aria-expanded', 'true');
    document.getElementById(toggle.dataset.navigation).hidden = false;
    header.classList.add('navigation-open');
    activeToggle = toggle;
  }

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => openNavigation(toggle));
    toggle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (toggle.getAttribute('aria-expanded') !== 'true') openNavigation(toggle);
      document.getElementById(toggle.dataset.navigation).querySelector('a').focus();
    });
  });

  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeNavigation();
    if (event.target.closest('.navigation-panel a')) closeNavigation();
    document.querySelectorAll('.route-picker[open]').forEach(picker => {
      if (!picker.contains(event.target)) picker.open = false;
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeNavigation(true);
    document.querySelectorAll('.route-picker[open]').forEach(picker => {
      picker.open = false;
      picker.querySelector('summary').focus();
    });
  });

  document.querySelectorAll('.route-picker').forEach(picker => {
    picker.addEventListener('toggle', () => {
      if (picker.open) closeNavigation();
    });
  });

  if (header.classList.contains('is-home')) {
    function updateHeader() {
      header.classList.toggle('sticky', window.scrollY > 90);
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }
})();
