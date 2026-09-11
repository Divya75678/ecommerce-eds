/**
 * Mini Cart Block
 *
 * Renders a compact cart icon with badge count in the header nav-tools area.
 * Clicking toggles a dropdown showing line items and a "View Cart" CTA.
 *
 * Usage: authored as a "Mini Cart" block in the nav document (nav-tools section).
 *
 * Rendered structure:
 *   .mini-cart
 *     button.mini-cart-trigger
 *       svg (bag icon)
 *       span.mini-cart-badge
 *     div.mini-cart-dropdown[aria-hidden]
 *       div.mini-cart-header
 *       ul.mini-cart-items
 *         li.mini-cart-item × N
 *       div.mini-cart-footer
 *         span.mini-cart-subtotal
 *         a.button.accent → /cart
 */

import { getItems, getTotals, formatPrice, subscribe } from '../../scripts/cart.js';

const BAG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
  <line x1="3" y1="6" x2="21" y2="6"/>
  <path d="M16 10a4 4 0 0 1-8 0"/>
</svg>`;

/**
 * Build an individual line-item element
 * @param {{ sku, name, price, quantity, image }} item
 * @returns {HTMLLIElement}
 */
function buildLineItem(item) {
  const li = document.createElement('li');
  li.classList.add('mini-cart-item');
  li.dataset.sku = item.sku;

  const lineTotal = formatPrice(item.price * item.quantity);

  li.innerHTML = `
    <div class="mini-cart-item-image">
      ${item.image
        ? `<img src="${item.image}" alt="${item.name}" width="56" height="56" loading="lazy">`
        : '<div class="mini-cart-item-placeholder"></div>'}
    </div>
    <div class="mini-cart-item-details">
      <span class="mini-cart-item-name">${item.name}</span>
      <span class="mini-cart-item-meta">Qty: ${item.quantity} · ${lineTotal}</span>
    </div>
  `;

  return li;
}

/**
 * Render the dropdown content from current cart state
 * @param {HTMLElement} dropdown
 * @param {HTMLElement} badge
 */
function renderCart(dropdown, badge) {
  const items = getItems();
  const { subtotal, itemCount } = getTotals();

  // Update badge
  badge.textContent = itemCount > 0 ? String(itemCount > 99 ? '99+' : itemCount) : '';
  badge.hidden = itemCount === 0;

  // Rebuild items list
  const itemsList = dropdown.querySelector('.mini-cart-items');
  itemsList.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.classList.add('mini-cart-empty');
    empty.textContent = 'Your cart is empty.';
    itemsList.appendChild(empty);
  } else {
    items.forEach((item) => itemsList.appendChild(buildLineItem(item)));
  }

  // Update subtotal
  const subtotalEl = dropdown.querySelector('.mini-cart-subtotal-value');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  // Show/hide view-cart button
  const viewCartBtn = dropdown.querySelector('.mini-cart-view-cart');
  if (viewCartBtn) viewCartBtn.style.display = items.length === 0 ? 'none' : '';
}

export default function decorate(block) {
  // Clear authored content (block may have no rows — purely programmatic)
  block.innerHTML = '';
  block.classList.add('mini-cart');

  // ── Trigger button ──
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.classList.add('mini-cart-trigger');
  trigger.setAttribute('aria-label', 'Open cart');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'mini-cart-dropdown');

  const badge = document.createElement('span');
  badge.classList.add('mini-cart-badge');
  badge.setAttribute('aria-hidden', 'true');
  badge.hidden = true;

  trigger.innerHTML = BAG_ICON;
  trigger.appendChild(badge);

  // ── Dropdown ──
  const dropdown = document.createElement('div');
  dropdown.id = 'mini-cart-dropdown';
  dropdown.classList.add('mini-cart-dropdown');
  dropdown.setAttribute('aria-hidden', 'true');

  dropdown.innerHTML = `
    <div class="mini-cart-header">
      <span class="mini-cart-title">Cart</span>
    </div>
    <ul class="mini-cart-items" aria-label="Cart items"></ul>
    <div class="mini-cart-footer">
      <div class="mini-cart-subtotal">
        <span class="mini-cart-subtotal-label">Subtotal</span>
        <span class="mini-cart-subtotal-value">${formatPrice(0)}</span>
      </div>
      <a href="/cart" class="button accent mini-cart-view-cart" style="display:none">View Cart</a>
    </div>
  `;

  block.appendChild(trigger);
  block.appendChild(dropdown);

  // ── Initial render ──
  renderCart(dropdown, badge);

  // ── Subscribe to cart changes ──
  subscribe(() => renderCart(dropdown, badge));

  // ── Toggle dropdown on trigger click ──
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      dropdown.classList.remove('is-open');
    } else {
      renderCart(dropdown, badge); // refresh before opening
      trigger.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');
      dropdown.classList.add('is-open');
    }
  });

  // ── Close when clicking outside ──
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      dropdown.classList.remove('is-open');
    }
  });

  // ── Close on Escape ──
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && dropdown.classList.contains('is-open')) {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      dropdown.classList.remove('is-open');
      trigger.focus();
    }
  });

  // ── Clicking "View Cart" link closes dropdown ──
  dropdown.querySelector('.mini-cart-view-cart')?.addEventListener('click', () => {
    dropdown.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');
  });
}
