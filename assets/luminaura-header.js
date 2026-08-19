const desktopMenuSelector = '.la-header__menu-item';

document.addEventListener('toggle', (event) => {
  const menu = event.target;
  if (!(menu instanceof HTMLDetailsElement) || !menu.matches(desktopMenuSelector) || !menu.open) return;

  document.querySelectorAll(desktopMenuSelector).forEach((otherMenu) => {
    if (otherMenu !== menu) otherMenu.open = false;
  });
}, true);

document.addEventListener('click', (event) => {
  if (event.target.closest(desktopMenuSelector)) return;
  document.querySelectorAll(desktopMenuSelector).forEach((menu) => {
    menu.open = false;
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll(desktopMenuSelector).forEach((menu) => {
    menu.open = false;
  });
});
