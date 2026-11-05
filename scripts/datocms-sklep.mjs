// Dodaje do modelu „Offer” w DatoCMS pola potrzebne do sprzedaży w koszyku
// i uzupełnia je w istniejących produktach na podstawie starych pól.
//
// Uruchomienie (z katalogu projektu, token CMA w .env):
//   node --env-file=.env scripts/datocms-sklep.mjs           ← tylko podgląd, nic nie zmienia
//   node --env-file=.env scripts/datocms-sklep.mjs --zapisz  ← dodaje pola i zapisuje produkty
//
// Skrypt można uruchamiać wielokrotnie: istniejących pól nie dubluje,
// wypełnionych wartości w produktach nie nadpisuje.
import { buildClient } from '@datocms/cma-client-node';

const APPLY = process.argv.includes('--zapisz');
const token = process.env.DATOCMS_CMA_TOKEN;
if (!token) {
	console.error('Brak DATOCMS_CMA_TOKEN w .env (DatoCMS → Settings → API tokens, token z pełnym dostępem).');
	process.exit(1);
}
const client = buildClient({ apiToken: token });

const FIELDS = [
	{
		label: 'Rodzaj produktu',
		api_key: 'product_type',
		field_type: 'string',
		hint: 'Decyduje, co klient dostaje po płatności.',
		default_value: 'plik',
		validators: { required: {}, enum: { values: ['plik', 'subskrypcja', 'usluga'] } },
		appearance: {
			editor: 'string_radio_group',
			addons: [],
			parameters: {
				radios: [
					{ label: 'Plik do pobrania', value: 'plik', hint: 'Ebook, plan, jadłospis — po płatności link do pobrania pliku poniżej' },
					{ label: 'Subskrypcja', value: 'subskrypcja', hint: 'Płatność cykliczna (NF DIET) — dostęp nadajesz ręcznie po e-mailu ze sklepu' },
					{ label: 'Usługa', value: 'usluga', hint: 'Jednorazowa płatność, np. współpraca 1:1 — po zakupie kontaktujesz się z klientem' },
				],
			},
		},
	},
	{
		label: 'Cena do płatności (zł)',
		api_key: 'price_amount',
		field_type: 'float',
		hint: 'Liczba, np. 89 albo 49.90. Tę kwotę zapłaci klient — i ta cena wyświetla się na stronie. Puste = produktu nie da się kupić w koszyku.',
		validators: { number_range: { min: 0 } },
		appearance: { editor: 'float', addons: [], parameters: {} },
	},
	{
		label: 'Subskrypcja: płatność co ile miesięcy',
		api_key: 'billing_months',
		field_type: 'integer',
		hint: 'Tylko dla subskrypcji: 1 = co miesiąc, 3 = co 3 miesiące, 12 = co rok. Kwota wyżej jest za cały okres.',
		validators: { number_range: { min: 1, max: 12 } },
		appearance: { editor: 'integer', addons: [], parameters: {} },
	},
	{
		label: 'Plik do pobrania po zakupie',
		api_key: 'file',
		field_type: 'file',
		hint: 'PDF (albo ZIP) wysyłany klientowi po płatności. Bez pliku produktu „Plik do pobrania” nie da się kupić.',
		validators: { extension: { extensions: ['pdf', 'zip', 'epub'] } },
		appearance: { editor: 'file', addons: [], parameters: {} },
	},
];

const offer = (await client.itemTypes.list()).find((t) => t.api_key === 'offer');
if (!offer) throw new Error('Nie znaleziono modelu o api_key „offer”.');

// --- 1. pola
const existing = await client.fields.list(offer.id);
const priceField = existing.find((f) => f.api_key === 'price');
let position = priceField ? priceField.position + 1 : undefined;

console.log(`\nModel „${offer.name}” (${offer.api_key})`);
for (const spec of FIELDS) {
	if (existing.some((f) => f.api_key === spec.api_key)) {
		console.log(`  ✓ pole ${spec.api_key} już jest`);
		continue;
	}
	console.log(`  + pole ${spec.api_key} („${spec.label}”)${APPLY ? '' : ' — do dodania'}`);
	if (APPLY) await client.fields.create(offer.id, { ...spec, localized: false, ...(position ? { position: position++ } : {}) });
}

// --- 2. wartości w produktach
const parsePrice = (text) => {
	const match = String(text ?? '').replace(/\s/g, '').match(/(\d+(?:[.,]\d{1,2})?)/);
	return match ? Number(match[1].replace(',', '.')) : null;
};
const guessType = (item) => {
	const text = `${item.category ?? ''} ${item.badge ?? ''} ${item.slug ?? ''}`.toLowerCase();
	if (/aplikacj|subskryp|dieta-|nf-diet/.test(text)) return 'subskrypcja';
	if (/pakiet|1:1|2halves|wsp[oó]łprac|konsultac/.test(text)) return 'usluga';
	return 'plik';
};

console.log('\nProdukty:');
const rows = [];
for await (const item of client.items.listPagedIterator({ filter: { type: offer.id } })) {
	const patch = {};
	if (!item.product_type) patch.product_type = guessType(item);
	if (item.price_amount == null && parsePrice(item.price) != null) patch.price_amount = parsePrice(item.price);
	if ((item.product_type ?? patch.product_type) === 'subskrypcja' && item.billing_months == null) patch.billing_months = 1;

	rows.push({
		produkt: item.title,
		slug: item.slug,
		'stara cena': item.price ?? '—',
		rodzaj: item.product_type ?? `${patch.product_type} (nowe)`,
		'cena zł': item.price_amount ?? (patch.price_amount != null ? `${patch.price_amount} (nowe)` : '— uzupełnij'),
		plik: item.file ? 'jest' : guessType(item) === 'plik' ? 'BRAK — wgraj' : '—',
	});

	if (APPLY && Object.keys(patch).length) {
		await client.items.update(item.id, patch);
		// produkt opublikowany bez czekających zmian publikujemy ponownie (szkiców Natalii nie ruszamy)
		if (offer.draft_mode_active && item.meta.status === 'published') await client.items.publish(item.id);
	}
}
console.table(rows);

console.log(
	APPLY
		? '\nGotowe. Sprawdź w DatoCMS rodzaj i cenę każdego produktu oraz wgraj pliki tam, gdzie „BRAK”.'
		: '\nTo był podgląd — nic nie zostało zmienione. Uruchom z --zapisz, żeby zapisać.',
);
