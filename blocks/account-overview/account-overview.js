/**
 * Account Overview Block
 *
 * Renders a profile card and quick-link cards for the /account page.
 * All data comes from scripts/account.js (mock profile + orders count).
 *
 * Authored block table structure (in account.html):
 * ─────────────────────────────────────────────────
 * | Account Overview     |                         |
 * | Greeting             | Welcome back            |
 * | Orders URL           | /account/orders         |
 * ─────────────────────────────────────────────────
 *
 * Rendered structure:
 *   .account-overview
 *     .account-profile-card
 *       .account-avatar
 *       .account-profile-info
 *     .account-quick-links
 *       .account-quick-link-card × N
 */

import {
  getProfile,
  getInitials,
  getAccountOrders,
  formatOrderDate,
} from '../../scripts/account.js';

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
 * Format a member-since ISO date to a readable year label.
 * e.g. "2024-01-15" → "January 2024"
 * @param {string} iso
 * @returns {string}
 */
function formatMemberSince(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

/**
 * Decorate the account-overview block.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const config = readConfig(block);
  block.innerHTML = '';

  const profile = getProfile();
  const orders = getAccountOrders();
  const ordersUrl = config.ordersUrl || '/account-orders';
  const greeting = config.greeting || 'Welcome back';

  // ── Profile card ──
  const profileCard = document.createElement('div');
  profileCard.classList.add('account-profile-card');

  const initials = getInitials(profile.name);
  const avatarHtml = profile.avatar
    ? `<img src="${profile.avatar}" alt="${profile.name}" class="account-avatar-img">`
    : `<span class="account-avatar-initials">${initials}</span>`;

  const lastOrder = orders[0];
  const lastOrderText = lastOrder
    ? `Last order: ${formatOrderDate(lastOrder.date)}`
    : 'No orders yet';

  profileCard.innerHTML = `
    <div class="account-avatar" aria-hidden="true">${avatarHtml}</div>
    <div class="account-profile-info">
      <p class="account-greeting">${greeting},</p>
      <h1 class="account-name">${profile.name}</h1>
      <p class="account-email">${profile.email}</p>
      <p class="account-member-since">Member since ${formatMemberSince(profile.memberSince)}</p>
      <p class="account-last-order">${lastOrderText}</p>
    </div>
  `;

  // ── Quick-link cards ──
  const quickLinks = document.createElement('div');
  quickLinks.classList.add('account-quick-links');

  const cards = [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>`,
      label: 'My Orders',
      meta: `${orders.length} order${orders.length !== 1 ? 's' : ''}`,
      url: ordersUrl,
      cta: 'View history',
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>`,
      label: 'Profile',
      meta: profile.email,
      url: '#profile',
      cta: 'Edit details',
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>`,
      label: 'Addresses',
      meta: 'Manage saved addresses',
      url: '#addresses',
      cta: 'Manage',
    },
  ];

  cards.forEach(({
    icon, label, meta, url, cta,
  }) => {
    const card = document.createElement('a');
    card.classList.add('account-quick-link-card');
    card.href = url;
    card.innerHTML = `
      <div class="account-quick-link-icon">${icon}</div>
      <div class="account-quick-link-body">
        <h2 class="account-quick-link-label">${label}</h2>
        <p class="account-quick-link-meta">${meta}</p>
      </div>
      <span class="account-quick-link-cta">${cta} →</span>
    `;
    quickLinks.appendChild(card);
  });

  block.appendChild(profileCard);
  block.appendChild(quickLinks);
}
