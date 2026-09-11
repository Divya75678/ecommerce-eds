/**
 * Product Specs Block
 *
 * Renders collapsible accordion panels for product details, specifications,
 * shipping info, and material/care instructions.
 *
 * Document table structure (2 columns):
 * ──────────────────────────────────────────────────────
 * Row 0 (block name):  "Product Specs"  |  (empty)
 * Row 1+:              Panel label      |  Panel content
 * ──────────────────────────────────────────────────────
 *
 * Example rows:
 *   Details            | Full product description text…
 *   Specifications     | • Height: 45cm \n• Pot diameter: 14cm
 *   Shipping & returns | Free shipping on orders over $250…
 *   Material & Care    | Water once a week. Keep in indirect sunlight.
 *
 * Rendered output:
 *   .product-specs-inner
 *     .product-specs-item  (first item open by default)
 *       button.product-specs-trigger[aria-expanded="true"]
 *         span  (label text)
 *         svg   (chevron icon)
 *       div.product-specs-panel[hidden]
 *         div.product-specs-content
 *     .product-specs-item
 *       …
 */

const CHEVRON_SVG = `<svg class="product-specs-chevron" xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18">
  <polyline points="6 9 12 15 18 9"/>
</svg>`;

/**
 * Parse content cell — if it has a list, preserve it;
 * if plain text with bullet chars, convert to <ul>.
 * @param {HTMLElement} cell
 * @returns {HTMLElement} content wrapper div
 */
function parseContent(cell) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('product-specs-content');

  // If there's already a list element, use it directly
  const existingList = cell.querySelector('ul, ol');
  if (existingList) {
    wrapper.appendChild(existingList.cloneNode(true));
    // Also grab any text nodes/paragraphs before the list
    [...cell.children].forEach((child) => {
      if (child !== existingList && child.tagName !== 'UL' && child.tagName !== 'OL') {
        wrapper.insertBefore(child.cloneNode(true), wrapper.firstChild);
      }
    });
    return wrapper;
  }

  // If there are paragraph elements, clone them
  const paras = cell.querySelectorAll('p');
  if (paras.length > 0) {
    paras.forEach((p) => {
      const pText = p.textContent.trim();
      if (!pText) return;
      // Check if paragraph contains bullet-style text
      if (pText.includes('•') || pText.includes('\n')) {
        const lines = pText.split(/\n|•/).map((l) => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          const ul = document.createElement('ul');
          ul.classList.add('product-specs-list');
          lines.forEach((line) => {
            const li = document.createElement('li');
            li.textContent = line;
            ul.appendChild(li);
          });
          wrapper.appendChild(ul);
        } else {
          const newP = document.createElement('p');
          newP.innerHTML = p.innerHTML;
          wrapper.appendChild(newP);
        }
      } else {
        const newP = document.createElement('p');
        newP.innerHTML = p.innerHTML;
        wrapper.appendChild(newP);
      }
    });
    return wrapper;
  }

  // Fallback: raw text content
  const rawText = cell.textContent.trim();
  if (rawText.includes('•')) {
    const lines = rawText.split('•').map((l) => l.trim()).filter(Boolean);
    const ul = document.createElement('ul');
    ul.classList.add('product-specs-list');
    lines.forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      ul.appendChild(li);
    });
    wrapper.appendChild(ul);
  } else {
    const p = document.createElement('p');
    p.textContent = rawText;
    wrapper.appendChild(p);
  }

  return wrapper;
}

/**
 * Toggle an accordion panel
 * @param {HTMLButtonElement} trigger
 * @param {HTMLElement} panel
 * @param {boolean} forceOpen
 */
function togglePanel(trigger, panel, forceOpen) {
  const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  const open = forceOpen !== undefined ? forceOpen : !isOpen;

  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    panel.removeAttribute('hidden');
    // Animate height
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  } else {
    panel.style.maxHeight = '0';
    // Re-add hidden after transition ends for accessibility
    panel.addEventListener('transitionend', () => {
      if (trigger.getAttribute('aria-expanded') === 'false') {
        panel.setAttribute('hidden', '');
      }
    }, { once: true });
  }
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  const inner = document.createElement('div');
  inner.classList.add('product-specs-inner');

  rows.forEach((row, idx) => {
    const labelCell = row.querySelector(':scope > div:first-child');
    const contentCell = row.querySelector(':scope > div:last-child');

    if (!labelCell || labelCell === contentCell) return;

    const labelText = labelCell.textContent.trim();
    if (!labelText) return;

    const itemId = `product-specs-panel-${idx}`;
    const triggerId = `product-specs-trigger-${idx}`;

    // Item wrapper
    const item = document.createElement('div');
    item.classList.add('product-specs-item');

    // Trigger button
    const trigger = document.createElement('button');
    trigger.classList.add('product-specs-trigger');
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('id', triggerId);
    trigger.setAttribute('aria-controls', itemId);
    trigger.setAttribute('aria-expanded', idx === 0 ? 'true' : 'false');

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('product-specs-label');
    labelSpan.textContent = labelText;

    trigger.appendChild(labelSpan);
    trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

    // Panel
    const panel = document.createElement('div');
    panel.classList.add('product-specs-panel');
    panel.setAttribute('id', itemId);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);

    if (idx !== 0) {
      panel.setAttribute('hidden', '');
      panel.style.maxHeight = '0';
    }

    // Content
    const contentWrapper = parseContent(contentCell);
    panel.appendChild(contentWrapper);

    // Toggle interaction
    trigger.addEventListener('click', () => {
      togglePanel(trigger, panel);
      // Set max height correctly when opening
      if (trigger.getAttribute('aria-expanded') === 'true') {
        // Allow content to be visible first
        requestAnimationFrame(() => {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        });
      }
    });

    item.appendChild(trigger);
    item.appendChild(panel);
    inner.appendChild(item);

    // Open first panel height after DOM insertion
    if (idx === 0) {
      requestAnimationFrame(() => {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      });
    }
  });

  block.innerHTML = '';
  block.appendChild(inner);
}
