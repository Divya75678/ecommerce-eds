const STORAGE_KEY = 'eds-cart';
const subscribers = new Set();

function dispatchCartEvent(items) {
  const event = new CustomEvent('cart:updated', { detail: { items }, bubbles: true });
  window.dispatchEvent(event);
  subscribers.forEach((fn) => {
    try { fn(items); } catch (e) { /* ignore subscriber errors */ }
  });
}

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage quota exceeded — still notify in-memory */
  }
  dispatchCartEvent(items);
}

export function parsePrice(price) {
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

export function addItem(product) {
  const {
    sku, name, price, image,
  } = product;
  const qty = Math.max(1, parseInt(product.quantity, 10) || 1);

  if (!sku) {
    // eslint-disable-next-line no-console
    console.warn('[cart] addItem called without sku — skipping');
    return;
  }

  const items = readCart();
  const existing = items.find((i) => i.sku === sku);

  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + qty);
  } else {
    items.push({
      sku,
      name: name || sku,
      price: parsePrice(price),
      quantity: Math.min(99, qty),
      image: image || '',
    });
  }

  writeCart(items);
}

export function removeItem(sku) {
  const items = readCart().filter((i) => i.sku !== sku);
  writeCart(items);
}

export function updateQty(sku, qty) {
  const parsed = parseInt(qty, 10);
  if (parsed <= 0 || Number.isNaN(parsed)) {
    removeItem(sku);
    return;
  }
  const items = readCart();
  const item = items.find((i) => i.sku === sku);
  if (item) {
    item.quantity = Math.min(99, parsed);
    writeCart(items);
  }
}

export function getItems() {
  return readCart();
}

export function getTotals() {
  const items = readCart();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estimatedTotal = subtotal;
  return { subtotal, itemCount, estimatedTotal };
}

export function subscribe(fn) {
  subscribers.add(fn);
}

export function unsubscribe(fn) {
  subscribers.delete(fn);
}

export function clearCart() {
  writeCart([]);
}
