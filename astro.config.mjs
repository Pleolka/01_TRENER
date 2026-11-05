// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// sklep widoczny tylko z PUBLIC_SHOP_PUBLISHED=true (patrz src/assets/data/strukturaStrony.js)
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SHOP_PUBLISHED = (process.env.PUBLIC_SHOP_PUBLISHED ?? env.PUBLIC_SHOP_PUBLISHED) === 'true';

// strony bez sensu w wyszukiwarce: koszyk, zamówienie, wypis z newslettera,
// a przy ukrytym sklepie — jego adresy (są przekierowaniami)
const NOT_IN_SITEMAP = ['/koszyk', '/zamowienie', '/dziekujemy', '/newsletter-wypis', ...(SHOP_PUBLISHED ? [] : ['/sklep-online'])];

// https://astro.build/config
export default defineConfig({
  // domena produkcyjna — z niej powstają canonical URL, sitemap, Open Graph,
  // dane strukturalne (JSON-LD), robots.txt i llms.txt
  site: 'https://nataliafigas.pl',
  integrations: [
    sitemap({
      filter: (page) => !NOT_IN_SITEMAP.some((path) => new URL(page).pathname.startsWith(path)),
    }),
  ],
  redirects: { '/sklep': SHOP_PUBLISHED ? '/sklep-online' : '/' },
  // CSS wstawiany do HTML — bez osobnych plików blokujących pierwsze
  // wyświetlenie strony (Lighthouse: render-blocking resources)
  build: { inlineStylesheets: 'always' },
});
