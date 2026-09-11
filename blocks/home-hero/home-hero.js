/**
 * Home Hero Block
 *
 * Expected document table structure (2 columns):
 * Row 1: [hero image]          | eyebrow text (e.g. "NEW SEASON · SS 2026")
 * Row 2: [h1 heading text]     |
 * Row 3: [subtitle paragraph]  |
 * Row 4: [Primary CTA link]    | [Secondary CTA link]
 *
 * The block renders a full-width split hero:
 * - Left panel: background image (50% width on desktop)
 * - Right panel: dark green brand background with eyebrow, h1, subtitle, and CTA buttons
 */

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // --- Extract content from table rows ---
  // Row 0: image (col 0) + eyebrow text (col 1)
  const imageRow = rows[0];
  const imageCell = imageRow?.querySelector(':scope > div:first-child');
  const eyebrowCell = imageRow?.querySelector(':scope > div:last-child');

  // Row 1: heading
  const headingRow = rows[1];
  // Row 2: subtitle
  const subtitleRow = rows[2];
  // Row 3: CTAs
  const ctaRow = rows[3];

  // --- Build picture / image panel ---
  const picture = imageCell?.querySelector('picture') || imageCell?.querySelector('img');
  const imagePanel = document.createElement('div');
  imagePanel.classList.add('home-hero-image');
  if (picture) {
    imagePanel.appendChild(picture);
  }

  // --- Build content panel ---
  const contentPanel = document.createElement('div');
  contentPanel.classList.add('home-hero-content');

  // Eyebrow
  const eyebrowText = eyebrowCell?.textContent?.trim();
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.classList.add('home-hero-eyebrow');
    eyebrow.textContent = eyebrowText;
    contentPanel.appendChild(eyebrow);
  }

  // Heading — promote first heading found, or wrap plain text in h1
  if (headingRow) {
    const existingHeading = headingRow.querySelector('h1, h2, h3');
    if (existingHeading) {
      const h1 = document.createElement('h1');
      h1.innerHTML = existingHeading.innerHTML;
      contentPanel.appendChild(h1);
    } else {
      const headingText = headingRow.querySelector(':scope > div')?.innerHTML;
      if (headingText) {
        const h1 = document.createElement('h1');
        h1.innerHTML = headingText;
        contentPanel.appendChild(h1);
      }
    }
  }

  // Subtitle
  if (subtitleRow) {
    const subtitleCell = subtitleRow.querySelector(':scope > div');
    if (subtitleCell) {
      const subtitle = document.createElement('p');
      subtitle.classList.add('home-hero-subtitle');
      subtitle.innerHTML = subtitleCell.innerHTML;
      contentPanel.appendChild(subtitle);
    }
  }

  // CTAs
  if (ctaRow) {
    const ctaCells = ctaRow.querySelectorAll(':scope > div');
    const ctaWrapper = document.createElement('div');
    ctaWrapper.classList.add('home-hero-ctas');

    ctaCells.forEach((cell, index) => {
      const link = cell.querySelector('a');
      if (link) {
        link.classList.add('button');
        link.classList.add(index === 0 ? 'primary' : 'secondary');
        ctaWrapper.appendChild(link);
      }
    });

    if (ctaWrapper.children.length > 0) {
      contentPanel.appendChild(ctaWrapper);
    }
  }

  // --- Assemble block ---
  block.innerHTML = '';
  const inner = document.createElement('div');
  inner.classList.add('home-hero-inner');
  inner.appendChild(imagePanel);
  inner.appendChild(contentPanel);
  block.appendChild(inner);
}
