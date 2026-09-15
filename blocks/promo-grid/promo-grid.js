function buildCategoryCard(row) {
  const cells = row.querySelectorAll(':scope > div');
  const imageCell = cells[0];
  const nameCell = cells[1];
  const countCell = cells[2];
  const linkCell = cells[3];

  const li = document.createElement('li');
  li.classList.add('promo-grid-card', 'promo-grid-card--category');

  const href = linkCell?.querySelector('a')?.href
    || linkCell?.textContent?.trim()
    || '#';
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.classList.add('promo-grid-card-link');
  anchor.setAttribute('aria-label', nameCell?.textContent?.trim() || 'Category');

  const picture = imageCell?.querySelector('picture') || imageCell?.querySelector('img');
  if (picture) {
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('promo-grid-card-image');
    imageWrapper.appendChild(picture);
    anchor.appendChild(imageWrapper);
  }

  const textDiv = document.createElement('div');
  textDiv.classList.add('promo-grid-card-body');

  const name = document.createElement('h3');
  name.classList.add('promo-grid-card-name');
  name.textContent = nameCell?.textContent?.trim() || '';
  textDiv.appendChild(name);

  if (countCell?.textContent?.trim()) {
    const count = document.createElement('p');
    count.classList.add('promo-grid-card-count');
    count.textContent = countCell.textContent.trim();
    textDiv.appendChild(count);
  }

  const shopLink = document.createElement('span');
  shopLink.classList.add('promo-grid-card-shoplink');
  shopLink.textContent = 'Shop now →';
  textDiv.appendChild(shopLink);

  anchor.appendChild(textDiv);
  li.appendChild(anchor);
  return li;
}

function buildProductCard(row) {
  const cells = row.querySelectorAll(':scope > div');
  const imageCell = cells[0];
  const nameCell = cells[1];
  const badgeCell = cells[2];
  const priceCell = cells[3];
  const linkCell = cells[4];
  const descCell = cells[5];

  const li = document.createElement('li');
  li.classList.add('promo-grid-card', 'promo-grid-card--product');

  const href = linkCell?.querySelector('a')?.href
    || linkCell?.textContent?.trim()
    || '#';

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('promo-grid-card-image');

  const picture = imageCell?.querySelector('picture') || imageCell?.querySelector('img');
  if (picture) {
    imageWrapper.appendChild(picture);
  }

  const badgeText = badgeCell?.textContent?.trim();
  if (badgeText) {
    const badge = document.createElement('span');
    badge.classList.add('promo-grid-badge');
    const badgeUpper = badgeText.toUpperCase();
    badge.classList.add(`promo-grid-badge--${badgeUpper.toLowerCase()}`);
    badge.textContent = badgeUpper;
    imageWrapper.appendChild(badge);
  }

  const wishlistBtn = document.createElement('button');
  wishlistBtn.classList.add('promo-grid-wishlist');
  wishlistBtn.setAttribute('aria-label', 'Add to wishlist');
  wishlistBtn.setAttribute('type', 'button');
  wishlistBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" width="18" height="18">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`;
  imageWrapper.appendChild(wishlistBtn);

  li.appendChild(imageWrapper);

  const body = document.createElement('div');
  body.classList.add('promo-grid-card-body');

  const productName = document.createElement('h3');
  productName.classList.add('promo-grid-card-name');
  productName.textContent = nameCell?.textContent?.trim() || '';
  body.appendChild(productName);

  if (priceCell?.textContent?.trim()) {
    const price = document.createElement('p');
    price.classList.add('promo-grid-card-price');
    price.textContent = priceCell.textContent.trim();
    body.appendChild(price);
  }

  if (descCell?.textContent?.trim()) {
    const desc = document.createElement('p');
    desc.classList.add('promo-grid-card-desc');
    desc.textContent = descCell.textContent.trim();
    body.appendChild(desc);
  }

  const addToCart = document.createElement('a');
  addToCart.href = href;
  addToCart.classList.add('button', 'promo-grid-cta');
  addToCart.textContent = 'Add to Cart';
  body.appendChild(addToCart);

  li.appendChild(body);
  return li;
}

export default function decorate(block) {
  const isProducts = block.classList.contains('products');

  const rows = [...block.querySelectorAll(':scope > div')];

  const headerRow = rows[0];
  const titleCell = headerRow?.querySelector(':scope > div:first-child');
  const viewAllCell = headerRow?.querySelector(':scope > div:last-child');

  const sectionTitle = titleCell?.textContent?.trim() || '';
  const viewAllLink = viewAllCell?.querySelector('a');
  const viewAllText = viewAllCell?.textContent?.trim();
  const showViewAll = viewAllText && viewAllText !== sectionTitle;

  const header = document.createElement('div');
  header.classList.add('promo-grid-header');

  if (sectionTitle) {
    const heading = document.createElement('h2');
    heading.classList.add('promo-grid-title');
    heading.textContent = sectionTitle;
    header.appendChild(heading);
  }

  if (showViewAll) {
    const viewAll = document.createElement('a');
    viewAll.classList.add('promo-grid-viewall');
    viewAll.href = viewAllLink?.href || '#';
    viewAll.textContent = viewAllLink?.textContent?.trim() || viewAllText;
    header.appendChild(viewAll);
  }

  const cardRows = rows.slice(1);
  const grid = document.createElement('ul');
  grid.classList.add('promo-grid-list');

  cardRows.forEach((row) => {
    const card = isProducts ? buildProductCard(row) : buildCategoryCard(row);
    grid.appendChild(card);
  });

  block.innerHTML = '';
  block.appendChild(header);
  block.appendChild(grid);
}
