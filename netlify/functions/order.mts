// GET /api/order?session_id=… — stan zamówienia dla strony /zamowienie:
// czy opłacone, lista produktów i świeże linki do plików.
import { stripe, orderView, json } from '../lib/order';

export default async (req: Request) => {
	const id = new URL(req.url).searchParams.get('session_id') ?? '';
	if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return json({ error: 'Nieprawidłowy numer zamówienia.' }, 400);

	try {
		const session = await stripe().checkout.sessions.retrieve(id);
		const order = await orderView(session, new URL(req.url).origin, 7);
		// adres e-mail tylko częściowo — strona zamówienia nie jest chroniona hasłem
		const email = order.email?.replace(/^(.).*(@.*)$/, '$1…$2') ?? null;
		return json({
			id: order.id,
			status: order.status,
			mode: order.mode,
			email,
			immediate: order.immediate,
			value: order.amountTotal,
			items: order.items,
		});
	} catch (error) {
		console.error('[order]', error);
		return json({ error: 'Nie znaleziono zamówienia.' }, 404);
	}
};

export const config = { path: '/api/order' };
