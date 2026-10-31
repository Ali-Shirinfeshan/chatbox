const RTL_LANGUAGES = ['fa', 'ar', 'he', 'ur', 'ps', 'ku'];

export function isRTL(lang: string): boolean {
  const baseLang = lang.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.includes(baseLang);
}