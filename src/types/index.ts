export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface ActionableTip {
  title: string;
  description: string;
  iconType: string;
}

export interface AssistantResponse {
  spokenText: string;
  fullAdvice: string;
  identifiedLanguage: string;
  identifiedAccentOrStyle: string;
  category: string;
  isEmergency: boolean;
  emergencyAction?: string;
  actionableTips: ActionableTip[];
  suggestHospitalSearch: boolean;
  suggestedDoctorType?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  data?: AssistantResponse;
  language?: SupportedLanguage;
  accentStyle?: string;
  isPlayingAudio?: boolean;
}

export interface HospitalPlace {
  id: number | string;
  name: string;
  type: string;
  distanceKm: number;
  lat: number;
  lng: number;
  phone: string;
  address: string;
  emergency: boolean;
  googleMapsUrl: string;
}

export interface HealthTopic {
  id: string;
  titleEn: string;
  titleTa: string;
  titleHi: string;
  promptEn: string;
  promptTa: string;
  promptHi: string;
  category: string;
  iconName: string;
  color: string;
  badgeText: string;
}
