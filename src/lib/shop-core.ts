// Wspólna logika sklepu — używana i przez strony (Astro), i przez funkcje
// płatności (netlify/functions). Bez importów z Astro, żeby dało się ją
// zbundlować do funkcji serwerowej.

/* rodzaj produktu — pole „Rodzaj produktu” (product_type) w modelu Offer
   - plik         — ebook, plan, jadłospis: po płatności link do pobrania
   - subskrypcja  — płatność cykliczna (NF DIET), dostęp nadaje Natalia
   - usluga       — jednorazowa płatność za usługę (np. współpraca 1:1) */
export type ProductType = 'plik' | 'subskrypcja' | 'usluga';

export const productTypeOf = (raw: string | null | undefined): ProductType =>
	raw === 'subskrypcja' || raw === 'usluga' ? raw : 'plik';

export interface ShopFields {
	productType?: string | null;
	priceAmount?: number | null;
	billingMonths?: number | null;
	/* tylko informacja, czy plik jest wgrany — adres pliku nigdy nie trafia do HTML */
	file?: { id: string } | null;
	/* stare pole tekstowe z ceną („89,00 zł”) — zapas, gdy brak ceny liczbowej */
	price?: string | null;
	buyUrl?: string | null;
}

const PLN = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });

export const formatPrice = (amount: number) => PLN.format(amount);

export const billingLabel = (months: number) =>
	months === 1 ? 'miesiąc' : months === 12 ? 'rok' : `${months} mies.`;

/* cena do wyświetlenia: liczbowa z CMS-u (z okresem przy subskrypcji),
   a bez niej — stare pole tekstowe */
export function displayPrice(offer: ShopFields): string | null {
	const amount = offer.priceAmount ?? 0;
	if (amount > 0) {
		const type = productTypeOf(offer.productType);
		const months = offer.billingMonths ?? 1;
		return type === 'subskrypcja' ? `${formatPrice(amount)} / ${billingLabel(months)}` : formatPrice(amount);
	}
	return offer.price || null;
}

/* czy produkt da się kupić w koszyku na stronie: ma cenę, plik (dla plików)
   i okres płatności (dla subskrypcji). Produkt z „Linkiem zakupu” (buyUrl)
   sprzedaje się poza stroną. */
export function isPurchasable(offer: ShopFields): boolean {
	if (offer.buyUrl) return false;
	if (!(offer.priceAmount && offer.priceAmount > 0)) return false;
	const type = productTypeOf(offer.productType);
	if (type === 'plik') return Boolean(offer.file);
	if (type === 'subskrypcja') return Boolean(offer.billingMonths && offer.billingMonths >= 1);
	return true;
}

/* kwota w groszach dla Stripe */
export const toMinorUnits = (amount: number) => Math.round(amount * 100);

/* 14 dni na odstąpienie od umowy — bez zgody na natychmiastową dostawę
   plik jest dostępny dopiero po tym czasie (regulamin, § 6 ust. 5) */
export const WITHDRAWAL_DAYS = 14;
export const DAY_MS = 24 * 60 * 60 * 1000;
