import { executeQuery } from '@datocms/cda-client';

const PAGE_BY_SLUG_QUERY = `
  query PageBySlug($slug: String!) {
    page(filter: { slug: { eq: $slug } }) {
      title
      seoTitle
      seoDescription
      heading
      badge
      content
    }
  }
`;

const OFFERS_QUERY = `
  query Offers {
    allOffers {
      title
      description
      path
      badge
    }
  }
`;

export interface CmsPage {
  title: string;
  seoTitle: string | null;
  seoDescription: string;
  heading: string | null;
  badge: string | null;
  content: string | null;
}

export interface CmsOffer {
  title: string;
  description: string;
  path: string;
  badge: string | null;
}

interface PageBySlugResponse {
  page: CmsPage | null;
}

interface OffersResponse {
  allOffers: CmsOffer[];
}

// Build resilience: DatoCMS is fetched at build time on every deploy. If it's
// briefly unreachable or a token/record is missing, we log and return a safe
// empty value instead of failing the whole site build — callers fall back to
// their own hardcoded copy.

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  try {
    const data = await executeQuery<PageBySlugResponse, { slug: string }>(PAGE_BY_SLUG_QUERY, {
      token: import.meta.env.DATOCMS_API_TOKEN,
      variables: { slug },
    });
    return data.page;
  } catch (error) {
    console.warn(`[datocms] Nie udało się pobrać strony "${slug}":`, error);
    return null;
  }
}

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
