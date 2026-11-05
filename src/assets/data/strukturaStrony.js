// Sklep (lista produktów, podstrony, pozycja w menu) widać tylko, gdy w Netlify
// ustawiona jest zmienna PUBLIC_SHOP_PUBLISHED=true. Można ją włączyć tylko dla
// podglądów (Deploy Previews), żeby testować sklep, zanim pokaże się klientom.
// Koszyk (/koszyk) i strona zamówienia działają zawsze — np. dla subskrypcji
// diety kupowanej z przycisku na stronie Dieta.
export const SHOP_PUBLISHED = import.meta.env.PUBLIC_SHOP_PUBLISHED === 'true';

export const list = [
  {
    name: "O mnie",
    path: "/o-mnie",
  },
  {
    name: "Współpraca 1:1",
    path: "/wspolpraca-11",
  },
  {
    name: "Dieta",
    path: "/dieta",
  },
  ...(SHOP_PUBLISHED ? [{ name: "Sklep online", path: "/sklep-online" }] : []),
  {
    name: "Blog",
    path: "/blog",
  },
  {
    name: "Kontakt",
    path: "/kontakt",
    cta: true,
  },
];
