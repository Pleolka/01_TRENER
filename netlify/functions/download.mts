// GET /api/pobierz?t=… — sprawdza podpisany link i przekierowuje do pliku
// produktu w DatoCMS.
import { readToken } from '../lib/tokens';
import { getProducts } from '../lib/products';

const page = (title: string, text: string, status: number) =>
	new Response(
		`<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#020024;color:#c1e8ff;font-family:Arial,Helvetica,sans-serif;text-align:center;padding:24px">
<div style="max-width:30rem"><h1 style="color:#fff">${title}</h1><p>${text}</p><p><a href="/" style="color:#00c8fd">Wróć na stronę</a></p></div></body></html>`,
		{ status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
	);

export default async (req: Request) => {
	const token = readToken(new URL(req.url).searchParams.get('t') ?? '');
	if (!token) return page('Nieprawidłowy link', 'Ten link do pobrania jest niepoprawny. Skopiuj go z e-maila w całości.', 400);

	const now = Date.now();
	if (now < token.nbf) {
		const date = new Date(token.nbf).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' });
		return page('Plik jeszcze niedostępny', `Plik będzie można pobrać od ${date}. Przy zakupie nie było zgody na dostawę przed upływem 14 dni od zawarcia umowy.`, 403);
	}
	if (now > token.exp) {
		// link wygasł — strona zamówienia wygeneruje nowy
		return Response.redirect(new URL(`/zamowienie?session_id=${encodeURIComponent(token.s)}`, req.url).toString(), 302);
	}

	try {
		const product = (await getProducts([token.p])).get(token.p);
		if (!product?.fileUrl) return page('Brak pliku', 'Nie znaleziono pliku tego produktu. Napisz do mnie — wyślę go mailem.', 404);
		return new Response(null, { status: 302, headers: { Location: product.fileUrl, 'Cache-Control': 'no-store' } });
	} catch (error) {
		console.error('[pobierz]', error);
		return page('Chwilowy problem', 'Nie udało się pobrać pliku. Spróbuj ponownie za chwilę.', 500);
	}
};

export const config = { path: '/api/pobierz' };
