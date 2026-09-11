/**
 * Cart Module — client-side cart backed by localStorage.
 *
 * Item model: { sku, name, price, quantity, image }
 *
 * Public API:
 *   addItem(product)       – add product or increment qty
 *   removeItem(sku)        – remove item entirely
 *   updateQty(sku, qty)    – set qty; removes item if qty <= 0
 *   getItems()             – returns array of cart items
 *   getTotals()            – returns { subtotal, itemCount, estimatedTotal }
 *   subscribe(fn)          – register callback for cart changes
 *   unsubscribe(fn)        – remove callback
 */

const STORAGE_KEY = 'eds-cart';
const subscribers = new Set();

/** Dispatch cart:updated on window so any block can react */
function dispatchCartEvent(items) {
  const event = new CustomEvent('cart:updated', { detail: { items }, bubbles: true });
  window.dispatchEvent(event);
  subscribers.forEach((fn) => {
    try { fn(items); } catch (e) { /* ignore subscriber errors */ }
  });
}

/**
 * Read cart from localStorage
 * @returns {Array}
 */
function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist cart to localStorage and notify subscribers
 * @param {Array} items
 */
function writeCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage quota exceeded — still notify in-memory */
  }
  dispatchCartEvent(items);
}

/**
 * Parse a price string like "$12.99" or "12.99" to a float
 * @param {string|number} price
 * @returns {number}
 */
export function parsePrice(price) {
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format a number as currency string
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Add a product to the cart or increment its quantity.
 * @param {{ sku: string, name: string, price: string|number,
 *   quantity?: number, image?: string }} product
 */
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

/**
 * Remove an item from the cart by SKU.
 * @param {string} sku
 */
export function removeItem(sku) {
  const items = readCart().filter((i) => i.sku !== sku);
  writeCart(items);
}

/**
 * Update the quantity of a cart item.
 * Removes the item if qty <= 0.
 * @param {string} sku
 * @param {number} qty
 */
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

/**
 * Get all cart items.
 * @returns {Array<{sku, name, price, quantity, image}>}
 */
export function getItems() {
  return readCart();
}

/**
 * Get cart totals.
 * @returns {{ subtotal: number, itemCount: number, estimatedTotal: number }}
 */
export function getTotals() {
  const items = readCart();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estimatedTotal = subtotal; // shipping TBD at checkout
  return { subtotal, itemCount, estimatedTotal };
}

/**
 * Subscribe to cart changes.
 * @param {function} fn  Called with the updated items array
 */
export function subscribe(fn) {
  subscribers.add(fn);
}

/**
 * Unsubscribe from cart changes.
 * @param {function} fn
 */
export function unsubscribe(fn) {
  subscribers.delete(fn);
}

/**
 * Clear all items from the cart (e.g. after order placed).
 */
export function clearCart() {
  writeCart([]);
}
