// Koszyk w przeglądarce klienta: lista slugów produktów w localStorage.
// Ceny i nazwy nie są tu zapisywane — strona koszyka bierze je z danych
// zbudowanych z DatoCMS, a płatność liczy od nowa serwer (/api/checkout).
const KEY = 'nf-cart';

export function readCart(): string[] {
	try {
		const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
		return Array.isArray(value) ? value.filter((s): s is string => typeof s === 'string') : [];
	} catch {
		return [];
	}
}

function writeCart(slugs: string[]) {
	try {
		localStorage.setItem(KEY, JSON.stringify(slugs));
	} catch {
		// prywatne okno / zablokowane dane strony — koszyk działa do odświeżenia
	}
	window.dispatchEvent(new CustomEvent('cart:change'));
}

export const addToCart = (slug: string) => {
	const cart = readCart();
	if (!cart.includes(slug)) writeCart([...cart, slug]);
};
export const removeFromCart = (slug: string) => writeCart(readCart().filter((s) => s !== slug));
export const setCart = (slugs: string[]) => writeCart(slugs);
export const clearCart = () => writeCart([]);

/* licznik przy ikonie koszyka w menu */
function renderCount() {
	const count = readCart().length;
	document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
		el.textContent = String(count);
		el.hidden = count === 0;
	});
	document.querySelectorAll<HTMLElement>('[data-cart-link]').forEach((el) => {
		el.setAttribute('aria-label', count ? `Koszyk, produktów: ${count}` : 'Koszyk');
	});
}

/* przyciski „Do koszyka” (data-add-to-cart="slug"): po dodaniu zmieniają się
   w „W koszyku” i drugie kliknięcie prowadzi do koszyka */
function bindAddButtons() {
	document.querySelectorAll<HTMLButtonElement>('[data-add-to-cart]').forEach((button) => {
		const slug = button.dataset.addToCart!;
		const label = button.textContent?.trim() || 'Do koszyka';
		const sync = () => {
			const inCart = readCart().includes(slug);
			button.textContent = inCart ? 'W koszyku ✓' : label;
			button.classList.toggle('in-cart', inCart);
		};
		sync();
		button.addEventListener('click', () => {
			if (readCart().includes(slug)) {
				window.location.href = '/koszyk';
				return;
			}
			addToCart(slug);
		});
		window.addEventListener('cart:change', sync);
	});
}

export function initCart() {
	renderCount();
	bindAddButtons();
	window.addEventListener('cart:change', renderCount);
	// zmiana koszyka w innej karcie
	window.addEventListener('storage', (e) => {
		if (e.key === KEY) window.dispatchEvent(new CustomEvent('cart:change'));
	});
}
