import React from 'react';
import { SupportedLanguage } from '../types';
import { playBrowserSynthesis, playChime } from '../utils/speech';

interface Props {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<Props> = ({ currentLanguage, onSelectLanguage }) => {
  const languages: { code: SupportedLanguage; label: string; native: string; flag: string; spokenAnnounce: string }[] = [
    {
      code: 'ta',
      label: 'Tamil',
      native: 'தமிழ்',
      flag: '🇮🇳',
      spokenAnnounce: 'வணக்கம், நீங்கள் இப்போது தமிழில் பேசலாம்.',
    },
    {
      code: 'hi',
      label: 'Hindi',
      native: 'हिंदी',
      flag: '🇮🇳',
      spokenAnnounce: 'नमस्ते, अब आप हिंदी में बात कर सकते हैं।',
    },
    {
      code: 'en',
      label: 'English',
      native: 'English',
      flag: '🌐',
      spokenAnnounce: 'Hello, you can now speak in English.',
    },
  ];

  const handleSelect = (code: SupportedLanguage, announcement: string) => {
    onSelectLanguage(code);
    playChime('success');
    // Illiterate user audio confirmation so they immediately know language switched
    playBrowserSynthesis(announcement, code);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
      {languages.map((lang) => {
        const isActive = currentLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code, lang.spokenAnnounce)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all touch-manipulation ${
              isActive
                ? 'bg-emerald-600 text-white shadow-sm scale-100'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/70'
            }`}
            title={`Switch to ${lang.label}`}
            aria-label={`Switch language to ${lang.label} - ${lang.native}`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="tracking-wide">{lang.native}</span>
          </button>
        );
      })}
    </div>
  );
};
