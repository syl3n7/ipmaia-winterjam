'use client';
import { useState, useEffect } from 'react';
import Background from "../components/Background";
import Link from "next/link";

export default function Home() {
  const [hasEventStarted, setHasEventStarted] = useState(false);

  useEffect(() => {
    const eventDate = new Date('2024-02-14T17:00:00');
    
    const checkEventStatus = () => {
      const now = new Date();
      setHasEventStarted(now >= eventDate);
    };

    // Check initially
    checkEventStatus();
    
    // Check every minute
    const interval = setInterval(checkEventStatus, 60000);
    
    return () => clearInterval(interval);
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
            <div className="flex items-center justify-center gap-3 text-3xl text-white mb-4">
              <span className="drop-shadow-md">
                {hasEventStarted ? 'A decorrer!' : '14 fevereiro às 17H'}
              </span>
            </div>
            <p className="text-4xl font-bold text-white drop-shadow-md">
              {hasEventStarted ? 'Se tiveres dúvidas consulta as regras' : '45 HORAS DE GAME JAM'}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
              <Link
                href="/rules"
                className="bg-orange-500 mt-8 px-8 py-3 hover:bg-orange-600 text-white rounded-lg font-medium text-lg transition-colors duration-200 transform hover:scale-105"
              >
                Ver Regras
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