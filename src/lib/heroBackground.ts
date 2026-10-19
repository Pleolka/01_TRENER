import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

// Zdjęcie tła nagłówka (SiteChrome). Renderowane jako <img> z srcset,
// a nie tło CSS — przeglądarka odkrywa je od razu w HTML (to element LCP)
// i telefon pobiera mały wariant zamiast pełnych 2000 px.
export interface HeroImage {
  src: string;
  srcset: string;
  /* kadrowanie, np. 'center top' albo '50% 30%' (punkt ostrości z CMS-u) */
  position: string;
}

export interface HeroBackground {
  heroBg: HeroImage;
  heroAspect: number;
}

const HERO_WIDTHS = [640, 1024, 1440, 2000];

export async function heroBackground(src: ImageMetadata, position = 'center top'): Promise<HeroBackground> {
  const widths = HERO_WIDTHS.filter((w) => w <= src.width);
  const image = await getImage({ src, widths, format: 'webp', quality: 85 });
  return {
    heroBg: { src: image.src, srcset: image.srcSet.attribute, position },
    heroAspect: src.width / src.height,
  };
}

// to samo dla zdjęcia z DatoCMS (imgix: ?w=… zmniejsza po stronie serwera)
export function heroBackgroundFromUrl(url: string, width: number, height: number, position = 'center top'): HeroBackground {
  const widths = HERO_WIDTHS.filter((w) => w <= width);
  const at = (w: number) => `${url}?w=${w}&auto=format&q=85`;
  return {
    heroBg: { src: at(widths.at(-1) ?? width), srcset: widths.map((w) => `${at(w)} ${w}w`).join(', '), position },
    heroAspect: width / height,
  };
}
