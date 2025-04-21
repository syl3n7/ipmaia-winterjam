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

  useEffect(() => {
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
  }, []);

  const fetchCurrentTime = async () => {
    // Don't use external APIs in development to avoid unnecessary errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Using local time in development mode');
      return new Date();
    }

    // Try multiple time APIs in order with timeout
    const timeApis = [
      'https://worldtimeapi.org/api/timezone/Europe/London',
      'https://timeapi.io/api/Time/current/zone?timeZone=Europe/London',
      'https://worldtimeapi.org/api/timezone/UTC',
      'https://timeapi.io/api/Time/current/zone?timeZone=UTC'
    ];

    // Helper function to fetch with timeout
    const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, { 
          ...options, 
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Try each API with timeout
    for (const api of timeApis) {
      try {
        const response = await fetchWithTimeout(api);
        if (!response.ok) continue;
        
        const data = await response.json();
        let datetime;
        
        // Handle different API response formats
        if (data.datetime) {
          // worldtimeapi.org format
          datetime = data.datetime;
        } else if (data.dateTime) {
          // timeapi.io format
          datetime = data.dateTime;
        }
        
        if (datetime) {
          // Cache the successful time in localStorage
          try {
            localStorage.setItem('lastKnownTime', JSON.stringify({
              time: datetime,
              timestamp: Date.now()
            }));
            setFetchError(false);
          } catch (error) {
            console.warn('Could not store time in localStorage:', error);
          }
          return new Date(datetime);
        }
      } catch (error) {
        console.error(`Failed to fetch time from ${api}:`, error);
        // Continue to the next API
      }
    }

    // All API calls failed, try to use cached time
    setFetchError(true);
    try {
      const cachedTimeStr = localStorage.getItem('lastKnownTime');
      if (cachedTimeStr) {
        const cachedTime = JSON.parse(cachedTimeStr);
        const { time, timestamp } = cachedTime;
        console.log('Using cached time from localStorage');
        const cachedDate = new Date(time);
        // Add the elapsed time since the cache was stored
        cachedDate.setMilliseconds(cachedDate.getMilliseconds() + (Date.now() - timestamp));
        return cachedDate;
      }
    } catch (error) {
      console.error('Error retrieving cached time:', error);
    }

    // Last resort: use local system time
    console.warn('Using local system time as fallback');
    return new Date();
  };

  useEffect(() => {
    const checkEventStatus = async () => {
      if (!isLoading) return; // Skip if we're already using cached data
      
      try {
        const now = await fetchCurrentTime();
        
        // Define the event dates - hardcoded for now
        const eventStart = new Date('2025-02-14T17:00:00Z');
        const eventEnd = new Date('2025-02-16T14:00:00Z');
        
        const hasStarted = now >= eventStart;
        const hasEnded = now >= eventEnd;

        // Save to localStorage
        try {
          localStorage.setItem('eventStatus', JSON.stringify({
            hasStarted,
            hasEnded,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('Could not store event status in localStorage:', error);
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
        imageUrl="/images/IPMAIA_SiteBanner.png"
        fallbackContent={
          <div className="text-gray-500 flex items-center justify-center h-full">
            <p>A carregar imagem...</p>
          </div>
        }
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full px-4 py-16 text-center">
          <div className="bg-black/40 backdrop-blur-md p-8 rounded-2xl shadow-xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">
                IPMAIA WinterJam 2025
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-orange-100 mb-8">
              Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em 45 horas.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
              <div className="px-5 py-3 bg-orange-900/50 backdrop-blur-sm rounded-full text-orange-100 inline-flex items-center gap-2">
                <Clock size={20} />
                <span>14-16 Fevereiro 2025</span>
              </div>
              <div className="px-5 py-3 bg-orange-900/50 backdrop-blur-sm rounded-full text-orange-100">
                <span>Tema: Anomalia</span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse bg-orange-500/30 text-transparent rounded-lg py-4 px-6 inline-block">
                A verificar status do evento...
              </div>
            ) : hasEventEnded ? (
              <Link 
                href="/archive/2025/winter"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                Ver Jogos Submetidos <ArrowRight size={20} />
              </Link>
            ) : hasEventStarted ? (
              <div className="space-y-4">
                <div className="inline-block bg-green-500/80 text-white px-4 py-2 rounded-md mb-4">
                  Evento a decorrer!
                </div>
                <Link 
                  href="/rules" 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  Ver Regras <ArrowRight size={20} />
                </Link>
              </div>
            ) : (
              <Link 
                href="/enlist-now" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                Inscrever Agora <ArrowRight size={20} />
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