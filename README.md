# nataliafigas.pl

Strona Natalii Figas — trenerki personalnej i dietetyczki. Astro 7, treści z DatoCMS, hosting na Netlify.

- Produkcja: https://nataliafigas.pl (Netlify, projekt `nataliafigas`, DNS domeny też w Netlify)
- CMS: https://natalia-figas.admin.datocms.com — wszystkie teksty, zdjęcia, produkty i wpisy bloga
- Repozytorium: https://github.com/Pleolka/01_TRENER

## Uruchomienie lokalne

```sh
npm install
cp .env.example .env      # uzupełnić DATOCMS_API_TOKEN (token tylko do odczytu)
npm run dev               # http://localhost:4321
```

Bez tokenu strona też się zbuduje — sekcje z CMS-u pokażą treści zapasowe albo będą puste.

| Polecenie | Co robi |
| --- | --- |
| `npm run dev` | serwer deweloperski |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd zbudowanej strony |
| `npm run lint` | ESLint |
| `npx astro check` | sprawdzenie typów |

## Zmienne środowiskowe

| Zmienna | Gdzie | Po co |
| --- | --- | --- |
| `DATOCMS_API_TOKEN` | `.env` i Netlify | token DatoCMS tylko do odczytu — build pobiera treści |
| `DATOCMS_CMA_TOKEN` | tylko `.env` | pełny dostęp do DatoCMS, wyłącznie do lokalnych skryptów; **nigdy na Netlify** |
| `PUBLIC_GTM_ID` | Netlify | Google Tag Manager (`GTM-XXXXXXX`); bez niego żaden skrypt Google się nie ładuje |

## Jak to działa

- **Treści** są pobierane z DatoCMS w czasie buildu (`src/lib/datocms.ts`). Strona jest statyczna.
- **Publikacja w DatoCMS** uruchamia nowy build na Netlify (webhook), po ok. 15 s zmiany są na stronie. Netlify odsyła wynik buildu do DatoCMS (przycisk „Build status”).
- **Push na `main`** też buduje i publikuje stronę automatycznie.
- **Formularze** (kontakt, newsletter, wypis z newslettera) obsługuje Netlify Forms; powiadomienia o zgłoszeniach idą e-mailem (ustawienia: Netlify → Forms → Submission notifications).
- **Menu** i podstrony: `src/assets/data/strukturaStrony.js`. Sklep jest chwilowo ukryty (`SHOP_PUBLISHED`).
- **Wygląd**: kolory, fonty i odstępy w `src/styles/tokens.css`; bloki sekcji w `src/components/blocks/`.
- **SEO**: sitemap (`@astrojs/sitemap`), `robots.txt` i `llms.txt` generowane w `src/pages/`, dane strukturalne JSON-LD w `src/lib/structuredData.ts`, adres produkcyjny w `astro.config.mjs` (`site`).

## Struktura

```text
src/
  assets/data/    menu i dane kontaktowe (zapas, gdy CMS niedostępny)
  components/     sekcje stron, blocks/ (bloki z CMS-u), ui/ (przyciski, kontenery)
  images/         logo, tła sekcji, zdjęcie zapasowe hero
  layouts/        BaseLayout (head, SEO, zgody cookies), LegalLayout (regulamin, polityka)
  lib/            DatoCMS, dane strukturalne, ikony
  pages/          podstrony (routing plikowy Astro)
  styles/         tokeny CSS
```
