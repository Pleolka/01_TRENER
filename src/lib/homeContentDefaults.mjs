// Treści strony głównej — słowo w słowo z https://nataliafigas.pl/.
// Służą jako fallback, gdy DatoCMS jest niedostępny, i jako dane startowe
// dla rekordu home_content. Konwencje pól tekstowych:
//   *tekst*            → fragment wyróżniony kolorem w nagłówku
//   lista (1 linia = 1 pozycja)
//   pillars:  "Tytuł | opis"
//   stats:    "wartość | sufiks | etykieta"
export const homeContentDefaults = {
	heroBadge: 'Trening | dieta | produkty online',
	heroHeading: 'Zdrowie, *siła*, kobiecość',
	heroText:
		'Programy treningowe, dieta w aplikacji i prowadzenie 1:1 dla kobiet biznesu. Budowanie siły, kształtowanie sylwetki i zdrowe życie.',
	heroPrimaryButton: 'Współpracuj 1:1',
	heroSecondaryButton: 'Sprawdź produkty online',
	heroStats: ['14 |  lat | Praktyki', '4 |  | Programy online', '5000 | + | Kcal dziennie spalonych'].join('\n'),

	aboutBadge: 'O MNIE',
	aboutHeading: 'Silne, zdrowe ciało tworzy *wspaniałe życie*.',
	aboutText: [
		'Od ponad 25 lat moje życie jest związane ze sportem. Wspieram kobiety biznesu w budowaniu sprawności fizycznej, siły i zdrowych relacji ze swoim ciałem. Za pomocą mojego wieloletniego doświadczenia prowadzę kobiety do sukcesu zdefiniowanego przez sprawność fizyczną, zadowolenie i nieograniczoną pewność siebie.',
		'Moje metody działają dzięki skupieniu, dyscyplinie i szlifowaniu tego, co ma realne znaczenie. Projektuję Twój sukces na trzech poziomach: precyzyjny plan treningowy, racjonalne odżywianie i wsparcie w budowaniu zdrowych nawyków na lata.',
	].join('\n\n'),
	pillars: [
		'2halves | Połączenie celowanego treningu, skutecznej diety i mentoringu 1:1.',
		'Ścieżka zdrowia | Analiza możliwości treningowo-dietetycznych i dobór rozwiązań.',
		'Społeczność | Grupowe wyjścia w góry i wsparcie społeczności kobiet biznesu.',
		'Wsparcie mentalne | Praca nad mindsetem i konkretne, psychologiczne metody działania.',
	].join('\n'),
	aboutButton: 'Poznaj mnie lepiej',

	coachingBadge: '2halves',
	coachingHeading: '*Indywidualna* opieka trenerska. *Autorska* metoda.',
	coachingText:
		'Stwórz silne ciało i zdrowy mindset do prowadzenia biznesu. Prowadzę Cię od zera do pełnego sukcesu krok po kroku, dzień po dniu. Skupiamy Twoją uwagę na tym, co przynosi realne rezultaty – bez wymówek.',
	coachingList: ['Audyt przed startem', 'Trening i dieta szyte na miarę', 'Wsparcie mentalne i kontakt'].join('\n'),
	coachingButton: 'Aplikuj o współpracę',
	coachingStats: ['0 |  | wymówek', '100 | % | skupienia'].join('\n'),

	dietBadge: 'Canela, aplikacja dietetyczna',
	dietHeading: 'Najedzona, *zdrowa*, szczęśliwa.',
	dietText:
		'Indywidualny plan żywieniowy, który daje Ci paliwo do prowadzenia biznesu. Zbilansowane dania inspirowane kuchnią śródziemnomorską, wygodny widok, proste wskazówki żywieniowe.',
	dietList: ['100+ przepisów', 'Wygodna lista zakupów', 'Wymiany produktów/dań', '15 min / danie'].join('\n'),
	dietPrimaryButton: 'Wypróbuj subskrypcję',
	dietSecondaryButton: 'Zobacz przepisy',

	newsletterBadge: 'Zdobywaj dodatkową wiedzę',
	newsletterHeading: 'Newsletter 2halves',
	newsletterText:
		'Zapisz się na mój mailing, aby poznać sekrety treningowe i dietetyczne. Dołączając, otrzymasz darmowego ebooka „7 białkowych śniadań”. E-mail wysyłam w każdy piątek.',
	newsletterList: ['Sekrety skutecznego treningu', 'Tajniki zdrowego odżywiania', 'Mindset w biznesie i sporcie'].join('\n'),
	newsletterPlaceholder: 'Twój adres e-mail',
	newsletterButton: 'Zapisz się',
};
