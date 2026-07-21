// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: podmień na docelową domenę produkcyjną — używane do sitemap, canonical URL i Open Graph
  site: 'https://trenershop.pl',
  integrations: [sitemap()],
});
