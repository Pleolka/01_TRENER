// E-maile po zakupie: do klienta (linki do plików / co dalej) i do Natalii
// (powiadomienie o zamówieniu). Wysyłka przez Resend — bez RESEND_API_KEY
// funkcja nic nie wysyła, a klient i tak widzi linki na stronie zamówienia
// i dostaje potwierdzenie płatności od Stripe.
import { formatPrice } from '../../src/lib/shop-core';
import type { OrderView } from './order';

const esc = (value: string) =>
	value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const dateLabel = (iso: string) =>
	new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' });

export async function sendMail(message: { to: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
	const key = process.env.RESEND_API_KEY;
	const from = process.env.MAIL_FROM;
	if (!key || !from) {
		console.warn('[mail] Brak RESEND_API_KEY / MAIL_FROM — e-mail nie został wysłany:', message.subject);
		return false;
	}
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from,
			to: [message.to],
			subject: message.subject,
			html: message.html,
			...(message.replyTo ? { reply_to: message.replyTo } : {}),
		}),
	});
	if (!res.ok) console.error('[mail] Resend:', res.status, await res.text());
	return res.ok;
}

const layout = (body: string) => `<!doctype html><html lang="pl"><body style="margin:0;padding:24px;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0b1d3d;line-height:1.5">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px">${body}
<p style="margin-top:32px;font-size:13px;color:#5b6b85">Natalia Figas · <a href="https://nataliafigas.pl" style="color:#00a0eb">nataliafigas.pl</a></p>
</div></body></html>`;

const button = (href: string, label: string) =>
	`<a href="${esc(href)}" style="display:inline-block;padding:10px 20px;background:#00a0eb;color:#ffffff;text-decoration:none;border-radius:4px;font-weight:bold">${esc(label)}</a>`;

export function customerEmail(order: OrderView, orderUrl: string) {
	const portal = process.env.STRIPE_PORTAL_URL;
	const rows = order.items
		.map((item) => {
			let action = '';
			if (item.type === 'plik' && item.downloadUrl) {
				action = item.availableFrom
					? `<br><span style="font-size:14px;color:#5b6b85">Plik będzie dostępny od ${dateLabel(item.availableFrom)} (nie wyrażono zgody na dostawę przed upływem 14 dni). Link poniżej zadziała od tego dnia.</span><br>${button(item.downloadUrl, 'Pobierz')}`
					: `<br>${button(item.downloadUrl, 'Pobierz')}`;
			} else if (item.type === 'subskrypcja') {
				action = `<br><span style="font-size:14px">Dostęp do aplikacji wyślę Ci osobnym e-mailem w ciągu 24 godzin (w dni robocze).${
					portal ? ` Subskrypcją zarządzasz i rezygnujesz <a href="${esc(portal)}" style="color:#00a0eb">tutaj</a>.` : ''
				}</span>`;
			} else if (item.type === 'usluga') {
				action = '<br><span style="font-size:14px">Odezwę się w ciągu 2 dni roboczych, żeby umówić start.</span>';
			}
			return `<li style="margin-bottom:16px"><strong>${esc(item.title)}</strong>${action}</li>`;
		})
		.join('');

	return {
		subject: 'Dziękuję za zakup — Natalia Figas',
		html: layout(`<h1 style="font-size:22px;margin:0 0 16px">Dziękuję za zakup!</h1>
<p>Płatność została przyjęta. Oto Twoje zamówienie:</p>
<ul style="padding-left:18px">${rows}</ul>
<p style="font-size:14px">Linki do plików działają 30 dni. Zawsze możesz wrócić do <a href="${esc(orderUrl)}" style="color:#00a0eb">strony zamówienia</a> i pobrać pliki ponownie.</p>
<p style="font-size:14px">Pytania? Odpowiedz na tego maila.</p>`),
	};
}

export function ownerEmail(order: OrderView, dashboardUrl: string) {
	const rows = order.items.map((item) => `<li>${esc(item.title)} <span style="color:#5b6b85">(${item.type})</span></li>`).join('');
	const todo = [
		order.items.some((i) => i.type === 'subskrypcja') && 'nadać dostęp do NF DIET',
		order.items.some((i) => i.type === 'usluga') && 'skontaktować się i umówić start współpracy',
	].filter(Boolean);

	return {
		subject: `Nowe zamówienie: ${order.items.map((i) => i.title).join(', ')} — ${formatPrice(order.amountTotal)}`,
		html: layout(`<h1 style="font-size:20px;margin:0 0 16px">Nowe zamówienie w sklepie</h1>
<ul style="padding-left:18px">${rows}</ul>
<p><strong>Kwota:</strong> ${formatPrice(order.amountTotal)}${order.mode === 'subscription' ? ' (subskrypcja)' : ''}<br>
<strong>Klient:</strong> ${esc(order.name ?? '—')}, <a href="mailto:${esc(order.email ?? '')}">${esc(order.email ?? '—')}</a>${order.phone ? `, tel. ${esc(order.phone)}` : ''}<br>
<strong>Zgoda na natychmiastową dostawę / start usługi:</strong> ${order.immediate ? 'tak' : 'NIE — pliki dostępne po 14 dniach'}</p>
${todo.length ? `<p style="background:#fff6d6;padding:12px;border-radius:4px"><strong>Do zrobienia:</strong> ${todo.join('; ')}</p>` : ''}
<p>${button(dashboardUrl, 'Zobacz w Stripe')}</p>`),
	};
}

export function cancellationEmail(customerEmail: string | null, subscriptionId: string) {
	return {
		subject: 'Subskrypcja anulowana — odebrać dostęp do NF DIET',
		html: layout(`<h1 style="font-size:20px;margin:0 0 16px">Subskrypcja zakończona</h1>
<p>Klient: <a href="mailto:${esc(customerEmail ?? '')}">${esc(customerEmail ?? '—')}</a></p>
<p style="background:#fff6d6;padding:12px;border-radius:4px"><strong>Do zrobienia:</strong> odebrać dostęp do aplikacji NF DIET.</p>
<p>${button(`https://dashboard.stripe.com/subscriptions/${subscriptionId}`, 'Zobacz w Stripe')}</p>`),
	};
}
