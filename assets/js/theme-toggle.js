// Theme detection and toggle functionality
(function() {
  'use strict';

  const THEME_KEY = 'theme-preference';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  // Get stored theme preference or system preference
  function getPreferredTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme) {
      return storedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }

    return THEME_LIGHT;
  }

  // Apply theme to document
  function applyTheme(theme) {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove('dark-mode', 'light-mode');

    // Add appropriate class
    if (theme === THEME_DARK) {
      root.classList.add('dark-mode');
    } else {
      root.classList.add('light-mode');
    }

    // Update toggle button appearance
    updateToggleButton(theme);
  }

  // Update toggle button icon
  function updateToggleButton(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    const icon = toggleButton.querySelector('.theme-toggle-icon');

    if (theme === THEME_DARK) {
      // Sun icon for switching to light mode
      icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      toggleButton.setAttribute('aria-label', 'Switch to light mode');
    } else {
      // Moon icon for switching to dark mode
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      toggleButton.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // Toggle theme
  function toggleTheme() {
    const currentTheme = getPreferredTheme();
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }

  // Initialize theme on page load
  function initTheme() {
    const theme = getPreferredTheme();
    applyTheme(theme);
  }

  // Listen for system preference changes (if user hasn't manually set preference)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
      }
    });
  }

  // Initialize immediately
  initTheme();

  // Set up toggle button after DOM loads
  document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);
    }
  });
})();
