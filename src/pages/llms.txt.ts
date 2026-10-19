import type { APIRoute } from 'astro';
import { getCooperationPage, getDietPage, getOffers, getBlogPosts, getSiteConfig } from '../lib/datocms';

// llms.txt (llmstxt.org) — krótkie podsumowanie strony w Markdownie dla
// asystentów AI: kim jest Natalia Figas, co oferuje, za ile, gdzie szukać
// szczegółów. Generowane przy buildzie z treści w DatoCMS.
export const GET: APIRoute = async ({ site }) => {
	const [coop, diet, offers, posts, config] = await Promise.all([
		getCooperationPage(),
		getDietPage(),
		getOffers(),
		getBlogPosts(),
		getSiteConfig(),
	]);
	const url = (path: string) => new URL(path, site).toString();
	const products = offers.filter((o) => o.price && o.slug);

	const lines = [
		'# Natalia Figas — trenerka personalna',
		'',
		'> Natalia Figas (Nati Figas) to trenerka personalna z ponad 25-letnim doświadczeniem w sporcie. Prowadzi kobiety — zwłaszcza przedsiębiorczynie — przez trening siłowy, dietę i budowanie zdrowych nawyków. Współpraca odbywa się online, w całej Polsce, w języku polskim.',
		'',
		'Specjalizacje: trening personalny online, trening siłowy kobiet, kształtowanie sylwetki i redukcja, dieta i żywienie, mobility, nawyki i mindset. Autorski program współpracy 1:1 „2halves” oraz aplikacja dietetyczna „Canela Diet”.',
		'',
		'## Oferta',
		'',
		`- [Współpraca 1:1 — program 2halves](${url('/wspolpraca-11')}): 12-tygodniowy indywidualny program treningowy, plan dietetyczny w aplikacji, mobility, stały kontakt (raporty, chat), comiesięczne wyjścia w góry. Cena ustalana indywidualnie po wypełnieniu formularza.`,
		`- [Dieta — Canela Diet](${url('/dieta')}): aplikacja z ponad 100 przepisami kuchni śródziemnomorskiej, listą zakupów i wymianą dań.${
			diet?.plans?.length ? ' Pakiety: ' + diet.plans.map((p) => `${p.name} — ${p.price}`).join('; ') + '.' : ''
		}`,
		`- [O mnie](${url('/o-mnie')}): doświadczenie, misja i marki Soltura oraz Canela.`,
		'',
	];

	if (products.length) {
		lines.push('## Sklep — plany treningowe, diety i e-booki', '');
		for (const p of products) lines.push(`- [${p.title}](${url(`/sklep-online/${p.slug}`)}): ${p.description} Cena: ${p.price}.`);
		lines.push('');
	}

	const faq = [...(coop?.faq ?? []), ...(diet?.faq ?? [])];
	if (faq.length) {
		lines.push('## Najczęściej zadawane pytania', '');
		for (const q of faq) lines.push(`- **${q.question}** ${q.answer}`);
		lines.push('');
	}

	if (posts.length) {
		lines.push('## Blog', '');
		for (const p of posts) lines.push(`- [${p.title}](${url(`/blog/${p.slug}`)})`);
		lines.push('');
	}

	lines.push('## Kontakt', '');
	lines.push(`- [Formularz kontaktowy](${url('/kontakt')})`);
	if (config?.email) lines.push(`- E-mail: ${config.email}`);
	if (config?.phone) lines.push(`- Telefon: ${config.phone}`);
	for (const [name, link] of [
		['Instagram', config?.instagramUrl],
		['Facebook', config?.facebookUrl],
		['YouTube', config?.youtubeUrl],
	]) {
		if (link) lines.push(`- ${name}: ${link}`);
	}
	lines.push('');

	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
