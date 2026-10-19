// Ikony kart z CMS-u — Phosphor Icons, wariant duotone (licencja MIT,
// bez obowiązku podpisu autora): https://phosphoricons.com
// Pliki SVG trafiają do HTML przy buildzie (bez dodatkowych zapytań).
// Ikona dobierana po słowie w tytule karty, więc zmiana kolejności kart
// w CMS-ie nie miesza ikon.
import barbell from '@phosphor-icons/core/assets/duotone/barbell-duotone.svg?raw';
import bowlFood from '@phosphor-icons/core/assets/duotone/bowl-food-duotone.svg?raw';
import taiChi from '@phosphor-icons/core/assets/duotone/person-simple-tai-chi-duotone.svg?raw';
import chats from '@phosphor-icons/core/assets/duotone/chats-circle-duotone.svg?raw';
import mountains from '@phosphor-icons/core/assets/duotone/mountains-duotone.svg?raw';
import checkCircle from '@phosphor-icons/core/assets/duotone/check-circle-duotone.svg?raw';
import deviceMobile from '@phosphor-icons/core/assets/duotone/device-mobile-duotone.svg?raw';
import cookingPot from '@phosphor-icons/core/assets/duotone/cooking-pot-duotone.svg?raw';
import calculator from '@phosphor-icons/core/assets/duotone/calculator-duotone.svg?raw';
import barcode from '@phosphor-icons/core/assets/duotone/barcode-duotone.svg?raw';
import shoppingCart from '@phosphor-icons/core/assets/duotone/shopping-cart-duotone.svg?raw';
import leaf from '@phosphor-icons/core/assets/duotone/leaf-duotone.svg?raw';

// słowo w tytule (małe litery) → ikona; pierwsze dopasowanie wygrywa,
// dlatego dokładniejsze reguły są wyżej (np. „aplikacja mobilna” przed „mobility”)
const KEYWORDS: [RegExp, string][] = [
  // Dieta — „Zobacz, co zyskujesz z Canela Diet”
  [/aplikac/, deviceMobile],
  [/przepis/, cookingPot],
  [/kalori|makro/, calculator],
  [/skan/, barcode],
  [/zakup/, shoppingCart],
  [/model żywien|najprost/, leaf],
  // Współpraca 1:1 — „Zakres współpracy”
  [/trening/, barbell],
  [/żywien|diet|jedzen/, bowlFood],
  [/mobil|ruch/, taiChi],
  [/kontakt|wsparci/, chats],
  [/gór|wyjści/, mountains],
];

// zwraca kod SVG ikony (kolor z currentColor) — do wstawienia przez set:html
export function iconFor(title: string): string {
  const t = title.toLowerCase();
  return (KEYWORDS.find(([re]) => re.test(t))?.[1] ?? checkCircle).replace('<svg ', '<svg aria-hidden="true" ');
}
