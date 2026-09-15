import { getOrders } from './orders.js';

export function getProfile() {
  return {
    name: 'Divya Patel',
    email: 'divya.patel@example.com',
    memberSince: '2024-01-15',
    avatar: null,
  };
}

export function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

const SEED_ORDERS = [
  {
    orderId: 'ORD-1718123001-1001',
    date: '2026-08-15T10:30:00.000Z',
    status: 'Delivered',
    totals: {
      subtotal: 178.00,
      estimatedTotal: 178.00,
    },
    items: [
      {
        sku: 'PLT-CAL-001', name: 'Calathea Runestad', price: 89.00, quantity: 2, image: '',
      },
    ],
    itemsCount: 2,
  },
  {
    orderId: 'ORD-1718123002-1002',
    date: '2026-07-28T14:15:00.000Z',
    status: 'Delivered',
    totals: {
      subtotal: 89.00,
      estimatedTotal: 89.00,
    },
    items: [
      {
        sku: 'PLT-FLF-002', name: 'Fiddle Leaf Fig', price: 89.00, quantity: 1, image: '',
      },
    ],
    itemsCount: 1,
  },
  {
    orderId: 'ORD-1718123003-1003',
    date: '2026-06-10T09:00:00.000Z',
    status: 'Cancelled',
    totals: {
      subtotal: 245.00,
      estimatedTotal: 245.00,
    },
    items: [
      {
        sku: 'PLT-MON-003', name: 'Monstera Deliciosa', price: 65.00, quantity: 2, image: '',
      },
      {
        sku: 'PLT-PAL-004', name: 'Parlour Palm', price: 55.00, quantity: 1, image: '',
      },
      {
        sku: 'PLT-PCL-005', name: 'Peace Lily', price: 60.00, quantity: 1, image: '',
      },
    ],
    itemsCount: 3,
  },
];

function normalise(order) {
  const items = order.items || [];
  const itemsCount = order.itemsCount
    || items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const total = (order.totals && (order.totals.estimatedTotal ?? order.totals.subtotal))
    ?? order.total
    ?? 0;

  return {
    orderId: order.orderId,
    date: order.date || new Date().toISOString(),
    status: order.status || 'Confirmed',
    total,
    itemsCount,
    items,
  };
}

export function getAccountOrders() {
  const live = getOrders().map(normalise);
  const liveIds = new Set(live.map((o) => o.orderId));

  const seeds = SEED_ORDERS
    .filter((o) => !liveIds.has(o.orderId))
    .map(normalise);

  return [...live, ...seeds];
}

export function formatOrderDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function getStatusClass(status) {
  const map = {
    delivered: 'account-status--delivered',
    confirmed: 'account-status--confirmed',
    processing: 'account-status--processing',
    cancelled: 'account-status--cancelled',
    pending: 'account-status--pending',
  };
  return map[(status || '').toLowerCase()] || 'account-status--pending';
}
