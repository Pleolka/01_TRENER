// Budowa sesji Stripe Checkout z koszyka — osobno od wywołania API, żeby
// dało się ją sprawdzić testem bez sieci.
import type Stripe from 'stripe';
import { toMinorUnits } from '../../src/lib/shop-core';
import type { Product } from './products';

export interface CheckoutRequest {
	/* koszyk: pliki i usługi (płatność jednorazowa) */
	items?: string[];
	/* subskrypcja kupowana osobno — inna forma płatności (cykliczna) */
	subscription?: string;
	acceptTerms?: boolean;
	immediate?: boolean;
}

export class CheckoutError extends Error {}

const MAX_ITEMS = 20;

export function requestedSlugs(body: CheckoutRequest): { slugs: string[]; mode: 'payment' | 'subscription' } {
	if (!body.acceptTerms) throw new CheckoutError('Zaakceptuj regulamin i politykę prywatności.');
	if (body.subscription) return { slugs: [String(body.subscription)], mode: 'subscription' };
	const slugs = [...new Set((body.items ?? []).map(String).filter(Boolean))];
	if (slugs.length === 0) throw new CheckoutError('Koszyk jest pusty.');
	if (slugs.length > MAX_ITEMS) throw new CheckoutError('Za dużo produktów w koszyku.');
	return { slugs, mode: 'payment' };
}

const productImage = (url: string | null) => (url ? [`${url}?w=600&h=600&fit=crop&fm=jpg&q=80`] : undefined);

export function buildSessionParams(
	body: CheckoutRequest,
	products: Map<string, Product>,
	origin: string,
): Stripe.Checkout.SessionCreateParams {
	const { slugs, mode } = requestedSlugs(body);

	const chosen = slugs.map((slug) => {
		const product = products.get(slug);
		if (!product || !product.purchasable) throw new CheckoutError(`Produktu „${product?.title ?? slug}” nie można teraz kupić.`);
		if (mode === 'subscription' && product.type !== 'subskrypcja') throw new CheckoutError(`„${product.title}” nie jest subskrypcją.`);
		if (mode === 'payment' && product.type === 'subskrypcja')
			throw new CheckoutError(`Subskrypcję „${product.title}” kupuje się osobno, nie w koszyku.`);
		return product;
	});

	const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = chosen.map((product) => ({
		quantity: 1,
		price_data: {
			currency: 'pln',
			unit_amount: toMinorUnits(product.priceAmount),
			product_data: {
				name: product.title,
				...(product.description ? { description: product.description.slice(0, 500) } : {}),
				...(productImage(product.imageUrl) ? { images: productImage(product.imageUrl) } : {}),
				metadata: { slug: product.slug },
			},
			...(mode === 'subscription' ? { recurring: { interval: 'month' as const, interval_count: product.billingMonths } } : {}),
		},
	}));

	const metadata = {
		items: chosen.map((p) => p.slug).join(','),
		immediate: body.immediate ? '1' : '0',
		terms_accepted_at: new Date().toISOString(),
	};
	const needsPhone = chosen.some((p) => p.type === 'usluga');

	return {
		mode,
		line_items,
		locale: 'pl',
		allow_promotion_codes: true,
		billing_address_collection: 'auto',
		phone_number_collection: { enabled: needsPhone },
		success_url: `${origin}/zamowienie?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: mode === 'subscription' ? `${origin}/koszyk?subskrypcja=${encodeURIComponent(slugs[0])}` : `${origin}/koszyk`,
		metadata,
		...(mode === 'payment'
			? {
					customer_creation: 'if_required' as const,
					payment_intent_data: { metadata, description: chosen.map((p) => p.title).join(', ').slice(0, 1000) },
				}
			: { subscription_data: { metadata } }),
	};
}
