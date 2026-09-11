/**
 * Account Module — mock profile data and order history for My Account.
 *
 * Profile is static demo data (swap for real auth/API later).
 * Orders merge the localStorage orders store (scripts/orders.js) with
 * seed data so the page is never empty on a first visit.
 *
 * Public API:
 *   getProfile()          – return mock profile object
 *   getAccountOrders()    – return merged orders array (live + seed), newest first
 *   formatOrderDate(iso)  – format ISO date string to readable label
 *   getStatusClass(status) – return CSS modifier class for order status pill
 */

import { getOrders } from './orders.js';

/* ─── Mock profile ─────────────────────────────────────────── */

/**
 * Return mock user profile.
 * @returns {{ name, email, memberSince, avatar }}
 */
export function getProfile() {
  return {
    name: 'Divya Patel',
    email: 'divya.patel@example.com',
    memberSince: '2024-01-15',
    avatar: null, // null = use initials fallback
  };
}

/**
 * Derive display initials from a full name.
 * @param {string} name
 * @returns {string}  e.g. "Alex Johnson" → "AJ"
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/* ─── Seed orders (always shown; live orders prepended) ────── */

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

/* ─── Helpers ───────────────────────────────────────────────── */

/**
 * Normalise a raw order record into the account order shape.
 * Handles records from both orders.js (live) and seed data.
 * @param {object} order
 * @returns {object}
 */
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

/**
 * Return all orders: live (from localStorage) + seed data.
 * Deduplicates by orderId so refreshing after placing an order
 * doesn't show a duplicate seed entry.
 * @returns {Array}
 */
export function getAccountOrders() {
  const live = getOrders().map(normalise);
  const liveIds = new Set(live.map((o) => o.orderId));

  const seeds = SEED_ORDERS
    .filter((o) => !liveIds.has(o.orderId))
    .map(normalise);

  return [...live, ...seeds];
}

/**
 * Format an ISO date string into a human-readable label.
 * e.g. "2026-08-15T10:30:00.000Z" → "15 Aug 2026"
 * @param {string} iso
 * @returns {string}
 */
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

/**
 * Return a CSS BEM modifier class for an order status pill.
 * @param {string} status
 * @returns {string}  e.g. 'account-status--delivered'
 */
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
