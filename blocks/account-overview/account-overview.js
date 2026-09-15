import {
  getProfile,
  getInitials,
  getAccountOrders,
  formatOrderDate,
} from '../../scripts/account.js';

const ORDERS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
  <line x1="3" y1="6" x2="21" y2="6"/>
  <path d="M16 10a4 4 0 0 1-8 0"/>
</svg>`;

const PROFILE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>`;

const ADDRESSES_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
  <circle cx="12" cy="10" r="3"/>
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

function formatMemberSince(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function buildProfileCard(profile, greeting, lastOrderText) {
  const profileCard = document.createElement('div');
  profileCard.classList.add('account-profile-card');

  // Avatar
  const avatarWrapper = document.createElement('div');
  avatarWrapper.classList.add('account-avatar');
  avatarWrapper.setAttribute('aria-hidden', 'true');

  if (profile.avatar) {
    const avatarImg = document.createElement('img');
    avatarImg.src = profile.avatar;
    avatarImg.alt = profile.name;
    avatarImg.classList.add('account-avatar-img');
    avatarWrapper.appendChild(avatarImg);
  } else {
    const initialsSpan = document.createElement('span');
    initialsSpan.classList.add('account-avatar-initials');
    initialsSpan.textContent = getInitials(profile.name);
    avatarWrapper.appendChild(initialsSpan);
  }
  profileCard.appendChild(avatarWrapper);

  // Profile info
  const infoDiv = document.createElement('div');
  infoDiv.classList.add('account-profile-info');

  const greetingEl = document.createElement('p');
  greetingEl.classList.add('account-greeting');
  greetingEl.textContent = `${greeting},`;
  infoDiv.appendChild(greetingEl);

  const nameEl = document.createElement('h1');
  nameEl.classList.add('account-name');
  nameEl.textContent = profile.name;
  infoDiv.appendChild(nameEl);

  const emailEl = document.createElement('p');
  emailEl.classList.add('account-email');
  emailEl.textContent = profile.email;
  infoDiv.appendChild(emailEl);

  const memberSinceEl = document.createElement('p');
  memberSinceEl.classList.add('account-member-since');
  memberSinceEl.textContent = `Member since ${formatMemberSince(profile.memberSince)}`;
  infoDiv.appendChild(memberSinceEl);

  const lastOrderEl = document.createElement('p');
  lastOrderEl.classList.add('account-last-order');
  lastOrderEl.textContent = lastOrderText;
  infoDiv.appendChild(lastOrderEl);

  profileCard.appendChild(infoDiv);
  return profileCard;
}

function buildQuickLinkCard({
  iconSvg, label, meta, url, cta,
}) {
  const card = document.createElement('a');
  card.classList.add('account-quick-link-card');
  card.href = url;

  const iconWrapper = document.createElement('div');
  iconWrapper.classList.add('account-quick-link-icon');
  iconWrapper.innerHTML = iconSvg;
  card.appendChild(iconWrapper);

  // Body
  const body = document.createElement('div');
  body.classList.add('account-quick-link-body');

  const labelEl = document.createElement('h2');
  labelEl.classList.add('account-quick-link-label');
  labelEl.textContent = label;
  body.appendChild(labelEl);

  const metaEl = document.createElement('p');
  metaEl.classList.add('account-quick-link-meta');
  metaEl.textContent = meta;
  body.appendChild(metaEl);

  card.appendChild(body);

  // CTA
  const ctaSpan = document.createElement('span');
  ctaSpan.classList.add('account-quick-link-cta');
  ctaSpan.textContent = `${cta} →`;
  card.appendChild(ctaSpan);

  return card;
}

export default function decorate(block) {
  const config = readConfig(block);
  block.innerHTML = '';

  const profile = getProfile();
  const orders = getAccountOrders();
  const ordersUrl = config.ordersUrl || '/eds-ecommerce/pages/account-orders';
  const greeting = config.greeting || 'Welcome back';

  const lastOrder = orders[0];
  const lastOrderText = lastOrder
    ? `Last order: ${formatOrderDate(lastOrder.date)}`
    : 'No orders yet';

  // ── Profile card ──
  const profileCard = buildProfileCard(profile, greeting, lastOrderText);
  block.appendChild(profileCard);

  // ── Quick-link cards ──
  const quickLinks = document.createElement('div');
  quickLinks.classList.add('account-quick-links');

  const cards = [
    {
      iconSvg: ORDERS_ICON_SVG,
      label: 'My Orders',
      meta: `${orders.length} order${orders.length !== 1 ? 's' : ''}`,
      url: ordersUrl,
      cta: 'View history',
    },
    {
      iconSvg: PROFILE_ICON_SVG,
      label: 'Profile',
      meta: profile.email,
      url: '#profile',
      cta: 'Edit details',
    },
    {
      iconSvg: ADDRESSES_ICON_SVG,
      label: 'Addresses',
      meta: 'Manage saved addresses',
      url: '#addresses',
      cta: 'Manage',
    },
  ];

  cards.forEach((cardData) => {
    quickLinks.appendChild(buildQuickLinkCard(cardData));
  });

  block.appendChild(quickLinks);
}
