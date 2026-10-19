// Dane strukturalne schema.org (JSON-LD) — jednoznaczny opis strony dla
// Google, Binga i asystentów AI (ChatGPT, Gemini, Perplexity): kim jest
// Natalia Figas, co oferuje, za ile i jak się skontaktować.
import type { CmsSiteConfig, CmsFaqItem, CmsOffer, CmsBlogPost } from './datocms';

const SITE = 'https://nataliafigas.pl';
export const PERSON_ID = `${SITE}/#natalia-figas`;
export const BUSINESS_ID = `${SITE}/#dzialalnosc`;

const abs = (path: string, site: URL | undefined) => new URL(path, site ?? SITE).toString();

// opis działalności — ten sam na każdej stronie (z tekstu hero strony głównej)
export const BUSINESS_DESCRIPTION =
  'Trenerka personalna Natalia Figas: programy treningowe, dieta w aplikacji i prowadzenie 1:1 dla kobiet biznesu — online, w całej Polsce. Budowanie siły, kształtowanie sylwetki i zdrowe życie.';

// cena z CMS-u („89,00 zł”, „69 zł / 1 miesiąc”) → „89.00”
export const priceValue = (price: string | null | undefined) => {
  const m = price?.replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/);
  return m ? m[1].replace(',', '.') : null;
};

// wspólny graf na każdej stronie: strona, osoba, działalność
export function siteGraph(config: CmsSiteConfig | null, site: URL | undefined, description: string) {
  const sameAs = [config?.instagramUrl, config?.facebookUrl, config?.youtubeUrl].filter(Boolean);
  const image = config?.defaultSeoImage?.url ? `${config.defaultSeoImage.url}?w=1200&h=630&fit=crop&fm=jpg&q=80` : undefined;

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Natalia Figas',
    alternateName: 'Nati Figas',
    jobTitle: 'Trenerka personalna',
    description:
      'Trenerka personalna z ponad 25-letnim doświadczeniem w sporcie. Prowadzi kobiety, zwłaszcza przedsiębiorczynie, przez trening siłowy, dietę i budowanie zdrowych nawyków — w autorskim programie 2halves i aplikacji dietetycznej Canela Diet.',
    url: abs('/o-mnie', site),
    image,
    knowsAbout: [
      'trening personalny',
      'trening siłowy kobiet',
      'trening online',
      'dieta i żywienie',
      'redukcja masy ciała',
      'budowanie nawyków',
      'mobility',
    ],
    worksFor: { '@id': BUSINESS_ID },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const address = config?.companyAddress
    ? { '@type': 'PostalAddress', streetAddress: config.companyAddress.replace(/\n+/g, ', '), addressCountry: 'PL' }
    : undefined;

  const business = {
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: config?.companyName || 'Natalia Figas — trening personalny i dieta',
    description,
    url: abs('/', site),
    image,
    logo: abs('/apple-touch-icon.png', site),
    founder: { '@id': PERSON_ID },
    areaServed: { '@type': 'Country', name: 'Polska' },
    availableLanguage: 'pl',
    serviceType: ['Trening personalny online', 'Współpraca trenerska 1:1', 'Dieta online', 'Plany treningowe'],
    ...(config?.email ? { email: config.email } : {}),
    ...(config?.phone ? { telephone: config.phone } : {}),
    ...(config?.companyNip ? { vatID: `PL${config.companyNip.replace(/\D/g, '')}` } : {}),
    ...(address ? { address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE}/#strona`,
    url: abs('/', site),
    name: 'Natalia Figas',
    inLanguage: 'pl-PL',
    publisher: { '@id': BUSINESS_ID },
  };

  return [website, person, business];
}

// FAQ (Współpraca, Dieta, produkt)
export const faqPage = (items: CmsFaqItem[]) =>
  items.length
    ? {
        '@type': 'FAQPage',
        mainEntity: items.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: { '@type': 'Answer', text: q.answer },
        })),
      }
    : null;

// usługa z ofertą (np. współpraca 2halves, dieta Canela)
export const service = (name: string, description: string, url: string, offers: { name: string; price: string | null }[] = []) => ({
  '@type': 'Service',
  name,
  description,
  url,
  provider: { '@id': BUSINESS_ID },
  areaServed: { '@type': 'Country', name: 'Polska' },
  ...(offers.length
    ? {
        offers: offers
          .filter((o) => priceValue(o.price))
          .map((o) => ({ '@type': 'Offer', name: o.name, price: priceValue(o.price), priceCurrency: 'PLN' })),
      }
    : {}),
});

// produkt sklepu
export const product = (offer: CmsOffer, url: string) => ({
  '@type': 'Product',
  name: offer.title,
  description: offer.description,
  url,
  ...(offer.image ? { image: `${offer.image.url}?w=1200&auto=format` } : {}),
  ...(offer.badge ? { category: offer.badge } : {}),
  brand: { '@type': 'Brand', name: 'Natalia Figas' },
  ...(priceValue(offer.price)
    ? {
        offers: {
          '@type': 'Offer',
          price: priceValue(offer.price),
          priceCurrency: 'PLN',
          availability: 'https://schema.org/InStock',
          url,
          seller: { '@id': BUSINESS_ID },
        },
      }
    : {}),
});

// wpis bloga
export const blogPosting = (post: CmsBlogPost, url: string) => ({
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.seoDescription || post.excerpt || post.title,
  datePublished: post.date,
  url,
  inLanguage: 'pl-PL',
  author: { '@id': PERSON_ID },
  publisher: { '@id': BUSINESS_ID },
  ...(post.cover ? { image: `${post.cover.url}?w=1200&auto=format` } : {}),
});
