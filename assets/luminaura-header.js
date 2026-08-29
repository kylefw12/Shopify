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

const cartCountSelector = '[data-luminaura-cart-count]';
const cartLinkSelector = '[data-luminaura-cart-link]';

function updateCartCount(itemCount) {
  const count = Number(itemCount) || 0;

  document.querySelectorAll(cartCountSelector).forEach((countElement) => {
    countElement.textContent = ` (${count})`;
    countElement.hidden = count === 0;
  });

  document.querySelectorAll(cartLinkSelector).forEach((cartLink) => {
    cartLink.setAttribute('aria-label', count > 0 ? `Carrito, ${count} artículos` : 'Carrito');
  });
}

async function refreshCartCount() {
  try {
    const root = window.Shopify?.routes?.root || '/';
    const response = await fetch(`${root}cart.js`, { credentials: 'same-origin' });
    if (!response.ok) return;

    const cart = await response.json();
    updateCartCount(cart.item_count);
  } catch (error) {
    // Keep the existing count visible if the cart request is unavailable.
  }
}

// The theme dispatches this event for product forms, quick add, cart changes, and the bundle builder.
document.addEventListener('cart:update', refreshCartCount);
window.addEventListener('pageshow', refreshCartCount);
