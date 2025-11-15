import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import i18next, { t } from '../i18n';

type Locale = 'en' | 'ru';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: any) => string;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Инициализация локали при загрузке
  useEffect(() => {
    const initializeLocale = () => {
      // 1. Проверяем URL параметр
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang') as Locale;
      
      // 2. Проверяем localStorage
      const storedLang = localStorage.getItem('locale') as Locale;
      
      // 3. Проверяем язык браузера
      const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
      
      // Выбираем язык в порядке приоритета
      const finalLocale = urlLang || storedLang || browserLang;
      
      setLocale(finalLocale);
    };

    initializeLocale();
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    i18next.changeLanguage(newLocale);
    
    // Сохраняем в localStorage
    localStorage.setItem('locale', newLocale);
    
    // Обновляем URL без перезагрузки страницы
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLocale);
    window.history.replaceState({}, '', url.toString());
    
    // Отправляем событие для обновления других компонентов
    window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale: newLocale } }));
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ru' : 'en');
  };

  const value: LocaleContextType = {
    locale,
    setLocale,
    t,
    toggleLocale
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}








