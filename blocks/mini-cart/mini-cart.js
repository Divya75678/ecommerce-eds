import {
  getItems, getTotals, formatPrice, subscribe,
} from '../../scripts/cart.js';

const BAG_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
  <line x1="3" y1="6" x2="21" y2="6"/>
  <path d="M16 10a4 4 0 0 1-8 0"/>
</svg>`;

function buildLineItem(item) {
  const li = document.createElement('li');
  li.classList.add('mini-cart-item');
  li.dataset.sku = item.sku;

  // Image wrapper
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('mini-cart-item-image');
  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.width = 56;
    img.height = 56;
    img.loading = 'lazy';
    imageWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.classList.add('mini-cart-item-placeholder');
    imageWrapper.appendChild(placeholder);
  }
  li.appendChild(imageWrapper);

  // Details
  const details = document.createElement('div');
  details.classList.add('mini-cart-item-details');

  const nameSpan = document.createElement('span');
  nameSpan.classList.add('mini-cart-item-name');
  nameSpan.textContent = item.name;
  details.appendChild(nameSpan);

  const metaSpan = document.createElement('span');
  metaSpan.classList.add('mini-cart-item-meta');
  metaSpan.textContent = `Qty: ${item.quantity} · ${formatPrice(item.price * item.quantity)}`;
  details.appendChild(metaSpan);

  li.appendChild(details);
  return li;
}

function buildDropdown() {
  const dropdown = document.createElement('div');
  dropdown.id = 'mini-cart-dropdown';
  dropdown.classList.add('mini-cart-dropdown');
  dropdown.setAttribute('aria-hidden', 'true');

  // Header
  const header = document.createElement('div');
  header.classList.add('mini-cart-header');
  const title = document.createElement('span');
  title.classList.add('mini-cart-title');
  title.textContent = 'Cart';
  header.appendChild(title);
  dropdown.appendChild(header);

  // Items list
  const itemsList = document.createElement('ul');
  itemsList.classList.add('mini-cart-items');
  itemsList.setAttribute('aria-label', 'Cart items');
  dropdown.appendChild(itemsList);

  // Footer
  const footer = document.createElement('div');
  footer.classList.add('mini-cart-footer');

  const subtotalWrapper = document.createElement('div');
  subtotalWrapper.classList.add('mini-cart-subtotal');

  const subtotalLabel = document.createElement('span');
  subtotalLabel.classList.add('mini-cart-subtotal-label');
  subtotalLabel.textContent = 'Subtotal';
  subtotalWrapper.appendChild(subtotalLabel);

  const subtotalValue = document.createElement('span');
  subtotalValue.classList.add('mini-cart-subtotal-value');
  subtotalValue.textContent = formatPrice(0);
  subtotalWrapper.appendChild(subtotalValue);

  footer.appendChild(subtotalWrapper);

  const viewCartLink = document.createElement('a');
  viewCartLink.href = '/eds-ecommerce/pages/cart';
  viewCartLink.classList.add('button', 'accent', 'mini-cart-view-cart');
  viewCartLink.textContent = 'View Cart';
  viewCartLink.style.display = 'none';
  footer.appendChild(viewCartLink);

  dropdown.appendChild(footer);
  return dropdown;
}

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
  block.innerHTML = '';
  block.classList.add('mini-cart');

  // Trigger button
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.classList.add('mini-cart-trigger');
  trigger.setAttribute('aria-label', 'Open cart');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'mini-cart-dropdown');

  const iconWrapper = document.createElement('span');
  iconWrapper.classList.add('mini-cart-icon');
  iconWrapper.innerHTML = BAG_ICON_SVG;
  trigger.appendChild(iconWrapper);

  // Badge
  const badge = document.createElement('span');
  badge.classList.add('mini-cart-badge');
  badge.setAttribute('aria-hidden', 'true');
  badge.hidden = true;
  trigger.appendChild(badge);

  const dropdown = buildDropdown();

  block.appendChild(trigger);
  block.appendChild(dropdown);

  renderCart(dropdown, badge);

  subscribe(() => renderCart(dropdown, badge));

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

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      dropdown.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && dropdown.classList.contains('is-open')) {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      dropdown.classList.remove('is-open');
      trigger.focus();
    }
  });

  dropdown.querySelector('.mini-cart-view-cart')?.addEventListener('click', () => {
    dropdown.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');
  });
}
