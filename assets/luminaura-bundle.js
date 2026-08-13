const bundleKey = 'luminaura_bundle_items';
const maxBundleItems = 3;

function getItems() { try { return JSON.parse(localStorage.getItem(bundleKey)) || []; } catch { return []; } }
function setItems(items) { localStorage.setItem(bundleKey, JSON.stringify(items.slice(0, maxBundleItems))); }
function updateUI() {
  const items = getItems(); const count = items.length;
  document.querySelectorAll('[data-luminaura-step]').forEach((step, index) => step.classList.toggle('is-active', index < count));
  document.querySelectorAll('[data-luminaura-bundle-status]').forEach((node) => node.textContent = count === 3 ? '3 of 3 selected — ready for your discount.' : `${count} of 3 selected`);
  document.querySelectorAll('[data-luminaura-bundle-helper]').forEach((node) => node.textContent = count === 3 ? 'Your set is ready. Add all three pieces to your bag together.' : `Choose ${3 - count} more eligible piece${3 - count === 1 ? '' : 's'}.`);
  document.querySelectorAll('[data-luminaura-bundle-submit]').forEach((button) => { button.disabled = count !== 3; });
  document.querySelectorAll('[data-luminaura-add-bundle-item]').forEach((button) => { const offer = button.closest('[data-luminaura-product-offer]'); const isSelected = items.some((item) => String(item.variantId) === String(offer?.dataset.variantId)); button.textContent = isSelected ? 'Selected for my bundle' : 'Add to my bundle'; button.setAttribute('aria-pressed', isSelected ? 'true' : 'false'); });
}
function toggleItem(offer) {
  if (!offer?.dataset.variantId) return;
  const item = { variantId: offer.dataset.variantId, title: offer.dataset.productTitle || 'Bundle item' };
  let items = getItems(); const match = items.findIndex((current) => String(current.variantId) === String(item.variantId));
  if (match >= 0) items.splice(match, 1); else if (items.length < maxBundleItems) items.push(item); else { offer.querySelector('[data-luminaura-add-bundle-item]')?.focus(); return; }
  setItems(items); updateUI();
}
async function addBundleToCart(button) {
  const items = getItems(); if (items.length !== maxBundleItems) return;
  const bundleId = `bundle-${Date.now()}`;
  button.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: items.map((item, index) => ({ id: Number(item.variantId), quantity: 1, properties: { _luminaura_bundle: '3-for-2', _luminaura_bundle_id: bundleId, 'Bundle position': `${index + 1} of 3`, 'Offer': 'Choose any 3, pay for 2' } })) }) });
    if (!response.ok) throw new Error('Unable to add bundle');
    setItems([]); updateUI(); button.textContent = 'Added to bag'; window.dispatchEvent(new CustomEvent('cart:refresh'));
  } catch { button.textContent = 'Try again'; } finally { button.removeAttribute('aria-busy'); }
}
document.addEventListener('click', (event) => { const itemButton = event.target.closest('[data-luminaura-add-bundle-item]'); if (itemButton) toggleItem(itemButton.closest('[data-luminaura-product-offer]')); const submit = event.target.closest('[data-luminaura-bundle-submit]'); if (submit) addBundleToCart(submit); });
document.addEventListener('DOMContentLoaded', updateUI); document.addEventListener('shopify:section:load', updateUI);
