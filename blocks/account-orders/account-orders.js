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

function buildDetailItem(item) {
  const itemEl = document.createElement('div');
  itemEl.classList.add('account-order-detail-item');

  // Image
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('account-order-detail-image');
  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.width = 64;
    img.height = 64;
    img.loading = 'lazy';
    imageWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.classList.add('account-order-detail-image-placeholder');
    imageWrapper.appendChild(placeholder);
  }
  itemEl.appendChild(imageWrapper);

  // Info
  const info = document.createElement('div');
  info.classList.add('account-order-detail-info');

  const nameEl = document.createElement('p');
  nameEl.classList.add('account-order-detail-name');
  nameEl.textContent = item.name;
  info.appendChild(nameEl);

  const skuEl = document.createElement('p');
  skuEl.classList.add('account-order-detail-sku');
  skuEl.textContent = `SKU: ${item.sku}`;
  info.appendChild(skuEl);

  const qtyEl = document.createElement('p');
  qtyEl.classList.add('account-order-detail-qty');
  qtyEl.textContent = `Qty: ${item.quantity}`;
  info.appendChild(qtyEl);

  itemEl.appendChild(info);

  // Price
  const priceEl = document.createElement('p');
  priceEl.classList.add('account-order-detail-price');
  priceEl.textContent = formatPrice(item.price * item.quantity);
  itemEl.appendChild(priceEl);

  return itemEl;
}

function buildOrderDetail(order) {
  const detail = document.createElement('div');
  detail.classList.add('account-order-detail');
  detail.hidden = true;
  detail.id = `order-detail-${order.orderId}`;

  const items = order.items || [];

  if (items.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.classList.add('account-order-detail-empty');
    emptyMsg.textContent = 'No item details available.';
    detail.appendChild(emptyMsg);
    return detail;
  }

  // Inner wrapper
  const inner = document.createElement('div');
  inner.classList.add('account-order-detail-inner');

  // Heading
  const heading = document.createElement('h3');
  heading.classList.add('account-order-detail-heading');
  heading.textContent = 'Order Items';
  inner.appendChild(heading);

  // Items list
  const itemsList = document.createElement('div');
  itemsList.classList.add('account-order-detail-items');
  items.forEach((item) => {
    itemsList.appendChild(buildDetailItem(item));
  });
  inner.appendChild(itemsList);

  // Total row
  const totalRow = document.createElement('div');
  totalRow.classList.add('account-order-detail-total');

  const totalLabel = document.createElement('span');
  totalLabel.classList.add('account-order-detail-total-label');
  totalLabel.textContent = 'Order Total';
  totalRow.appendChild(totalLabel);

  const totalValue = document.createElement('span');
  totalValue.classList.add('account-order-detail-total-value');
  totalValue.textContent = formatPrice(order.total);
  totalRow.appendChild(totalValue);

  inner.appendChild(totalRow);
  detail.appendChild(inner);

  return detail;
}

function buildOrderRow(order) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('account-order-row');
  wrapper.dataset.orderId = order.orderId;

  const statusClass = getStatusClass(order.status);

  const summary = document.createElement('button');
  summary.type = 'button';
  summary.classList.add('account-order-summary');
  summary.setAttribute('aria-expanded', 'false');
  summary.setAttribute('aria-controls', `order-detail-${order.orderId}`);

  const orderIdSpan = document.createElement('span');
  orderIdSpan.classList.add('account-order-id');
  orderIdSpan.textContent = order.orderId;
  summary.appendChild(orderIdSpan);

  const dateSpan = document.createElement('span');
  dateSpan.classList.add('account-order-date');
  dateSpan.textContent = formatOrderDate(order.date);
  summary.appendChild(dateSpan);

  const statusSpan = document.createElement('span');
  statusSpan.classList.add('account-order-status');
  const statusPill = document.createElement('span');
  statusPill.classList.add('account-status-pill', statusClass);
  statusPill.textContent = order.status;
  statusSpan.appendChild(statusPill);
  summary.appendChild(statusSpan);

  const itemsCountSpan = document.createElement('span');
  itemsCountSpan.classList.add('account-order-items-count');
  itemsCountSpan.textContent = `${order.itemsCount} item${order.itemsCount !== 1 ? 's' : ''}`;
  summary.appendChild(itemsCountSpan);

  const totalSpan = document.createElement('span');
  totalSpan.classList.add('account-order-total');
  totalSpan.textContent = formatPrice(order.total);
  summary.appendChild(totalSpan);

  const toggleSpan = document.createElement('span');
  toggleSpan.classList.add('account-order-toggle');
  toggleSpan.innerHTML = CHEVRON_SVG;
  summary.appendChild(toggleSpan);

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

export default function decorate(block) {
  const config = readConfig(block);
  block.innerHTML = '';

  const orders = getAccountOrders();
  const pageHeading = config.pageHeading || 'My Orders';
  const continueUrl = config.continueShoppingUrl || '/category/';

  // ── Page header ──
  const header = document.createElement('div');
  header.classList.add('account-orders-header');

  const titleEl = document.createElement('h1');
  titleEl.classList.add('account-orders-title');
  titleEl.textContent = pageHeading;
  header.appendChild(titleEl);

  const countSpan = document.createElement('span');
  countSpan.classList.add('account-orders-count');
  countSpan.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;
  header.appendChild(countSpan);

  block.appendChild(header);

  // ── Empty state ──
  if (orders.length === 0) {
    const empty = document.createElement('div');
    empty.classList.add('account-orders-empty');

    const emptyText = document.createElement('p');
    emptyText.classList.add('account-orders-empty-text');
    emptyText.textContent = "You haven't placed any orders yet.";
    empty.appendChild(emptyText);

    const shopLink = document.createElement('a');
    shopLink.href = continueUrl;
    shopLink.classList.add('button', 'accent');
    shopLink.textContent = 'Start Shopping';
    empty.appendChild(shopLink);

    block.appendChild(empty);
    return;
  }

  // ── Orders table ──
  const table = document.createElement('div');
  table.classList.add('account-orders-table');
  table.setAttribute('role', 'list');

  // Column labels
  const tableHead = document.createElement('div');
  tableHead.classList.add('account-orders-table-head');
  tableHead.setAttribute('aria-hidden', 'true');

  ['Order ID', 'Date', 'Status', 'Items', 'Total', ''].forEach((label) => {
    const span = document.createElement('span');
    span.textContent = label;
    tableHead.appendChild(span);
  });

  table.appendChild(tableHead);

  orders.forEach((order) => {
    const row = buildOrderRow(order);
    row.setAttribute('role', 'listitem');
    table.appendChild(row);
  });

  block.appendChild(table);
}
