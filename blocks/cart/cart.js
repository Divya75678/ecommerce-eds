/**
 * Cart Block
 *
 * Full-page cart rendered at /cart.
 * Reads configuration from authored block table rows (key | value pairs).
 * Reads cart state from scripts/cart.js (localStorage-backed).
 *
 * Authored block table structure (in cart.html):
 * ─────────────────────────────────────────────
 * | Cart                      |                   |
 * | Continue Shopping URL     | /category/all     |
 * | Checkout URL              | /checkout         |
 * | Empty State Message       | Your cart is empty|
 * | Empty State CTA Label     | Start Shopping    |
 * | Cart Heading              | Shopping Cart     |
 * | Summary Heading           | Order Summary     |
 * | Checkout Label            | Proceed to Checkout|
 * | Continue Label            | Continue Shopping |
 * ─────────────────────────────────────────────
 *
 * Rendered structure:
 *   .cart
 *     .cart-empty          (shown when no items)
 *     .cart-content        (shown when items exist)
 *       .cart-items
 *         .cart-items-header
 *         .cart-col-labels  (desktop)
 *         .cart-line-item × N
 *       .cart-summary
 *         .cart-summary-inner
 *           .cart-summary-rows
 *           .cart-summary-actions
 */

import {
  getItems,
  getTotals,
  removeItem,
  updateQty,
  formatPrice,
  subscribe,
} from '../../scripts/cart.js';

const TRASH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6M14 11v6"/>
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>`;

/**
 * Convert a key string to camelCase (mirrors EDS readBlockConfig convention)
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Parse authored key|value rows from the block element into a config object.
 * Rows look like: <div><div>Key Label</div><div>value text or link</div></div>
 * @param {HTMLElement} block
 * @returns {object}
 */
function readConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cols = row.querySelectorAll(':scope > div');
    if (cols.length < 2) return;
    const key = toCamelCase(cols[0].textContent.trim());
    // Value: prefer href of a link, else text content
    const linkEl = cols[1].querySelector('a');
    const val = linkEl ? linkEl.href : cols[1].textContent.trim();
    if (key && val) config[key] = val;
  });
  return config;
}

/**
 * Build a single cart line-item element
 * @param {{ sku, name, price, quantity, image }} item
 * @param {function} onUpdate  Called after qty/remove change
 * @returns {HTMLElement}
 */
function buildLineItem(item, onUpdate) {
  const row = document.createElement('div');
  row.classList.add('cart-line-item');
  row.dataset.sku = item.sku;

  const lineTotal = item.price * item.quantity;

  row.innerHTML = `
    <div class="cart-line-image">
      ${item.image
    ? `<img src="${item.image}" alt="${item.name}" width="96" height="96" loading="lazy">`
    : '<div class="cart-line-image-placeholder"></div>'}
    </div>
    <div class="cart-line-details">
      <p class="cart-line-name">${item.name}</p>
      <p class="cart-line-unit-price">${formatPrice(item.price)}</p>
      <p class="cart-line-sku">SKU: ${item.sku}</p>
    </div>
    <div class="cart-line-qty">
      <button type="button" class="cart-qty-btn cart-qty-minus"
        aria-label="Decrease quantity for ${item.name}">−</button>
      <input
        type="number"
        class="cart-qty-input"
        value="${item.quantity}"
        min="1"
        max="99"
        aria-label="Quantity for ${item.name}"
      >
      <button type="button" class="cart-qty-btn cart-qty-plus"
        aria-label="Increase quantity for ${item.name}">+</button>
    </div>
    <p class="cart-line-total">${formatPrice(lineTotal)}</p>
    <button type="button" class="cart-line-remove"
      aria-label="Remove ${item.name} from cart">
      ${TRASH_ICON}
    </button>
  `;

  // ── Qty controls ──
  const qtyInput = row.querySelector('.cart-qty-input');
  const minusBtn = row.querySelector('.cart-qty-minus');
  const plusBtn = row.querySelector('.cart-qty-plus');
  const totalEl = row.querySelector('.cart-line-total');

  function applyQty(newQty) {
    const clamped = Math.max(1, Math.min(99, newQty));
    qtyInput.value = clamped;
    updateQty(item.sku, clamped);
    totalEl.textContent = formatPrice(item.price * clamped);
    onUpdate();
  }

  minusBtn.addEventListener('click', () => {
    const val = parseInt(qtyInput.value, 10);
    if (val <= 1) {
      removeItem(item.sku);
      onUpdate();
    } else {
      applyQty(val - 1);
    }
  });

  plusBtn.addEventListener('click', () => {
    applyQty(parseInt(qtyInput.value, 10) + 1);
  });

  qtyInput.addEventListener('change', () => {
    const val = parseInt(qtyInput.value, 10);
    if (!val || val < 1) {
      removeItem(item.sku);
      onUpdate();
    } else {
      applyQty(val);
    }
  });

  // ── Remove button ──
  row.querySelector('.cart-line-remove').addEventListener('click', () => {
    row.classList.add('is-removing');
    row.addEventListener('transitionend', () => {
      removeItem(item.sku);
      onUpdate();
    }, { once: true });
    // Fallback if no transition fires
    setTimeout(() => {
      if (row.isConnected) {
        removeItem(item.sku);
        onUpdate();
      }
    }, 350);
  });

  return row;
}

/**
 * Build the order summary sidebar
 * @param {HTMLElement} container
 * @param {object} config  Authored config values
 */
function buildSummary(container, config) {
  const { subtotal, estimatedTotal } = getTotals();
  const summaryHeading = config.summaryHeading || 'Order Summary';
  const checkoutUrl = config.checkoutUrl || '/checkout';
  const checkoutLabel = config.checkoutLabel || 'Proceed to Checkout';
  const continueUrl = config.continueShoppingUrl || '/category/all';
  const continueLabel = config.continueLabel || 'Continue Shopping';

  container.innerHTML = `
    <div class="cart-summary-inner">
      <h2 class="cart-summary-title">${summaryHeading}</h2>
      <div class="cart-summary-rows">
        <div class="cart-summary-row">
          <span class="cart-summary-label">Subtotal</span>
          <span class="cart-summary-value cart-summary-subtotal">${formatPrice(subtotal)}</span>
        </div>
        <div class="cart-summary-row">
          <span class="cart-summary-label">Shipping</span>
          <span class="cart-summary-value cart-summary-shipping">Calculated at checkout</span>
        </div>
        <div class="cart-summary-row cart-summary-total-row">
          <span class="cart-summary-label">Estimated Total</span>
          <span class="cart-summary-value cart-summary-estimated">${formatPrice(estimatedTotal)}</span>
        </div>
      </div>
      <div class="cart-summary-actions">
        <a href="${checkoutUrl}" class="button accent cart-checkout-btn">${checkoutLabel}</a>
        <a href="${continueUrl}" class="button secondary cart-continue-btn">${continueLabel}</a>
      </div>
    </div>
  `;
}

/**
 * Full render of the cart block
 * @param {HTMLElement} block
 * @param {object} config  Authored config values
 */
function render(block, config) {
  const items = getItems();
  block.innerHTML = '';

  if (items.length === 0) {
    // ── Empty state ──
    const emptyMessage = config.emptyStateMessage || 'Your cart is empty';
    const emptyCtaLabel = config.emptyStateCtaLabel || 'Start Shopping';
    const continueUrl = config.continueShoppingUrl || '/category/all';

    const emptyState = document.createElement('div');
    emptyState.classList.add('cart-empty');
    emptyState.innerHTML = `
      <div class="cart-empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <h2 class="cart-empty-title">${emptyMessage}</h2>
      <p class="cart-empty-desc">Looks like you haven't added anything yet.</p>
      <a href="${continueUrl}" class="button accent">${emptyCtaLabel}</a>
    `;
    block.appendChild(emptyState);
    return;
  }

  // ── Cart content (items + summary) ──
  const content = document.createElement('div');
  content.classList.add('cart-content');

  // Items column
  const itemsCol = document.createElement('div');
  itemsCol.classList.add('cart-items');

  const cartHeading = config.cartHeading || 'Shopping Cart';
  const itemsHeader = document.createElement('div');
  itemsHeader.classList.add('cart-items-header');
  itemsHeader.innerHTML = `
    <span class="cart-items-heading">${cartHeading}</span>
    <span class="cart-items-count">${items.length} item${items.length !== 1 ? 's' : ''}</span>
  `;
  itemsCol.appendChild(itemsHeader);

  // Column labels (desktop only — CSS hides on mobile)
  const colLabels = document.createElement('div');
  colLabels.classList.add('cart-col-labels');
  colLabels.innerHTML = `
    <span>Product</span>
    <span class="cart-col-qty">Quantity</span>
    <span class="cart-col-total">Total</span>
  `;
  itemsCol.appendChild(colLabels);

  // Line items
  const onUpdate = () => render(block, config);
  items.forEach((item) => {
    itemsCol.appendChild(buildLineItem(item, onUpdate));
  });

  // Summary column
  const summaryCol = document.createElement('div');
  summaryCol.classList.add('cart-summary');
  buildSummary(summaryCol, config);

  content.appendChild(itemsCol);
  content.appendChild(summaryCol);
  block.appendChild(content);
}

/**
 * Decorate the cart block.
 * 1. Reads authored config from the block's table rows.
 * 2. Clears the block (removes the authored table markup).
 * 3. Renders the dynamic cart UI.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  // ── Step 1: Read authored configuration ──
  const config = readConfig(block);

  // ── Step 2: Clear the authored table markup ──
  block.innerHTML = '';

  // ── Step 3: Render dynamic cart UI ──
  render(block, config);

  // Re-render on cart changes (e.g. items added from PDP or mini-cart)
  subscribe(() => render(block, config));

  // Also sync across browser tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'eds-cart') render(block, config);
  });
}
