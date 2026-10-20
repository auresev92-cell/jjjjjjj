export interface DetectedGeoInfo {
  language: string;
  langCode: string;
  country: string;
  countryCode: string;
  city: string;
  ip?: string;
}

const COUNTRY_TO_LANG: Record<string, { lang: string; langCode: string; defaultCity: string }> = {
  CI: { lang: 'Français', langCode: 'fr', defaultCity: 'Abidjan' },
  FR: { lang: 'Français', langCode: 'fr', defaultCity: 'Paris' },
  SN: { lang: 'Français', langCode: 'fr', defaultCity: 'Dakar' },
  CM: { lang: 'Français', langCode: 'fr', defaultCity: 'Douala' },
  CA: { lang: 'Français', langCode: 'fr', defaultCity: 'Montréal' },
  BE: { lang: 'Français', langCode: 'fr', defaultCity: 'Bruxelles' },
  CH: { lang: 'Français', langCode: 'fr', defaultCity: 'Genève' },
  MA: { lang: 'Français', langCode: 'fr', defaultCity: 'Casablanca' },
  DZ: { lang: 'Français', langCode: 'fr', defaultCity: 'Alger' },
  TN: { lang: 'Français', langCode: 'fr', defaultCity: 'Tunis' },
  GA: { lang: 'Français', langCode: 'fr', defaultCity: 'Libreville' },
  BF: { lang: 'Français', langCode: 'fr', defaultCity: 'Ouagadougou' },
  GN: { lang: 'Français', langCode: 'fr', defaultCity: 'Conakry' },
  ML: { lang: 'Français', langCode: 'fr', defaultCity: 'Bamako' },
  CD: { lang: 'Français', langCode: 'fr', defaultCity: 'Kinshasa' },
  US: { lang: 'English', langCode: 'en', defaultCity: 'New York' },
  GB: { lang: 'English', langCode: 'en', defaultCity: 'London' },
  NG: { lang: 'English', langCode: 'en', defaultCity: 'Lagos' },
  GH: { lang: 'English', langCode: 'en', defaultCity: 'Accra' },
  ES: { lang: 'Español', langCode: 'es', defaultCity: 'Madrid' },
  DE: { lang: 'Deutsch', langCode: 'de', defaultCity: 'Berlin' },
  IT: { lang: 'Italiano', langCode: 'it', defaultCity: 'Rome' },
  PT: { lang: 'Português', langCode: 'pt', defaultCity: 'Lisbon' },
  BR: { lang: 'Português', langCode: 'pt', defaultCity: 'São Paulo' },
};

export async function detectUserGeoAndLanguage(): Promise<DetectedGeoInfo> {
  const navLang = typeof navigator !== 'undefined' ? (navigator.language || (navigator.languages && navigator.languages[0]) || 'fr') : 'fr';
  const shortLang = navLang.substring(0, 2).toLowerCase();

  let defaultLang = 'Français';
  if (shortLang === 'en') defaultLang = 'English';
  else if (shortLang === 'es') defaultLang = 'Español';
  else if (shortLang === 'de') defaultLang = 'Deutsch';
  else if (shortLang === 'it') defaultLang = 'Italiano';
  else if (shortLang === 'pt') defaultLang = 'Português';

  const defaultFallback: Record<string, { country: string; countryCode: string; city: string }> = {
    fr: { country: 'France', countryCode: 'FR', city: 'Paris' },
    en: { country: 'United States', countryCode: 'US', city: 'New York' },
    es: { country: 'España', countryCode: 'ES', city: 'Madrid' },
    de: { country: 'Deutschland', countryCode: 'DE', city: 'Berlin' },
    it: { country: 'Italia', countryCode: 'IT', city: 'Roma' },
    pt: { country: 'Brasil', countryCode: 'BR', city: 'São Paulo' },
  };

  const initialGeo = defaultFallback[shortLang] || defaultFallback['fr'];

  let result: DetectedGeoInfo = {
    language: defaultLang,
    langCode: shortLang,
    country: initialGeo.country,
    countryCode: initialGeo.countryCode,
    city: initialGeo.city,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        const countryCode = data.country_code.toUpperCase();
        const mapping = COUNTRY_TO_LANG[countryCode];

        result = {
          language: mapping ? mapping.lang : defaultLang,
          langCode: mapping ? mapping.langCode : shortLang,
          country: data.country_name || 'Côte d\'Ivoire',
          countryCode: countryCode,
          city: data.city || (mapping ? mapping.defaultCity : 'Abidjan'),
          ip: data.ip
        };
      }
    }
  } catch (e) {
    // Fallback to browser navigator
  }

  try {
    localStorage.setItem('bavel_user_language', result.language);
    localStorage.setItem('bavel_user_country', result.country);
    localStorage.setItem('bavel_user_city', result.city);
    localStorage.setItem('bavel_user_ip', result.ip || '');
  } catch {}

  return result;
}

export function getStoredLanguage(): string {
  try {
    const saved = localStorage.getItem('bavel_user_language');
    if (saved) return saved;
  } catch {}
  
  const navLang = typeof navigator !== 'undefined' ? (navigator.language || 'fr') : 'fr';
  if (navLang.startsWith('en')) return 'English';
  if (navLang.startsWith('es')) return 'Español';
  if (navLang.startsWith('de')) return 'Deutsch';
  if (navLang.startsWith('it')) return 'Italiano';
  return 'Français';
}
