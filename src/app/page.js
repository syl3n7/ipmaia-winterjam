'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Background from '../components/Background';
import { Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  const [hasEventStarted, setHasEventStarted] = useState(false);
  const [hasEventEnded, setHasEventEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [currentGameJam, setCurrentGameJam] = useState(null);
  const [frontPageSettings, setFrontPageSettings] = useState({});

  // Fetch front page settings from admin-controlled API
  const fetchFrontPageSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/frontpage/settings`);
      if (!response.ok) throw new Error('Failed to fetch front page settings');
      const settings = await response.json();
      setFrontPageSettings(settings);
      return settings;
    } catch (error) {
      console.error('Error fetching front page settings:', error);
      // Return fallback settings if API fails
      return {
        hero_title: 'IPMAIA WinterJam 2025',
        hero_description: 'Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em 45 horas.',
        hero_background_image: '/images/IPMAIA_SiteBanner.png',
        show_event_dates: true,
        show_theme: true,
        show_required_object: true,
        button_before_start_text: 'Inscrever Agora',
        button_before_start_url: '/enlist-now',
        button_during_event_text: 'Ver Regras',
        button_during_event_url: '/rules',
        button_after_event_text: 'Ver Jogos Submetidos',
        button_after_event_url: '/archive/2025/winter',
        status_event_running: 'Evento a decorrer!',
        status_fallback_message: 'Estamos a usar informação guardada. Algumas funcionalidades podem não refletir o tempo atual.'
      };
    }
  };

  // Fetch current game jam data from backend
  const fetchCurrentGameJam = async () => {
    try {
      const { gameJamApi } = await import('../utils/api');
      const gameJam = await gameJamApi.getCurrent();
      setCurrentGameJam(gameJam);
      return gameJam;
    } catch (error) {
      console.error('Error fetching current game jam:', error);
      return null;
    }
  };

  useEffect(() => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      try {
        // Initialize from localStorage if available
        const cached = localStorage.getItem('eventStatus');
        if (cached) {
          try {
            const { hasStarted, hasEnded, timestamp } = JSON.parse(cached);
            // Only use cache if it's less than 30 minutes old
            if (Date.now() - timestamp < 1800000) {
              setHasEventStarted(hasStarted);
              setHasEventEnded(hasEnded);
              setIsLoading(false); // Use cached status without waiting for API
            }
          } catch (error) {
            console.error('Error parsing cached event status:', error);
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
  }, []);

  // Fetch current time (optimized for production)
  const fetchCurrentTime = async () => {
    // Don't use external APIs in development to avoid unnecessary errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Using local time in development mode');
      return new Date();
    }

    // In production, use a faster, more reliable time source
    try {
      // Try a fast, reliable time API first
      const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Lisbon', {
        signal: AbortSignal.timeout(3000), // 3 second timeout
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        return new Date(data.datetime);
      }
    } catch (error) {
      console.warn('Fast time API failed, using local time:', error);
    }

    // Fallback to local system time if external APIs are slow/unavailable
    console.log('Using local system time as fallback');
    return new Date();
  };

  useEffect(() => {
    const checkEventStatus = async () => {
      if (!isLoading) return; // Skip if we're already using cached data
      
      try {
        const now = await fetchCurrentTime();
        
        // Fetch front page settings and current game jam data in parallel
        const [settings, gameJam] = await Promise.all([
          fetchFrontPageSettings(),
          fetchCurrentGameJam()
        ]);
        
        let eventStart, eventEnd;
        
        if (gameJam) {
          // Use dates from backend
          eventStart = new Date(gameJam.start_date);
          eventEnd = new Date(gameJam.end_date);
        } else {
          // Fallback to hardcoded dates if backend data unavailable
          console.warn('Using fallback event dates');
          eventStart = new Date('2025-02-14T17:00:00Z');
          eventEnd = new Date('2025-02-16T14:00:00Z');
        }
        
        const hasStarted = now >= eventStart;
        const hasEnded = now >= eventEnd;

        // Save to localStorage (browser only)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('eventStatus', JSON.stringify({
              hasStarted,
              hasEnded,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.warn('Could not store event status in localStorage:', error);
          }
        }
        
        setCurrentTime(now);
        setHasEventStarted(hasStarted);
        setHasEventEnded(hasEnded);
      } catch (error) {
        console.error('Failed to check event status:', error);
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkEventStatus();

    // Check every 5 minutes instead of every minute to reduce API calls
    const interval = setInterval(checkEventStatus, 300000);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <main className="min-h-screen">
      <Background
        imageUrl={frontPageSettings.hero_background_image || '/images/IPMAIA_SiteBanner.png'}
        fallbackContent={
          <div className="text-center">
            <img 
              src="/images/placeholder-game.png" 
              alt="WinterJam Background" 
              className="max-w-md mx-auto opacity-50"
            />
            <p className="text-gray-400 mt-4">Imagem de fundo não disponível</p>
          </div>
        }
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full px-4 py-16 text-center">
          <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">
                {currentGameJam ? currentGameJam.name : (frontPageSettings.hero_title || 'IPMAIA WinterJam 2025')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-orange-100 mb-8">
              {currentGameJam ? currentGameJam.description : (frontPageSettings.hero_description || 'Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em 45 horas.')}
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
              {frontPageSettings.show_event_dates !== false && (
                <div className="px-5 py-3 bg-orange-900/50 backdrop-blur-sm rounded-full text-orange-100 inline-flex items-center gap-2">
                  <Clock size={20} />
                  <span>
                    {currentGameJam 
                      ? `${new Date(currentGameJam.start_date).toLocaleDateString('pt-PT')} - ${new Date(currentGameJam.end_date).toLocaleDateString('pt-PT')}`
                      : '14-16 Fevereiro 2025'
                    }
                  </span>
                </div>
              )}
              {frontPageSettings.show_theme !== false && currentGameJam && currentGameJam.theme && (
                <div className="px-5 py-3 bg-orange-900/50 backdrop-blur-sm rounded-full text-orange-100">
                  <span>Tema: {currentGameJam.theme}</span>
                </div>
              )}
              {frontPageSettings.show_required_object !== false && currentGameJam && currentGameJam.required_object && (
                <div className="px-5 py-3 bg-orange-900/50 backdrop-blur-sm rounded-full text-orange-100">
                  <span>Objeto: {currentGameJam.required_object}</span>
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="animate-pulse bg-orange-500/30 text-transparent rounded-lg py-4 px-6 inline-block">
                A verificar status do evento...
              </div>
            ) : hasEventEnded ? (
              <Link 
                href={frontPageSettings.button_after_event_url || "/archive/2025/winter"}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                {frontPageSettings.button_after_event_text || "Ver Jogos Submetidos"} <ArrowRight size={20} />
              </Link>
            ) : hasEventStarted ? (
              <div className="space-y-4">
                <div className="inline-block bg-green-500/80 text-white px-4 py-2 rounded-md mb-4">
                  {frontPageSettings.status_event_running || "Evento a decorrer!"}
                </div>
                <Link 
                  href={frontPageSettings.button_during_event_url || "/rules"}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  {frontPageSettings.button_during_event_text || "Ver Regras"} <ArrowRight size={20} />
                </Link>
              </div>
            ) : (
              <Link 
                href={frontPageSettings.button_before_start_url || "/enlist-now"}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                {frontPageSettings.button_before_start_text || "Inscrever Agora"} <ArrowRight size={20} />
              </Link>
            )}

            {fetchError && (
              <div className="mt-4 text-amber-300 text-sm">
                <p>Nota: Estamos a usar informação guardada. Algumas funcionalidades podem não refletir o tempo atual.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}