import type { Language } from './index';

const langSuffixes: Record<Language, string[]> = {
  uzb: ['uzb', 'uz'],
  rus: ['rus', 'ru'],
  eng: ['eng', 'en'],
};

export function getLocalizedSectionValue(
  content: Record<string, Record<string, string>>,
  section: string,
  key: string,
  language: Language,
  fallback: string
) {
  const sectionContent = content[section] || {};
  const localizedValue = langSuffixes[language]
    .map(suffix => sectionContent[`${key}_${suffix}`])
    .find(Boolean);

  if (localizedValue) return localizedValue;
  if (sectionContent[key]) return sectionContent[key];

  return fallback;
}

export function pickLocalized<T extends Record<string, any>>(
  item: T,
  baseKey: string,
  language: Language,
  fallback = ''
) {
  const localizedValue = langSuffixes[language]
    .map(suffix => item[`${baseKey}_${suffix}`])
    .find(Boolean);

  return localizedValue || item[baseKey] || fallback;
}
