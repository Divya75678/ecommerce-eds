/**
 * Related Products Block
 *
 * Renders a horizontal row of product-teaser cards for cross-sell / upsell.
 * Visual style mirrors the promo-grid--product cards.
 *
 * Document table structure (5 columns):
 * ──────────────────────────────────────────────────────────────────────
 * Row 0 (block name):    "Related Products"  |  …  |  …  |  …  |  …
 * Row 1 (section title): Section heading     |     |     |     |
 * Row 2+ (cards):        [image] | Product name | Badge | Price | URL
 * ──────────────────────────────────────────────────────────────────────
 *
 * Example:
 *   Related Products     |          |      |         |
 *   You May Also Like    |          |      |         |
 *   [plant img] | Bird of Paradise | NEW | $95.00 | /products/bird-of-paradise
 *   [plant img] | Fiddle Leaf Fig  |     | $120.00| /products/fiddle-leaf
 *
 * Rendered output:
 *   .related-products-header
 *     h2.related-products-title
 *   ul.related-products-list
 *     li.related-products-card
 *       div.related-products-card-image
 *         picture
 *         span.related-products-badge (optional)
 *         button.related-products-wishlist
 *       div.related-products-card-body
 *         h3.related-products-card-name
 *         p.related-products-card-price
 *         a.button.related-products-cta
 */

const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" width="18" height="18">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>`;

/**
 * Build a single related product card
 * @param {HTMLElement} row - table row div
 * @returns {HTMLLIElement}
 */
function buildCard(row) {
  const cells = [...row.querySelectorAll(':scope > div')];
  const imageCell = cells[0];
  const nameCell = cells[1];
  const badgeCell = cells[2];
  const priceCell = cells[3];
  const linkCell = cells[4];

  const li = document.createElement('li');
  li.classList.add('related-products-card');

  // Resolve product href
  const href = linkCell?.querySelector('a')?.href
    || linkCell?.textContent?.trim()
    || '#';

  // ── Image wrapper ──
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('related-products-card-image');

  const picture = imageCell?.querySelector('picture') || imageCell?.querySelector('img');
  if (picture) {
    imageWrapper.appendChild(picture.cloneNode(true));
  }

  // Badge (NEW / SALE / custom)
  const badgeText = badgeCell?.textContent?.trim();
  if (badgeText) {
    const badge = document.createElement('span');
    badge.classList.add('related-products-badge');
    badge.classList.add(`related-products-badge--${badgeText.toLowerCase()}`);
    badge.textContent = badgeText.toUpperCase();
    imageWrapper.appendChild(badge);
  }

  // Wishlist button
  const wishlistBtn = document.createElement('button');
  wishlistBtn.classList.add('related-products-wishlist');
  wishlistBtn.setAttribute('type', 'button');
  wishlistBtn.setAttribute('aria-label', 'Add to wishlist');
  wishlistBtn.setAttribute('aria-pressed', 'false');
  wishlistBtn.innerHTML = HEART_SVG;
  wishlistBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const pressed = wishlistBtn.getAttribute('aria-pressed') === 'true';
    wishlistBtn.setAttribute('aria-pressed', String(!pressed));
    wishlistBtn.classList.toggle('is-active', !pressed);
  });
  imageWrapper.appendChild(wishlistBtn);

  li.appendChild(imageWrapper);

  // ── Card body ──
  const body = document.createElement('div');
  body.classList.add('related-products-card-body');

  const name = document.createElement('h3');
  name.classList.add('related-products-card-name');
  name.textContent = nameCell?.textContent?.trim() || '';
  body.appendChild(name);

  const priceText = priceCell?.textContent?.trim();
  if (priceText) {
    const price = document.createElement('p');
    price.classList.add('related-products-card-price');
    price.textContent = priceText;
    body.appendChild(price);
  }

  const cta = document.createElement('a');
  cta.href = href;
  cta.classList.add('button', 'related-products-cta');
  cta.textContent = 'Add to Cart';
  body.appendChild(cta);

  li.appendChild(body);
  return li;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // ── Row 0: section heading ──
  const headerRow = rows[0];
  const headingText = headerRow?.querySelector(':scope > div:first-child')?.textContent?.trim();

  // ── Remaining rows: product cards ──
  const cardRows = rows.slice(1);

  // ── Build section header ──
  const header = document.createElement('div');
  header.classList.add('related-products-header');

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.classList.add('related-products-title');
    h2.textContent = headingText;
    header.appendChild(h2);
  }

  // ── Build card grid ──
  const list = document.createElement('ul');
  list.classList.add('related-products-list');

  cardRows.forEach((row) => {
    const card = buildCard(row);
    list.appendChild(card);
  });

  // ── Assemble ──
  block.innerHTML = '';
  block.appendChild(header);
  block.appendChild(list);
}
