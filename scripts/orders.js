/**
 * Orders Module — client-side order history backed by localStorage.
 *
 * Order model: { orderId, date, items, totals, status }
 *
 * Public API:
 *   generateOrderId()          – generate a unique mock order ID
 *   saveOrder(order)           – persist a new order record
 *   getOrders()                – return all saved orders (newest first)
 *   getOrder(orderId)          – return a single order by ID
 *   clearOrders()              – remove all saved orders (dev/test use)
 */

const STORAGE_KEY = 'eds-orders';

/**
 * Read orders array from localStorage.
 * @returns {Array}
 */
function readOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist orders array to localStorage.
 * @param {Array} orders
 */
function writeOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    /* storage quota exceeded — silently ignore */
  }
}

/**
 * Generate a unique mock order ID.
 * Format: ORD-<timestamp>-<4-digit random>
 * Example: ORD-1749534821-4273
 * @returns {string}
 */
export function generateOrderId() {
  const ts = Date.now();
  const rand = Math.floor(1000 + Math.random() * 9000); // 1000–9999
  return `ORD-${ts}-${rand}`;
}

/**
 * Save a new order record.
 * @param {{ orderId: string, items: Array, totals: object, status?: string }} order
 */
export function saveOrder(order) {
  if (!order || !order.orderId) {
    // eslint-disable-next-line no-console
    console.warn('[orders] saveOrder called without orderId — skipping');
    return;
  }

  const orders = readOrders();
  orders.unshift({
    orderId: order.orderId,
    date: order.date || new Date().toISOString(),
    items: order.items || [],
    totals: order.totals || {},
    status: order.status || 'confirmed',
  });

  writeOrders(orders);
}

/**
 * Get all saved orders, newest first.
 * @returns {Array<{ orderId, date, items, totals, status }>}
 */
export function getOrders() {
  return readOrders();
}

/**
 * Get a single order by ID.
 * @param {string} orderId
 * @returns {{ orderId, date, items, totals, status } | undefined}
 */
export function getOrder(orderId) {
  return readOrders().find((o) => o.orderId === orderId);
}

/**
 * Clear all saved orders (for development / testing).
 */
export function clearOrders() {
  writeOrders([]);
}
