import { executeQuery } from '@datocms/cda-client';
import { homeContentDefaults } from './homeContentDefaults.mjs';

// pola bloku „Sekcja ze zdjęciem” — wspólne dla każdego modelu z polem Sekcje
const IMAGE_SECTIONS_FIELDS = `
      sections {
        ... on ImageSectionRecord {
          id
          badge
          heading
          text
          buttonLabel
          buttonUrl
          image {
            url
            alt
            width
            height
          }
        }
      }`;

const OFFERS_QUERY = `
  query Offers {
    allOffers {
      title
      description
      path
      badge
      price
      category
    }
  }
`;

// blok „Sekcja ze zdjęciem” z pola Sekcje
export interface CmsImageSection {
  id: string;
  badge: string | null;
  heading: string;
  text: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
  image: { url: string; alt: string | null; width: number; height: number } | null;
}

export interface CmsOffer {
  title: string;
  description: string;
  path: string;
  badge: string | null;
  price: string | null;
  category: string | null;
}

interface OffersResponse {
  allOffers: CmsOffer[];
}

// Build resilience: DatoCMS is fetched at build time on every deploy. If it's
// briefly unreachable or a token/record is missing, we log and return a safe
// empty value instead of failing the whole site build — callers fall back to
// their own hardcoded copy.

export async function getOffers(): Promise<CmsOffer[]> {
  try {
    const data = await executeQuery<OffersResponse>(OFFERS_QUERY, {
      token: import.meta.env.DATOCMS_API_TOKEN,
    });
    return data.allOffers;
  } catch (error) {
    console.warn('[datocms] Nie udało się pobrać ofert:', error);
    return [];
  }
}

const HOME_CONTENT_QUERY = `
  query HomeContent {
    homeContent {
      ${Object.keys(homeContentDefaults).join('\n      ')}
    }
  }
`;

export type HomeContent = typeof homeContentDefaults;

interface HomeContentResponse {
  homeContent: Partial<Record<keyof HomeContent, string | null>> | null;
}

// Pola puste w CMS-ie wracają do wartości domyślnych (treści z nataliafigas.pl).
export async function getHomeContent(): Promise<HomeContent> {
  try {
    const data = await executeQuery<HomeContentResponse>(HOME_CONTENT_QUERY, {
      token: import.meta.env.DATOCMS_API_TOKEN,
    });
    const fromCms = data.homeContent ?? {};
    return Object.fromEntries(
      Object.entries(homeContentDefaults).map(([key, fallback]) => [
        key,
        fromCms[key as keyof HomeContent] || fallback,
      ]),
    ) as HomeContent;
  } catch (error) {
    console.warn('[datocms] Nie udało się pobrać treści strony głównej:', error);
    return homeContentDefaults;
  }
}

const BLOG_POST_FIELDS = `
      title
      slug
      category
      label
      date
      excerpt
      cover {
        url
        alt
        width
        height
        focalPoint {
          x
          y
        }
      }
`;

const BLOG_POSTS_QUERY = `
  query BlogPosts {
    allBlogPosts(orderBy: date_DESC, first: 100) {
${BLOG_POST_FIELDS}
    }
  }
`;

const BLOG_POST_QUERY = `
  query BlogPost($slug: String!) {
    blogPost(filter: { slug: { eq: $slug } }) {
${BLOG_POST_FIELDS}
      content
      seoDescription
    }
  }
`;

export interface CmsBlogPost {
  title: string;
  slug: string;
  category: string | null;
  label: string | null;
  date: string;
  excerpt: string | null;
  cover: {
    url: string;
    alt: string | null;
    width: number;
    height: number;
    focalPoint: { x: number; y: number } | null;
  } | null;
  content?: string | null;
  seoDescription?: string | null;
}

export async function getBlogPosts(): Promise<CmsBlogPost[]> {
  try {
    const data = await executeQuery<{ allBlogPosts: CmsBlogPost[] }>(BLOG_POSTS_QUERY, {
      token: import.meta.env.DATOCMS_API_TOKEN,
    });
    return data.allBlogPosts;
  } catch (error) {
    console.warn('[datocms] Nie udało się pobrać wpisów bloga:', error);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<CmsBlogPost | null> {
  try {
    const data = await executeQuery<{ blogPost: CmsBlogPost | null }, { slug: string }>(BLOG_POST_QUERY, {
      token: import.meta.env.DATOCMS_API_TOKEN,
      variables: { slug },
    });
    return data.blogPost;
  } catch (error) {
    console.warn(`[datocms] Nie udało się pobrać wpisu "${slug}":`, error);
    return null;
  }
}

// --- O mnie (model pojedynczy about_page)

const ABOUT_PAGE_QUERY = `
  query AboutPage {
    aboutPage {
${IMAGE_SECTIONS_FIELDS}
      seo {
        title
        description
        image {
          url
        }
      }
    }
  }
`;

export interface CmsSeo {
  title: string | null;
  description: string | null;
  image: { url: string } | null;
}

export interface CmsAboutPage {
  sections: CmsImageSection[];
  seo: CmsSeo | null;
}

export async function getAboutPage(): Promise<CmsAboutPage | null> {
  try {
    const data = await executeQuery<{ aboutPage: CmsAboutPage | null }>(ABOUT_PAGE_QUERY, {
      token: import.meta.env.DATOCMS_API_TOKEN,
    });
    return data.aboutPage;
  } catch (error) {
    console.warn('[datocms] Nie udało się pobrać strony O mnie:', error);
    return null;
  }
}

// --- podstrony z osobnymi modelami pojedynczymi (cooperation_page, diet_page,
//     contact_page, shop_page, blog_page)

const SEO_FIELDS = `
      seo {
        title
        description
        image {
          url
        }
      }`;

const HERO_FIELDS = `
      heroBadge
      heroLabel
      heroHeading
      heroText
      heroPrimaryLabel
      heroPrimaryUrl
      heroSecondaryLabel
      heroSecondaryUrl`;

const TESTIMONIALS_FAQ_CTA_FIELDS = `
      testimonialsHeading
      testimonialsLead
      testimonials {
        ... on TestimonialRecord { id quote author tag }
      }
      testimonialsButtonLabel
      testimonialsButtonUrl
      faqBadge
      faqHeading
      faq {
        ... on FaqItemRecord { id question answer }
      }
      ctaHeading
      ctaText
      ctaSubheading
      ctaSubtext
      ctaButtonLabel
      ctaButtonUrl`;

const FEATURE_ITEM = `... on FeatureItemRecord { id title description }`;

const COOPERATION_PAGE_QUERY = `
  query CooperationPage {
    cooperationPage {
${HERO_FIELDS}
      scopeBadge
      scopeHeading
      scopeLead
      scopeItems { ${FEATURE_ITEM} }
      resultsBadge
      resultsHeading
      resultsText
      resultsStats {
        ... on StatItemRecord { id value suffix label }
      }
      resultsCtaHeading
      resultsCtaText
      stepsHeading
      steps { ${FEATURE_ITEM} }
${TESTIMONIALS_FAQ_CTA_FIELDS}
${SEO_FIELDS}
    }
  }
`;

const DIET_PAGE_QUERY = `
  query DietPage {
    dietPage {
${HERO_FIELDS}
      benefitsHeading
      benefitsLead
      benefits { ${FEATURE_ITEM} }
      benefitsClosingHeading
      benefitsClosingText
      plansHeading
      plansSubheading
      plansLead
      plans {
        ... on PlanRecord { id name description features price priceNote buttonLabel buttonUrl }
      }
      audienceBadge
      audienceHeading
      audienceItems
      optionsHeading
      optionsLead
      options {
        ... on OptionItemRecord { id title description buttonLabel buttonUrl }
      }
${TESTIMONIALS_FAQ_CTA_FIELDS}
${SEO_FIELDS}
    }
  }
`;

const CONTACT_PAGE_QUERY = `
  query ContactPage {
    contactPage {
      badge
      heading
      text
      formHeading
${SEO_FIELDS}
    }
  }
`;

const SHOP_PAGE_QUERY = `
  query ShopPage {
    shopPage {
      badge
      heading
      lead
      listHeading
      listSubheading
${SEO_FIELDS}
    }
  }
`;

const BLOG_PAGE_QUERY = `
  query BlogPage {
    blogPage {
      badge
      heading
      lead
      listBadge
      listHeading
${SEO_FIELDS}
    }
  }
`;

type Text = string | null;

export interface CmsFeatureItem { id: string; title: string; description: Text }
export interface CmsStatItem { id: string; value: string; suffix: Text; label: string }
export interface CmsTestimonial { id: string; quote: string; author: string; tag: Text }
export interface CmsFaqItem { id: string; question: string; answer: string }
export interface CmsPlan {
  id: string; name: string; description: Text; features: Text;
  price: Text; priceNote: Text; buttonLabel: Text; buttonUrl: Text;
}
export interface CmsOptionItem { id: string; title: string; description: Text; buttonLabel: Text; buttonUrl: Text }

export interface CmsHero {
  heroBadge: Text; heroLabel: Text; heroHeading: string; heroText: Text;
  heroPrimaryLabel: Text; heroPrimaryUrl: Text; heroSecondaryLabel: Text; heroSecondaryUrl: Text;
}

export interface CmsTestimonialsFaqCta {
  testimonialsHeading: Text; testimonialsLead: Text; testimonials: CmsTestimonial[];
  testimonialsButtonLabel: Text; testimonialsButtonUrl: Text;
  faqBadge: Text; faqHeading: Text; faq: CmsFaqItem[];
  ctaHeading: Text; ctaText: Text; ctaSubheading: Text; ctaSubtext: Text;
  ctaButtonLabel: Text; ctaButtonUrl: Text;
}

export interface CmsCooperationPage extends CmsHero, CmsTestimonialsFaqCta {
  scopeBadge: Text; scopeHeading: Text; scopeLead: Text; scopeItems: CmsFeatureItem[];
  resultsBadge: Text; resultsHeading: Text; resultsText: Text; resultsStats: CmsStatItem[];
  resultsCtaHeading: Text; resultsCtaText: Text;
  stepsHeading: Text; steps: CmsFeatureItem[];
  seo: CmsSeo | null;
}

export interface CmsDietPage extends CmsHero, CmsTestimonialsFaqCta {
  benefitsHeading: Text; benefitsLead: Text; benefits: CmsFeatureItem[];
  benefitsClosingHeading: Text; benefitsClosingText: Text;
  plansHeading: Text; plansSubheading: Text; plansLead: Text; plans: CmsPlan[];
  audienceBadge: Text; audienceHeading: Text; audienceItems: Text;
  optionsHeading: Text; optionsLead: Text; options: CmsOptionItem[];
  seo: CmsSeo | null;
}

export interface CmsContactPage { badge: Text; heading: string; text: Text; formHeading: Text; seo: CmsSeo | null }
export interface CmsShopPage { badge: Text; heading: string; lead: Text; listHeading: Text; listSubheading: Text; seo: CmsSeo | null }
export interface CmsBlogPage { badge: Text; heading: string; lead: Text; listBadge: Text; listHeading: Text; seo: CmsSeo | null }

// wspólne pobieranie rekordu modelu pojedynczego — przy błędzie strona
// buduje się dalej z treściami zapasowymi zamiast wywracać cały build
async function getSingleton<T>(query: string, key: string, label: string): Promise<T | null> {
  try {
    const data = await executeQuery<Record<string, T | null>>(query, {
      token: import.meta.env.DATOCMS_API_TOKEN,
    });
    return data[key];
  } catch (error) {
    console.warn(`[datocms] Nie udało się pobrać strony ${label}:`, error);
    return null;
  }
}

// pola strony głównej, które nie są tekstem (dlatego poza homeContentDefaults)
const HOME_META_QUERY = `
  query HomeMeta {
    homeContent {
      heroImage {
        url
        alt
        width
        height
      }
${SEO_FIELDS}
    }
  }
`;

export interface CmsImage {
  url: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface CmsHomeMeta {
  heroImage: CmsImage | null;
  seo: CmsSeo | null;
}

export const getHomeMeta = () => getSingleton<CmsHomeMeta>(HOME_META_QUERY, 'homeContent', 'główna (zdjęcie, SEO)');

export const getCooperationPage = () =>
  getSingleton<CmsCooperationPage>(COOPERATION_PAGE_QUERY, 'cooperationPage', 'Współpraca 1:1');
export const getDietPage = () => getSingleton<CmsDietPage>(DIET_PAGE_QUERY, 'dietPage', 'Dieta');
export const getContactPage = () => getSingleton<CmsContactPage>(CONTACT_PAGE_QUERY, 'contactPage', 'Kontakt');
export const getShopPage = () => getSingleton<CmsShopPage>(SHOP_PAGE_QUERY, 'shopPage', 'Sklep');
export const getBlogPage = () => getSingleton<CmsBlogPage>(BLOG_PAGE_QUERY, 'blogPage', 'Blog');
