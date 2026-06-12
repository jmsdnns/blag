// Theme toggle. The inline script in <head> sets the initial dark-mode/light-mode
// class before paint; the html class is the source of truth from then on.
(function() {
  'use strict';

  const THEME_KEY = 'theme-preference';

  function currentTheme() {
    return document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove('dark-mode', 'light-mode');
    root.classList.add(theme + '-mode');
    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    const icon = toggleButton.querySelector('.theme-toggle-icon');

    if (theme === 'dark') {
      // Sun icon for switching to light mode
      icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      toggleButton.setAttribute('aria-label', 'Switch to light mode');
    } else {
      // Moon icon for switching to dark mode
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      toggleButton.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // Follow system preference changes unless the user has chosen a theme
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    updateToggleButton(currentTheme());

    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', function() {
        const newTheme = currentTheme() === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
      });
    }
  });
})();
