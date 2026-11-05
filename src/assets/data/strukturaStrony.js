// sklep chwilowo ukryty. Żeby go przywrócić: ustaw true, zmień nazwę folderu
// src/pages/_sklep-online na sklep-online i usuń przekierowania w astro.config.mjs
export const SHOP_PUBLISHED = false;

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
