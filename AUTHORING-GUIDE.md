# AEM EDS Blocks — Authoring Guide

> **Project:** Verdant Ecommerce Storefront  
> **Blocks covered:** `home-hero` · `promo-grid` · `product-details` · `product-specs` · `related-products` · `checkout-summary`

---

## Table of Contents

1. [EDS Authoring Fundamentals](#1-eds-authoring-fundamentals)
2. [Home Hero Block](#2-home-hero-block)
3. [Promo Grid Block — Categories Variant](#3-promo-grid-block--categories-variant)
4. [Promo Grid Block — Products Variant](#4-promo-grid-block--products-variant)
5. [Image Guidelines](#5-image-guidelines)
6. [Do's and Don'ts](#6-dos-and-donts)
7. [Page Structure Example](#7-page-structure-example)
8. [Product Details Block (PDP)](#8-product-details-block-pdp)
9. [Product Specs Block (Accordion)](#9-product-specs-block-accordion)
10. [Related Products Block](#10-related-products-block)
11. [Full PDP Page Structure](#11-full-pdp-page-structure)
12. [Cart Block](#12-cart-block)
13. [Checkout Summary Block](#13-checkout-summary-block)

---

## 1. EDS Authoring Fundamentals

Adobe Experience Manager Edge Delivery Services (EDS) uses **Google Docs or Microsoft Word** as the authoring tool. Blocks are created using simple **tables** inside the document.

### How blocks work

| Concept | Description |
|---------|-------------|
| **Block name** | The first cell (top-left) of the table defines the block type |
| **Block variant** | Additional words in the first cell add modifier classes (e.g. `Promo Grid (categories)`) |
| **Rows** | Each table row below the header row represents a content unit (card, text row, etc.) |
| **Columns** | Columns within a row map to specific content fields |
| **Flat structure** | Blocks must **not** be nested inside other blocks |

### Creating a block in Google Docs

1. Place your cursor where the block should appear.
2. Go to **Insert → Table** and choose the required number of columns.
3. In the **top-left cell**, type the block name exactly as shown in this guide.
4. Fill in the remaining cells with content.
5. The block name is **case-insensitive** (e.g. `Home Hero` = `home-hero`).

---

## 2. Home Hero Block

The **Home Hero** block renders a full-width, split-panel hero section:
- **Left panel** — large fashion photograph
- **Right panel** — dark green brand background with eyebrow text, heading, subtitle, and CTA buttons

### Document Table Structure

The table has **2 columns** and **4 rows** (plus the block name header):

| Home Hero | |
|---|---|
| *(hero image)* | `NEW SEASON · SS 2026` |
| `Style That Moves With You` | |
| `Discover our new spring–summer collection. Premium fabrics, timeless cuts, and colours inspired by the natural world.` | |
| `[Shop Now](https://example.com/shop)` | `[View Lookbook](https://example.com/lookbook)` |

### Row-by-row breakdown

| Row | Column 1 | Column 2 |
|-----|----------|----------|
| **Row 0** (header) | `Home Hero` | *(empty — block name row)* |
| **Row 1** | Hero photograph (insert image) | Eyebrow text (e.g. `NEW SEASON · SS 2026`) |
| **Row 2** | Main heading text (becomes `<h1>`) | *(leave empty)* |
| **Row 3** | Subtitle / descriptive paragraph | *(leave empty)* |
| **Row 4** | Primary CTA hyperlink | Secondary CTA hyperlink |

### Step-by-step authoring instructions

**Step 1 — Insert the table**
- Insert a 2-column table.
- In the first row (block name row), type `Home Hero` in the left cell. Leave the right cell empty.

**Step 2 — Add the hero image (Row 1, Column 1)**
- Click into the left cell of Row 1.
- Go to **Insert → Image** and choose your hero photograph.
- Recommended image size: **900 × 640px** minimum, landscape or portrait orientation.
- The image will be used as the left visual panel.

**Step 3 — Add the eyebrow text (Row 1, Column 2)**
- In the right cell of Row 1, type the short season/label text.
- Example: `NEW SEASON · SS 2026`
- Keep it short (under 40 characters). Use all-caps for impact.

**Step 4 — Add the heading (Row 2, Column 1)**
- Type the main headline in the left cell of Row 2.
- This becomes the page's `<h1>` — use it for SEO-critical text.
- Example: `Style That Moves With You`
- Keep it under 60 characters for best rendering.

**Step 5 — Add the subtitle (Row 3, Column 1)**
- Type the supporting paragraph in the left cell of Row 3.
- 1–3 sentences is ideal.
- Example: `Discover our new spring–summer collection. Premium fabrics, timeless cuts, and colours inspired by the natural world.`

**Step 6 — Add CTA links (Row 4)**
- In the **left cell** of Row 4: type the primary button label and hyperlink it.
  - Select the text → Insert → Link → paste the URL → Apply.
  - Example: label = `Shop Now`, URL = `/collections/new-arrivals`
- In the **right cell** of Row 4: type the secondary button label and hyperlink it.
  - Example: label = `View Lookbook`, URL = `/pages/lookbook`

### Rendered output

```html
<section class="home-hero">
  <div class="home-hero-inner">
    <div class="home-hero-image">
      <picture>...</picture>
    </div>
    <div class="home-hero-content">
      <p class="home-hero-eyebrow">NEW SEASON · SS 2026</p>
      <h1>Style That Moves With You</h1>
      <p class="home-hero-subtitle">Discover our new spring–summer collection...</p>
      <div class="home-hero-ctas">
        <a href="/collections/new-arrivals" class="button primary">Shop Now</a>
        <a href="/pages/lookbook" class="button secondary">View Lookbook</a>
      </div>
    </div>
  </div>
</section>
```

### Variants & options

| Block name in doc | Visual result |
|---|---|
| `Home Hero` | Default split-panel layout |

> **Note:** There is only one variant of this block. To change the hero image or copy, edit the table cells directly.

---

## 3. Promo Grid Block — Categories Variant

The **Promo Grid (categories)** block renders the "Shop by Category" section:  
A responsive 4-column grid of image cards, each linking to a product category.

### Document Table Structure

The table has **4 columns**:

| Promo Grid (categories) | | | |
|---|---|---|---|
| `Shop by Category` | `[Shop all →](https://example.com/collections)` | | |
| *(Women image)* | `Women` | `120 items` | `[/collections/women](/collections/women)` |
| *(Men image)* | `Men` | `85 items` | `[/collections/men](/collections/men)` |
| *(Outerwear image)* | `Outerwear` | `42 items` | `[/collections/outerwear](/collections/outerwear)` |
| *(Accessories image)* | `Accessories` | `63 items` | `[/collections/accessories](/collections/accessories)` |

### Row-by-row breakdown

| Row | Col 1 | Col 2 | Col 3 | Col 4 |
|-----|-------|-------|-------|-------|
| **Row 0** (block name) | `Promo Grid (categories)` | *(empty)* | *(empty)* | *(empty)* |
| **Row 1** (section header) | Section heading text | "View all" link | *(empty)* | *(empty)* |
| **Row 2+** (cards) | Category photograph | Category name | Item count | Link URL |

### Step-by-step authoring instructions

**Step 1 — Insert the table**
- Insert a 4-column table.
- In the first row (block name row), type `Promo Grid (categories)` in the left cell. Leave the remaining cells empty.

> ⚠️ The variant name `categories` inside the parentheses is what activates the category card layout. Spelling must be exact.

**Step 2 — Add the section header (Row 1)**
- **Column 1:** Type the section heading, e.g. `Shop by Category`
- **Column 2:** Add a "view all" hyperlink, e.g. label `Shop all →` linking to `/collections`
- Leave Columns 3 and 4 empty.

**Step 3 — Add category cards (Row 2 onward)**

For each category, add one table row with:
- **Column 1:** Insert the category image (Insert → Image). Recommended: **400 × 500px**, portrait.
- **Column 2:** Category display name, e.g. `Women`
- **Column 3:** Number of items label, e.g. `120 items` (optional — leave empty to hide)
- **Column 4:** Hyperlink to the category page. You can either:
  - Type the URL path directly, e.g. `/collections/women`
  - Or insert a hyperlinked word, e.g. `[Women](/collections/women)`

**Step 4 — Add more categories**
- Repeat Step 3 for each category. Up to 8 cards are recommended (4 per row on desktop).

### Rendered card HTML

```html
<li class="promo-grid-card promo-grid-card--category">
  <a href="/collections/women" class="promo-grid-card-link" aria-label="Women">
    <div class="promo-grid-card-image">
      <picture>...</picture>
    </div>
    <div class="promo-grid-card-body">
      <h3 class="promo-grid-card-name">Women</h3>
      <p class="promo-grid-card-count">120 items</p>
      <span class="promo-grid-card-shoplink">Shop now →</span>
    </div>
  </a>
</li>
```

---

## 4. Promo Grid Block — Products Variant

The **Promo Grid (products)** block renders the "New Arrivals" or "Best Sellers" section:  
A responsive 4-column grid of product cards with image, badge, name, price, and "Add to Cart" button.

### Document Table Structure

The table has **5 columns**:

| Promo Grid (products) | | | | |
|---|---|---|---|---|
| `New Arrivals` | `[View all →](https://example.com/new-arrivals)` | | | |
| *(shirt image)* | `Linen Relaxed Shirt` | `NEW` | `$89.00` | `[/products/linen-shirt](/products/linen-shirt)` |
| *(trousers image)* | `Wide-Leg Trousers` | `NEW` | `$125.00` | `[/products/wide-leg-trousers](/products/wide-leg-trousers)` |
| *(dress image)* | `Oversized Blazer` | `SALE` | `$149.00` | `[/products/oversized-blazer](/products/oversized-blazer)` |
| *(coat image)* | `Knit Midi Dress` | `NEW` | `$220.00` | `[/products/knit-midi-dress](/products/knit-midi-dress)` |

### Row-by-row breakdown

| Row | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 |
|-----|-------|-------|-------|-------|-------|
| **Row 0** (block name) | `Promo Grid (products)` | *(empty)* | *(empty)* | *(empty)* | *(empty)* |
| **Row 1** (section header) | Section heading | "View all" link | *(empty)* | *(empty)* | *(empty)* |
| **Row 2+** (cards) | Product image | Product name | Badge (NEW / SALE) | Price | Product URL |

### Step-by-step authoring instructions

**Step 1 — Insert the table**
- Insert a 5-column table.
- In the first row (block name row), type `Promo Grid (products)` in the left cell. Leave remaining cells empty.

> ⚠️ The variant name `products` activates the product card layout with badge, price, and Add to Cart button.

**Step 2 — Add the section header (Row 1)**
- **Column 1:** Section heading, e.g. `New Arrivals` or `Best Sellers`
- **Column 2:** "View all" hyperlink, e.g. label `View all →` linking to `/collections/new`
- Leave Columns 3–5 empty.

**Step 3 — Add product cards (Row 2 onward)**

For each product, add one table row with:
- **Column 1:** Product image (Insert → Image). Recommended: **400 × 500px**, portrait.
- **Column 2:** Product name, e.g. `Linen Relaxed Shirt`
- **Column 3:** Badge label — type `NEW` or `SALE` (or leave empty for no badge)
- **Column 4:** Price string, e.g. `$89.00`
- **Column 5:** Hyperlink to the product page. Type the URL or insert a hyperlinked label.

### Badge options

| Text in Column 3 | Badge appearance |
|---|---|
| `NEW` | Dark green pill badge (top-left of image) |
| `SALE` | Red pill badge (top-left of image) |
| *(empty)* | No badge shown |

### Rendered card HTML

```html
<li class="promo-grid-card promo-grid-card--product">
  <div class="promo-grid-card-image">
    <picture>...</picture>
    <span class="promo-grid-badge promo-grid-badge--new">NEW</span>
    <button class="promo-grid-wishlist" aria-label="Add to wishlist">...</button>
  </div>
  <div class="promo-grid-card-body">
    <h3 class="promo-grid-card-name">Linen Relaxed Shirt</h3>
    <p class="promo-grid-card-price">$89.00</p>
    <a href="/products/linen-shirt" class="button promo-grid-cta">Add to Cart</a>
  </div>
</li>
```

---

## 5. Image Guidelines

| Block | Recommended dimensions | Format | Notes |
|---|---|---|---|
| Home Hero (left panel) | 900 × 640px minimum | JPG / WebP | Portrait or landscape; subject should be centre-top |
| Promo Grid — Category card | 400 × 500px | JPG / WebP | Portrait (4:5 aspect ratio) |
| Promo Grid — Product card | 400 × 500px | JPG / WebP | Portrait (3:4 aspect ratio); plain/neutral background preferred |

**General image tips:**
- Upload images to your EDS media library or DAM before referencing them in documents.
- Use descriptive file names for accessibility (e.g. `women-summer-collection.jpg`).
- Always add alt text: when inserting an image in Google Docs, right-click → Alt Text → enter a meaningful description.
- EDS automatically generates responsive `<picture>` elements with multiple breakpoints — always provide the largest source size.

---

## 6. Do's and Don'ts

### ✅ Do's

- **Use exact block names** — `Home Hero`, `Promo Grid (categories)`, `Promo Grid (products)`. Typos prevent blocks from loading.
- **Keep blocks flat** — never put a block table inside another block table.
- **Use hyperlinks for CTAs** — select text, Insert → Link, paste URL. Do not type raw URLs in CTA cells (they will render as text, not buttons).
- **Leave unused cells empty** — don't type placeholder text like "N/A" — empty is correct.
- **Use semantic heading text** — the Home Hero heading becomes the page `<h1>`. Make it meaningful for SEO.
- **Follow column order strictly** — the JS reads cells by position (0, 1, 2…). Swapping columns breaks the output.

### ❌ Don'ts

- **Don't nest blocks** — a table inside a table cell is not supported.
- **Don't add extra rows** to the block name row — the first row is always consumed as the block identifier.
- **Don't use rich formatting in non-heading cells** — bold/italic in category names or badge cells may cause unexpected output.
- **Don't skip the section header row** for Promo Grid — Row 1 must always be the section title row, even if you leave the "view all" cell empty.
- **Don't use the generic `Hero` block** for the home page hero — use `Home Hero` for the split-panel layout.
- **Don't exceed 8 cards per promo-grid** — for more products/categories, use pagination or a second block.

---

## 7. Page Structure Example

Below is a typical home page document structure using these blocks:

```
[Header block — handled separately]

┌─────────────────────────────────────────────┐
│  Home Hero                                  │
│  [fashion photo] │ NEW SEASON · SS 2026     │
│  Style That Moves With You                  │
│  Discover our new spring–summer collection. │
│  [Shop Now]      │ [View Lookbook]           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Promo Grid (categories)     │                      │
│  Shop by Category │ Shop all →│                     │
│  [Women img] │ Women  │ 120 items │ /collections/women  │
│  [Men img]   │ Men    │ 85 items  │ /collections/men    │
│  [Out img]   │ Outer  │ 42 items  │ /collections/outer  │
│  [Acc img]   │ Access │ 63 items  │ /collections/access │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Promo Grid (products)         │                             │
│  New Arrivals │ View all →     │                             │
│  [img] │ Linen Shirt  │ NEW  │ $89.00  │ /products/shirt     │
│  [img] │ Wide Trousers│ NEW  │ $125.00 │ /products/trousers  │
│  [img] │ Ovrsz Blazer │ SALE │ $149.00 │ /products/blazer    │
│  [img] │ Knit Dress   │ NEW  │ $220.00 │ /products/dress     │
└──────────────────────────────────────────────────────────────┘

[Footer block — handled separately]
```

---

## Troubleshooting

| Issue | Likely cause | Fix |
|---|---|---|
| Block shows as raw table | Block name typo | Check spelling: `Home Hero`, `Promo Grid (categories)`, `Promo Grid (products)` |
| Hero image not showing | Image not in Col 1 of Row 1 | Move image to first column of second table row |
| Cards not showing | Content rows start at wrong row | Ensure Row 1 is the section header; cards start at Row 2 |
| Only one CTA button shows | Second CTA link missing | Add a hyperlink in Column 2 of the CTA row |
| No badge on product card | Typo in badge column | Use exactly `NEW` or `SALE` (case-insensitive) |
| "View all" link missing | Wrong cell or no hyperlink | Link must be in Column 2 of Row 1; must be a hyperlink, not plain text |
| Layout looks broken on mobile | Custom CSS override | Check browser devtools for conflicting section-level styles |

---

---

## 8. Product Details Block (PDP)

The **Product Details** block renders the main PDP hero section — a two-column layout with an interactive image gallery on the left and the product information panel on the right.

**Left panel (gallery):**
- Large main image viewer
- Thumbnail strip (click to swap main image)

**Right panel (info):**
- Product title (`<h1>`)
- Star rating (rendered from a numeric value, e.g. `4.8`)
- Price
- SKU (stock-keeping unit identifier, e.g. `PLT-CAL-001`)
- Long description paragraph
- Key features bullet list
- Quantity selector (− / number / +)
- "Add to Cart" primary CTA (green button)

### Document Table Structure

The table has **7 columns** and **4 content rows** (plus the block name header):

| Product Details | | | | | | |
|---|---|---|---|---|---|---|
| *(img 1)* | *(img 2)* | *(img 3)* | `Calathea Runestad` | `4.8` | `$89.00` | `PLT-CAL-001` |
| | | | Long description text… | | | |
| | | | `• Air purifying \n• Easy to care for \n• Pet friendly` | | | |
| | | | `[Add to Cart](/cart)` | | | |

### Row-by-row breakdown

| Row | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Col 7 |
|-----|-------|-------|-------|-------|-------|-------|-------|
| **Row 0** (block name) | `Product Details` | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* |
| **Row 1** (images + meta) | Product image 1 | Product image 2 | Product image 3 | Product title | Rating (e.g. `4.8`) | Price (e.g. `$89.00`) | SKU (e.g. `PLT-CAL-001`) |
| **Row 2** (description) | *(empty)* | *(empty)* | *(empty)* | Long description paragraph | *(empty)* | *(empty)* | *(empty)* |
| **Row 3** (features) | *(empty)* | *(empty)* | *(empty)* | Key features (bullet list or `• item` text) | *(empty)* | *(empty)* | *(empty)* |
| **Row 4** (CTAs) | *(empty)* | *(empty)* | *(empty)* | Add to Cart link | *(empty)* | *(empty)* | *(empty)* |

### Step-by-step authoring instructions

**Step 1 — Insert the table**
- Insert a 7-column table.
- In the first row (block name row), type `Product Details` in the left cell. Leave all other cells empty.

**Step 2 — Add product images (Row 1, Columns 1–3)**
- Insert up to 3 product images. The first image becomes the default main image.
- Click thumbnail buttons to swap the main viewer image.
- Recommended size: **800 × 1000px**, portrait (4:5 ratio), neutral/white background.
- You can use 1, 2, or 3 images — unused image cells can be left empty.

**Step 3 — Add product title (Row 1, Column 4)**
- Type the product name, e.g. `Calathea Runestad`.
- This becomes the page `<h1>` — use SEO-optimised copy.

**Step 4 — Add rating (Row 1, Column 5)**
- Type a numeric rating value between `0` and `5`, e.g. `4.8`.
- Half-star increments are supported (e.g. `3.5`).
- Leave empty to hide the rating row entirely.

**Step 5 — Add price (Row 1, Column 6)**
- Type the price string, e.g. `$89.00` or `€95.00`.
- Include the currency symbol — no formatting is applied automatically.

**Step 6 — Add SKU (Row 1, Column 7)**
- Type the product SKU identifier, e.g. `PLT-CAL-001`.
- The SKU renders below the price as `SKU: PLT-CAL-001` in small muted text.
- Leave empty to hide the SKU field entirely.

**Step 7 — Add description (Row 2, Column 4)**
- Type the long product description paragraph.
- Standard paragraph text; HTML is not needed.

**Step 8 — Add key features (Row 3, Column 4)**
- Type each feature as a bullet-point list using Google Docs list formatting, **or**
- Type plain text using `•` characters separated by line breaks, e.g.:
  ```
  • Air purifying
  • Easy to care for
  • Pet friendly
  ```
- Each bullet item renders as a list item with a green dot.

**Step 9 — Add CTAs (Row 4)**
- **Column 4:** Hyperlink your Add to Cart label, e.g. label = `Add to Cart`, URL = `/cart`

### Rendered output (simplified)

```html
<div class="product-details-inner">
  <div class="product-gallery">
    <div class="product-gallery-main"><picture>...</picture></div>
    <div class="product-gallery-thumbs">
      <button class="product-gallery-thumb is-active">...</button>
      <button class="product-gallery-thumb">...</button>
    </div>
  </div>
  <div class="product-info">
    <h1 class="product-title">Calathea Runestad</h1>
    <div class="product-rating">
      <span class="product-rating-stars">★★★★½</span>
      <span class="product-rating-value">4.8</span>
    </div>
    <p class="product-price">$89.00</p>
    <p class="product-sku"><span class="product-sku-label">SKU:</span> <span class="product-sku-value">PLT-CAL-001</span></p>
    <hr class="product-divider">
    <p class="product-description">...</p>
    <ul class="product-features">
      <li>Air purifying</li>
      <li>Easy to care for</li>
    </ul>
    <div class="product-actions">
      <div class="product-qty">
        <button>−</button><input type="number" value="1"><button>+</button>
      </div>
      <a class="button accent product-add-to-cart" href="/cart">Add to Cart</a>
    </div>
  </div>
</div>
```

---

## 9. Product Specs Block (Accordion)

The **Product Specs** block renders a series of collapsible accordion panels below the main product details. Each panel can hold a label (e.g. "Specifications") and any content (paragraphs, bullet lists).

The first panel is open by default. Clicking any panel header toggles it open/closed with a smooth animation.

### Document Table Structure

The table has **2 columns**:

| Product Specs | |
|---|---|
| `Details` | Full product description or highlights text... |
| `Specifications` | `• Height: 45cm` `• Pot diameter: 14cm` `• Light: Indirect` |
| `Shipping & returns` | Free shipping on orders over $250. Returns accepted within 30 days. |
| `Material & Care` | Water once a week. Keep in indirect sunlight. Wipe leaves with a damp cloth. |

### Row-by-row breakdown

| Row | Col 1 (accordion label) | Col 2 (accordion content) |
|-----|------------------------|--------------------------|
| **Row 0** (block name) | `Product Specs` | *(empty)* |
| **Row 1+** | Panel heading text | Panel body content (paragraph or list) |

### Step-by-step authoring instructions

**Step 1 — Insert the table**
- Insert a 2-column table.
- In the first row (block name row), type `Product Specs` in the left cell. Leave the right cell empty.

**Step 2 — Add accordion rows**
- For each accordion panel, add one table row:
  - **Column 1:** Panel label, e.g. `Details`, `Specifications`, `Shipping & returns`, `Material & Care`.
  - **Column 2:** Panel content — paragraph text, or a bullet list created via Google Docs list formatting.

**Step 3 — Order panels**
- The first row of content is **always open by default**.
- Reorder rows in the table to change which panel appears first.

**Step 4 — Bullet content in specs**
- In Column 2, you can use Google Docs bullet lists **or** type `•` characters inline:
  ```
  • Height: 45cm
  • Pot diameter: 14cm
  • Suitable light: Indirect
  ```

### Rendered output

```html
<div class="product-specs-inner">
  <div class="product-specs-item">
    <button class="product-specs-trigger" aria-expanded="true">
      <span class="product-specs-label">Details</span>
      <svg class="product-specs-chevron">...</svg>
    </button>
    <div class="product-specs-panel">
      <div class="product-specs-content">
        <p>Full description text...</p>
      </div>
    </div>
  </div>
  <div class="product-specs-item">
    <button class="product-specs-trigger" aria-expanded="false">
      <span class="product-specs-label">Specifications</span>
      <svg class="product-specs-chevron">...</svg>
    </button>
    <div class="product-specs-panel" hidden>
      <div class="product-specs-content">
        <ul><li>Height: 45cm</li>...</ul>
      </div>
    </div>
  </div>
</div>
```

---

## 10. Related Products Block

The **Related Products** block renders a horizontal row of product-teaser cards for cross-sell and upsell purposes. Visual style matches the `Promo Grid (products)` cards — image, badge, name, price, and "Add to Cart" button.

### Document Table Structure

The table has **5 columns**:

| Related Products | | | | |
|---|---|---|---|---|
| `You May Also Like` | | | | |
| *(plant img)* | `Bird of Paradise` | `NEW` | `$95.00` | `[/products/bird-of-paradise](/products/bird-of-paradise)` |
| *(plant img)* | `Fiddle Leaf Fig` | | `$120.00` | `[/products/fiddle-leaf](/products/fiddle-leaf)` |
| *(plant img)* | `Monstera Deliciosa` | `SALE` | `$65.00` | `[/products/monstera](/products/monstera)` |
| *(plant img)* | `Peace Lily` | `NEW` | `$45.00` | `[/products/peace-lily](/products/peace-lily)` |

### Row-by-row breakdown

| Row | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 |
|-----|-------|-------|-------|-------|-------|
| **Row 0** (block name) | `Related Products` | *(empty)* | *(empty)* | *(empty)* | *(empty)* |
| **Row 1** (section title) | Section heading text | *(empty)* | *(empty)* | *(empty)* | *(empty)* |
| **Row 2+** (cards) | Product image | Product name | Badge (NEW / SALE or empty) | Price | Product page URL |

### Step-by-step authoring instructions

**Step 1 — Insert the table**
- Insert a 5-column table.
- In the first row (block name row), type `Related Products` in the left cell. Leave all other cells empty.

**Step 2 — Add the section title (Row 1)**
- In Column 1 of Row 1, type the section heading, e.g. `You May Also Like` or `Complete the Look`.
- Leave Columns 2–5 empty.

**Step 3 — Add product cards (Row 2 onward)**
- For each related product, add one row:
  - **Column 1:** Product image (Insert → Image). Recommended: **400 × 500px**, portrait.
  - **Column 2:** Product name, e.g. `Bird of Paradise`
  - **Column 3:** Badge — type `NEW` or `SALE`, or leave empty for no badge.
  - **Column 4:** Price string, e.g. `$95.00`
  - **Column 5:** Hyperlink to the product page URL.

**Step 4 — Recommended number of cards**
- 3–4 cards is ideal for most screens.
- Up to 8 cards are supported; beyond 4, cards scroll/wrap on smaller screens.

### Badge options

| Text in Column 3 | Badge appearance |
|---|---|
| `NEW` | Dark green pill badge (top-left of card image) |
| `SALE` | Red pill badge (top-left of card image) |
| *(empty)* | No badge |

### Rendered card HTML

```html
<li class="related-products-card">
  <div class="related-products-card-image">
    <picture>...</picture>
    <span class="related-products-badge related-products-badge--new">NEW</span>
    <button class="related-products-wishlist" aria-label="Add to wishlist">...</button>
  </div>
  <div class="related-products-card-body">
    <h3 class="related-products-card-name">Bird of Paradise</h3>
    <p class="related-products-card-price">$95.00</p>
    <a href="/products/bird-of-paradise" class="button related-products-cta">Add to Cart</a>
  </div>
</li>
```

---

## 11. Full PDP Page Structure

Below is a complete product detail page document structure:

```
[Header block — auto-loaded from /nav]

┌─────────────────────────────────────────────────────────────────────┐
│  Product Details                                                    │
│  [img1] [img2] [img3] │ Calathea Runestad │ 4.8 │ $89.00 │ PLT-CAL-001 │
│                       │ Long description paragraph…                │
│                       │ • Air purifying • Easy care • Pet friendly │
│                       │ [Add to Cart]                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Product Specs                                                      │
│  Details            │ Full product text…                           │
│  Specifications     │ • Height: 45cm • Pot: 14cm                  │
│  Shipping & returns │ Free shipping on orders over $250…           │
│  Material & Care    │ Water weekly. Indirect sunlight.             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Related Products                                                   │
│  You May Also Like                                                  │
│  [img] │ Bird of Paradise │ NEW  │ $95.00 │ /products/bird         │
│  [img] │ Fiddle Leaf Fig  │      │ $120.00│ /products/fiddle       │
│  [img] │ Monstera         │ SALE │ $65.00 │ /products/monstera     │
│  [img] │ Peace Lily       │ NEW  │ $45.00 │ /products/peace-lily   │
└─────────────────────────────────────────────────────────────────────┘

[Footer block — auto-loaded from /footer]
```

### PDP Troubleshooting

| Issue | Likely cause | Fix |
|---|---|---|
| Gallery not showing / broken | Images not in Columns 1–3 of Row 1 | Move all product images to the first 3 columns of the first content row |
| Rating stars not showing | Rating cell empty or non-numeric | Enter a number like `4.8` in Column 5 of Row 1 |
| Price missing | Price in wrong column | Price must be in Column 6 of Row 1 |
| Features show as plain text (no bullets) | Features row empty or in wrong row | Put feature text in Row 3, Column 4; use `•` bullets or Google Docs list format |
| Accordion panel doesn't open | JavaScript error | Check browser console; ensure `Product Specs` block name is spelled correctly |
| Accordion shows all panels open | CSS not loaded | Verify `product-specs.css` is present in `blocks/product-specs/` |
| Related products cards not showing | Wrong row structure | Row 1 must be the section title; product cards start at Row 2 |
| Add to Cart button missing | CTA link not authored | In Row 4, Column 4, add a hyperlinked label (e.g. `Add to Cart` → `/cart`) |
| SKU not showing | SKU cell empty or in wrong column | Enter the SKU text in Column 7 of Row 1; leave empty to hide |

---

## 5. Image Guidelines

| Block | Recommended dimensions | Format | Notes |
|---|---|---|---|
| Home Hero (left panel) | 900 × 640px minimum | JPG / WebP | Portrait or landscape; subject should be centre-top |
| Promo Grid — Category card | 400 × 500px | JPG / WebP | Portrait (4:5 aspect ratio) |
| Promo Grid — Product card | 400 × 500px | JPG / WebP | Portrait (3:4 aspect ratio); plain/neutral background preferred |
| Product Details — Main gallery | 800 × 1000px | JPG / WebP | Portrait (4:5); neutral/white background; subject centred |
| Product Details — Thumbnails | 400 × 500px | JPG / WebP | Same source images as main; EDS generates responsive sizes |
| Related Products — Card | 400 × 500px | JPG / WebP | Portrait (3:4 aspect ratio); plain background preferred |

**General image tips:**
- Upload images to your EDS media library or DAM before referencing them in documents.
- Use descriptive file names for accessibility (e.g. `calathea-runestad-main.jpg`).
- Always add alt text: when inserting an image in Google Docs, right-click → Alt Text → enter a meaningful description.
- EDS automatically generates responsive `<picture>` elements with multiple breakpoints — always provide the largest source size.

---

## 12. Cart Block

The **Cart** block powers the full shopping cart page at `/cart`. It reads its labels, headings, and navigation URLs from an authored configuration table — so content authors can customise all text and links without touching code.

**What it renders:**
- **Empty state** — bag illustration, heading, description, and a "Start Shopping" CTA when there are no items.
- **Cart items column** — line items showing product image, name, unit price, SKU, quantity stepper (− / number / +), line total, and a remove button.
- **Order summary sidebar** — subtotal, shipping placeholder, estimated total, "Proceed to Checkout" primary CTA, and "Continue Shopping" secondary CTA.

All cart data (items, quantities, totals) comes from `localStorage` via `scripts/cart.js`. The block re-renders automatically whenever items are added, removed, or updated from anywhere on the site (PDP "Add to Cart" button, mini-cart, or another browser tab).

---

### Document Table Structure

The table has **2 columns** and up to **8 configuration rows**:

| Cart | |
|---|---|
| `Continue Shopping URL` | `/category/all` |
| `Checkout URL` | `/checkout` |
| `Empty State Message` | `Your cart is empty` |
| `Empty State CTA Label` | `Start Shopping` |
| `Cart Heading` | `Shopping Cart` |
| `Summary Heading` | `Order Summary` |
| `Checkout Label` | `Proceed to Checkout` |
| `Continue Label` | `Continue Shopping` |

---

### Row-by-row breakdown

| Row | Column 1 (key) | Column 2 (value) | Default if omitted |
|-----|----------------|------------------|--------------------|
| **Row 0** (block name) | `Cart` | *(empty)* | — |
| **Row 1** | `Continue Shopping URL` | URL path to return to (e.g. `/category/all`) | `/category/all` |
| **Row 2** | `Checkout URL` | URL for the checkout page (e.g. `/checkout`) | `/checkout` |
| **Row 3** | `Empty State Message` | Heading shown when cart is empty | `Your cart is empty` |
| **Row 4** | `Empty State CTA Label` | Button label in empty state | `Start Shopping` |
| **Row 5** | `Cart Heading` | "Shopping Cart" heading in the items column | `Shopping Cart` |
| **Row 6** | `Summary Heading` | "Order Summary" heading in the sidebar | `Order Summary` |
| **Row 7** | `Checkout Label` | Primary CTA button text | `Proceed to Checkout` |
| **Row 8** | `Continue Label` | Secondary CTA button text | `Continue Shopping` |

> All rows are **optional** — every key has a sensible default. You only need to author the rows you want to customise.

---

### Step-by-step authoring instructions

**Step 1 — Create the cart page**
- Create a new document (Google Doc or HTML page) at the path `/cart`.
- This page should contain **only the Cart block** in `<main>` (plus the standard header/footer auto-loaded from `/nav` and `/footer`).

**Step 2 — Insert the table**
- Insert a **2-column table**.
- In the first row (block name row), type `Cart` in the left cell. Leave the right cell empty.

**Step 3 — Add configuration rows**
- For each setting you want to customise, add a new table row:
  - **Column 1:** The configuration key, exactly as shown in the table above (e.g. `Continue Shopping URL`).
  - **Column 2:** The value — a URL path, or plain text for labels and messages.

**Step 4 — URL values**
- For URL fields (`Continue Shopping URL`, `Checkout URL`), you can either:
  - Type the path directly: `/category/all`
  - Or insert a hyperlink: select text → Insert → Link → paste the URL.
- Relative paths (`/category/all`) are recommended over absolute URLs.

**Step 5 — Skip rows you don't need**
- Any configuration key you omit will fall back to its default value.
- For a minimal setup, you only need to author the two URL rows (Row 1 and Row 2).

---

### Minimal authoring example

For most stores the only rows needed are the two URL overrides:

| Cart | |
|---|---|
| `Continue Shopping URL` | `/products` |
| `Checkout URL` | `/checkout` |

---

### Rendered output (simplified)

**Empty state (no items in cart):**
```html
<div class="cart-empty">
  <div class="cart-empty-icon"><!-- bag SVG --></div>
  <h2 class="cart-empty-title">Your cart is empty</h2>
  <p class="cart-empty-desc">Looks like you haven't added anything yet.</p>
  <a href="/category/all" class="button accent">Start Shopping</a>
</div>
```

**Cart with items:**
```html
<div class="cart-content">
  <div class="cart-items">
    <div class="cart-items-header">
      <span class="cart-items-heading">Shopping Cart</span>
      <span class="cart-items-count">2 items</span>
    </div>
    <div class="cart-line-item">
      <div class="cart-line-image"><img src="..." alt="..."></div>
      <div class="cart-line-details">
        <p class="cart-line-name">Calathea Runestad</p>
        <p class="cart-line-unit-price">$89.00</p>
        <p class="cart-line-sku">SKU: PLT-CAL-001</p>
      </div>
      <div class="cart-line-qty">
        <button>−</button><input type="number" value="2"><button>+</button>
      </div>
      <p class="cart-line-total">$178.00</p>
      <button class="cart-line-remove"><!-- trash icon --></button>
    </div>
  </div>
  <div class="cart-summary">
    <div class="cart-summary-inner">
      <h2 class="cart-summary-title">Order Summary</h2>
      <!-- subtotal, shipping, estimated total rows -->
      <a href="/checkout" class="button accent cart-checkout-btn">Proceed to Checkout</a>
      <a href="/category/all" class="button secondary cart-continue-btn">Continue Shopping</a>
    </div>
  </div>
</div>
```

---

### Cart Troubleshooting

| Issue | Likely cause | Fix |
|---|---|---|
| Cart shows empty even after adding items | `localStorage` blocked or different origin | Check browser privacy settings; ensure page is served from the same origin as the PDP |
| "Proceed to Checkout" goes to wrong URL | `Checkout URL` row not authored or typo | Check Column 2 of the `Checkout URL` row; value must be a valid path |
| "Continue Shopping" goes to wrong page | `Continue Shopping URL` not authored | Add the row with the correct path in Column 2 |
| Empty state message not customised | `Empty State Message` row missing | Add the row with your custom message text |
| Quantities don't update | JavaScript error | Open browser console; ensure `scripts/cart.js` is accessible at that path |
| Cart doesn't reflect items added on PDP | Browser tab mismatch | Both pages must run from the same origin; check for `localStorage` errors in console |
| Block renders as raw table | Block name typo | Ensure the first cell says exactly `Cart` |

---

*Last updated: SS 2026 · Verdant Storefront — Phase 3 PDP*

---

## 13. Checkout Summary Block

The **Checkout Summary** block powers the read-only order review page at `/checkout`. It renders the same cart items that are in `localStorage` — but without quantity steppers or remove buttons — alongside an order totals panel and a "What happens next?" info callout. There is no payment form on this page.

**What it renders:**
- **Empty state** — bag illustration, heading, and a "Continue Shopping" CTA when the cart is empty.
- **Order items column** — read-only line items showing product image, name, unit price, SKU, and quantity. No edit controls.
- **Order totals sidebar** — subtotal, shipping, and grand total.
- **Next Steps panel** — a green-accented info callout with a configurable heading and body text.

All cart data comes from `localStorage` via `scripts/cart.js`. Totals update automatically if the cart changes in another browser tab.

---

### Document Table Structure

The table has **2 columns** and up to **6 configuration rows**:

| Checkout Summary | |
|---|---|
| `Order Heading` | `Review Your Order` |
| `Summary Heading` | `Order Total` |
| `Shipping Label` | `Free` |
| `Next Steps Heading` | `What happens next?` |
| `Next Steps Text` | `You'll receive a confirmation email shortly. Our team will process your order within 1–2 business days.` |
| `Continue Shopping URL` | `/category/all` |

---

### Row-by-row breakdown

| Row | Column 1 (key) | Column 2 (value) | Default if omitted |
|-----|----------------|------------------|--------------------|
| **Row 0** (block name) | `Checkout Summary` | *(empty)* | — |
| **Row 1** | `Order Heading` | Heading shown above the list of items | `Review Your Order` |
| **Row 2** | `Summary Heading` | Heading shown above the totals panel | `Order Total` |
| **Row 3** | `Shipping Label` | Shipping row value in totals. Type `Free` to show in green; any other text shows as-is | `Free` |
| **Row 4** | `Next Steps Heading` | Heading inside the info callout panel | `What happens next?` |
| **Row 5** | `Next Steps Text` | Body text inside the info callout panel | `You'll receive a confirmation email shortly. Our team will process your order within 1–2 business days.` |
| **Row 6** | `Continue Shopping URL` | URL for the "Continue Shopping" link shown in the empty state | `/category/all` |

> All rows are **optional** — every key has a sensible default. You only need to author the rows you want to customise.

---

### Step-by-step authoring instructions

**Step 1 — Create the checkout page**
- Create a new document (Google Doc or HTML page) at the path `/checkout`.
- This page should contain **only the Checkout Summary block** in `<main>` (plus the standard header/footer auto-loaded from `/nav` and `/footer`).
- Do **not** include a Cart block on this page — the Checkout Summary block reads the same `localStorage` cart data independently.

**Step 2 — Insert the table**
- Insert a **2-column table**.
- In the first row (block name row), type `Checkout Summary` in the left cell. Leave the right cell empty.

> ⚠️ The block name must be exactly `Checkout Summary` (two words, capital C and capital S). A typo will cause the block to render as a raw table.

**Step 3 — Add the Order Heading (Row 1)**
- **Column 1:** `Order Heading`
- **Column 2:** The heading displayed above the read-only item list, e.g. `Review Your Order` or `Your Order`.

**Step 4 — Add the Summary Heading (Row 2)**
- **Column 1:** `Summary Heading`
- **Column 2:** The heading displayed above the totals panel, e.g. `Order Total` or `Order Summary`.

**Step 5 — Set the Shipping Label (Row 3)**
- **Column 1:** `Shipping Label`
- **Column 2:** One of:
  - `Free` — renders the word "Free" in brand green in the totals panel, and uses `$0.00` when calculating the grand total.
  - Any other string (e.g. `Calculated at next step`) — renders that text as muted italic, and the grand total equals the subtotal.

**Step 6 — Add the Next Steps Heading (Row 4)**
- **Column 1:** `Next Steps Heading`
- **Column 2:** The bold heading inside the green-accented callout panel, e.g. `What happens next?`.

**Step 7 — Add the Next Steps Text (Row 5)**
- **Column 1:** `Next Steps Text`
- **Column 2:** The body paragraph inside the callout panel. Keep it to 1–3 sentences.
- Example: `You'll receive a confirmation email shortly. Our team will process your order within 1–2 business days.`

**Step 8 — Set the Continue Shopping URL (Row 6)**
- **Column 1:** `Continue Shopping URL`
- **Column 2:** The URL path shown as a fallback CTA when the cart is empty, e.g. `/category/all` or `/products`.
- You can type the path directly or insert a hyperlink.

---

### Minimal authoring example

For stores that only need to change the shipping label:

| Checkout Summary | |
|---|---|
| `Shipping Label` | `Calculated at next step` |

---

### Shipping Label options

| Value in Column 2 | Totals panel display | Grand total calculation |
|---|---|---|
| `Free` | "Free" in brand green | `subtotal + $0` |
| Any other text | Rendered as muted italic | Equal to subtotal |

---

### Rendered output (simplified)

**Empty state (cart has no items):**
```html
<div class="checkout-summary-empty">
  <div class="cart-empty-icon"><!-- bag SVG --></div>
  <h2 class="cart-empty-title">Your cart is empty</h2>
  <p class="cart-empty-desc">Add items to your cart before checking out.</p>
  <a href="/category/all" class="button accent">Continue Shopping</a>
</div>
```

**With items:**
```html
<div class="checkout-summary-content">

  <!-- Items column (left) -->
  <div class="checkout-items-col">
    <div class="checkout-items-header">
      <span class="checkout-items-heading">Review Your Order</span>
      <span class="checkout-items-badge">2 items</span>
    </div>
    <!-- desktop column labels -->
    <div class="cart-col-labels">
      <span>Product</span>
      <span class="cart-col-total">Total</span>
    </div>
    <!-- read-only line item -->
    <div class="cart-line-item checkout-line-item">
      <div class="cart-line-image"><img src="..." alt="..."></div>
      <div class="cart-line-details">
        <p class="cart-line-name">Calathea Runestad</p>
        <p class="cart-line-unit-price">$89.00</p>
        <p class="cart-line-sku">SKU: PLT-CAL-001</p>
        <p class="cart-line-qty-label">Qty: <strong>2</strong></p>
      </div>
      <p class="cart-line-total">$178.00</p>
      <!-- no qty stepper, no remove button -->
    </div>
  </div>

  <!-- Sidebar (right) -->
  <div class="checkout-sidebar">

    <!-- Totals panel -->
    <div class="checkout-totals">
      <div class="cart-summary-inner">
        <h2 class="cart-summary-title">Order Total</h2>
        <div class="cart-summary-rows">
          <div class="cart-summary-row">
            <span class="cart-summary-label">Subtotal</span>
            <span class="cart-summary-value checkout-subtotal">$178.00</span>
          </div>
          <div class="cart-summary-row">
            <span class="cart-summary-label">Shipping</span>
            <span class="cart-summary-value checkout-shipping">
              <span class="checkout-shipping-free">Free</span>
            </span>
          </div>
          <div class="cart-summary-row cart-summary-total-row">
            <span class="cart-summary-label">Total</span>
            <span class="cart-summary-value checkout-grand-total">$178.00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Next Steps callout -->
    <div class="checkout-next-steps">
      <div class="checkout-next-steps-icon"><!-- info SVG --></div>
      <div class="checkout-next-steps-body">
        <h3 class="checkout-next-steps-heading">What happens next?</h3>
        <p class="checkout-next-steps-text">
          You'll receive a confirmation email shortly…
        </p>
      </div>
    </div>

  </div>
</div>
```

---

### Checkout page structure example

```
[Header block — auto-loaded from /nav]

┌───────────────────────────────────────────────────────────────┐
│  Checkout Summary                     │                       │
│  Order Heading        │ Review Your Order                     │
│  Summary Heading      │ Order Total                           │
│  Shipping Label       │ Free                                  │
│  Next Steps Heading   │ What happens next?                    │
│  Next Steps Text      │ You'll receive a confirmation email…  │
│  Continue Shopping URL│ /category/all                         │
└───────────────────────────────────────────────────────────────┘

Renders as:

┌──────────────────────────────────┬──────────────────────┐
│ Review Your Order        2 items │  Order Total         │
│ ─────────────────────────────────│  Subtotal   $178.00  │
│ [img] Calathea Runestad          │  Shipping   Free     │
│       $89.00 · SKU: PLT-CAL-001  │  ──────────────────  │
│       Qty: 2              $178.00│  Total      $178.00  │
│ ─────────────────────────────────│                      │
│ [img] Fiddle Leaf Fig            │ ╔══════════════════╗ │
│       $95.00 · SKU: PLT-FLF-002  │ ║ ℹ What happens  ║ │
│       Qty: 1               $95.00│ ║   next?         ║ │
│                                  │ ║ You'll receive  ║ │
│                                  │ ║ a confirmation… ║ │
│                                  │ ╚══════════════════╝ │
└──────────────────────────────────┴──────────────────────┘

[Footer block — auto-loaded from /footer]
```

---

### Checkout Summary Troubleshooting

| Issue | Likely cause | Fix |
|---|---|---|
| Block renders as raw table | Block name typo | First cell must be exactly `Checkout Summary` |
| Page shows empty state even after adding items | Cart items in `localStorage` not found | Ensure the `/checkout` page is served from the same origin as the cart and PDP pages |
| Totals show `$0.00` | Cart is empty | Add items via the PDP "Add to Cart" button before navigating to `/checkout` |
| Shipping shows as muted italic instead of green | `Shipping Label` value is not `Free` | Change the value to exactly `Free` (case-insensitive) |
| Grand total doesn't include shipping cost | By design — shipping is a placeholder | Shipping costs are resolved at the payment step (outside scope of this block) |
| Next Steps panel text not customised | `Next Steps Text` row not authored | Add the row with your custom paragraph text in Column 2 |
| Items show remove button or qty stepper | CSS not loaded | Verify `checkout-summary.css` is present in `blocks/checkout-summary/` |
| Totals don't update after changing cart in another tab | Expected behaviour — full re-render | Navigate away and back to `/checkout`, or refresh the page |

---

*Last updated: SS 2026 · Verdant Storefront — Phase 4 Checkout*
