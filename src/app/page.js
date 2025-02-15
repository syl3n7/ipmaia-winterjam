'use client';
import { useState, useEffect } from 'react';
import Background from "../components/Background";
import Link from "next/link";

export default function Home() {
  const [hasEventStarted, setHasEventStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const eventStart = new Date('2024-02-14T17:00:00');
    const eventEnd = new Date('2024-02-16T14:00:00');
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = now < eventStart ? eventStart : eventEnd;
      const difference = targetDate - now;

      // Add console log to debug
      console.log('Current time:', now);
      console.log('Target date:', targetDate);
      console.log('Difference:', difference);

      // Check if the difference is negative
      if (difference <= 0) {
        console.log('Timer finished');
        return '';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      console.log('Time string:', timeString);
      return timeString;
    };

    const checkEventStatus = () => {
      const now = new Date();
      setHasEventStarted(now >= new Date('2024-02-14T17:00:00'));
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    checkEventStatus();

    // Update countdown every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      console.log('New time left:', newTimeLeft); // Debug log
      setTimeLeft(newTimeLeft);
      checkEventStatus();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
                {hasEventStarted ? 'Termina' : 'Começa'} 16 fevereiro às 14h
              </span>
              {timeLeft && (
                <div className="bg-black/30 px-6 py-2 rounded-lg">
                  <span className="text-3xl font-mono text-orange-400 font-bold">
                    {timeLeft}
                  </span>
                </div>
              )}
            </div>
            <p className="text-4xl font-bold text-white drop-shadow-md">
              {hasEventStarted ? 'Se tiveres dúvidas consulta as regras ou aborda o staff no discord' : '45 HORAS DE GAME JAM'}
            </p>
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
                href="/enlist-now"
                className={`mt-8 px-8 py-3 text-white rounded-lg font-medium text-lg transition-colors duration-200 transform 
                  ${hasEventStarted 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                  }`}
                onClick={(e) => hasEventStarted && e.preventDefault()}
              >
                Inscrever já!
              </Link>
            </div>
          </div>
        </div>
    </main>
  );
}