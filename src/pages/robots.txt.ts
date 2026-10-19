import type { APIRoute } from 'astro';

// robots.txt — cała strona dostępna dla wyszukiwarek i asystentów AI
// (ChatGPT, Gemini, Claude, Perplexity, Apple, Bing). Wprost wymienione boty
// AI, bo część z nich sprawdza tylko własny wpis. Adres mapy strony z domeny
// w astro.config.mjs.
const AI_BOTS = [
	'GPTBot', // OpenAI — trening modeli
	'OAI-SearchBot', // wyszukiwanie w ChatGPT
	'ChatGPT-User', // ChatGPT otwierający stronę na prośbę użytkownika
	'Google-Extended', // Gemini
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'PerplexityBot',
	'Perplexity-User',
	'Applebot-Extended',
	'Bingbot', // Copilot i wyszukiwanie ChatGPT korzystają z indeksu Binga
];

export const GET: APIRoute = ({ site }) => {
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /dziekujemy',
		'',
		...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
		`Sitemap: ${new URL('/sitemap-index.xml', site)}`,
		'',
		`# Podsumowanie strony dla modeli AI: ${new URL('/llms.txt', site)}`,
		'',
	].join('\n');

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
