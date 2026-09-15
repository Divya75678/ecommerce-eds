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

const EMPTY_CART_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
  <line x1="3" y1="6" x2="21" y2="6"/>
  <path d="M16 10a4 4 0 0 1-8 0"/>
</svg>`;

const INFO_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>`;

const SUCCESS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="9 12 11 14 15 10"/>
</svg>`;

function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

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

function buildReadOnlyLineItem(item) {
  const row = document.createElement('div');
  row.classList.add('cart-line-item', 'checkout-line-item');
  row.dataset.sku = item.sku;

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

  // Details
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

  const qtyLabel = document.createElement('p');
  qtyLabel.classList.add('cart-line-qty-label');
  const qtyLabelText = document.createTextNode('Qty: ');
  const qtyStrong = document.createElement('strong');
  qtyStrong.textContent = String(item.quantity);
  qtyLabel.appendChild(qtyLabelText);
  qtyLabel.appendChild(qtyStrong);
  details.appendChild(qtyLabel);

  row.appendChild(details);

  // Line total
  const totalEl = document.createElement('p');
  totalEl.classList.add('cart-line-total');
  totalEl.textContent = formatPrice(item.price * item.quantity);
  row.appendChild(totalEl);

  return row;
}

function buildTotals(config) {
  const { subtotal, estimatedTotal } = getTotals();
  const summaryHeading = config.summaryHeading || 'Order Total';
  const shippingLabel = config.shippingLabel || 'Free';
  const placeOrderLabel = config.placeOrderLabel || 'Place Order';

  const isFreeShipping = shippingLabel.toLowerCase() === 'free';
  const shipping = isFreeShipping ? 0 : null;
  const grandTotal = shipping !== null ? subtotal + shipping : estimatedTotal;

  const wrapper = document.createElement('div');
  wrapper.classList.add('checkout-totals');

  // Inner (reuses cart summary CSS)
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
  const subtotalLabelEl = document.createElement('span');
  subtotalLabelEl.classList.add('cart-summary-label');
  subtotalLabelEl.textContent = 'Subtotal';
  const subtotalValueEl = document.createElement('span');
  subtotalValueEl.classList.add('cart-summary-value', 'checkout-subtotal');
  subtotalValueEl.textContent = formatPrice(subtotal);
  subtotalRow.appendChild(subtotalLabelEl);
  subtotalRow.appendChild(subtotalValueEl);
  rows.appendChild(subtotalRow);

  // Shipping row
  const shippingRow = document.createElement('div');
  shippingRow.classList.add('cart-summary-row');
  const shippingLabelEl = document.createElement('span');
  shippingLabelEl.classList.add('cart-summary-label');
  shippingLabelEl.textContent = 'Shipping';
  const shippingValueEl = document.createElement('span');
  shippingValueEl.classList.add('cart-summary-value', 'checkout-shipping');
  if (isFreeShipping) {
    const freeSpan = document.createElement('span');
    freeSpan.classList.add('checkout-shipping-free');
    freeSpan.textContent = 'Free';
    shippingValueEl.appendChild(freeSpan);
  } else {
    const otherSpan = document.createElement('span');
    otherSpan.classList.add('cart-summary-shipping');
    otherSpan.textContent = shippingLabel;
    shippingValueEl.appendChild(otherSpan);
  }
  shippingRow.appendChild(shippingLabelEl);
  shippingRow.appendChild(shippingValueEl);
  rows.appendChild(shippingRow);

  // Grand total row
  const totalRow = document.createElement('div');
  totalRow.classList.add('cart-summary-row', 'cart-summary-total-row');
  const totalLabelEl = document.createElement('span');
  totalLabelEl.classList.add('cart-summary-label');
  totalLabelEl.textContent = 'Total';
  const totalValueEl = document.createElement('span');
  totalValueEl.classList.add('cart-summary-value', 'cart-summary-estimated', 'checkout-grand-total');
  totalValueEl.textContent = formatPrice(grandTotal);
  totalRow.appendChild(totalLabelEl);
  totalRow.appendChild(totalValueEl);
  rows.appendChild(totalRow);

  inner.appendChild(rows);

  // Place Order button
  const orderActions = document.createElement('div');
  orderActions.classList.add('checkout-order-actions');

  const placeOrderBtn = document.createElement('button');
  placeOrderBtn.type = 'button';
  placeOrderBtn.classList.add('button', 'checkout-place-order-btn');
  placeOrderBtn.textContent = placeOrderLabel;
  orderActions.appendChild(placeOrderBtn);
  inner.appendChild(orderActions);

  wrapper.appendChild(inner);

  // ── Place Order click handler ──
  placeOrderBtn.addEventListener('click', () => {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing order\u2026';

    const items = getItems();
    const totals = getTotals();
    const orderId = generateOrderId();

    saveOrder({
      orderId,
      date: new Date().toISOString(),
      items,
      totals,
      status: 'confirmed',
    });

    window.dispatchEvent(new CustomEvent('checkout:place-order', {
      detail: { orderId, items, totals },
      bubbles: true,
    }));

    clearCart();
    window.location.href = `/eds-ecommerce/pages/checkout?status=confirmed&orderId=${encodeURIComponent(orderId)}`;
  });

  return wrapper;
}

function buildNextSteps(config) {
  const heading = config.nextStepsHeading || 'What happens next?';
  const text = config.nextStepsText
    || "You'll receive a confirmation email shortly. Our team will process your order within 1–2 business days.";

  const panel = document.createElement('div');
  panel.classList.add('checkout-next-steps');

  const iconWrapper = document.createElement('div');
  iconWrapper.classList.add('checkout-next-steps-icon');
  iconWrapper.setAttribute('aria-hidden', 'true');
  iconWrapper.innerHTML = INFO_ICON_SVG;
  panel.appendChild(iconWrapper);

  // Body
  const body = document.createElement('div');
  body.classList.add('checkout-next-steps-body');

  const headingEl = document.createElement('h3');
  headingEl.classList.add('checkout-next-steps-heading');
  headingEl.textContent = heading;
  body.appendChild(headingEl);

  const textEl = document.createElement('p');
  textEl.classList.add('checkout-next-steps-text');
  textEl.textContent = text;
  body.appendChild(textEl);

  panel.appendChild(body);
  return panel;
}

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

function render(block, config) {
  const items = getItems();
  block.innerHTML = '';

  // ── Empty state ──
  if (items.length === 0) {
    const continueUrl = config.continueShoppingUrl || '/eds-ecommerce/pages/category/';

    const emptyState = document.createElement('div');
    emptyState.classList.add('checkout-summary-empty');

    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('cart-empty-icon');
    iconWrapper.innerHTML = EMPTY_CART_ICON_SVG;
    emptyState.appendChild(iconWrapper);

    const emptyTitle = document.createElement('h2');
    emptyTitle.classList.add('cart-empty-title');
    emptyTitle.textContent = 'Your cart is empty';
    emptyState.appendChild(emptyTitle);

    const emptyDesc = document.createElement('p');
    emptyDesc.classList.add('cart-empty-desc');
    emptyDesc.textContent = 'Add items to your cart before checking out.';
    emptyState.appendChild(emptyDesc);

    const continueLink = document.createElement('a');
    continueLink.href = continueUrl;
    continueLink.classList.add('button', 'accent');
    continueLink.textContent = 'Continue Shopping';
    emptyState.appendChild(continueLink);

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

  const itemsHeadingSpan = document.createElement('span');
  itemsHeadingSpan.classList.add('checkout-items-heading');
  itemsHeadingSpan.textContent = orderHeading;
  itemsHeader.appendChild(itemsHeadingSpan);

  const itemsBadge = document.createElement('span');
  itemsBadge.classList.add('checkout-items-badge');
  itemsBadge.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
  itemsHeader.appendChild(itemsBadge);

  itemsCol.appendChild(itemsHeader);

  // Column labels
  const colLabels = document.createElement('div');
  colLabels.classList.add('cart-col-labels');

  const productLabel = document.createElement('span');
  productLabel.textContent = 'Product';
  colLabels.appendChild(productLabel);

  const totalLabel = document.createElement('span');
  totalLabel.classList.add('cart-col-total');
  totalLabel.textContent = 'Total';
  colLabels.appendChild(totalLabel);

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

function renderConfirmation(block, config, orderId) {
  const continueUrl = config.continueShoppingUrl || '/eds-ecommerce/pages/category/';

  block.innerHTML = '';

  const panel = document.createElement('div');
  panel.classList.add('checkout-confirmation');

  // Icon (static SVG)
  const iconWrapper = document.createElement('div');
  iconWrapper.classList.add('checkout-confirmation-icon');
  iconWrapper.setAttribute('aria-hidden', 'true');
  iconWrapper.innerHTML = SUCCESS_ICON_SVG;
  panel.appendChild(iconWrapper);

  // Title
  const titleEl = document.createElement('h1');
  titleEl.classList.add('checkout-confirmation-title');
  titleEl.textContent = 'Order Placed Successfully!';
  panel.appendChild(titleEl);

  // Description
  const descEl = document.createElement('p');
  descEl.classList.add('checkout-confirmation-desc');
  descEl.textContent = 'Thank you! Your order has been confirmed and is being processed. You\'ll receive a confirmation email shortly.';
  panel.appendChild(descEl);

  const orderIdWrapper = document.createElement('div');
  orderIdWrapper.classList.add('checkout-confirmation-order-id-wrapper');

  const orderIdLabel = document.createElement('span');
  orderIdLabel.classList.add('checkout-confirmation-order-id-label');
  orderIdLabel.textContent = 'Order ID';
  orderIdWrapper.appendChild(orderIdLabel);

  const orderIdValue = document.createElement('span');
  orderIdValue.classList.add('checkout-confirmation-order-id');
  orderIdValue.textContent = orderId;
  orderIdWrapper.appendChild(orderIdValue);

  panel.appendChild(orderIdWrapper);

  // CTA
  const ctaLink = document.createElement('a');
  ctaLink.href = continueUrl;
  ctaLink.classList.add('button', 'checkout-confirmation-cta');
  ctaLink.textContent = 'Continue Shopping';
  panel.appendChild(ctaLink);

  block.appendChild(panel);
}

export default function decorate(block) {
  const config = readConfig(block);
  block.innerHTML = '';

  // Check for order confirmation query param
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const orderId = params.get('orderId');

  if (status === 'confirmed' && orderId) {
    renderConfirmation(block, config, orderId);
    return;
  }

  render(block, config);

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
