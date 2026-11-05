// POST /api/stripe-webhook — zdarzenia ze Stripe: po opłaceniu zamówienia
// e-mail do klienta (linki do plików) i do Natalii; po anulowaniu
// subskrypcji — przypomnienie Natalii o odebraniu dostępu.
import type Stripe from 'stripe';
import { stripe, orderView } from '../lib/order';
import { sendMail, customerEmail, ownerEmail, cancellationEmail } from '../lib/mail';

const siteOrigin = (req: Request) => process.env.URL || new URL(req.url).origin;

async function fulfil(session: Stripe.Checkout.Session, origin: string) {
	const order = await orderView(session, origin, 30);
	if (order.status !== 'paid') return;

	const owner = process.env.NOTIFY_EMAIL;
	const live = session.livemode ? '' : 'test/';
	const dashboardUrl = session.payment_intent
		? `https://dashboard.stripe.com/${live}payments/${typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id}`
		: `https://dashboard.stripe.com/${live}subscriptions/${typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? ''}`;

	if (order.email) {
		const orderUrl = `${origin}/zamowienie?session_id=${session.id}`;
		await sendMail({ to: order.email, ...customerEmail(order, orderUrl), replyTo: owner });
	}
	if (owner) await sendMail({ to: owner, ...ownerEmail(order, dashboardUrl), replyTo: order.email ?? undefined });
}

export default async (req: Request) => {
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	const signature = req.headers.get('stripe-signature');
	if (!secret || !signature) return new Response('Brak podpisu', { status: 400 });

	let event: Stripe.Event;
	try {
		event = await stripe().webhooks.constructEventAsync(await req.text(), signature, secret);
	} catch (error) {
		console.error('[webhook] Zły podpis:', (error as Error).message);
		return new Response('Zły podpis', { status: 400 });
	}

	try {
		switch (event.type) {
			// płatność od razu (karta, BLIK) albo opóźniona (Przelewy24) — wtedy
			// completed przychodzi jako „unpaid”, a potem async_payment_succeeded
			case 'checkout.session.completed':
			case 'checkout.session.async_payment_succeeded':
				await fulfil(event.data.object, siteOrigin(req));
				break;
			case 'customer.subscription.deleted': {
				const sub = event.data.object;
				const customer = typeof sub.customer === 'string' ? await stripe().customers.retrieve(sub.customer) : sub.customer;
				const email = 'email' in customer ? customer.email : null;
				if (process.env.NOTIFY_EMAIL) await sendMail({ to: process.env.NOTIFY_EMAIL, ...cancellationEmail(email, sub.id) });
				break;
			}
		}
	} catch (error) {
		// 500 = Stripe ponowi zdarzenie później
		console.error(`[webhook] ${event.type}:`, error);
		return new Response('Błąd obsługi', { status: 500 });
	}

	return new Response('ok', { status: 200 });
};

export const config = { path: '/api/stripe-webhook' };
