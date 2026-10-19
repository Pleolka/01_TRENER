import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export interface HeroBackground {
  heroBg: string;
  heroAspect: number;
}

// Tło nagłówka podstrony (SiteChrome): webp w pełnej rozdzielczości źródła,
// proporcje zdjęcia (tło ma jego pełną wysokość), kadrowanie od góry.
export async function heroBackground(src: ImageMetadata, position = 'center top'): Promise<HeroBackground> {
  const image = await getImage({ src, format: 'webp', quality: 90 });
  return {
    heroBg: `url(${image.src}) ${position} / cover no-repeat`,
    heroAspect: src.width / src.height,
  };
}
