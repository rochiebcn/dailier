import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'es';

type TranslationParams = Record<string, string | number>;

const STORAGE_KEY = 'dailier-language';

const FALLBACK_LANGUAGE: Language = 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly language = signal<Language>(this.getInitialLanguage());
  private readonly dictionaries = new Map<Language, Record<string, string>>();

  async setLanguage(language: Language): Promise<void> {
    await this.loadLanguage(FALLBACK_LANGUAGE);
    await this.loadLanguage(language);
    this.language.set(language);
    localStorage.setItem(STORAGE_KEY, language);
  }


  t(key: string, params?: TranslationParams): string {
    const dictionary = this.dictionaries.get(this.language()) ?? {};
    const fallbackDictionary = this.dictionaries.get(FALLBACK_LANGUAGE) ?? {};
    const fallback = fallbackDictionary[key] ?? key;
    const raw = dictionary[key] ?? fallback;

    if (!params) {
      return raw;
    }

    return Object.entries(params).reduce(
      (acc, [paramKey, value]) => acc.replaceAll(`{${paramKey}}`, String(value)),
      raw
    );
  }

  private async loadLanguage(language: Language): Promise<void> {
    if (this.dictionaries.has(language)) {
      return;
    }

    try {
      const response = await fetch(`/i18n/${language}.properties`);
      if (!response.ok) {
        this.dictionaries.set(language, {});
        return;
      }

      const fileContent = await response.text();
      this.dictionaries.set(language, this.parseProperties(fileContent));
    } catch {
      this.dictionaries.set(language, {});
    }
  }

  private parseProperties(fileContent: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = fileContent.split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.startsWith('!')) {
        continue;
      }

      const separatorIndex = this.findSeparator(line);
      if (separatorIndex === -1) {
        result[line] = '';
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      result[key] = this.decodeEscapes(value);
    }

    return result;
  }

  private decodeEscapes(value: string): string {
    return value
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
  }

  private findSeparator(line: string): number {
    const equalIndex = line.indexOf('=');
    const colonIndex = line.indexOf(':');

    if (equalIndex === -1) {
      return colonIndex;
    }
    if (colonIndex === -1) {
      return equalIndex;
    }

    return Math.min(equalIndex, colonIndex);
  }

  private getInitialLanguage(): Language {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es') {
      return stored;
    }
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('es') ? 'es' : 'en';
  }
}

