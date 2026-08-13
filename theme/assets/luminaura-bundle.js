const bundleKey = 'luminaura_bundle_items';
const maxBundleItems = 3;

function getBundleItems() {
  try {
    return JSON.parse(localStorage.getItem(bundleKey)) || [];
  } catch {
    return [];
  }
}

function setBundleItems(items) {
  localStorage.setItem(bundleKey, JSON.stringify(items.slice(0, maxBundleItems)));
}

function renderBundleState() {
  const items = getBundleItems();
  const count = Math.min(items.length, maxBundleItems);

  document.querySelectorAll('[data-luminaura-step]').forEach((step, index) => {
    step.classList.toggle('is-active', index < count);
  });

  document.querySelectorAll('[data-luminaura-bundle-status]').forEach((status) => {
    status.textContent = count >= maxBundleItems ? 'Your free piece is unlocked.' : `${count} of 3 selected`;
  });

  document.querySelectorAll('[data-luminaura-bundle-helper]').forEach((helper) => {
    const remaining = Math.max(maxBundleItems - count, 0);
    helper.textContent = remaining === 0 ? 'Add your bundle to cart or continue browsing.' : `Choose ${remaining} more eligible piece${remaining === 1 ? '' : 's'}.`;
  });
}

async function addBundleItem(button) {
  const offer = button.closest('[data-luminaura-product-offer]');
  const variantId = offer?.dataset.variantId;

  if (!variantId) return;

  button.setAttribute('aria-busy', 'true');

  const items = getBundleItems().filter((item) => item.variantId !== variantId);
  items.push({
    variantId,
    title: offer.dataset.productTitle || 'Bundle item',
  });
  setBundleItems(items);
  renderBundleState();

  await fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      id: Number(variantId),
      quantity: 1,
      properties: {
        _luminaura_bundle: '3-for-2',
        'Purchase option': 'Build Your Bundle - Buy 2, Get 1 Free',
      },
    }),
  });

  button.removeAttribute('aria-busy');
  button.textContent = 'Added to Bundle';
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-luminaura-add-bundle-item]');
  if (button) {
    addBundleItem(button);
  }
});

renderBundleState();
