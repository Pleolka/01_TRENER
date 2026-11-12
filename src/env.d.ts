/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly DATOCMS_API_TOKEN: string;
	readonly PUBLIC_GTM_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface Window {
	dataLayer: unknown[];
	gtag: (...args: unknown[]) => void;
	loadGtm: () => void;
	gtmLoaded?: boolean;
}
