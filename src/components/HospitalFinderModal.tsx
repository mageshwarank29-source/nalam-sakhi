import React, { useState, useEffect } from 'react';
import { X, Navigation, Phone, MapPin, AlertTriangle, ExternalLink, Volume2, ShieldCheck, RefreshCw } from 'lucide-react';
import { HospitalPlace, SupportedLanguage } from '../types';
import { playSpokenAdvice } from '../utils/speech';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  initialQuery?: string;
}

export const HospitalFinderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  initialQuery,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<HospitalPlace[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSpeakingList, setIsSpeakingList] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      locateAndFetchHospitals();
    }
  }, [isOpen]);

  const locateAndFetchHospitals = () => {
    setLoading(true);
    setErrorMsg(null);

    if (!('geolocation' in navigator)) {
      // Fallback coordinate (e.g., Tamil Nadu central hub: 13.0827, 80.2707)
      fetchNearbyHospitals(13.0827, 80.2707);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        fetchNearbyHospitals(lat, lng);
      },
      (err) => {
        console.warn('Geolocation error or denied:', err);
        // If denied or timed out, inform user and use approximate regional coordinates
        setErrorMsg('GPS location access was not granted. Showing verified hospitals in your region.');
        fetchNearbyHospitals(13.0827, 80.2707);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/nearby-hospitals?lat=${lat}&lng=${lng}&radius=8000`);
      if (!res.ok) throw new Error('Failed to retrieve nearby health facilities');
      const data = await res.json();
      setHospitals(data.hospitals || []);
    } catch (e: any) {
      setErrorMsg('Could not fetch hospitals right now. Please call emergency 108 if urgent.');
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (hospitals.length === 0) return;
    setIsSpeakingList(true);

    const firstThree = hospitals.slice(0, 3);
    let speechScript = '';

    if (language === 'ta') {
      speechScript = `உங்களுக்கு அருகிலுள்ள மருத்துவமனைகள்: ${firstThree
        .map((h, i) => `${i + 1}. ${h.name}, தூரம் ${h.distanceKm} கிலோமீட்டர்.`)
        .join(' ')} அவசர உதவிக்கு 108 என்ற எண்ணை அழைக்கவும்.`;
    } else if (language === 'hi') {
      speechScript = `आपके सबसे नजदीकी अस्पताल: ${firstThree
        .map((h, i) => `${i + 1}. ${h.name}, दूरी ${h.distanceKm} किलोमीटर।`)
        .join(' ')} आपातकालीन मदद के लिए 108 पर कॉल करें।`;
    } else {
      speechScript = `Nearest health centres for you: ${firstThree
        .map((h, i) => `${i + 1}: ${h.name}, distance ${h.distanceKm} kilometres.`)
        .join(' ')} For any emergency, call 108 immediately.`;
    }

    playSpokenAdvice(
      speechScript,
      language,
      () => setIsSpeakingList(true),
      () => setIsSpeakingList(false)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Nearby Hospitals & Doctors (GPS)
              </h2>
              <p className="text-xs text-emerald-100">
                {language === 'ta'
                  ? 'உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள மருத்துவமனைகள்'
                  : language === 'hi'
                  ? 'आपके नजदीकी अस्पताल एवं प्राथमिक स्वास्थ्य केंद्र'
                  : 'Verified clinics, Primary Health Centres & Emergency'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Ambulance Hotlink */}
        <div className="p-3 bg-rose-50 border-b border-rose-200 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5">
          <div className="flex items-center gap-2 text-rose-800 text-xs sm:text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Emergency Ambulance (National):</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 108 (Free)</span>
            </a>
            <a
              href="tel:102"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm"
              title="Maternal & Child Transport"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mother Line 102</span>
            </a>
          </div>
        </div>

        {/* Subheader Toolbar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {coords
                ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                : 'Locating via GPS...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadAloud}
              disabled={hospitals.length === 0 || isSpeakingList}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                isSpeakingList
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeakingList ? 'Speaking...' : '🔊 Listen List'}</span>
            </button>

            <button
              onClick={locateAndFetchHospitals}
              disabled={loading}
              className="p-1 rounded-md hover:bg-stone-200 text-stone-600"
              title="Refresh GPS"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hospitals List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-500 gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium">Finding nearest verified doctors and hospitals via GPS...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="py-10 text-center text-stone-500">
              <p className="text-sm font-medium">No medical facilities found within this immediate range.</p>
              <p className="text-xs text-stone-400 mt-1">Please call 108 directly for immediate emergency ambulance.</p>
            </div>
          ) : (
            hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                      {hospital.name}
                    </h4>
                    {hospital.emergency && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-md">
                        24x7 Emergency
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    {hospital.type}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-stone-800">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {hospital.distanceKm} km away
                    </span>
                    <span>·</span>
                    <span className="truncate max-w-[200px] sm:max-w-[300px]">
                      {hospital.address}
                    </span>
                  </div>
                </div>

                {/* Actions: Call & Directions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {hospital.phone && (
                    <a
                      href={`tel:${hospital.phone.replace(/[^0-9]/g, '') || '108'}`}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      title="Call Hospital"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call</span>
                    </a>
                  )}

                  <a
                    href={hospital.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Government PHCs provide free consultation & essential drugs.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
