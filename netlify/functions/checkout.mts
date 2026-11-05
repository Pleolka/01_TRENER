// POST /api/checkout — tworzy płatność Stripe Checkout z koszyka (albo
// subskrypcję) i zwraca adres strony płatności.
import { buildSessionParams, requestedSlugs, CheckoutError, type CheckoutRequest } from '../lib/checkout';
import { getProducts } from '../lib/products';
import { stripe, json } from '../lib/order';

export default async (req: Request) => {
	if (req.method !== 'POST') return json({ error: 'Metoda niedozwolona' }, 405);

	let body: CheckoutRequest;
	try {
		body = (await req.json()) as CheckoutRequest;
	} catch {
		return json({ error: 'Nieprawidłowe dane.' }, 400);
	}

	try {
		const { slugs } = requestedSlugs(body);
		const products = await getProducts(slugs);
		const origin = new URL(req.url).origin;
		const session = await stripe().checkout.sessions.create(buildSessionParams(body, products, origin));
		return json({ url: session.url });
	} catch (error) {
		if (error instanceof CheckoutError) return json({ error: error.message }, 400);
		console.error('[checkout]', error);
		return json({ error: 'Nie udało się rozpocząć płatności. Spróbuj ponownie za chwilę albo napisz do mnie.' }, 500);
	}
};

export const config = { path: '/api/checkout' };
