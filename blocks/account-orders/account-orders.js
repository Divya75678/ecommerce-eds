/**
 * Account Orders Block
 *
 * Renders an order history list for the /account/orders page.
 * Clicking a row expands it to show the order's line items (client-side only).
 *
 * Authored block table structure (in account-orders.html):
 * ──────────────────────────────────────────────────────────
 * | Account Orders          |                               |
 * | Page Heading            | My Orders                     |
 * | Continue Shopping URL   | /category/all                 |
 * ──────────────────────────────────────────────────────────
 *
 * Rendered structure:
 *   .account-orders
 *     .account-orders-header
 *     .account-orders-table
 *       .account-orders-table-head
 *       .account-order-row × N
 *         .account-order-summary   (always visible — click to expand)
 *         .account-order-detail    (hidden; expands on click)
 *     .account-orders-empty        (shown when no orders)
 */

import {
  getAccountOrders,
  formatOrderDate,
  getStatusClass,
} from '../../scripts/account.js';

import { formatPrice } from '../../scripts/cart.js';

const CHEVRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  class="account-order-chevron">
  <polyline points="6 9 12 15 18 9"/>
</svg>`;

/**
 * Convert a key string to camelCase.
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
 * Parse authored key|value config rows.
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
 * Build the expanded order detail panel (line items).
 * @param {object} order
 * @returns {HTMLElement}
 */
function buildOrderDetail(order) {
  const detail = document.createElement('div');
  detail.classList.add('account-order-detail');
  detail.hidden = true;
  detail.id = `order-detail-${order.orderId}`;

  const items = order.items || [];

  if (items.length === 0) {
    detail.innerHTML = '<p class="account-order-detail-empty">No item details available.</p>';
    return detail;
  }

  const itemsHtml = items.map((item) => `
    <div class="account-order-detail-item">
      <div class="account-order-detail-image">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" width="64" height="64" loading="lazy">`
          : '<div class="account-order-detail-image-placeholder"></div>'}
      </div>
      <div class="account-order-detail-info">
        <p class="account-order-detail-name">${item.name}</p>
        <p class="account-order-detail-sku">SKU: ${item.sku}</p>
        <p class="account-order-detail-qty">Qty: ${item.quantity}</p>
      </div>
      <p class="account-order-detail-price">${formatPrice(item.price * item.quantity)}</p>
    </div>
  `).join('');

  detail.innerHTML = `
    <div class="account-order-detail-inner">
      <h3 class="account-order-detail-heading">Order Items</h3>
      <div class="account-order-detail-items">${itemsHtml}</div>
      <div class="account-order-detail-total">
        <span class="account-order-detail-total-label">Order Total</span>
        <span class="account-order-detail-total-value">${formatPrice(order.total)}</span>
      </div>
    </div>
  `;

  return detail;
}

/**
 * Build a single order row (summary + expandable detail).
 * @param {object} order
 * @returns {HTMLElement}
 */
function buildOrderRow(order) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('account-order-row');
  wrapper.dataset.orderId = order.orderId;

  const statusClass = getStatusClass(order.status);

  // Summary row (always visible)
  const summary = document.createElement('button');
  summary.type = 'button';
  summary.classList.add('account-order-summary');
  summary.setAttribute('aria-expanded', 'false');
  summary.setAttribute('aria-controls', `order-detail-${order.orderId}`);

  summary.innerHTML = `
    <span class="account-order-id">${order.orderId}</span>
    <span class="account-order-date">${formatOrderDate(order.date)}</span>
    <span class="account-order-status">
      <span class="account-status-pill ${statusClass}">${order.status}</span>
    </span>
    <span class="account-order-items-count">${order.itemsCount} item${order.itemsCount !== 1 ? 's' : ''}</span>
    <span class="account-order-total">${formatPrice(order.total)}</span>
    <span class="account-order-toggle">${CHEVRON_SVG}</span>
  `;

  // Detail panel
  const detail = buildOrderDetail(order);

  // Toggle expand/collapse
  summary.addEventListener('click', () => {
    const expanded = summary.getAttribute('aria-expanded') === 'true';
    summary.setAttribute('aria-expanded', String(!expanded));
    detail.hidden = expanded;
    wrapper.classList.toggle('is-expanded', !expanded);
  });

  wrapper.appendChild(summary);
  wrapper.appendChild(detail);
  return wrapper;
}

/**
 * Decorate the account-orders block.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const config = readConfig(block);
  block.innerHTML = '';

  const orders = getAccountOrders();
  const pageHeading = config.pageHeading || 'My Orders';
  const continueUrl = config.continueShoppingUrl || '/category/';

  // ── Page header ──
  const header = document.createElement('div');
  header.classList.add('account-orders-header');
  header.innerHTML = `
    <h1 class="account-orders-title">${pageHeading}</h1>
    <span class="account-orders-count">${orders.length} order${orders.length !== 1 ? 's' : ''}</span>
  `;
  block.appendChild(header);

  // ── Empty state ──
  if (orders.length === 0) {
    const empty = document.createElement('div');
    empty.classList.add('account-orders-empty');
    empty.innerHTML = `
      <p class="account-orders-empty-text">You haven't placed any orders yet.</p>
      <a href="${continueUrl}" class="button accent">Start Shopping</a>
    `;
    block.appendChild(empty);
    return;
  }

  // ── Orders table ──
  const table = document.createElement('div');
  table.classList.add('account-orders-table');
  table.setAttribute('role', 'list');

  // Column labels (desktop only)
  const tableHead = document.createElement('div');
  tableHead.classList.add('account-orders-table-head');
  tableHead.setAttribute('aria-hidden', 'true');
  tableHead.innerHTML = `
    <span>Order ID</span>
    <span>Date</span>
    <span>Status</span>
    <span>Items</span>
    <span>Total</span>
    <span></span>
  `;
  table.appendChild(tableHead);

  orders.forEach((order) => {
    const row = buildOrderRow(order);
    row.setAttribute('role', 'listitem');
    table.appendChild(row);
  });

  block.appendChild(table);
}
