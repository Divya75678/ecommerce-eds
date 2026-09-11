/**
 * Product Details Block
 *
 * Renders a two-column PDP hero: image gallery (left) + product info panel (right).
 *
 * Document table structure (7 columns):
 * ─────────────────────────────────────────────────────────────────────────
 * Row 0 (block name):  "Product Details"  |  …  |  …  |  …  |  …  |  …  |  …
 * Row 1 (images+meta): [img1] | [img2] | [img3] | Product Title | Rating | Price | SKU
 * Row 2 (description): (empty)×3 | Long description paragraph | (empty)×3
 * Row 3 (features):    (empty)×3 | • Feature 1 \n• Feature 2 … | (empty)×3
 * Row 4 (CTAs):        (empty)×3 | [Add to Cart link] | (empty)×3
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Rendered output:
 *   .product-details-inner
 *     .product-gallery
 *       .product-gallery-main  (large image)
 *       .product-gallery-thumbs  (thumbnail strip)
 *     .product-info
 *       h1.product-title
 *       .product-rating  (stars + numeric)
 *       p.product-price
 *       p.product-sku
 *       p.product-description
 *       ul.product-features
 *       .product-actions
 *         .product-qty  (− input +)
 *         button.button.accent  (Add to Cart)
 */

import { addItem as cartAddItem } from '../../scripts/cart.js';

const STAR_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  fill="currentColor" aria-hidden="true" width="16" height="16">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`;

const STAR_HALF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  aria-hidden="true" width="16" height="16">
  <defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/>
  <stop offset="50%" stop-color="transparent"/></linearGradient></defs>
  <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  <path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`;

const STAR_EMPTY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" width="16" height="16">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`;

/**
 * Build star rating HTML from a numeric string like "4.8"
 * @param {string} ratingText
 * @returns {string} HTML string
 */
function buildStars(ratingText) {
  const rating = parseFloat(ratingText);
  if (Number.isNaN(rating)) return '';

  let stars = '';
  for (let i = 1; i <= 5; i += 1) {
    if (rating >= i) {
      stars += STAR_FILLED;
    } else if (rating >= i - 0.5) {
      stars += STAR_HALF;
    } else {
      stars += STAR_EMPTY;
    }
  }
  return stars;
}

/**
 * Activate a thumbnail — swap main image
 * @param {HTMLElement} thumbBtn
 * @param {HTMLElement} mainImg
 * @param {NodeList} allThumbs
 */
function activateThumb(thumbBtn, mainImg) {
  const thumbImg = thumbBtn.querySelector('img');
  if (!thumbImg) return;

  // Clone the thumb's picture/img into main viewer
  const picture = thumbBtn.querySelector('picture');
  if (picture) {
    mainImg.innerHTML = '';
    mainImg.appendChild(picture.cloneNode(true));
  } else {
    const img = thumbBtn.querySelector('img');
    if (img) {
      mainImg.innerHTML = '';
      mainImg.appendChild(img.cloneNode(true));
    }
  }
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // ── Row 1: images (cols 0–2) + meta (cols 3–5) ──
  const metaRow = rows[0];
  const cells = metaRow ? [...metaRow.querySelectorAll(':scope > div')] : [];

  const imageCells = cells.slice(0, 3).filter((c) => c.querySelector('img, picture'));
  const titleCell = cells[3];
  const ratingCell = cells[4];
  const priceCell = cells[5];
  const skuCell = cells[6];

  // ── Row 2: description ──
  const descRow = rows[1];
  const descCell = descRow?.querySelector(':scope > div:nth-child(4)') || descRow?.querySelector(':scope > div');

  // ── Row 3: features ──
  const featuresRow = rows[2];
  const featuresCell = featuresRow?.querySelector(':scope > div:nth-child(4)') || featuresRow?.querySelector(':scope > div');

  // ── Row 4: CTAs ──
  const ctaRow = rows[3];
  const ctaCells = ctaRow ? [...ctaRow.querySelectorAll(':scope > div')] : [];
  const addToCartCell = ctaCells[3] || ctaCells[0];

  // ════════════════════════════════════════
  // BUILD GALLERY (left panel)
  // ════════════════════════════════════════
  const gallery = document.createElement('div');
  gallery.classList.add('product-gallery');

  const mainViewer = document.createElement('div');
  mainViewer.classList.add('product-gallery-main');

  const thumbStrip = document.createElement('div');
  thumbStrip.classList.add('product-gallery-thumbs');

  if (imageCells.length > 0) {
    // First image as default main image
    const firstPicture = imageCells[0].querySelector('picture') || imageCells[0].querySelector('img');
    if (firstPicture) mainViewer.appendChild(firstPicture.cloneNode(true));

    // Build thumbnails
    imageCells.forEach((cell, idx) => {
      const picture = cell.querySelector('picture') || cell.querySelector('img');
      if (!picture) return;

      const thumbBtn = document.createElement('button');
      thumbBtn.classList.add('product-gallery-thumb');
      thumbBtn.setAttribute('type', 'button');
      thumbBtn.setAttribute('aria-label', `View image ${idx + 1}`);
      if (idx === 0) thumbBtn.classList.add('is-active');
      thumbBtn.appendChild(picture.cloneNode(true));

      thumbBtn.addEventListener('click', () => {
        thumbStrip.querySelectorAll('.product-gallery-thumb').forEach((b) => b.classList.remove('is-active'));
        thumbBtn.classList.add('is-active');
        activateThumb(thumbBtn, mainViewer);
      });

      thumbStrip.appendChild(thumbBtn);
    });
  }

  gallery.appendChild(mainViewer);
  gallery.appendChild(thumbStrip);

  // ════════════════════════════════════════
  // BUILD INFO PANEL (right panel)
  // ════════════════════════════════════════
  const info = document.createElement('div');
  info.classList.add('product-info');

  // Title
  const titleText = titleCell?.textContent?.trim();
  if (titleText) {
    const h1 = document.createElement('h1');
    h1.classList.add('product-title');
    h1.textContent = titleText;
    info.appendChild(h1);
  }

  // Rating
  const ratingText = ratingCell?.textContent?.trim();
  if (ratingText) {
    const ratingEl = document.createElement('div');
    ratingEl.classList.add('product-rating');
    ratingEl.innerHTML = `
      <span class="product-rating-stars" aria-label="Rating: ${ratingText} out of 5">${buildStars(ratingText)}</span>
      <span class="product-rating-value">${ratingText}</span>
    `;
    info.appendChild(ratingEl);
  }

  // Price
  const priceText = priceCell?.textContent?.trim();
  if (priceText) {
    const price = document.createElement('p');
    price.classList.add('product-price');
    price.textContent = priceText;
    info.appendChild(price);
  }

  // SKU
  const skuText = skuCell?.textContent?.trim();
  if (skuText) {
    const sku = document.createElement('p');
    sku.classList.add('product-sku');
    sku.innerHTML = `<span class="product-sku-label">SKU:</span> <span class="product-sku-value">${skuText}</span>`;
    info.appendChild(sku);
  }

  // Divider
  const divider = document.createElement('hr');
  divider.classList.add('product-divider');
  info.appendChild(divider);

  // Description
  if (descCell?.textContent?.trim()) {
    const desc = document.createElement('p');
    desc.classList.add('product-description');
    desc.innerHTML = descCell.innerHTML;
    info.appendChild(desc);
  }

  // Features — parse bullet list (lines starting with • or - or authored as <ul>)
  if (featuresCell?.textContent?.trim()) {
    const existingList = featuresCell.querySelector('ul, ol');
    if (existingList) {
      const featuresList = document.createElement('ul');
      featuresList.classList.add('product-features');
      [...existingList.querySelectorAll('li')].forEach((li) => {
        const newLi = document.createElement('li');
        newLi.textContent = li.textContent.trim();
        featuresList.appendChild(newLi);
      });
      info.appendChild(featuresList);
    } else {
      // Plain text with bullets: split by newline or • character
      const rawText = featuresCell.textContent.trim();
      const lines = rawText.split(/\n|•/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const featuresList = document.createElement('ul');
        featuresList.classList.add('product-features');
        lines.forEach((line) => {
          const li = document.createElement('li');
          li.textContent = line;
          featuresList.appendChild(li);
        });
        info.appendChild(featuresList);
      }
    }
  }

  // ── Actions: Qty + Add to Cart + Wishlist ──
  const actions = document.createElement('div');
  actions.classList.add('product-actions');

  // Quantity selector
  const qtyWrapper = document.createElement('div');
  qtyWrapper.classList.add('product-qty');
  qtyWrapper.innerHTML = `
    <button type="button" class="product-qty-btn product-qty-minus" aria-label="Decrease quantity">−</button>
    <input type="number" class="product-qty-input" value="1" min="1" max="99" aria-label="Quantity">
    <button type="button" class="product-qty-btn product-qty-plus" aria-label="Increase quantity">+</button>
  `;

  const minusBtn = qtyWrapper.querySelector('.product-qty-minus');
  const plusBtn = qtyWrapper.querySelector('.product-qty-plus');
  const qtyInput = qtyWrapper.querySelector('.product-qty-input');

  minusBtn.addEventListener('click', () => {
    const val = parseInt(qtyInput.value, 10);
    if (val > 1) qtyInput.value = val - 1;
  });

  plusBtn.addEventListener('click', () => {
    const val = parseInt(qtyInput.value, 10);
    if (val < 99) qtyInput.value = val + 1;
  });

  actions.appendChild(qtyWrapper);

  // ── Toast notification helper (scoped to this block) ──
  function showAddedToast(triggerEl) {
    // Remove any existing toast
    const existing = block.querySelector('.product-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.classList.add('product-toast');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Added to cart!</span>
    `;

    // Position toast near the button
    const actionsEl = triggerEl.closest('.product-actions');
    if (actionsEl) {
      actionsEl.appendChild(toast);
    } else {
      block.appendChild(toast);
    }

    // Animate in
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    // Auto-dismiss after 2.5 s
    setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2500);
  }

  // Add to Cart CTA — wired to cart module
  const ctaLink = addToCartCell?.querySelector('a');
  const ctaText = ctaLink?.textContent?.trim() || 'Add to Cart';

  const addToCart = document.createElement('button');
  addToCart.type = 'button';
  addToCart.classList.add('button', 'accent', 'product-add-to-cart');
  addToCart.textContent = ctaText;

  addToCart.addEventListener('click', () => {
    // Collect product data from the rendered info panel
    const currentImage = mainViewer.querySelector('img')?.src
      || mainViewer.querySelector('picture source')?.srcset
      || '';
    const qty = parseInt(qtyInput.value, 10) || 1;

    cartAddItem({
      sku: skuText || titleText || 'unknown',
      name: titleText || '',
      price: priceText || '0',
      quantity: qty,
      image: currentImage,
    });

    showAddedToast(addToCart);
  });

  actions.appendChild(addToCart);

  info.appendChild(actions);

  // ════════════════════════════════════════
  // ASSEMBLE
  // ════════════════════════════════════════

  block.innerHTML = '';
  const inner = document.createElement('div');
  inner.classList.add('product-details-inner');
  inner.appendChild(gallery);
  inner.appendChild(info);
  block.appendChild(inner);
}
