const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true" width="18" height="18">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>`;

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

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('related-products-card-image');

  const picture = imageCell?.querySelector('picture') || imageCell?.querySelector('img');
  if (picture) {
    imageWrapper.appendChild(picture.cloneNode(true));
  }

  const badgeText = badgeCell?.textContent?.trim();
  if (badgeText) {
    const badge = document.createElement('span');
    badge.classList.add('related-products-badge');
    badge.classList.add(`related-products-badge--${badgeText.toLowerCase()}`);
    badge.textContent = badgeText.toUpperCase();
    imageWrapper.appendChild(badge);
  }

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

  const headerRow = rows[0];
  const headingText = headerRow?.querySelector(':scope > div:first-child')?.textContent?.trim();

  const cardRows = rows.slice(1);

  const header = document.createElement('div');
  header.classList.add('related-products-header');

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.classList.add('related-products-title');
    h2.textContent = headingText;
    header.appendChild(h2);
  }

  const list = document.createElement('ul');
  list.classList.add('related-products-list');

  cardRows.forEach((row) => {
    const card = buildCard(row);
    list.appendChild(card);
  });

  block.innerHTML = '';
  block.appendChild(header);
  block.appendChild(list);
}
