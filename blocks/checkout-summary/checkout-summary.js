/**
 * Checkout Summary Block
 *
 * Read-only order review page rendered at /checkout.
 * Reads configuration from authored block table rows (key | value pairs).
 * Reads cart state from scripts/cart.js (localStorage-backed).
 *
 * Authored block table structure (in checkout.html):
 * ──────────────────────────────────────────────────────────
 * | Checkout Summary      |                                 |
 * | Order Heading         | Review Your Order               |
 * | Summary Heading       | Order Total                     |
 * | Shipping Label        | Free                            |
 * | Next Steps Heading    | What happens next?              |
 * | Next Steps Text       | You'll receive a confirmation…  |
 * | Continue Shopping URL | /category/all                   |
 * ──────────────────────────────────────────────────────────
 *
 * Rendered structure:
 *   .checkout-summary
 *     .checkout-summary-empty      (shown when cart is empty)
 *     .checkout-summary-content    (shown when items exist)
 *       .checkout-items-col
 *         .checkout-items-header
 *         .cart-col-labels          (desktop — reuses cart CSS)
 *         .cart-line-item × N       (read-only; qty/remove hidden via CSS)
 *       .checkout-sidebar
 *         .checkout-totals
 *           .cart-summary-inner     (reuses cart summary CSS)
 *         .checkout-next-steps
 */

import {
  getItems,
  getTotals,
  formatPrice,
  subscribe,
  clearCart,
} from '../../scripts/cart.js';

import {
  generateOrderId,
  saveOrder,
} from '../../scripts/orders.js';

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
 * Build a single read-only line-item element (no qty stepper, no remove button).
 * Reuses `.cart-line-item` class names so cart CSS applies automatically.
 * @param {{ sku, name, price, quantity, image }} item
 * @returns {HTMLElement}
 */
function buildReadOnlyLineItem(item) {
  const row = document.createElement('div');
  row.classList.add('cart-line-item', 'checkout-line-item');
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
      <p class="cart-line-qty-label">Qty: <strong>${item.quantity}</strong></p>
    </div>
    <p class="cart-line-total">${formatPrice(lineTotal)}</p>
  `;

  return row;
}

/**
 * Build the order totals sidebar panel.
 * Reuses `.cart-summary-*` class names so cart CSS applies automatically.
 * @param {object} config
 * @returns {HTMLElement}
 */
function buildTotals(config) {
  const { subtotal, estimatedTotal } = getTotals();
  const summaryHeading = config.summaryHeading || 'Order Total';
  const shippingLabel = config.shippingLabel || 'Free';
  const placeOrderLabel = config.placeOrderLabel || 'Place Order';

  const shipping = shippingLabel.toLowerCase() === 'free' ? 0 : null;
  const grandTotal = shipping !== null ? subtotal + shipping : estimatedTotal;

  const wrapper = document.createElement('div');
  wrapper.classList.add('checkout-totals');

  wrapper.innerHTML = `
    <div class="cart-summary-inner">
      <h2 class="cart-summary-title">${summaryHeading}</h2>
      <div class="cart-summary-rows">
        <div class="cart-summary-row">
          <span class="cart-summary-label">Subtotal</span>
          <span class="cart-summary-value checkout-subtotal">${formatPrice(subtotal)}</span>
        </div>
        <div class="cart-summary-row">
          <span class="cart-summary-label">Shipping</span>
          <span class="cart-summary-value checkout-shipping">
            ${shippingLabel.toLowerCase() === 'free'
    ? '<span class="checkout-shipping-free">Free</span>'
    : `<span class="cart-summary-shipping">${shippingLabel}</span>`}
          </span>
        </div>
        <div class="cart-summary-row cart-summary-total-row">
          <span class="cart-summary-label">Total</span>
          <span class="cart-summary-value cart-summary-estimated checkout-grand-total">${formatPrice(grandTotal)}</span>
        </div>
      </div>
      <div class="checkout-order-actions">
        <button type="button" class="button checkout-place-order-btn">
          ${placeOrderLabel}
        </button>
      </div>
    </div>
  `;

  // ── Place Order click handler ──
  const placeOrderBtn = wrapper.querySelector('.checkout-place-order-btn');
  placeOrderBtn.addEventListener('click', () => {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing order\u2026';

    const items = getItems();
    const totals = getTotals();

    // 1. Generate mock order ID
    const orderId = generateOrderId();

    // 2. Persist order to localStorage orders store
    saveOrder({
      orderId,
      date: new Date().toISOString(),
      items,
      totals,
      status: 'confirmed',
    });

    // 3. Dispatch event for any external integrations
    window.dispatchEvent(new CustomEvent('checkout:place-order', {
      detail: { orderId, items, totals },
      bubbles: true,
    }));

    // 4. Clear the cart
    clearCart();

    // 5. Redirect to confirmation view
    window.location.href = `/eds-ecommerce/pages/checkout?status=confirmed&orderId=${encodeURIComponent(orderId)}`;
  });

  return wrapper;
}

/**
 * Build the "Next Steps" info callout panel.
 * @param {object} config
 * @returns {HTMLElement}
 */
function buildNextSteps(config) {
  const heading = config.nextStepsHeading || 'What happens next?';
  const text = config.nextStepsText
    || "You'll receive a confirmation email shortly. Our team will process your order within 1–2 business days.";

  const panel = document.createElement('div');
  panel.classList.add('checkout-next-steps');

  panel.innerHTML = `
    <div class="checkout-next-steps-icon" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <div class="checkout-next-steps-body">
      <h3 class="checkout-next-steps-heading">${heading}</h3>
      <p class="checkout-next-steps-text">${text}</p>
    </div>
  `;

  return panel;
}

/**
 * Refresh totals in place (without full re-render) when cart changes.
 * @param {HTMLElement} block
 */
function refreshTotals(block) {
  const { subtotal, estimatedTotal } = getTotals();
  const shippingFree = block.querySelector('.checkout-shipping-free');
  const shipping = shippingFree !== null ? 0 : null;
  const grandTotal = shipping !== null ? subtotal + shipping : estimatedTotal;

  const subtotalEl = block.querySelector('.checkout-subtotal');
  const grandTotalEl = block.querySelector('.checkout-grand-total');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(grandTotal);
}

/**
 * Full render of the checkout-summary block.
 * @param {HTMLElement} block
 * @param {object} config
 */
function render(block, config) {
  const items = getItems();
  block.innerHTML = '';

  // ── Empty state ──
  if (items.length === 0) {
    const continueUrl = config.continueShoppingUrl || '/category/all';

    const emptyState = document.createElement('div');
    emptyState.classList.add('checkout-summary-empty');
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
      <h2 class="cart-empty-title">Your cart is empty</h2>
      <p class="cart-empty-desc">Add items to your cart before checking out.</p>
      <a href="${continueUrl}" class="button accent">Continue Shopping</a>
    `;
    block.appendChild(emptyState);
    return;
  }

  // ── Main content ──
  const content = document.createElement('div');
  content.classList.add('checkout-summary-content');

  // ── Items column ──
  const itemsCol = document.createElement('div');
  itemsCol.classList.add('checkout-items-col');

  const orderHeading = config.orderHeading || 'Review Your Order';
  const itemsHeader = document.createElement('div');
  itemsHeader.classList.add('checkout-items-header');
  itemsHeader.innerHTML = `
    <span class="checkout-items-heading">${orderHeading}</span>
    <span class="checkout-items-badge">${items.length} item${items.length !== 1 ? 's' : ''}</span>
  `;
  itemsCol.appendChild(itemsHeader);

  // Column labels (desktop only — reuses cart CSS)
  const colLabels = document.createElement('div');
  colLabels.classList.add('cart-col-labels');
  colLabels.innerHTML = `
    <span>Product</span>
    <span class="cart-col-total">Total</span>
  `;
  itemsCol.appendChild(colLabels);

  // Read-only line items
  items.forEach((item) => {
    itemsCol.appendChild(buildReadOnlyLineItem(item));
  });

  // ── Sidebar (totals + next steps) ──
  const sidebar = document.createElement('div');
  sidebar.classList.add('checkout-sidebar');

  sidebar.appendChild(buildTotals(config));
  sidebar.appendChild(buildNextSteps(config));

  content.appendChild(itemsCol);
  content.appendChild(sidebar);
  block.appendChild(content);
}

/**
 * Render the order confirmation ("Thank You") view.
 * Shown when the URL contains ?status=confirmed.
 * @param {HTMLElement} block
 * @param {object} config
 * @param {string} orderId
 */
function renderConfirmation(block, config, orderId) {
  const continueUrl = config.continueShoppingUrl || '/category/all';

  block.innerHTML = '';

  const panel = document.createElement('div');
  panel.classList.add('checkout-confirmation');

  panel.innerHTML = `
    <div class="checkout-confirmation-icon" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    </div>
    <h1 class="checkout-confirmation-title">Order Placed Successfully!</h1>
    <p class="checkout-confirmation-desc">
      Thank you! Your order has been confirmed and is being processed.
      You'll receive a confirmation email shortly.
    </p>
    <div class="checkout-confirmation-order-id-wrapper">
      <span class="checkout-confirmation-order-id-label">Order ID</span>
      <span class="checkout-confirmation-order-id">${orderId}</span>
    </div>
    <a href="${continueUrl}" class="button checkout-confirmation-cta">Continue Shopping</a>
  `;

  block.appendChild(panel);
}

/**
 * Decorate the checkout-summary block.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const config = readConfig(block);
  block.innerHTML = '';

  // ── Check for order confirmation query param ──
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const orderId = params.get('orderId');

  if (status === 'confirmed' && orderId) {
    renderConfirmation(block, config, orderId);
    return; // Don't set up cart subscriptions on confirmation view
  }

  render(block, config);

  // Keep totals live if cart changes (e.g. another tab updates cart)
  subscribe(() => {
    const items = getItems();
    if (items.length === 0) {
      render(block, config);
    } else {
      refreshTotals(block);
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'eds-cart') render(block, config);
  });
}
