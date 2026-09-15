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

const TRASH_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6M14 11v6"/>
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>`;

const EMPTY_CART_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
  <line x1="3" y1="6" x2="21" y2="6"/>
  <path d="M16 10a4 4 0 0 1-8 0"/>
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
 * @param {HTMLElement} block
 * @returns {object}
 */
function readConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cols = row.querySelectorAll(':scope > div');
    if (cols.length < 2) return;
    const key = toCamelCase(cols[0].textContent.trim());
    const linkEl = cols[1].querySelector('a');
    const val = linkEl ? linkEl.href : cols[1].textContent.trim();
    if (key && val) config[key] = val;
  });
  return config;
}

/**
 * Build a single cart line-item element using pure DOM creation.
 * @param {{ sku, name, price, quantity, image }} item
 * @param {function} onUpdate  Called after qty/remove change
 * @returns {HTMLElement}
 */
function buildLineItem(item, onUpdate) {
  const row = document.createElement('div');
  row.classList.add('cart-line-item');
  row.dataset.sku = item.sku;

  // ── Image ──
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('cart-line-image');
  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.width = 96;
    img.height = 96;
    img.loading = 'lazy';
    imageWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.classList.add('cart-line-image-placeholder');
    imageWrapper.appendChild(placeholder);
  }
  row.appendChild(imageWrapper);

  // ── Details ──
  const details = document.createElement('div');
  details.classList.add('cart-line-details');

  const nameEl = document.createElement('p');
  nameEl.classList.add('cart-line-name');
  nameEl.textContent = item.name;
  details.appendChild(nameEl);

  const unitPrice = document.createElement('p');
  unitPrice.classList.add('cart-line-unit-price');
  unitPrice.textContent = formatPrice(item.price);
  details.appendChild(unitPrice);

  const skuEl = document.createElement('p');
  skuEl.classList.add('cart-line-sku');
  skuEl.textContent = `SKU: ${item.sku}`;
  details.appendChild(skuEl);

  row.appendChild(details);

  // ── Qty stepper ──
  const qtyWrapper = document.createElement('div');
  qtyWrapper.classList.add('cart-line-qty');

  const minusBtn = document.createElement('button');
  minusBtn.type = 'button';
  minusBtn.classList.add('cart-qty-btn', 'cart-qty-minus');
  minusBtn.setAttribute('aria-label', `Decrease quantity for ${item.name}`);
  minusBtn.textContent = '−';
  qtyWrapper.appendChild(minusBtn);

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.classList.add('cart-qty-input');
  qtyInput.value = String(item.quantity);
  qtyInput.min = '1';
  qtyInput.max = '99';
  qtyInput.setAttribute('aria-label', `Quantity for ${item.name}`);
  qtyWrapper.appendChild(qtyInput);

  const plusBtn = document.createElement('button');
  plusBtn.type = 'button';
  plusBtn.classList.add('cart-qty-btn', 'cart-qty-plus');
  plusBtn.setAttribute('aria-label', `Increase quantity for ${item.name}`);
  plusBtn.textContent = '+';
  qtyWrapper.appendChild(plusBtn);

  row.appendChild(qtyWrapper);

  // ── Line total ──
  const totalEl = document.createElement('p');
  totalEl.classList.add('cart-line-total');
  totalEl.textContent = formatPrice(item.price * item.quantity);
  row.appendChild(totalEl);

  // ── Remove button ──
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.classList.add('cart-line-remove');
  removeBtn.setAttribute('aria-label', `Remove ${item.name} from cart`);
  removeBtn.innerHTML = TRASH_ICON_SVG;
  row.appendChild(removeBtn);

  // ── Qty event handlers ──
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

  // ── Remove handler ──
  removeBtn.addEventListener('click', () => {
    row.classList.add('is-removing');
    row.addEventListener('transitionend', () => {
      removeItem(item.sku);
      onUpdate();
    }, { once: true });
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
 * Build the order summary sidebar using pure DOM creation.
 * @param {HTMLElement} container
 * @param {object} config
 */
function buildSummary(container, config) {
  const { subtotal, estimatedTotal } = getTotals();
  const summaryHeading = config.summaryHeading || 'Order Summary';
  const checkoutUrl = config.checkoutUrl || '/checkout';
  const checkoutLabel = config.checkoutLabel || 'Proceed to Checkout';
  const continueUrl = config.continueShoppingUrl || '/category/all';
  const continueLabel = config.continueLabel || 'Continue Shopping';

  // Inner wrapper
  const inner = document.createElement('div');
  inner.classList.add('cart-summary-inner');

  // Title
  const title = document.createElement('h2');
  title.classList.add('cart-summary-title');
  title.textContent = summaryHeading;
  inner.appendChild(title);

  // Rows
  const rows = document.createElement('div');
  rows.classList.add('cart-summary-rows');

  // Subtotal row
  const subtotalRow = document.createElement('div');
  subtotalRow.classList.add('cart-summary-row');
  const subtotalLabel = document.createElement('span');
  subtotalLabel.classList.add('cart-summary-label');
  subtotalLabel.textContent = 'Subtotal';
  const subtotalValue = document.createElement('span');
  subtotalValue.classList.add('cart-summary-value', 'cart-summary-subtotal');
  subtotalValue.textContent = formatPrice(subtotal);
  subtotalRow.appendChild(subtotalLabel);
  subtotalRow.appendChild(subtotalValue);
  rows.appendChild(subtotalRow);

  // Shipping row
  const shippingRow = document.createElement('div');
  shippingRow.classList.add('cart-summary-row');
  const shippingLabel = document.createElement('span');
  shippingLabel.classList.add('cart-summary-label');
  shippingLabel.textContent = 'Shipping';
  const shippingValue = document.createElement('span');
  shippingValue.classList.add('cart-summary-value', 'cart-summary-shipping');
  shippingValue.textContent = 'Calculated at checkout';
  shippingRow.appendChild(shippingLabel);
  shippingRow.appendChild(shippingValue);
  rows.appendChild(shippingRow);

  // Total row
  const totalRow = document.createElement('div');
  totalRow.classList.add('cart-summary-row', 'cart-summary-total-row');
  const totalLabel = document.createElement('span');
  totalLabel.classList.add('cart-summary-label');
  totalLabel.textContent = 'Estimated Total';
  const totalValue = document.createElement('span');
  totalValue.classList.add('cart-summary-value', 'cart-summary-estimated');
  totalValue.textContent = formatPrice(estimatedTotal);
  totalRow.appendChild(totalLabel);
  totalRow.appendChild(totalValue);
  rows.appendChild(totalRow);

  inner.appendChild(rows);

  // Actions
  const actions = document.createElement('div');
  actions.classList.add('cart-summary-actions');

  const checkoutLink = document.createElement('a');
  checkoutLink.href = checkoutUrl;
  checkoutLink.classList.add('button', 'accent', 'cart-checkout-btn');
  checkoutLink.textContent = checkoutLabel;
  actions.appendChild(checkoutLink);

  const continueLink = document.createElement('a');
  continueLink.href = continueUrl;
  continueLink.classList.add('button', 'secondary', 'cart-continue-btn');
  continueLink.textContent = continueLabel;
  actions.appendChild(continueLink);

  inner.appendChild(actions);
  container.appendChild(inner);
}

/**
 * Full render of the cart block using pure DOM creation.
 * @param {HTMLElement} block
 * @param {object} config
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

    // Icon wrapper (SVG is static/trusted icon — inner SVG only)
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('cart-empty-icon');
    iconWrapper.innerHTML = EMPTY_CART_ICON_SVG;
    emptyState.appendChild(iconWrapper);

    const emptyTitle = document.createElement('h2');
    emptyTitle.classList.add('cart-empty-title');
    emptyTitle.textContent = emptyMessage;
    emptyState.appendChild(emptyTitle);

    const emptyDesc = document.createElement('p');
    emptyDesc.classList.add('cart-empty-desc');
    emptyDesc.textContent = "Looks like you haven't added anything yet.";
    emptyState.appendChild(emptyDesc);

    const emptyLink = document.createElement('a');
    emptyLink.href = continueUrl;
    emptyLink.classList.add('button', 'accent');
    emptyLink.textContent = emptyCtaLabel;
    emptyState.appendChild(emptyLink);

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

  // Items header
  const itemsHeader = document.createElement('div');
  itemsHeader.classList.add('cart-items-header');

  const headingSpan = document.createElement('span');
  headingSpan.classList.add('cart-items-heading');
  headingSpan.textContent = cartHeading;
  itemsHeader.appendChild(headingSpan);

  const countSpan = document.createElement('span');
  countSpan.classList.add('cart-items-count');
  countSpan.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
  itemsHeader.appendChild(countSpan);

  itemsCol.appendChild(itemsHeader);

  // Column labels (desktop only — CSS hides on mobile)
  const colLabels = document.createElement('div');
  colLabels.classList.add('cart-col-labels');

  const productLabel = document.createElement('span');
  productLabel.textContent = 'Product';
  colLabels.appendChild(productLabel);

  const qtyLabel = document.createElement('span');
  qtyLabel.classList.add('cart-col-qty');
  qtyLabel.textContent = 'Quantity';
  colLabels.appendChild(qtyLabel);

  const totalLabel = document.createElement('span');
  totalLabel.classList.add('cart-col-total');
  totalLabel.textContent = 'Total';
  colLabels.appendChild(totalLabel);

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
 * 3. Renders the dynamic cart UI via pure createElement.
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
