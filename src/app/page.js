'use client';
import { useState, useEffect } from 'react';
import Background from "../components/Background";
import Link from "next/link";

export default function Home() {
  const [hasEventStarted, setHasEventStarted] = useState(false);
  const [hasEventEnded, setHasEventEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize from localStorage if available
    const cached = localStorage.getItem('eventStatus');
    if (cached) {
      const { hasStarted, hasEnded, timestamp } = JSON.parse(cached);
      // Only use cache if it's less than 5 minutes old
      if (Date.now() - timestamp < 300000) {
        setHasEventStarted(hasStarted);
        setHasEventEnded(hasEnded);
      }
    }
  }, []);

  const fetchCurrentTime = async () => {
    // Try multiple time APIs in order
    const timeApis = [
      'http://worldtimeapi.org/api/timezone/Europe/London',
      'https://timeapi.io/api/Time/current/zone?timeZone=Europe/London',
      'https://www.timeapi.io/api/Time/current/zone?timeZone=UTC'
    ];

    for (const api of timeApis) {
      try {
        const response = await fetch(api);
        if (!response.ok) continue;
        
        const data = await response.json();
        // Different APIs have different response formats
        const datetime = data.datetime || data.dateTime;
        if (datetime) {
          // Cache the successful time in localStorage
          localStorage.setItem('lastKnownTime', JSON.stringify({
            time: datetime,
            timestamp: Date.now()
          }));
          return new Date(datetime);
        }
      } catch (error) {
        console.error(`Failed to fetch time from ${api}:`, error);
        continue;
      }
    }

    // If all APIs fail, try to use cached time
    const cachedTime = localStorage.getItem('lastKnownTime');
    if (cachedTime) {
      const { time, timestamp } = JSON.parse(cachedTime);
      const cachedDate = new Date(time);
      // Add the elapsed time since the cache was stored
      cachedDate.setMilliseconds(cachedDate.getMilliseconds() + (Date.now() - timestamp));
      return cachedDate;
    }

    // Last resort: use local time
    console.warn('Using local system time as fallback');
    return new Date();
  };

  useEffect(() => {
    const checkEventStatus = async () => {
      setIsLoading(true);
      try {
        const now = await fetchCurrentTime();
        const eventStart = new Date('2025-02-14T17:00:00Z');
        const eventEnd = new Date('2025-02-16T14:00:00Z');
        
        const hasStarted = now >= eventStart;
        const hasEnded = now >= eventEnd;

        localStorage.setItem('eventStatus', JSON.stringify({
          hasStarted,
          hasEnded,
          timestamp: Date.now()
        }));
        
        setCurrentTime(now);
        setHasEventStarted(hasStarted);
        setHasEventEnded(hasEnded);
      } catch (error) {
        console.error('Failed to check event status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkEventStatus();
    
    // Check every minute
    const timer = setInterval(checkEventStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  // Debug logging
  useEffect(() => {
    if (currentTime) {
      console.log('Current time:', currentTime.toISOString());
      console.log('Event ended:', hasEventEnded);
      console.log('Event started:', hasEventStarted);
    }
  }, [currentTime, hasEventEnded, hasEventStarted]);

  return (
    <main className="relative h-[calc(100vh-theme(spacing.16))]">
      <Background
        imageUrl="/images/IPMAIA_SiteBanner.png"
        fallbackContent={
          <div className="text-gray-500 text-center">
            <p>Não foi possível carregar a imagem de fundo</p>
          </div>
        }
      />
      <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2 text-3xl text-white mb-4">
              <span className="drop-shadow-md">
                Esta Jam terminou, fica atento para uma próxima!
              </span>
            </div>

            {/* Results Section */}
            <div className="mt-8 mb-6 space-y-6 text-white">
              <h2 className="text-3xl font-bold mb-6 text-orange-400">Resultados</h2>
              
              <div className="space-y-4">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-transform">
                  <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <span className="text-yellow-400">🥇</span>
                    <span>1º LUGAR</span>
                  </h3>
                  <p className="text-xl font-semibold text-orange-400 mt-2">Interdimensional Cat</p>
                  <p className="text-gray-300">Parabéns à equipa Team MALU</p>
                </div>

                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-transform">
                  <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <span className="text-gray-300">🥈</span>
                    <span>2º LUGAR</span>
                  </h3>
                  <p className="text-xl font-semibold text-orange-400 mt-2">Ever Sleep</p>
                  <p className="text-gray-300">Parabéns à equipa Lata D'Atum</p>
                </div>

                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-transform">
                  <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <span className="text-amber-700">🥉</span>
                    <span>3º LUGAR</span>
                  </h3>
                  <p className="text-xl font-semibold text-orange-400 mt-2">Deep Anomaly</p>
                  <p className="text-gray-300">Parabéns à equipa Vatanupe</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mt-4">
                Podes consultar os critérios de avaliação foram os disponibilizados nas regras.
                <br />
                Em breve entraremos em contacto por email para entregar os prémios e certificados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
              <Link
                href="/rules"
                className="bg-orange-500 mt-8 px-8 py-3 hover:bg-orange-600 text-white rounded-lg font-medium text-lg transition-colors duration-200 transform hover:scale-105"
              >
                Ver Regras
              </Link>
              <Link
                href="https://discord.gg/X97GAg7F6E"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#5865F2] mt-8 px-8 py-3 hover:bg-[#4752C4] text-white rounded-lg font-medium text-lg transition-colors duration-200 transform hover:scale-105"
              >
                Junta-te ao Discord
              </Link>
              <Link
                href="/games"
                className="bg-green-500 mt-8 px-8 py-3 hover:bg-green-600 text-white rounded-lg font-medium text-lg transition-colors duration-200 transform hover:scale-105"
              >
                Ver Jogos
              </Link>
            </div>
          </div>
        </div>
    </main>
  );
}