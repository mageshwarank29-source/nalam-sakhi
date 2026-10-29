import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Phone,
  Navigation,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  ShieldCheck,
  RotateCcw,
  Mic,
  MicOff,
} from 'lucide-react';
import {
  SupportedLanguage,
  ChatMessage,
  HealthTopic,
  AssistantResponse,
} from './types';
import { PRESET_TOPICS, PROBLEM_CATEGORIES } from './data/presetTopics';
import { LanguageSelector } from './components/LanguageSelector';
import { VoiceMicOrb } from './components/VoiceMicOrb';
import { AnimeDoctorSakhi } from './components/AnimeDoctorSakhi';
import { HealthCard } from './components/HealthCard';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { HospitalFinderModal } from './components/HospitalFinderModal';
import {
  startSpeechCapture,
  playSpokenAdvice,
  stopAllSpeech,
  playChime,
  unlockAudio,
} from './utils/speech';

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('ta');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastIdentifiedAccent, setLastIdentifiedAccent] = useState<string>('');
  const [latestSpokenAdvice, setLatestSpokenAdvice] = useState<string>('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredTopics = selectedCategory === 'all'
    ? PRESET_TOPICS
    : PRESET_TOPICS.filter((t) => t.category === selectedCategory || t.category === 'all');

  // Initialize with warm welcome message in the selected language
  useEffect(() => {
    initWelcomeMessage(language);
    // Request GPS early for hospital search readiness
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location pre-check:', err.message),
        { timeout: 8000 }
      );
    }
  }, []);

  // Update welcome greeting when language changes if conversation is brand new
  const initWelcomeMessage = (lang: SupportedLanguage) => {
    const welcomeTexts: Record<SupportedLanguage, { spoken: string; full: string; accent: string }> = {
      ta: {
        spoken: 'வணக்கம்! நான் உங்கள் நலம் சகி. நீங்கள் உங்கள் சொந்த தமிழில் என்னிடம் பேசலாம். உடற்பயிற்சி நன்மைகள், சர்க்கரை கட்டுப்பாடு, காய்ச்சல் அல்லது அருகிலுள்ள மருத்துவமனை பற்றி எதை வேண்டுமானாலும் கேளுங்கள்.',
        full: 'எளிய கிராமிய தமிழ், தங்கிலீஷ் (Tanglish) என எதிலும் நீங்கள் பேசலாம். கீழே உள்ள மைக் பொத்தானை அழுத்திப் பேசுங்கள் அல்லது அட்டையைத் தொடுங்கள்.',
        accent: 'Colloquial Spoken Tamil (கிராமிய தமிழ்)',
      },
      hi: {
        spoken: 'नमस्ते! मैं आपकी नलम सखी हूँ। आप मुझसे अपनी भाषा में बात कर सकते हैं। कसरत के फायदे, शुगर नियंत्रण, बुखार या नजदीकी अस्पताल के बारे में कुछ भी पूछिए।',
        full: 'आप सामान्य बोलचाल की हिंदी या हिंग्लिश (Hinglish) में बोल सकते हैं। नीचे दिए गए माइक बटन को दबाकर पूछें।',
        accent: 'Everyday Spoken Hindi (हिंदी)',
      },
      en: {
        spoken: 'Hello! I am Nalam Sakhi, your friendly health companion. You can speak naturally in English, Tamil, or Hindi. Ask me about exercise, controlling sugar, fever, or nearby hospitals.',
        full: 'I am designed especially to help everyone understand their health in simple words. Tap the microphone below or choose a topic card to begin.',
        accent: 'Standard Indian English',
      },
    };

    const initial = welcomeTexts[lang];
    const welcomeMsg: ChatMessage = {
      id: 'welcome-msg',
      role: 'assistant',
      text: initial.spoken,
      timestamp: new Date(),
      data: {
        spokenText: initial.spoken,
        fullAdvice: initial.full,
        identifiedLanguage: lang,
        identifiedAccentOrStyle: initial.accent,
        category: 'general_wellness',
        isEmergency: false,
        actionableTips: [
          {
            title: lang === 'ta' ? 'வாய்ஸ் மூலம் கேளுங்கள்' : lang === 'hi' ? 'बोलकर पूछें' : 'Voice-First Help',
            description: lang === 'ta' ? 'பெரிய மைக் பொத்தானைத் தொட்டு நேரடியாகப் பேசலாம்.' : lang === 'hi' ? 'माइक दबाकर अपनी बीमारी या सवाल बताएं।' : 'Tap the big green mic and speak in your mother tongue.',
            iconType: 'activity',
          },
          {
            title: lang === 'ta' ? 'அருகிலுள்ள மருத்துவமனை' : lang === 'hi' ? 'नजदीकी अस्पताल' : 'Nearby GPS Hospital',
            description: lang === 'ta' ? 'அரசு ஆரம்ப சுகாதார நிலையம் மற்றும் 108 ஆம்புலன்ஸ் சேவை.' : lang === 'hi' ? 'सरकारी अस्पताल और 108 एम्बुलेंस सुविधा।' : 'Instant GPS discovery for Primary Health Centres.',
            iconType: 'shield',
          },
        ],
        suggestHospitalSearch: false,
      },
    };

    setMessages([welcomeMsg]);
    setLastIdentifiedAccent(initial.accent);
    setLatestSpokenAdvice(initial.spoken);
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    stopAllSpeech();
    setIsSpeaking(false);
    if (messages.length <= 1) {
      initWelcomeMessage(newLang);
    }
  };

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeCaptureRef = useRef<any>(null);

  // Handle Speech Recognition and Voice Capture toggle
  const startListening = async () => {
    unlockAudio();
    stopAllSpeech();
    setIsSpeaking(false);
    setInterimTranscript('');
    setVoiceNotice(null);
    playChime('start');
    setIsListening(true);

    const capture = await startSpeechCapture(
      language,
      (transcript, isFinal) => {
        if (isFinal) {
          setInterimTranscript('');
          handleSendMessage(transcript);
        } else {
          setInterimTranscript(transcript);
        }
      },
      (err) => {
        setIsListening(false);
        if (err === 'no-speech') {
          // Provide friendly guidance without alarming console warning
          setVoiceNotice(
            language === 'ta'
              ? 'குரல் கேட்கவில்லை. மைக்கைத் தொட்டு மீண்டும் சத்தமாகப் பேசுங்கள் அல்லது ஒரு அட்டையைத் தொடுங்கள்.'
              : language === 'hi'
              ? 'आवाज नहीं सुनाई दी। कृपया माइक दबाकर फिर से बोलें।'
              : 'No speech heard. Please tap the mic again and speak clearly, or select a topic card.'
          );
          setTimeout(() => setVoiceNotice(null), 5000);
        } else {
          setVoiceNotice(err);
          setTimeout(() => setVoiceNotice(null), 6000);
        }
      },
      () => {
        setIsListening(false);
        playChime('stop');
      }
    );

    if (capture) {
      activeCaptureRef.current = capture;
    } else {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (activeCaptureRef.current) {
      activeCaptureRef.current.stop();
      activeCaptureRef.current = null;
    }
    setIsListening(false);
    playChime('stop');
  };

  const stopSpeaking = () => {
    stopAllSpeech();
    setIsSpeaking(false);
  };

  // Main interaction sender to backend Express Gemini API
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    // Check if user specifically requested GPS hospitals
    const isHospitalQuery =
      trimmed.toLowerCase().includes('hospital') ||
      trimmed.toLowerCase().includes('doctor') ||
      trimmed.includes('மருத்துவமனை') ||
      trimmed.includes('டாக்டர்') ||
      trimmed.includes('அஸ்பத்திரி') ||
      trimmed.includes('अस्पताल') ||
      trimmed.includes('डॉक्टर');

    if (isHospitalQuery) {
      setIsHospitalModalOpen(true);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/health-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language,
          conversationHistory: messages.map((m) => ({ role: m.role, text: m.text })),
          userLocation,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach Nalam Sakhi health server');
      }

      const assistantData: AssistantResponse = await response.json();

      if (assistantData.identifiedAccentOrStyle) {
        setLastIdentifiedAccent(assistantData.identifiedAccentOrStyle);
      }

      setLatestSpokenAdvice(assistantData.spokenText);

      // If urgent or hospital search suggested, trigger modal suggestion
      if (assistantData.isEmergency || assistantData.suggestHospitalSearch) {
        // can offer hospital popup
      }

      const assistantMessage: ChatMessage = {
        id: `sakhi-${Date.now()}`,
        role: 'assistant',
        text: assistantData.spokenText,
        timestamp: new Date(),
        data: assistantData,
        language,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-play speech for illiterate users so they can immediately listen
      if (autoPlayAudio && assistantData.spokenText) {
        playSpokenAdvice(
          assistantData.spokenText,
          language,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (error: any) {
      console.error('Error fetching health advice:', error);
      const fallbackMsg: ChatMessage = {
        id: `sakhi-err-${Date.now()}`,
        role: 'assistant',
        text:
          language === 'ta'
            ? 'மன்னிக்கவும் அம்மா/ஐயா, என்னால் இப்போது இணையத்துடன் இணைக்க முடியவில்லை. அவசர உதவிக்கு உடனடியாக 108 என்ற எண்ணை அழைக்கவும்.'
            : language === 'hi'
            ? 'माफ़ कीजिए, अभी संपर्क नहीं हो पा रहा है। आपातकाल में तुरंत 108 पर कॉल करें।'
            : 'Sorry, I could not connect right now. If it is an emergency, please call 108 immediately.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTopic = (topic: HealthTopic) => {
    if (topic.id === 'hospital_gps') {
      setIsHospitalModalOpen(true);
      return;
    }

    let promptText = topic.promptEn;
    if (language === 'ta') promptText = topic.promptTa;
    if (language === 'hi') promptText = topic.promptHi;

    handleSendMessage(promptText);
  };

  const handlePlayAudio = (text: string, lang: SupportedLanguage) => {
    playSpokenAdvice(
      text,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const resetChat = () => {
    stopAllSpeech();
    setIsSpeaking(false);
    initWelcomeMessage(language);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Hospital Universal Header */}
      <header className="sticky top-0 z-40 bg-teal-950/95 backdrop-blur-md border-b border-teal-800 shadow-md text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Hospital Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-teal-950 shadow-md ring-2 ring-teal-300">
              <span className="text-2xl font-black">+</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-teal-950 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>NALAM SAKHI</span>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 bg-teal-800/80 text-teal-200 border border-teal-600/50 rounded-md">
                    Hospital Clinic
                  </span>
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-teal-300/80 font-medium">
                நலம் சகி மருத்துவ மையம் · नलम सखी अस्पताल · AI Voice Care
              </p>
            </div>
          </div>

          {/* Quick Action Controls: Emergency 108 & GPS & Language */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* 108 Emergency Ambulance Button */}
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 animate-pulse"
              title="Emergency 108 Ambulance Call"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>108 Ambulance</span>
            </a>

            {/* GPS Nearby Hospitals Button */}
            <button
              onClick={() => setIsHospitalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-900/80 hover:bg-teal-800 text-teal-100 border border-teal-700 rounded-xl text-xs font-bold transition-colors"
              title="Find Doctors and Hospitals via GPS"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
              <span>Nearby Hospitals (GPS)</span>
            </button>

            {/* Language Selector */}
            <LanguageSelector
              currentLanguage={language}
              onSelectLanguage={handleLanguageChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 sm:py-7 space-y-6">
        {/* Animated Anime Doctor Sakhi Consultation Stage */}
        <section aria-label="Dr. Sakhi Anime Hospital Clinic">
          <AnimeDoctorSakhi
            isListening={isListening}
            isSpeaking={isSpeaking}
            isLoading={isLoading}
            language={language}
            lastIdentifiedAccent={lastIdentifiedAccent}
            currentSpeechText={latestSpokenAdvice}
            onStartListening={startListening}
            onStopListening={stopListening}
            onStopSpeaking={stopSpeaking}
            onReplaySpeech={() => {
              if (latestSpokenAdvice) {
                handlePlayAudio(latestSpokenAdvice, language);
              }
            }}
          />

          {/* Gentle Speech & Mic Status Notification */}
          {voiceNotice && (
            <div className="mt-3 p-3 bg-teal-50 border border-teal-300 text-teal-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
              <span className="flex items-center gap-2">
                <span className="text-base">🎙️</span>
                <span>{voiceNotice}</span>
              </span>
              <button
                onClick={() => setVoiceNotice(null)}
                className="px-2 py-0.5 text-teal-700 hover:text-teal-950 font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </section>

        {/* Pictorial One-Tap Health Cards for illiterate / semi-literate users */}
        <section aria-label="Quick Health Topics" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  {language === 'ta'
                    ? 'எல்லாவித உடல்நல பிரச்சனைகளுக்கும் உடனடி தீர்வு'
                    : language === 'hi'
                    ? 'हर प्रकार की स्वास्थ्य समस्या का समाधान'
                    : 'Explore Any Health Problem & Doubts'}
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                  {language === 'ta' ? 'அனைத்து பிரச்சனைகளுக்கும்' : language === 'hi' ? 'सभी बीमारियों के लिए' : 'Covers All Doubts'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'ta'
                  ? 'வயிற்று வலி, முட்டு வலி, கண் எரிச்சல், சளி, குழந்தை நலம் என எதையும் தொட்டுப் பேசலாம் அல்லது கீழே உள்ள மைக்கில் கேளுங்கள்.'
                  : language === 'hi'
                  ? 'पेट दर्द, घुटनों का दर्द, सिरदर्द, बुखार, आँखों में जलन या बच्चों की सेहत—कोई भी परेशानी आवाज में पूछें।'
                  : 'Tap any body issue to hear Sakhi explain it aloud, or ask any custom doubt using the mic.'}
              </p>
            </div>

            <button
              onClick={() => setAutoPlayAudio(!autoPlayAudio)}
              className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                autoPlayAudio
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'
              }`}
              title="Toggle automatic speech playback"
            >
              {autoPlayAudio ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Voice Auto-Play: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Voice Auto-Play: OFF</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Problem Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {PROBLEM_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const catTitle =
                language === 'ta' ? cat.nameTa : language === 'hi' ? cat.nameHi : cat.nameEn;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all touch-manipulation ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{catTitle}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredTopics.map((topic) => (
              <HealthCard
                key={topic.id}
                topic={topic}
                language={language}
                onSelect={handleSelectTopic}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>

        {/* Active Conversation Stream */}
        <section
          aria-label="Health Consultation Timeline"
          className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-bold text-stone-800">
                {language === 'ta'
                  ? 'சகியுடன் உங்கள் உரையாடல்'
                  : language === 'hi'
                  ? 'सखी के साथ आपकी बातचीत'
                  : 'Your Consultation with Sakhi'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                title="Start New Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="space-y-4 min-h-[220px]">
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                language={language}
                isAudioPlaying={isSpeaking && msg.role === 'assistant'}
                onPlayAudio={handlePlayAudio}
                onStopAudio={stopSpeaking}
                onOpenHospitalModal={() => setIsHospitalModalOpen(true)}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-base">
                  👩‍⚕️
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-900">
                    {language === 'ta'
                      ? 'சகி ஆலோசனை தயாரித்து பேசத் தொடங்குகிறார்...'
                      : language === 'hi'
                      ? 'सखी आपकी सेहत की जानकारी तैयार कर रही है...'
                      : 'Sakhi is preparing personalized medical guidance...'}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Understanding your accent and vernacular speech...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Direct Question Input Bar with In-Line Mic */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="pt-3 border-t border-stone-100 flex items-center gap-2"
          >
            {/* Quick in-input Mic button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-2xl transition-all touch-manipulation focus:outline-none focus:ring-2 flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-300'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
              }`}
              title={isListening ? 'Stop listening' : 'Tap to speak your doubt'}
              aria-label="Tap to speak"
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-emerald-700" />
              )}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'எந்த நோயைப் பற்றியும் கேட்கலாம்... (எ.கா: முட்டு வலி, வயிற்று எரிச்சல், கண் வலி)'
                  : language === 'hi'
                  ? 'किसी भी बीमारी या समस्या के बारे में पूछें... (उदा: घुटनों का दर्द, गैस, सिरदर्द)'
                  : 'Ask about ANY health problem... (e.g. knee pain, stomach gas, eye burning)'
              }
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 text-white disabled:text-stone-400 rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 touch-manipulation"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </section>

        {/* Quick Voice Prompt Suggestions covering all real problems */}
        <section aria-label="Example Voice Queries" className="p-4 bg-stone-100/90 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-2">
          <p className="font-semibold text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {language === 'ta'
                ? 'மக்கள் அடிக்கடி கேட்கும் பொதுவான ஆரோக்கிய சந்தேகங்கள் (தொட்டுப் பேசலாம்):'
                : language === 'hi'
                ? 'लोग अक्सर ये समस्याएं पूछते हैं (दबाकर सीधे पूछें):'
                : 'Common Everyday Health Doubts You Can Ask Sakhi:'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              {
                text:
                  language === 'ta'
                    ? 'கால் முட்டு வலி மற்றும் வீக்கத்திற்கு என்ன வீட்டு வைத்தியம்?'
                    : language === 'hi'
                    ? 'घुटनों के दर्द और सूजन के लिए घरेलू उपाय क्या हैं?'
                    : 'What home remedies help knee pain and swelling?',
              },
              {
                text:
                  language === 'ta'
                    ? 'வயிற்று வலி மற்றும் நெஞ்செரிச்சலுக்கு என்ன சாப்பிடலாம்?'
                    : language === 'hi'
                    ? 'पेट दर्द, गैस और सीने में जलन में क्या खाना चाहिए?'
                    : 'What can I take for severe stomach gas & acidity?',
              },
              {
                text:
                  language === 'ta'
                    ? 'கண் எரிகிறது மற்றும் நீர் வடிகிறது, என்ன முதலுதவி செய்யலாம்?'
                    : language === 'hi'
                    ? 'आँखों में जलन और पानी आने पर क्या घरेलू उपाय करें?'
                    : 'My eyes are burning and watering, what first aid to do?',
              },
              {
                text:
                  language === 'ta'
                    ? 'குழந்தைக்கு காய்ச்சல், சளி வந்தால் என்ன செய்யணும்?'
                    : language === 'hi'
                    ? 'छोटे बच्चे को कफ और बुखार हो तो तुरंत क्या करें?'
                    : 'What immediate steps for child cold and fever?',
              },
              {
                text:
                  language === 'ta'
                    ? 'தாங்க முடியாத பல் வலிக்கு உடனடி எளிய தீர்வு என்ன?'
                    : language === 'hi'
                    ? 'दांत के तेज दर्द से तुरंत राहत के आसान तरीके'
                    : 'Instant relief home remedy for severe toothache',
              },
              {
                text:
                  language === 'ta'
                    ? 'சுகர் மற்றும் இரத்த அழுத்தத்தை உணவால் கட்டுப்படுத்துவது எப்படி?'
                    : language === 'hi'
                    ? 'शुगर और बीपी को खानपान से कैसे नियंत्रित करें?'
                    : 'How to control sugar and BP naturally with food?',
              },
              {
                text:
                  language === 'ta'
                    ? 'தோல் அரிப்பு மற்றும் தடிப்புகளுக்கு வேப்பிலை பயன்படுமா?'
                    : language === 'hi'
                    ? 'त्वचा में खुजली और दानों से राहत के उपाय'
                    : 'Safe remedies for severe skin itching and rashes',
              },
              {
                text:
                  language === 'ta'
                    ? 'என் அருகிலுள்ள அரசு ஆரம்ப சுகாதார நிலையத்தைக் காட்டு'
                    : language === 'hi'
                    ? 'मेरे नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) दिखाएं'
                    : 'Find nearest Government PHC and emergency hospital',
              },
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 rounded-lg text-xs font-medium text-left transition-colors shadow-2xs"
              >
                "{q.text}"
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Nearby GPS Hospital Finder Modal */}
      <HospitalFinderModal
        isOpen={isHospitalModalOpen}
        onClose={() => setIsHospitalModalOpen(false)}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 px-4 mt-8 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="font-semibold text-stone-700">
            NALAM SAKHI (நலம் சகி / नलम सखी) · Rural & Community Health Initiative
          </p>
          <p className="text-[11px] text-stone-400 max-w-xl mx-auto">
            Disclaimer: Nalam Sakhi provides informational health education and first-aid tips for wellness awareness. For severe chest pain, breathing difficulty, or critical emergencies, call 108 or visit the nearest hospital emergency room immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
