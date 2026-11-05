// Zamówienie = sesja Stripe Checkout. Lista produktów (slugi) i zgoda na
// natychmiastową dostawę są w metadanych sesji — zapisuje je serwer przy
// tworzeniu płatności, klient nie może ich zmienić.
import Stripe from 'stripe';
import { getProducts } from './products';
import { createToken } from './tokens';
import { DAY_MS, WITHDRAWAL_DAYS, type ProductType } from '../../src/lib/shop-core';

export const stripe = () => {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) throw new Error('Brak zmiennej STRIPE_SECRET_KEY');
	return new Stripe(key);
};

export interface OrderItem {
	slug: string;
	title: string;
	type: ProductType;
	downloadUrl?: string;
	/* plik dostępny dopiero od tej daty (brak zgody na natychmiastową dostawę) */
	availableFrom?: string;
}

export interface OrderView {
	id: string;
	status: 'paid' | 'pending' | 'open' | 'expired';
	mode: 'payment' | 'subscription';
	email: string | null;
	name: string | null;
	phone: string | null;
	immediate: boolean;
	amountTotal: number;
	items: OrderItem[];
}

export const orderSlugs = (session: Stripe.Checkout.Session) =>
	(session.metadata?.items ?? '').split(',').map((s) => s.trim()).filter(Boolean);

/* linkDays — ile dni działa link do pliku, licząc od chwili, gdy plik
   staje się dostępny (strona zamówienia: 7, e-mail: 30) */
export async function orderView(session: Stripe.Checkout.Session, origin: string, linkDays: number): Promise<OrderView> {
	const slugs = orderSlugs(session);
	const products = await getProducts(slugs);
	const immediate = session.metadata?.immediate === '1';
	const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
	const status: OrderView['status'] =
		session.status === 'complete' ? (paid ? 'paid' : 'pending') : session.status === 'expired' ? 'expired' : 'open';

	const created = session.created * 1000;
	const nbf = immediate ? created : created + WITHDRAWAL_DAYS * DAY_MS;
	const now = Date.now();

	const items = slugs.map((slug): OrderItem => {
		const product = products.get(slug);
		const item: OrderItem = { slug, title: product?.title ?? slug, type: product?.type ?? 'plik' };
		if (status === 'paid' && item.type === 'plik' && product?.fileUrl) {
			const token = createToken({ s: session.id, p: slug, nbf, exp: Math.max(nbf, now) + linkDays * DAY_MS });
			item.downloadUrl = `${origin}/api/pobierz?t=${token}`;
			if (nbf > now) item.availableFrom = new Date(nbf).toISOString();
		}
		return item;
	});

	return {
		id: session.id,
		status,
		mode: session.mode === 'subscription' ? 'subscription' : 'payment',
		email: session.customer_details?.email ?? null,
		name: session.customer_details?.name ?? null,
		phone: session.customer_details?.phone ?? null,
		immediate,
		amountTotal: (session.amount_total ?? 0) / 100,
		items,
	};
}

export const json = (data: unknown, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
	});
