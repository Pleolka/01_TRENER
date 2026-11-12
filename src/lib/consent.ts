/** Klucz localStorage z wyborem z okna cookies (JSON z polami zgód).
 *  v2 — od dodania zgody „Marketing”: wcześniejsze wybory („granted”/„denied”
 *  pod kluczem „cookie-consent”) nie obejmowały reklam, więc okno pyta ponownie. */
export const CONSENT_STORAGE_KEY = 'cookie-consent-v2';

export interface ConsentChoice {
	/** Google Analytics (analytics_storage) */
	analytics: boolean;
	/** piksel Meta, Google Ads (ad_storage, ad_user_data, ad_personalization) */
	marketing: boolean;
}

/** Stan Google Consent Mode v2 dla danego wyboru. */
export const consentModeState = (choice: ConsentChoice) => {
	const ads = choice.marketing ? 'granted' : 'denied';
	return {
		analytics_storage: choice.analytics ? 'granted' : 'denied',
		ad_storage: ads,
		ad_user_data: ads,
		ad_personalization: ads,
	};
};
