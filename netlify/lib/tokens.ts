// Podpisane linki do pobrania pliku: kto ma link, ten pobiera — ale tylko
// w oknie czasowym [nbf, exp] i tylko ten jeden produkt z tego zamówienia.
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface DownloadToken {
	s: string; // id sesji Stripe Checkout (zamówienie)
	p: string; // slug produktu
	nbf: number; // od kiedy (ms) — bez zgody na natychmiastową dostawę: +14 dni
	exp: number; // do kiedy (ms)
}

const secret = () => {
	const value = process.env.DOWNLOAD_SECRET;
	if (!value || value.length < 32) throw new Error('Brak zmiennej DOWNLOAD_SECRET (min. 32 znaki)');
	return value;
};

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url');
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest();

export function createToken(data: DownloadToken): string {
	const payload = b64url(JSON.stringify(data));
	return `${payload}.${b64url(sign(payload))}`;
}

export function readToken(token: string): DownloadToken | null {
	const [payload, signature] = token.split('.');
	if (!payload || !signature) return null;
	const expected = sign(payload);
	const given = Buffer.from(signature, 'base64url');
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
	try {
		const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as DownloadToken;
		return typeof data.s === 'string' && typeof data.p === 'string' ? data : null;
	} catch {
		return null;
	}
}
