// Czyści HTML wklejony do edytora z innych narzędzi (ChatGPT, Word, Google Docs):
// ukryte komentarze, obce klasy i style, przyciski kopiowania, puste akapity.
// Klasy używane w stylach wpisów (.btn, .eyebrow, .price) zostają.
const KEEP_CLASS = /\b(btn|btn-outline|eyebrow|price)\b/;

export const cleanHtml = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<button\b[\s\S]*?<\/button>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
    .replace(/<\/?(span|div|font)\b[^>]*>/gi, '')
    .replace(/\sclass="([^"]*)"/gi, (match, value) => (KEEP_CLASS.test(value) ? match : ''))
    .replace(/\s(style|id|dir|tabindex|scope|aria-[a-z-]+|data-[a-z-]+)="[^"]*"/gi, '')
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/\n{2,}/g, '\n')
    .trim();

const PL = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => PL[c])
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// nadaje nagłówkom H2 kotwice i zwraca listę do spisu treści
export const withToc = (html) => {
  const toc = [];
  const used = new Set();
  const withIds = html.replace(/<h2>([\s\S]*?)<\/h2>/gi, (_, inner) => {
    const label = inner.replace(/<[^>]+>/g, '').trim();
    let id = slug(label) || 'sekcja';
    for (let n = 2; used.has(id); n++) id = `${slug(label)}-${n}`;
    used.add(id);
    toc.push({ id, label });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: withIds, toc };
};
