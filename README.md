<p align="center">
  <a href="https://commerce.nuxt.dev" target="_blank" rel="noopener">
    <img alt="NuxtCommerce: Headless storefront for Shopify" src="https://github.com/user-attachments/assets/1c6720b7-5aea-4f6b-be55-8944fb81799a">
  </a>
</p>

<h1 align="center">NuxtCommerce (Shopify edition)</h1>

<p align="center">
  Headless storefront for <strong>Shopify</strong>, built with <strong>Nuxt 4</strong> and the <strong>Shopify Storefront API</strong>.<br/>
  Same Pinterest-style UI, dark mode and multi-language support as the original WooCommerce version.
</p>

## Table of Contents

* [What changed from the WooCommerce version](#what-changed-from-the-woocommerce-version)
* [Quickstart](#quickstart)
* [Shopify Setup](#shopify-setup)
* [How Shopify data maps to the UI](#how-shopify-data-maps-to-the-ui)
* [Checkout flow](#checkout-flow)
* [API Endpoints (Server)](#api-endpoints-server)
* [Internationalization (i18n)](#internationalization-i18n)
* [Performance & Caching](#performance--caching)

## What changed from the WooCommerce version

The design, pages, components and styles are untouched. Only the data layer was replaced:

* `server/utils/wpgraphql.ts` was replaced by `server/utils/shopify.ts` (Storefront API client).
* `server/utils/shopifyMappers.ts` converts Shopify data into the exact shapes the components already use, so no template had to change.
* `app/gql/*` now contains Shopify Storefront queries.
* The cart is kept in `localStorage` (as before). Adding to cart validates the variant and stock against Shopify.
* Checkout keeps the in-app form, then creates a Shopify cart with those details prefilled and redirects to Shopify's secure hosted checkout.

## Quickstart

### Requirements

* Node.js 20+
* pnpm
* A Shopify store with the **Headless** sales channel installed

### 1) Install

```bash
pnpm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Yes | `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | One of the two | Private Storefront token (recommended, server-only) |
| `SHOPIFY_STOREFRONT_TOKEN` | One of the two | Public Storefront token |
| `SHOPIFY_API_VERSION` | No | Defaults to `2026-04` |
| `SHOPIFY_COUNTRY_CODE` | Recommended | e.g. `LK`. Sets currency/pricing context and prefills the checkout country. Without it, the delivery address is not prefilled. |
| `SHOPIFY_HIDDEN_COLLECTIONS` | No | Comma separated collection handles to hide. Defaults to `frontpage`. |

Tokens are only used on the server (Nitro API routes); they never reach the browser.
At runtime on Cloudflare you can also set them as `NUXT_SHOPIFY_STORE_DOMAIN`, `NUXT_SHOPIFY_STOREFRONT_PRIVATE_TOKEN`, etc.

### 3) Run

```bash
pnpm dev
```

### 4) Build / Deploy

```bash
pnpm build
pnpm deploy:pages
```

## Shopify Setup

1. In Shopify admin, install the **Headless** sales channel and create a storefront.
2. Copy the **private** (or public) Storefront API token into `.env`.
3. In the storefront's Storefront API permissions, enable:
   * `unauthenticated_read_product_listings`
   * `unauthenticated_read_product_inventory` (optional, enables "Insufficient stock" limits; the site works without it)
   * `unauthenticated_write_checkouts` and `unauthenticated_read_checkouts`
4. Make sure your products and collections are published to the **Headless** channel.
5. Set up payments, shipping zones and taxes in Shopify as usual; they are handled on Shopify's checkout.
6. Optional: in the Headless channel settings, set your storefront URL so the "Continue shopping" link on the order confirmation page returns shoppers to this site.

## How Shopify data maps to the UI

| UI element | WooCommerce source | Shopify source |
| --- | --- | --- |
| Categories (menu, carousel, categories page) | Product categories | Collections with at least one product in stock |
| Product card subtitle | `pa_style` attribute | Product type (falls back to vendor) |
| Colour swatches on product page | Separate products per colour | Values of the variant option named `Color` / `Colour` |
| Size buttons | Variations | Remaining variant options (usually `Size`) |
| Sale price + strikethrough | Sale / regular price | Price / compare-at price |
| Card hover image | First gallery image | Second product image |
| "Shop similar" | Related products | Shopify product recommendations |

Product URLs look like `/product/{handle}-{productId}`, or `/product/{handle}-{colour}-{productId}` when a colour is selected.
Only colours with at least one in-stock variant get a swatch.

## Checkout flow

1. The shopper fills in the same in-app checkout form as before.
2. `POST /api/checkout` creates a Shopify cart with the cart lines, email and delivery address prefilled (address requires `SHOPIFY_COUNTRY_CODE`; phone is prefilled only when entered in international format such as `+94771234567`).
3. The shopper is redirected to Shopify's hosted checkout to pay. If Shopify rejects the prefilled details, the shopper is still sent to checkout without them.
4. When the shopper comes back to the site, the storefront checks whether that checkout was completed and clears the local cart if so. If they abandon payment, their cart is kept.

## API Endpoints (Server)

| Endpoint | Purpose |
| --- | --- |
| `GET /api/products` | Product grid with infinite scroll, sort (newest / price) and category filter |
| `GET /api/search` | Search dropdown (6 results) |
| `GET /api/product` | Product detail, colours, sizes and recommendations |
| `GET /api/categories` | Collections |
| `POST /api/cart/add` | Validates variant and stock, returns a cart line |
| `POST /api/checkout` | Creates the Shopify cart and returns the checkout URL |
| `GET /api/cart/status` | Tells the storefront whether a checkout was completed |

## Internationalization (i18n)

* Locales: **en-GB**, **nb-NO**, **nl-NL**, **de-DE**
* Default: **en**
* Use `useLocalePath()` for links; SEO tags adapt per route.

## Performance & Caching

* **`cachedEventHandler`** on GET handlers with **SWR** (stale-while-revalidate)
* **Route Rules** for `/categories` and `/favorites`
* Optional **NuxtHub KV cache** (`hub: { cache: true }`)
* Image optimization via `@nuxt/image`
* Prerender: `/`, `/sitemap.xml`, `/robots.txt`

## 🙌 Contributors & Acknowledgements

We sincerely thank everyone who has contributed to **NuxtCommerce**.
Your support, feedback, and ideas keep this project moving forward. 🚀

✨ **Special thanks**

|                                                    Collaborator                                                    |
| :----------------------------------------------------------------------------------------------------------------: |
| [<img src="https://github.com/rikp777.png?size=115" width=115><br><sub>@rikp777</sub>](https://github.com/rikp777) |

<sub>More contributors will be highlighted here as the project grows.</sub>

## Contact

Have questions or suggestions?

* Email: **[zckhtln@icloud.com](mailto:zckhtln@icloud.com)**
* X (Twitter): [**@ZHatlen**](https://twitter.com/ZHatlen)


> **Note**  
> You can view the orders you create during the live demo at [NuxtCommerce Admin](https://nuxtcommerce-admin.vercel.app/).  
> From there, you can also update their statuses and add notes to your orders.
