// V10.6 — Language Switcher (global EPD)
// 24 world languages with native names + flag emoji + RTL support for ar/he.
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGS = [
  { code: 'ro', name: 'Română',       flag: '🇷🇴' },
  { code: 'en', name: 'English',      flag: '🇬🇧' },
  { code: 'es', name: 'Español',      flag: '🇪🇸' },
  { code: 'fr', name: 'Français',     flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',      flag: '🇩🇪' },
  { code: 'it', name: 'Italiano',     flag: '🇮🇹' },
  { code: 'pt', name: 'Português',    flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands',   flag: '🇳🇱' },
  { code: 'pl', name: 'Polski',       flag: '🇵🇱' },
  { code: 'uk', name: 'Українська',   flag: '🇺🇦' },
  { code: 'ru', name: 'Русский',      flag: '🇷🇺' },
  { code: 'tr', name: 'Türkçe',       flag: '🇹🇷' },
  { code: 'ar', name: 'العربية',       flag: '🇸🇦', rtl: true },
  { code: 'he', name: 'עברית',         flag: '🇮🇱', rtl: true },
  { code: 'hi', name: 'हिन्दी',         flag: '🇮🇳' },
  { code: 'zh', name: '中文',           flag: '🇨🇳' },
  { code: 'ja', name: '日本語',         flag: '🇯🇵' },
  { code: 'ko', name: '한국어',         flag: '🇰🇷' },
  { code: 'vi', name: 'Tiếng Việt',   flag: '🇻🇳' },
  { code: 'th', name: 'ไทย',           flag: '🇹🇭' },
  { code: 'el', name: 'Ελληνικά',      flag: '🇬🇷' },
  { code: 'hu', name: 'Magyar',       flag: '🇭🇺' },
  { code: 'cs', name: 'Čeština',      flag: '🇨🇿' },
  { code: 'bg', name: 'Български',    flag: '🇧🇬' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const current = LANGS.find((l) => l.code === i18n.language?.split('-')[0]) || LANGS[0];

  useEffect(() => {
    const onClickOut = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  useEffect(() => {
    // Apply RTL direction for ar/he
    const rtl = LANGS.find((l) => l.code === current.code)?.rtl;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = current.code;
  }, [current]);

  const change = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} data-testid="language-switcher">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md transition-all backdrop-blur-sm`}
        data-testid="language-switcher-toggle"
        aria-label="Change language"
      >
        <Globe className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="font-semibold uppercase tracking-wider">{current.code}</span>
        <ChevronDown className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 max-h-[60vh] overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-2xl z-50">
          <div className="p-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => change(l.code)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between gap-2 transition-colors ${
                  l.code === current.code ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
                data-testid={`lang-option-${l.code}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{l.flag}</span>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{l.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">{l.code}</div>
                  </div>
                </div>
                {l.code === current.code && <Check className="w-4 h-4 text-violet-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
