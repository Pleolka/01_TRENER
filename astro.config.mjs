// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // domena produkcyjna — z niej powstają canonical URL, sitemap, Open Graph,
  // dane strukturalne (JSON-LD), robots.txt i llms.txt
  site: 'https://nataliafigas.pl',
  integrations: [sitemap()],
  redirects: { '/sklep': '/sklep-online' },
  // CSS wstawiany do HTML — bez osobnych plików blokujących pierwsze
  // wyświetlenie strony (Lighthouse: render-blocking resources)
  build: { inlineStylesheets: 'always' },
});
