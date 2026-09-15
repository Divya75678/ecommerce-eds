const STORAGE_KEY = 'eds-orders';

function readOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    /* ignore */
  }
}

export function generateOrderId() {
  const ts = Date.now();
  const rand = Math.floor(1000 + Math.random() * 9000); // 1000–9999
  return `ORD-${ts}-${rand}`;
}

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

export function getOrders() {
  return readOrders();
}

export function getOrder(orderId) {
  return readOrders().find((o) => o.orderId === orderId);
}

export function clearOrders() {
  writeOrders([]);
}
