import React from 'react';
import {
  Volume2,
  Square,
  Sparkles,
  Activity,
  Heart,
  Stethoscope,
  MessageSquare,
  Mic,
  MicOff,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  language: SupportedLanguage;
  lastIdentifiedAccent?: string;
  currentSpeechText?: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onReplaySpeech: () => void;
}

export const AnimeDoctorSakhi: React.FC<Props> = ({
  isListening,
  isSpeaking,
  isLoading,
  language,
  lastIdentifiedAccent,
  currentSpeechText,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onReplaySpeech,
}) => {
  const getGreeting = () => {
    if (language === 'ta') {
      if (isListening) return 'நான் உங்கள் குரலைக் கேட்கிறேன்... பேசுங்கள்!';
      if (isLoading) return 'உங்கள் உடல்நிலை குறித்து ஆலோசிக்கிறேன்... ஒரு நொடி!';
      if (isSpeaking) return 'உங்கள் ஆரோக்கியத்திற்கான ஆலோசனையை கவனமாகக் கேளுங்கள்!';
      return 'வணக்கம்! நான் டாக்டர் சகி. உங்கள் உடல்நல பிரச்சனையை என்னிடம் சொல்லுங்கள்!';
    } else if (language === 'hi') {
      if (isListening) return 'मैं ध्यान से सुन रही हूँ... कृपया बोलिए!';
      if (isLoading) return 'आपकी समस्या की जांच कर रही हूँ... कृपया रुकें!';
      if (isSpeaking) return 'अपनी सेहत की सलाह ध्यान से सुनें!';
      return 'नमस्ते! मैं डॉ. सखी हूँ। अपनी बीमारी या परेशानी मुझे बताएं!';
    } else {
      if (isListening) return "I'm listening closely... Please speak your symptoms!";
      if (isLoading) return "Reviewing your symptoms and preparing guidance...";
      if (isSpeaking) return "Please listen carefully to my health advice!";
      return "Hello! I am Dr. Sakhi, your hospital companion. What is troubling your health today?";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-teal-900/90 via-teal-950 to-slate-950 text-white p-5 sm:p-7 shadow-xl border border-teal-500/30">
      {/* Background Hospital Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Clinical Monitor Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-teal-500/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-emerald-300 font-bold tracking-wider">
            CONSULTATION ROOM 01 · DR. SAKHI ON DUTY
          </span>
        </div>

        {/* Live Heartbeat Vitals Animation */}
        <div className="flex items-center gap-3 text-teal-200/80 font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-900/60 border border-teal-500/30 rounded-lg">
            <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="text-white font-bold">72 BPM</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-900/60 border border-teal-500/30 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white font-bold">SpO2 99%</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Anime Doctor Character Showcase */}
        <div className="relative flex-shrink-0 group">
          {/* Animated Glow Halo */}
          <div
            className={`absolute -inset-2 rounded-full blur-lg transition-all duration-500 ${
              isSpeaking
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 opacity-80 animate-pulse scale-105'
                : isListening
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 opacity-90 animate-ping'
                : 'bg-teal-500/40 opacity-50'
            }`}
          />

          {/* Character Portrait Card */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-teal-300/80 shadow-2xl bg-teal-950 flex items-center justify-center">
            <img
              src="/src/assets/images/anime_doctor_sakhi_1793264335258.jpg"
              alt="Dr. Sakhi - Anime Hospital Doctor"
              className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                isSpeaking
                  ? 'scale-105 filter brightness-105 animate-[pulse_2s_ease-in-out_infinite]'
                  : isListening
                  ? 'scale-110 filter brightness-110'
                  : 'group-hover:scale-105'
              }`}
            />

            {/* Speaking Equalizer overlay */}
            {isSpeaking && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-400">
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-[pulse_0.4s_infinite]" />
                <span className="w-1 h-5 bg-teal-300 rounded-full animate-[pulse_0.6s_infinite]" />
                <span className="w-1 h-6 bg-emerald-400 rounded-full animate-[pulse_0.3s_infinite]" />
                <span className="w-1 h-4 bg-teal-300 rounded-full animate-[pulse_0.5s_infinite]" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-[pulse_0.4s_infinite]" />
              </div>
            )}

            {/* Listening Mic Badge overlay */}
            {isListening && (
              <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center animate-bounce shadow-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-bold mt-1 bg-black/60 px-2 py-0.5 rounded-full">
                  Listening...
                </span>
              </div>
            )}
          </div>

          {/* Badge: Doctor Title */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full text-xs font-bold shadow-lg border border-teal-200 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Dr. Sakhi (மருத்துவர் சகி)</span>
          </div>
        </div>

        {/* Doctor Dialogue Speech Bubble */}
        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          {/* Accent Recognition Tag */}
          {lastIdentifiedAccent && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-800/80 text-teal-200 border border-teal-400/40 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice Accent: {lastIdentifiedAccent}</span>
            </div>
          )}

          {/* Dialogue Cloud Box */}
          <div className="relative p-4 sm:p-5 rounded-2xl bg-teal-900/50 backdrop-blur-md border border-teal-400/30 text-white space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>
                {language === 'ta'
                  ? 'டாக்டர் சகி பேசுகிறார்'
                  : language === 'hi'
                  ? 'डॉ. सखी का संदेश'
                  : 'Dr. Sakhi Speaking'}
              </span>
            </div>

            <p className="text-base sm:text-lg font-semibold leading-relaxed text-teal-50">
              "{currentSpeechText || getGreeting()}"
            </p>
          </div>

          {/* Big Action Controls: Mic Tap & Listen Aloud */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            {/* Primary Voice Mic Button */}
            <button
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isLoading}
              className={`px-5 py-3 rounded-2xl font-bold text-sm shadow-lg flex items-center gap-2.5 transition-all transform active:scale-95 touch-manipulation focus:outline-none focus:ring-4 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-rose-400 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white ring-teal-300 hover:scale-105 shadow-emerald-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 animate-bounce" />
                  <span>
                    {language === 'ta'
                      ? 'பேசி முடித்தேன் (Stop)'
                      : language === 'hi'
                      ? 'सुनना बंद करें'
                      : 'Stop Listening'}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>
                    {language === 'ta'
                      ? 'டாக்டரிடம் பேசுங்கள் (Speak)'
                      : language === 'hi'
                      ? 'डॉक्टर से बोलें (माइक)'
                      : 'Speak to Dr. Sakhi (Mic)'}
                  </span>
                </>
              )}
            </button>

            {/* Listen / Stop Audio Button */}
            {isSpeaking ? (
              <button
                onClick={onStopSpeaking}
                className="px-4 py-3 bg-rose-600/90 hover:bg-rose-700 text-white rounded-2xl font-semibold text-xs flex items-center gap-2 border border-rose-400 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Voice Audio</span>
              </button>
            ) : (
              <button
                onClick={onReplaySpeech}
                className="px-4 py-3 bg-teal-800/80 hover:bg-teal-700/90 text-teal-100 rounded-2xl font-semibold text-xs flex items-center gap-2 border border-teal-500/40 transition-colors"
                title="Listen to advice again"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'ta'
                    ? '🔊 மீண்டும் கேள்'
                    : language === 'hi'
                    ? '🔊 फिर से सुनें'
                    : '🔊 Listen Again'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
