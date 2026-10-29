import React from 'react';
import {
  Activity,
  Droplet,
  Thermometer,
  Apple,
  Heart,
  Shield,
  Hospital,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import { HealthTopic, SupportedLanguage } from '../types';

interface Props {
  topic: HealthTopic;
  language: SupportedLanguage;
  onSelect: (topic: HealthTopic) => void;
  isLoading: boolean;
}

export const HealthCard: React.FC<Props> = ({
  topic,
  language,
  onSelect,
  isLoading,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Activity':
        return <Activity className="w-6 h-6 text-emerald-600" />;
      case 'Droplet':
        return <Droplet className="w-6 h-6 text-amber-600" />;
      case 'Thermometer':
        return <Thermometer className="w-6 h-6 text-rose-600" />;
      case 'Apple':
        return <Apple className="w-6 h-6 text-green-700" />;
      case 'Heart':
        return <Heart className="w-6 h-6 text-red-600" />;
      case 'Shield':
        return <Shield className="w-6 h-6 text-purple-600" />;
      case 'Hospital':
        return <Hospital className="w-6 h-6 text-blue-600" />;
      default:
        return <Activity className="w-6 h-6 text-emerald-600" />;
    }
  };

  const getLocalizedTitle = () => {
    if (language === 'ta') return topic.titleTa;
    if (language === 'hi') return topic.titleHi;
    return topic.titleEn;
  };

  const getSubTitle = () => {
    if (language === 'ta') return topic.titleEn;
    if (language === 'hi') return topic.titleEn;
    return topic.titleTa; // Bilingual context
  };

  return (
    <button
      onClick={() => onSelect(topic)}
      disabled={isLoading}
      className="group relative flex flex-col justify-between p-4 sm:p-5 text-left bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all active:scale-[0.98] touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500"
      aria-label={`Ask Sakhi about ${topic.titleEn}`}
    >
      <div className="flex items-start justify-between w-full mb-3">
        <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
          {getIcon(topic.iconName)}
        </div>
        <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 group-hover:bg-emerald-100/70 group-hover:text-emerald-800 px-2.5 py-1 rounded-full transition-colors">
          {topic.badgeText}
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-stone-900 text-base sm:text-lg group-hover:text-emerald-700 transition-colors">
          {getLocalizedTitle()}
        </h4>
        <p className="text-xs text-stone-500 font-medium">{getSubTitle()}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between w-full text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
        <span className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5" />
          <span>
            {language === 'ta'
              ? 'சகியிடம் கேளுங்கள்'
              : language === 'hi'
              ? 'सखी से पूछें'
              : 'Ask Voice Sakhi'}
          </span>
        </span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};
