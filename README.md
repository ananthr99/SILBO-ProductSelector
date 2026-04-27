# Product Selector — Invendis Technologies

A browser-based product catalogue for Invendis Technologies, allowing customers to browse, filter, search, and compare the full range of Invendis products (routers, gateways, switches, energy meters, and accessories).

No framework, no build step. Open `index.html` directly in a browser.

---

## What it does

- **Browse** all products in grid or list view, paginated 12 per page
- **Filter** by category tab, cellular generation, Wi-Fi standard, port count, and serial interface (RS485/RS232)
- **Search** by name, model, description, or CPU keyword
- **Compare** up to 3 products side-by-side in a spec table (differences highlighted)
- **Detail modal** — click any product to see its image carousel, typical use cases, full specs, and product variants table
- **Enquire** — mailto link pre-filled with the product name goes directly to sales@invendis.com

---

## Project structure

```
ProductSelector/
├── index.html              — Page markup, filter controls, script loading order
├── styles.css              — All styling (layout, cards, modal, chips, responsive)
├── products.js             — Product data (PRODUCTS_DATA array, one object per product)
├── js/
│   ├── config.js           — Global constants (CATS, PAGE_SIZE) and mutable state variables
│   ├── data.js             — Product image paths (PRODUCT_IMAGES) and use case labels (PRODUCT_USE_CASES)
│   ├── utils.js            — Pure helper functions: catBadgeClass, wifiLabel, srow
│   ├── filters.js          — Filtering logic: getFiltered, hasActiveFilters, setCat, clearFilters
│   ├── render.js           — All DOM rendering: render, renderGrid, renderList, renderPagination, buildCatTabs, setView, goPage
│   ├── compare.js          — Compare feature: toggleCompare, updateCompareTray, clearCompare, openCompareModal
│   ├── modal.js            — Product detail modal: openDetail, closeModal, buildImageCarousel, navigateCarousel, buildVariantsTable
│   └── main.js             — Bootstrap: seeds PRODUCTS from PRODUCTS_DATA and calls render()
└── assets/
    ├── invendis_logo.png
    ├── silbo_logo.png
    └── images/             — One or more product images per model (PNG/JPG)
```

Scripts are loaded in the order listed above. Each file depends only on globals declared by earlier files — no bundler needed.

---

## How to make common changes

### Add a new product
1. **`products.js`** — Add a new object to the `PRODUCTS_DATA` array. Follow the existing schema:
   ```js
   {
     id: 'unique-id',       // kebab-case, used as the key everywhere
     name: 'Display Name',
     cat: 'Router',         // must be one of: Router, Gateway, Switch, Energy Meter, Other
     cpu: '...',
     ram: '...',
     storage: '...',
     cell: '...',           // human-readable cellular description
     cellular_gen: '5G',    // '5G' | '4G' | 'none'
     wifi: 'WiFi6',         // 'WiFi6' | 'WiFi5' | 'WiFi24' | 'none'
     rs485: true,
     rs232: false,
     ip: 'IP67',
     power: '...',
     ports: 5,              // total Ethernet port count
     os: '...',
     desc: 'Short description shown on the card',
     housing: '...',
     dims: '...',
     weight: '...',
     op_temp: '...',
     variants: {            // optional — omit if no variants table needed
       note: 'Optional note above the table',
       headers: ['Col1', 'Col2', 'Part No.'],
       rows: [['val', 'val', 'PART-001']]
     }
   }
   ```
2. **`js/data.js`** — Add the product image(s) to `PRODUCT_IMAGES` and use cases to `PRODUCT_USE_CASES`:
   ```js
   'unique-id': ['assets/images/filename.png'],
   ```
3. **`assets/images/`** — Drop the product image file(s) here.

### Add or change a product image
Edit `PRODUCT_IMAGES` in **`js/data.js`**. Each key is a product `id`; the value is an array of image paths. Multiple images enable the carousel in the detail modal.

### Edit use cases
Edit `PRODUCT_USE_CASES` in **`js/data.js`**. Each product has an array of short label strings. The first 2 are shown as chips on the grid card; all of them appear in the detail modal.

### Add a new filter
1. Add the `<select>` control in **`index.html`** (follow existing pattern, call `render()` on change).
2. Add the filter logic inside `getFiltered()` in **`js/filters.js`**.
3. Add the filter ID to the `hasActiveFilters()` check and the `clearFilters()` reset in **`js/filters.js`**.

### Add a new product category
Add the category string to the `CATS` array in **`js/config.js`** and add a colour class for it in **`styles.css`** (follow the `.b-router`, `.b-gateway` pattern). Also add it to the `catBadgeClass` map in **`js/utils.js`**.

### Change modal layout or spec sections
Edit `openDetail()` in **`js/modal.js`**.

### Change card or list row layout
Edit `renderGrid()` or `renderList()` in **`js/render.js`**.

### Change styling
Everything visual is in **`styles.css`**. Key sections are marked with comments:
- Card layout and chips → search `.card`, `.card-use-cases`, `.use-case-chip-sm`
- Modal → search `.modal`, `.modal-use-cases`, `.modal-body`
- Compare tray → search `.compare-tray`
- Pagination → search `.pagination`

---

## Product data schema reference

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique key used across all maps in `js/data.js` |
| `name` | string | Displayed on cards and in modals |
| `cat` | string | One of: `Router`, `Gateway`, `Switch`, `Energy Meter`, `Other` |
| `cellular_gen` | string | `'5G'`, `'4G'`, or `'none'` — drives cellular filter |
| `wifi` | string | `'WiFi6'`, `'WiFi5'`, `'WiFi24'`, or `'none'` — drives Wi-Fi filter |
| `rs485` / `rs232` | boolean | Drives serial filter |
| `ports` | number | Total Ethernet port count — drives port count filter |
| `variants` | object \| undefined | Optional variants table; omit the field entirely if not needed |

---

## Assets

- **`assets/invendis_logo.png`** — Header and footer logo
- **`assets/silbo_logo.png`** — Header and footer co-brand logo
- **`assets/images/`** — Product photos. Filenames are referenced directly in `PRODUCT_IMAGES` in `js/data.js`. No automatic discovery — a file must be explicitly listed there to appear.
