# Sklep: koszyk + Stripe

Produkty są w DatoCMS (model **Offer**), koszyk w przeglądarce klienta, płatność w **Stripe Checkout** (BLIK, Przelewy24, karta, Apple/Google Pay). Pliki po zakupie wydaje funkcja Netlify przez podpisane linki.

## Jak to działa

| Rodzaj produktu (pole w CMS) | Na stronie | Po płatności |
| --- | --- | --- |
| **Plik do pobrania** (ebook, plan, jadłospis) | „Do koszyka” | link „Pobierz” na stronie zamówienia i w e-mailu |
| **Usługa** (np. 2halves, 1499 zł) | „Do koszyka” | e-mail do Natalii z danymi i telefonem klienta, klient dostaje „odezwę się w 2 dni” |
| **Subskrypcja** (NF DIET) | „Subskrybuj” → `/koszyk?subskrypcja=<slug>` | płatność cykliczna co N miesięcy; e-mail do Natalii „nadać dostęp”; przy anulowaniu — „odebrać dostęp” |

Subskrypcję kupuje się osobno od koszyka (inny tryb płatności w Stripe, BLIK i P24 nie obsługują płatności cyklicznych).

Zgody w koszyku (regulamin § 6 ust. 5): akceptacja regulaminu jest wymagana; zgoda na dostawę przed upływem 14 dni jest dobrowolna — bez niej link do pliku zadziała dopiero 14 dni po zakupie.

### Pliki w kodzie

- `src/lib/shop-core.ts` — rodzaje produktów, cena do wyświetlenia, reguła „czy da się kupić”
- `src/components/BuyButton.astro` — przycisk produktu (Do koszyka / Subskrybuj / Zapytaj o produkt)
- `src/scripts/cart.ts` — koszyk w `localStorage` (tylko slugi; ceny liczy serwer)
- `src/pages/koszyk.astro`, `src/pages/zamowienie.astro`
- `netlify/functions/` — `/api/checkout`, `/api/order`, `/api/pobierz`, `/api/stripe-webhook`
- `netlify/lib/` — wspólny kod funkcji (produkty z DatoCMS, linki, e-maile)
- `scripts/datocms-sklep.mjs` — dodaje pola sklepu w DatoCMS

## Uruchomienie — krok po kroku

### 1. DatoCMS
1. `node --env-file=.env scripts/datocms-sklep.mjs` — podgląd (nic nie zmienia).
2. `node --env-file=.env scripts/datocms-sklep.mjs --zapisz` — dodaje pola *Rodzaj produktu*, *Cena do płatności (zł)*, *Subskrypcja: płatność co ile miesięcy*, *Plik do pobrania po zakupie* i wpisuje rodzaj i cenę na podstawie starych pól.
3. W każdym produkcie sprawdzić rodzaj i cenę, **wgrać plik** (bez pliku produkt „Plik” pokazuje „Zapytaj o produkt”). Subskrypcje NF DIET: osobny produkt na każdy wariant (np. 1 / 3 / 6 / 12 mies.), cena za cały okres.
4. Stara cena tekstowa (pole *price*) zostaje jako zapas — gdy jest cena liczbowa, strona pokazuje liczbową.

Do czasu uruchomienia skryptu strona działa jak dotąd (zapytania wracają do wersji bez nowych pól).

### 2. Stripe (konto Natalii)
1. **Settings → Payment methods**: włączyć BLIK, Przelewy24, karty, Apple Pay / Google Pay.
2. **Settings → Customer emails**: włączyć „Successful payments” (potwierdzenie płatności od Stripe).
3. **Settings → Billing → Customer portal**: aktywować, zezwolić na anulowanie subskrypcji, skopiować link logowania → `STRIPE_PORTAL_URL`.
4. **Developers → Webhooks → Add endpoint**: `https://nataliafigas.pl/api/stripe-webhook`, zdarzenia:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.deleted` → Signing secret → `STRIPE_WEBHOOK_SECRET`.
   W trybie testowym osobny endpoint na adres podglądu (np. `https://deploy-preview-12--nataliafigas.netlify.app/api/stripe-webhook`) z osobnym sekretem.

### 3. E-maile (Resend)
1. Konto na resend.com, **Domains → Add** `nataliafigas.pl`, dopisać rekordy DNS (SPF/DKIM) u dostawcy DNS domeny.
2. API key → `RESEND_API_KEY`, nadawca `MAIL_FROM` z tej domeny.

Bez Resend sklep działa: klient widzi linki na stronie zamówienia i dostaje potwierdzenie od Stripe, a Natalia — powiadomienie o płatności od Stripe. Nie wyjdą tylko e-maile z linkami i „do zrobienia”.

### 4. Netlify — zmienne środowiskowe
Site configuration → Environment variables (wartości osobno dla *Production* i *Deploy Previews*):

| Zmienna | Production | Deploy Previews |
| --- | --- | --- |
| `PUBLIC_SHOP_PUBLISHED` | `false` do startu sklepu, potem `true` | `true` |
| `STRIPE_SECRET_KEY` | `sk_live_…` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | sekret endpointu produkcyjnego | sekret endpointu testowego |
| `STRIPE_PORTAL_URL` | link portalu (live) | link portalu (test) |
| `DOWNLOAD_SECRET` | losowe ≥ 32 znaki | inne losowe |
| `RESEND_API_KEY`, `MAIL_FROM`, `NOTIFY_EMAIL` | jak w `.env.example` | to samo |
| `DATOCMS_API_TOKEN` | już jest — sprawdzić, że zakres obejmuje **Functions** | |

### 5. Test przed startem (na podglądzie, klucze testowe)
- karta `4242 4242 4242 4242`, dowolna przyszła data i CVC;
- BLIK i Przelewy24 w trybie testowym: Stripe pokazuje stronę „Authorize / Fail”;
- sprawdzić: koszyk → płatność → strona zamówienia z „Pobierz” → plik się otwiera → e-mail do klienta i do Natalii;
- zakup bez zgody na natychmiastową dostawę → link „dostępny od …”;
- subskrypcja → anulowanie w portalu klienta → e-mail „odebrać dostęp”.

### 6. Start
Klucze live w Production, `PUBLIC_SHOP_PUBLISHED=true`, nowy deploy. Przycisk w hero na stronie **Dieta** (DatoCMS: Dieta → Hero → Przycisk główny — link) ustawić na `/koszyk?subskrypcja=<slug-subskrypcji>`.

## Do wiedzenia
- Ceny są **brutto**, w PLN. Faktur sklep nie wystawia — klient dostaje potwierdzenie Stripe; fakturę na żądanie Natalia wystawia ręcznie.
- Pliki leżą w DatoCMS pod długimi, losowymi adresami; link „Pobierz” przekierowuje do nich dopiero po sprawdzeniu podpisu i terminu. To wystarcza dla ebooków, ale nie jest DRM — adres pliku po przekierowaniu da się skopiować.
- Kody rabatowe: Stripe → Product catalog → Coupons → Promotion codes; pole na kod jest w płatności.
- Strona zamówienia (`/zamowienie?session_id=…`) zawsze generuje świeże linki — ten adres jest w e-mailu do klienta.
- Zdarzenie `purchase` trafia do `dataLayer` na stronie zamówienia — gotowe pod Google Tag Manager / piksel Meta.
