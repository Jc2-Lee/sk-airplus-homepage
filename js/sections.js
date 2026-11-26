(() => {
  'use strict';

  document.querySelectorAll('[data-section-tabs]').forEach(group => {
    const tabs = [...group.querySelectorAll('[data-section-tab]')];
    const defaultTab = tabs.find(tab => tab.getAttribute('aria-controls') === group.dataset.defaultTab) || tabs[0];

    function selectTab(tab, updateAddress = false) {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        panel.hidden = !selected;
      });
      if (updateAddress) {
        history.pushState(null, '', '#' + tab.getAttribute('aria-controls'));
      }
    }

    function selectFromAddress() {
      const anchor = location.hash.slice(1);
      const defaultPanel = document.getElementById(defaultTab.getAttribute('aria-controls'));
      const legacyTarget = [...defaultPanel.querySelectorAll('[data-original-anchor]')]
        .find(element => element.dataset.originalAnchor === anchor);
      const target = document.getElementById(anchor) || legacyTarget;
      const matchingTab = tabs.find(tab => {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        return panel === target || panel.contains(target);
      });
      selectTab(matchingTab || defaultTab);
      if (legacyTarget && target === legacyTarget) {
        legacyTarget.scrollIntoView();
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab, true));
      tab.addEventListener('keydown', event => {
        let nextIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex === undefined) return;
        event.preventDefault();
        selectTab(tabs[nextIndex], true);
        tabs[nextIndex].focus();
      });
    });

    window.addEventListener('hashchange', selectFromAddress);
    window.addEventListener('popstate', selectFromAddress);
    selectFromAddress();
  });
})();
