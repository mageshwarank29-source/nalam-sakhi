import { SupportedLanguage } from '../types';

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

let activeAudioElement: HTMLAudioElement | null = null;
let audioContextUnlocked = false;

// Unlocks browser audio context on user interaction (required by Chrome/Safari autoplay policies)
export function unlockAudio() {
  if (audioContextUnlocked) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      ctx.resume().then(() => {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      });
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    audioContextUnlocked = true;
  } catch (e) {
    // Ignore audio policy errors
  }
}

// Gentle Web Audio feedback chime for mic interactions
export function playChime(type: 'start' | 'stop' | 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'start') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'stop') {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // Ignore audio context errors if blocked
  }
}

// Check if browser has native speech recognition
export function isSpeechRecognitionSupported(): boolean {
  const win = window as IWindow;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

// Stop all currently playing audio
export function stopAllSpeech() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.src = '';
    activeAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// High-fidelity speech playback: Uses real MP3 audio stream first, falling back smoothly to Web Speech Synthesis
export async function playSpokenAdvice(
  text: string,
  lang: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void
) {
  stopAllSpeech();
  unlockAudio();

  // Try real server-side audio generation first (guarantees authentic Tamil/Hindi/English speech on all OS)
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: lang,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
        activeAudioElement = audio;

        audio.onplay = () => {
          onStart?.();
        };

        audio.onended = () => {
          activeAudioElement = null;
          onEnd?.();
        };

        audio.onerror = () => {
          activeAudioElement = null;
          playBrowserSynthesis(text, lang, onStart, onEnd);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((playErr) => {
            console.warn('HTML5 Audio play was blocked, falling back to Web Speech API:', playErr);
            activeAudioElement = null;
            playBrowserSynthesis(text, lang, onStart, onEnd);
          });
        }
        return;
      }
    }
  } catch (err) {
    console.warn('TTS endpoint fetch error, falling back to browser speech synthesis:', err);
  }

  // Graceful fallback to client-side browser speech synthesis
  playBrowserSynthesis(text, lang, onStart, onEnd);
}

// Client-side Web SpeechSynthesis Fallback with Chrome bug workarounds
export function playBrowserSynthesis(
  text: string,
  lang: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported');
    onEnd?.();
    return;
  }

  unlockAudio();

  // Strip emojis, markdown, and asterisks for smooth phonetic speech
  const clean = text
    .replace(/[#*_~`\[\]()]/g, ' ')
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
    .trim();

  // Chrome Bug Workaround: cancel first, wait 50ms, resume, then speak
  window.speechSynthesis.cancel();

  setTimeout(() => {
    try {
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(clean);

      const langTagMap: Record<SupportedLanguage, string> = {
        ta: 'ta-IN',
        hi: 'hi-IN',
        en: 'en-IN',
      };

      utterance.lang = langTagMap[lang] || 'en-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes(lang === 'ta' ? 'ta' : lang === 'hi' ? 'hi' : 'en')
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance notice:', e.error);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis speak failed:', e);
      onEnd?.();
    }
  }, 60);
}

// Combined Speech Capture: Prompts for mic permission, uses Web Speech API, with MediaRecorder fallback
export async function startSpeechCapture(
  lang: SupportedLanguage,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (err: string) => void,
  onEnd: () => void
) {
  unlockAudio();

  // 1. First explicitly prompt and request microphone permission from browser
  let mediaStream: MediaStream | null = null;
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  } catch (micErr: any) {
    console.warn('Microphone permission request failed:', micErr);
    onError('Microphone permission was denied or not available. Please allow microphone in browser settings.');
    onEnd();
    return null;
  }

  const win = window as IWindow;
  const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

  // 2. Setup MediaRecorder as universal fallback
  let mediaRecorder: MediaRecorder | null = null;
  const recordedChunks: Blob[] = [];

  if (mediaStream && typeof MediaRecorder !== 'undefined') {
    try {
      mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };
      mediaRecorder.start(250);
    } catch (mrErr) {
      console.warn('MediaRecorder init error:', mrErr);
    }
  }

  let finalTranscriptReceived = false;

  // Function to stop and clean up media stream
  const cleanupStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
  };

  // If native SpeechRecognition is supported
  if (SpeechRec) {
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const langCodeMap: Record<SupportedLanguage, string> = {
      ta: 'ta-IN',
      hi: 'hi-IN',
      en: 'en-IN',
    };
    recognition.lang = langCodeMap[lang] || 'en-IN';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        finalTranscriptReceived = true;
        onResult(final.trim(), true);
      } else if (interim) {
        onResult(interim.trim(), false);
      }
    };

    recognition.onerror = async (event: any) => {
      if (event.error === 'no-speech') {
        // If native recognition heard no speech but MediaRecorder recorded audio, try server transcribe
        if (mediaRecorder && mediaRecorder.state !== 'inactive' && recordedChunks.length > 0) {
          try {
            mediaRecorder.stop();
            await new Promise((r) => setTimeout(r, 200));
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            if (blob.size > 2000) {
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64 = (reader.result as string)?.split(',')[1];
                if (base64) {
                  const trRes = await fetch('/api/transcribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audioBase64: base64, language: lang }),
                  });
                  if (trRes.ok) {
                    const trData = await trRes.json();
                    if (trData.transcript) {
                      onResult(trData.transcript, true);
                      return;
                    }
                  }
                }
                onError('no-speech');
              };
              reader.readAsDataURL(blob);
              return;
            }
          } catch (e) {}
        }

        onError('no-speech');
        return;
      }

      if (event.error === 'not-allowed') {
        onError('Microphone permission denied. Please allow microphone in your browser settings.');
      } else {
        onError(`Notice: ${event.error}`);
      }
    };

    recognition.onend = () => {
      cleanupStream();
      onEnd();
    };

    try {
      recognition.start();
      return {
        stop: () => {
          try {
            recognition.stop();
          } catch (e) {}
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            try {
              mediaRecorder.stop();
            } catch (e) {}
          }
          cleanupStream();
        },
      };
    } catch (startErr) {
      console.warn('Recognition start error:', startErr);
    }
  }

  // If SpeechRecognition is not available or failed to start, use pure MediaRecorder + server transcribe
  if (mediaRecorder) {
    return {
      stop: async () => {
        try {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          await new Promise((r) => setTimeout(r, 300));
          cleanupStream();

          const blob = new Blob(recordedChunks, { type: 'audio/webm' });
          if (blob.size > 1500) {
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64 = (reader.result as string)?.split(',')[1];
              if (base64) {
                const trRes = await fetch('/api/transcribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audioBase64: base64, language: lang }),
                });
                if (trRes.ok) {
                  const trData = await trRes.json();
                  if (trData.transcript) {
                    onResult(trData.transcript, true);
                    onEnd();
                    return;
                  }
                }
              }
              onError('no-speech');
              onEnd();
            };
            reader.readAsDataURL(blob);
          } else {
            onError('no-speech');
            onEnd();
          }
        } catch (e) {
          onError('no-speech');
          onEnd();
        }
      },
    };
  }

  onError('Microphone is not supported in this browser.');
  onEnd();
  return null;
}
