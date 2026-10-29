import React from 'react';
import {
  Volume2,
  Square,
  AlertTriangle,
  Activity,
  Heart,
  Droplet,
  Apple,
  Shield,
  Clock,
  Pill,
  Smile,
  Sun,
  MapPin,
  Sparkles,
  Phone,
  User,
} from 'lucide-react';
import { ChatMessage, SupportedLanguage } from '../types';

interface Props {
  message: ChatMessage;
  language: SupportedLanguage;
  isAudioPlaying: boolean;
  onPlayAudio: (text: string, lang: SupportedLanguage) => void;
  onStopAudio: () => void;
  onOpenHospitalModal: () => void;
}

export const ChatMessageBubble: React.FC<Props> = ({
  message,
  language,
  isAudioPlaying,
  onPlayAudio,
  onStopAudio,
  onOpenHospitalModal,
}) => {
  const isUser = message.role === 'user';
  const data = message.data;

  const renderTipIcon = (iconType: string) => {
    const cls = 'w-4 h-4 text-emerald-700 flex-shrink-0';
    switch (iconType) {
      case 'activity':
        return <Activity className={cls} />;
      case 'heart':
        return <Heart className={cls} />;
      case 'droplet':
        return <Droplet className={cls} />;
      case 'apple':
        return <Apple className={cls} />;
      case 'shield':
        return <Shield className={cls} />;
      case 'clock':
        return <Clock className={cls} />;
      case 'pill':
        return <Pill className={cls} />;
      case 'sun':
        return <Sun className={cls} />;
      default:
        return <Smile className={cls} />;
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 my-3 animate-fadeIn">
        <div className="max-w-[85%] sm:max-w-[75%] bg-stone-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-[11px] text-stone-400 font-medium">
            <User className="w-3.5 h-3.5" />
            <span>You (Voice / Spoken)</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed font-medium">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  // Sakhi Assistant Response
  return (
    <div className="flex justify-start gap-3 my-4 animate-fadeIn">
      {/* Anime Doctor Sakhi Avatar */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-teal-400 shadow-md ring-2 ring-teal-200/50 flex-shrink-0 bg-teal-950">
        <img
          src="/src/assets/images/anime_doctor_sakhi_1793264335258.jpg"
          alt="Dr. Sakhi"
          className="w-full h-full object-cover object-top"
        />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
      </div>

      <div className="max-w-[94%] sm:max-w-[85%] bg-white rounded-3xl rounded-tl-xs border border-teal-200/80 shadow-md p-4 sm:p-5 space-y-4 relative overflow-hidden">
        {/* Subtle Hospital Watermark / Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-teal-700 font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1.5">
              <span>🏥 Dr. Sakhi · Medical Consultation</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-teal-50 text-teal-800 rounded border border-teal-200">
              OPD Rx
            </span>
          </div>

          {/* Accent style badge */}
          {data?.identifiedAccentOrStyle && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 text-teal-900 border border-teal-200 rounded-full text-xs font-semibold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Accent: {data.identifiedAccentOrStyle}</span>
            </div>
          )}
        </div>

        {/* Audio Playback Bar for Illiterate Users */}
        <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAudioPlaying ? 'bg-emerald-600 text-white animate-pulse' : 'bg-emerald-200 text-emerald-800'}`}>
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                {language === 'ta'
                  ? 'சகியின் குரலில் கேளுங்கள்'
                  : language === 'hi'
                  ? 'सखी की आवाज में सुनें'
                  : 'Listen to Sakhi Speaking'}
              </p>
              <p className="text-[11px] text-emerald-700">
                {isAudioPlaying ? 'Playing speech right now...' : 'Tap play to listen to this health advice'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isAudioPlaying) {
                onStopAudio();
              } else {
                onPlayAudio(data?.spokenText || message.text, language);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              isAudioPlaying
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isAudioPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play Voice</span>
              </>
            )}
          </button>
        </div>

        {/* Spoken Core Response (Large clear font for readability) */}
        <div className="space-y-2">
          <p className="text-stone-900 font-semibold text-base sm:text-lg leading-relaxed">
            {data?.spokenText || message.text}
          </p>

          {data?.fullAdvice && (
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mt-2 pt-2 border-t border-stone-100">
              {data.fullAdvice}
            </p>
          )}
        </div>

        {/* Red-Flag Emergency Alert Box */}
        {data?.isEmergency && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-bounce" />
              <span>Urgent Medical Attention Needed / அவசர மருத்துவ ஆலோசனை</span>
            </div>
            <p className="text-xs sm:text-sm text-rose-800 font-medium">
              {data.emergencyAction ||
                'Symptoms suggest a medical emergency. Do not delay. Call 108 ambulance or visit the nearest emergency hospital immediately.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="tel:108"
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency Ambulance (108)</span>
              </a>
              <button
                onClick={onOpenHospitalModal}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Find Nearest Emergency Hospital via GPS</span>
              </button>
            </div>
          </div>
        )}

        {/* Actionable Health Tips Cards */}
        {data?.actionableTips && data.actionableTips.length > 0 && (
          <div className="space-y-2 pt-1">
            <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {language === 'ta'
                ? 'தினசரி செய்ய வேண்டிய எளிய வழிகள்'
                : language === 'hi'
                ? 'आसान घरेलू उपाय व सावधानियां'
                : 'Simple Daily Actions to Follow'}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.actionableTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    {renderTipIcon(tip.iconType)}
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-stone-900">{tip.title}</h6>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-normal">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Hospital Search via GPS Button */}
        {(data?.suggestHospitalSearch || !data?.isEmergency) && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100">
            <div className="text-xs text-stone-500">
              {data?.suggestedDoctorType ? (
                <span>
                  Recommended Care:{' '}
                  <strong className="text-emerald-800">{data.suggestedDoctorType}</strong>
                </span>
              ) : (
                <span>Need an in-person physical checkup?</span>
              )}
            </div>

            <button
              onClick={onOpenHospitalModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded-xl text-xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {language === 'ta'
                  ? 'அருகிலுள்ள மருத்துவமனையைக் காட்டு'
                  : language === 'hi'
                  ? 'नजदीकी अस्पताल देखें (GPS)'
                  : 'Find Nearby Hospitals (GPS)'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
