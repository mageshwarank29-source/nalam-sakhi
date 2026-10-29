import React from 'react';
import { Mic, MicOff, Square, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  language: SupportedLanguage;
  lastIdentifiedAccent?: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  interimTranscript?: string;
}

export const VoiceMicOrb: React.FC<Props> = ({
  isListening,
  isSpeaking,
  isLoading,
  language,
  lastIdentifiedAccent,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  interimTranscript,
}) => {
  // Multilingual labels for illiterate accessibility
  const labels: Record<SupportedLanguage, { idle: string; idleSub: string; listening: string; thinking: string; speaking: string }> = {
    ta: {
      idle: 'பேச தொடங்குங்கள்',
      idleSub: 'சகியிடம் உங்கள் சந்தேகங்களைக் கேளுங்கள்',
      listening: 'உங்கள் குரலை கேட்கிறேன்... பேசுங்கள்',
      thinking: 'சகி ஆலோசிக்கிறார்...',
      speaking: 'சகி பேசுகிறார்... கேளுங்கள்',
    },
    hi: {
      idle: 'बोलने के लिए दबाएं',
      idleSub: 'सखी से अपनी सेहत के बारे में पूछें',
      listening: 'मैं सुन रही हूँ... कृपया बोलिए',
      thinking: 'सखी सोच रही है...',
      speaking: 'सखी बोल रही है... सुनिए',
    },
    en: {
      idle: 'Tap & Speak to Sakhi',
      idleSub: 'Ask exercise, sugar, fever, or allergy doubts',
      listening: 'Listening to your voice... Speak now',
      thinking: 'Sakhi is thinking...',
      speaking: 'Sakhi is speaking advice...',
    },
  };

  const currentLabels = labels[language] || labels.en;

  const handleClick = () => {
    if (isSpeaking) {
      onStopSpeaking();
    } else if (isListening) {
      onStopListening();
    } else if (!isLoading) {
      onStartListening();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50/70 via-white to-amber-50/50 rounded-3xl border border-emerald-100 shadow-sm text-center">
      {/* Accent / Speech Style Badge if detected */}
      {lastIdentifiedAccent && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-900 border border-amber-300/80 rounded-full text-xs font-semibold animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Accent: {lastIdentifiedAccent}</span>
        </div>
      )}

      {/* Mic Action Orb */}
      <div className="relative flex items-center justify-center my-2">
        {/* Animated Ripple Rings when Listening */}
        {isListening && (
          <>
            <span className="absolute w-28 h-28 rounded-full bg-rose-400/30 animate-ping pointer-events-none" />
            <span className="absolute w-36 h-36 rounded-full bg-rose-300/20 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Animated Ripple Rings when Speaking */}
        {isSpeaking && (
          <span className="absolute w-28 h-28 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
        )}

        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform transform active:scale-95 touch-manipulation focus:outline-none focus:ring-4 ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 ring-rose-300 animate-pulse'
              : isSpeaking
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-200 ring-emerald-300'
              : isLoading
              ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200 ring-emerald-200 hover:scale-105'
          }`}
          aria-label={
            isListening
              ? 'Stop recording voice'
              : isSpeaking
              ? 'Stop voice playback'
              : 'Start speaking to health companion'
          }
        >
          {isLoading ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-10 h-10 animate-bounce" />
          ) : isSpeaking ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-10 h-10" />
          )}

          <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-90">
            {isListening ? 'Stop' : isSpeaking ? 'Stop Audio' : 'Speak'}
          </span>
        </button>
      </div>

      {/* Audio Wave Visualizer Bars when listening */}
      {isListening && (
        <div className="flex items-center gap-1.5 my-3 h-6">
          <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
          <span className="w-1.5 h-6 bg-rose-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" />
          <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]" />
          <span className="w-1.5 h-7 bg-rose-700 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
          <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
          <span className="w-1.5 h-2 bg-rose-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-2 my-2 text-emerald-800 text-xs font-semibold">
          <Volume2 className="w-4 h-4 animate-bounce text-emerald-600" />
          <span>Playing audio... Click button to pause</span>
        </div>
      )}

      {/* Status Titles */}
      <h3 className="text-lg font-bold text-stone-900 mt-2">
        {isListening
          ? currentLabels.listening
          : isLoading
          ? currentLabels.thinking
          : isSpeaking
          ? currentLabels.speaking
          : currentLabels.idle}
      </h3>

      <p className="text-xs text-stone-600 max-w-sm mt-1">
        {isListening && interimTranscript ? (
          <span className="italic text-stone-900 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            "{interimTranscript}"
          </span>
        ) : (
          currentLabels.idleSub
        )}
      </p>

      {/* Language reminder badge */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
        <span>Current Speech Language:</span>
        <span className="font-bold text-emerald-700">
          {language === 'ta' ? 'தமிழ் (Tamil / Tanglish)' : language === 'hi' ? 'हिंदी (Hindi / Hinglish)' : 'English (Indian Accent)'}
        </span>
      </div>
    </div>
  );
};
