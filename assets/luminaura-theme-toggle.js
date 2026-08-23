const storageKey = 'luminaura-theme';
const darkTheme = 'dark';

function setTheme(theme) {
  const isDark = theme === darkTheme;
  document.documentElement.dataset.luminauraTheme = isDark ? darkTheme : 'light';

  document.querySelectorAll('[data-luminaura-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

    const label = button.querySelector('[data-theme-toggle-label]');
    if (label) label.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  });
}

function getSavedTheme() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

setTheme(getSavedTheme() === darkTheme ? darkTheme : 'light');

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest('[data-luminaura-theme-toggle]');
  if (!button) return;

  const nextTheme = document.documentElement.dataset.luminauraTheme === darkTheme ? 'light' : darkTheme;

  try {
    window.localStorage.setItem(storageKey, nextTheme);
  } catch {
    // The preference still works for this visit if storage is unavailable.
  }

  setTheme(nextTheme);
});
