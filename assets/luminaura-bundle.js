import { CartAddEvent } from '@theme/events';

const bundleKey = 'luminaura_bundle_items';
const maxBundleItems = 3;

function getItems() { try { return JSON.parse(localStorage.getItem(bundleKey)) || []; } catch { return []; } }
function setItems(items) { localStorage.setItem(bundleKey, JSON.stringify(items.slice(0, maxBundleItems))); }
function getStoreUrl(path) {
  const root = window.Shopify?.routes?.root || '/';
  return `${root.endsWith('/') ? root : `${root}/`}${path}`;
}
function setFeedback(message = '', isError = false) {
  document.querySelectorAll('[data-luminaura-bundle-feedback]').forEach((node) => {
    node.textContent = message;
    node.hidden = !message;
    node.classList.toggle('is-error', isError);
  });
}
function updateUI() {
  const items = getItems(); const count = items.length;
  document.querySelectorAll('[data-luminaura-step]').forEach((step, index) => step.classList.toggle('is-active', index < count));
  document.querySelectorAll('[data-luminaura-bundle-status]').forEach((node) => node.textContent = count === 3 ? '3 of 3 selected — ready for your discount.' : `${count} of 3 selected`);
  document.querySelectorAll('[data-luminaura-bundle-helper]').forEach((node) => node.textContent = count === 3 ? 'Your set is ready. Add all three pieces to your bag together.' : `Choose ${3 - count} more eligible piece${3 - count === 1 ? '' : 's'}.`);
  document.querySelectorAll('[data-luminaura-bundle-submit]').forEach((button) => { button.disabled = count !== 3; });
  document.querySelectorAll('[data-luminaura-add-bundle-item]').forEach((button) => {
    if (button.disabled) return;
    const offer = button.closest('[data-luminaura-product-offer]');
    const isSelected = items.some((item) => String(item.variantId) === String(offer?.dataset.variantId));
    button.textContent = isSelected ? 'Selected for my bundle' : 'Add to my bundle';
    button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });
}
function toggleItem(offer) {
  if (!offer?.dataset.variantId) return;
  const item = { variantId: offer.dataset.variantId, title: offer.dataset.productTitle || 'Bundle item' };
  let items = getItems(); const match = items.findIndex((current) => String(current.variantId) === String(item.variantId));
  if (match >= 0) items.splice(match, 1); else if (items.length < maxBundleItems) items.push(item); else { offer.querySelector('[data-luminaura-add-bundle-item]')?.focus(); return; }
  setItems(items); setFeedback(); updateUI();
}
function updateProductOfferVariant(event) {
  const variantId = event.detail?.resource?.id;
  const productId = event.detail?.data?.productId;
  if (!variantId || !productId) return;
  document.querySelectorAll('[data-luminaura-product-offer]').forEach((offer) => {
    if (String(offer.dataset.productId) === String(productId)) offer.dataset.variantId = String(variantId);
  });
  updateUI();
}
async function addBundleToCart(button) {
  const items = getItems(); if (items.length !== maxBundleItems) return;
  const bundleId = `bundle-${Date.now()}`;
  button.setAttribute('aria-busy', 'true');
  button.disabled = true;
  button.textContent = 'Adding to bag…';
  setFeedback();
  try {
    const response = await fetch(getStoreUrl('cart/add.js'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        items: items.map((item, index) => ({
          id: String(item.variantId),
          quantity: 1,
          properties: {
            _luminaura_bundle: '3-for-2',
            _luminaura_bundle_id: bundleId,
            'Bundle position': `${index + 1} of 3`,
            Offer: 'Choose any 3, pay for 2',
          },
        })),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.description || result.message || 'One of those pieces is no longer available. Please choose another item.');

    const cartResponse = await fetch(getStoreUrl('cart.js'));
    const cart = cartResponse.ok ? await cartResponse.json() : null;
    setItems([]);
    updateUI();
    button.textContent = 'Added to bag';
    setFeedback('Your three pieces are in your bag. Your 3-for-2 offer will be applied at checkout.');
    document.dispatchEvent(new CartAddEvent(cart, 'luminaura-bundle-builder', {
      source: 'luminaura-bundle-builder',
      itemCount: cart?.item_count,
      variantId: String(items[0].variantId),
    }));
  } catch (error) {
    button.textContent = 'Try again';
    setFeedback(error instanceof Error ? error.message : 'We could not add your bundle. Please try again.', true);
  } finally {
    button.removeAttribute('aria-busy');
    button.disabled = getItems().length !== maxBundleItems;
  }
}
document.addEventListener('click', (event) => { const itemButton = event.target.closest('[data-luminaura-add-bundle-item]'); if (itemButton) toggleItem(itemButton.closest('[data-luminaura-product-offer]')); const submit = event.target.closest('[data-luminaura-bundle-submit]'); if (submit) addBundleToCart(submit); });
document.addEventListener('variant:update', updateProductOfferVariant);
document.addEventListener('DOMContentLoaded', updateUI); document.addEventListener('shopify:section:load', updateUI);
