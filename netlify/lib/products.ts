// Produkty prosto z DatoCMS w chwili zakupu — cena i rodzaj zawsze z CMS-u,
// nigdy z przeglądarki klienta.
import { productTypeOf, isPurchasable, type ProductType } from '../../src/lib/shop-core';

export interface Product {
	slug: string;
	title: string;
	description: string | null;
	type: ProductType;
	priceAmount: number;
	billingMonths: number;
	imageUrl: string | null;
	fileUrl: string | null;
	purchasable: boolean;
}

interface RawOffer {
	slug: string;
	title: string;
	description: string | null;
	buyUrl: string | null;
	productType: string | null;
	priceAmount: number | null;
	billingMonths: number | null;
	image: { url: string } | null;
	file: { id: string; url: string } | null;
}

const QUERY = `
  query ShopProducts($slugs: [String]) {
    allOffers(first: 100, filter: { slug: { in: $slugs } }) {
      slug
      title
      description
      buyUrl
      productType
      priceAmount
      billingMonths
      image { url }
      file { id url }
    }
  }
`;

export async function getProducts(slugs: string[]): Promise<Map<string, Product>> {
	const token = process.env.DATOCMS_API_TOKEN;
	if (!token) throw new Error('Brak zmiennej DATOCMS_API_TOKEN');
	if (slugs.length === 0) return new Map();

	const res = await fetch('https://graphql.datocms.com/', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({ query: QUERY, variables: { slugs } }),
	});
	const json = (await res.json()) as { data?: { allOffers: RawOffer[] }; errors?: unknown };
	if (!res.ok || json.errors || !json.data) {
		throw new Error(`DatoCMS: ${res.status} ${JSON.stringify(json.errors ?? '')}`);
	}

	return new Map(
		json.data.allOffers.map((o) => [
			o.slug,
			{
				slug: o.slug,
				title: o.title,
				description: o.description,
				type: productTypeOf(o.productType),
				priceAmount: o.priceAmount ?? 0,
				billingMonths: o.billingMonths ?? 1,
				imageUrl: o.image?.url ?? null,
				fileUrl: o.file?.url ?? null,
				purchasable: isPurchasable(o),
			},
		]),
	);
}
