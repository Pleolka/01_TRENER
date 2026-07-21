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

export interface CmsPage {
  title: string;
  seoTitle: string | null;
  seoDescription: string;
  heading: string | null;
  badge: string | null;
  content: string | null;
}

interface PageBySlugResponse {
  page: CmsPage | null;
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const data = await executeQuery<PageBySlugResponse, { slug: string }>(PAGE_BY_SLUG_QUERY, {
    token: import.meta.env.DATOCMS_API_TOKEN,
    variables: { slug },
  });
  return data.page;
}
