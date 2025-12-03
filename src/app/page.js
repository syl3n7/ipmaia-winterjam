'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Background from '../components/Background';
import Sponsor from '../components/Sponsor';
import { Clock, ArrowRight, Calendar, Target, Trophy, Users, Info, Lightbulb, FileText, X } from 'lucide-react';
import { useFrontPageSettings } from '../hooks/useFrontPageSettings';
import { useLatestArchive } from '../hooks/useLatestArchive';

// Helper function to convert line breaks to HTML (with HTML escaping for XSS protection)
const nl2br = (text) => {
  if (!text) return '';
  // Escape HTML special characters to prevent XSS
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  // Convert newlines to <br /> tags
  return escaped.replace(/\n/g, '<br />');
};

export default function Home() {
  const [hasEventStarted, setHasEventStarted] = useState(false);
  const [hasEventEnded, setHasEventEnded] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [currentGameJam, setCurrentGameJam] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [showRulesNotification, setShowRulesNotification] = useState(false);
  const { frontPageSettings } = useFrontPageSettings();
  const latestArchiveUrl = useLatestArchive();

  // Fetch current game jam data from backend
  const fetchCurrentGameJam = async () => {
    try {
      const { gameJamApi } = await import('../utils/api');
      const gameJam = await gameJamApi.getCurrent();
      setCurrentGameJam(gameJam);
      return gameJam;
    } catch (error) {
      return null;
    }
  };

  // Check if rules notification should be shown
  useEffect(() => {
    const checkRulesNotification = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/rules/last-updated`);
        const data = await response.json();
        
        const rulesReadTimestamp = localStorage.getItem('rulesReadComplete');
        const lastUpdated = data.lastUpdated;
        
        // Show notification if:
        // 1. User has never read the rules, OR
        // 2. Rules were updated after the user last read them
        if (!rulesReadTimestamp || (lastUpdated && new Date(lastUpdated) > new Date(rulesReadTimestamp))) {
          setShowRulesNotification(true);
        }
      } catch (error) {
        console.error('Error checking rules update:', error);
        // If API fails, check if user has read rules at all
        const rulesReadComplete = localStorage.getItem('rulesReadComplete');
        if (!rulesReadComplete) {
          setShowRulesNotification(true);
        }
      }
    };
    
    checkRulesNotification();
  }, []);

  const handleDismissRulesNotification = () => {
    setShowRulesNotification(false);
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
            // Error parsing cached event status
          }
        }
      } catch (error) {
        // Error accessing localStorage
      }
    }
  }, []);

  useEffect(() => {
    const checkEventStatus = async () => {
      if (!isLoading) return; // Skip if we're already using cached data
      
      try {
        // Use local browser time
        const now = new Date();
        
        // Fetch current game jam data
        const gameJam = await fetchCurrentGameJam();
        
        let eventStart, eventEnd;
        
        if (gameJam) {
          // Use dates from backend
          eventStart = new Date(gameJam.start_date);
          eventEnd = new Date(gameJam.end_date);
          const regStart = gameJam.registration_start_date ? new Date(gameJam.registration_start_date) : null;
          const regEnd = gameJam.registration_end_date ? new Date(gameJam.registration_end_date) : null;
          
          const hasStarted = now >= eventStart;
          const hasEnded = now >= eventEnd;
          const regIsOpen = regStart && now >= regStart;
          const regIsClosed = regEnd && now > regEnd;
          
          setRegistrationOpen(regIsOpen);
          setRegistrationClosed(regIsClosed);
        } else {
          // Fallback to hardcoded dates if backend data unavailable
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
            // Could not store event status in localStorage
          }
        }
        
        setCurrentTime(now);
        setHasEventStarted(hasStarted);
        setHasEventEnded(hasEnded);
      } catch (error) {
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

  useEffect(() => {
    const apiUrl = typeof window === 'undefined' 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://backend:3001/api')
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
    fetch(`${apiUrl}/sponsors`)
      .then(res => res.json())
      .then(data => setSponsors(data.sponsors || []))
      .catch(() => setSponsors([]));
  }, []);

  return (
    <main className="min-h-screen">
      <Background
        imageUrl={frontPageSettings.hero_background_image}
        fallbackContent={
          <div className="text-center">
            <img 
              src="/images/placeholder-image.png" 
              alt="WinterJam Background" 
              className="max-w-md mx-auto opacity-50"
            />
            <p className="text-gray-400 mt-4">Imagem de fundo não disponível</p>
          </div>
        }
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen py-16">
        <div className="max-w-6xl w-full px-4">
          {/* Main Hero Section */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header Section */}
            <div className="text-center p-8 border-b border-orange-500/30">
              {(!currentGameJam || currentGameJam.show_title !== false) && (
                <>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">
                      {currentGameJam ? currentGameJam.name : (frontPageSettings.hero_title || 'IPMAIA WinterJam 2025')}
                    </span>
                  </h1>

                  {/* Hero sponsor(s) directly below the title: fetched from API */}
                  {sponsors.length > 0 && (
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <span className="text-xs uppercase text-orange-300 leading-none">SPONSORED BY</span>
                      <div className="flex items-center gap-3">
                        {sponsors.map((s, idx) => (
                          <Sponsor key={idx} showText={false} isCircular={false} imgSrc={s.imgSrc} alt={s.alt || 'Sponsor'} href={s.href} imgClassName={'h-10 sm:h-12'} containerClass={'p-0'} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {(!currentGameJam || currentGameJam.show_description !== false) && (
                <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
                  {currentGameJam ? currentGameJam.description : (frontPageSettings.hero_description || 'Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em 45 horas.')}
                </p>
              )}

              {/* Mobile sponsor moved to a floating, dismissable widget to avoid duplicated sponsors */}

              {/* Mobile sponsor moved to a floating, dismissable widget to avoid duplicated sponsors */}
            </div>

            {/* Event Info Stack - Full Width Sections */}
            <div className="flex flex-col gap-4 p-8">
              
              {/* Introduction */}
              <div className="bg-orange-900/30 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="text-orange-400" size={24} />
                  <h3 className="text-2xl font-semibold text-orange-100">
                    {currentGameJam?.name ? `O que é a ${currentGameJam.name}?` : 'O que é a WinterJam?'}
                  </h3>
                </div>
                {currentGameJam?.introduction ? (
                  <div className="text-orange-200 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: nl2br(currentGameJam.introduction) }} />
                ) : (
                  <p className="text-orange-200 text-lg leading-relaxed">
                    Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-orange-300/90">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span>Equipas (máximo 4 pessoas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>45 horas de desenvolvimento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={18} />
                    <span>Tema revelado no início</span>
                  </div>
                </div>
              </div>

              {/* Prizes */}
              <div className="bg-orange-900/30 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="text-orange-400" size={24} />
                  <h3 className="text-2xl font-semibold text-orange-100">Prémios</h3>
                </div>
                {currentGameJam?.prizes_content ? (
                  <div className="text-orange-200" dangerouslySetInnerHTML={{ __html: nl2br(currentGameJam.prizes_content) }} />
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl">🥇</div>
                        <h4 className="text-2xl font-bold text-yellow-300">1º Lugar</h4>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-orange-200">
                        <li>Gift card InstantGaming de 10€ (por cada elemento)</li>
                        <li>Certificado</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl">🎁</div>
                        <h4 className="text-2xl font-bold text-orange-200">Todos os Participantes</h4>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-orange-200">
                        <li>Fita ou porta-chaves do evento</li>
                        <li>Certificado de participação</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="bg-orange-900/30 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-orange-400" size={24} />
                  <h3 className="text-2xl font-semibold text-orange-100">Horário do Evento</h3>
                </div>
                
                <div className="space-y-6">
                  {currentGameJam ? (
                    <>
                      {/* Day 1 - Start */}
                      <div>
                        <h4 className="text-xl font-semibold text-orange-200 mb-3 flex items-center gap-2">
                          📅 {new Date(currentGameJam.start_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </h4>
                        <div className="space-y-2 ml-4">
                          {/* Reception - Use reception_datetime if available */}
                          {currentGameJam.reception_datetime && (
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-orange-300 min-w-[80px]">
                                {new Date(currentGameJam.reception_datetime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div>
                                <strong className="text-orange-100">👋 Receção</strong>
                                <p className="text-sm text-orange-300/70">Chegada e check-in dos participantes</p>
                              </div>
                            </div>
                          )}
                          {/* Theme Announcement - Use theme_announcement_datetime if available */}
                          {currentGameJam.theme_announcement_datetime ? (
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-orange-300 min-w-[80px]">
                                {new Date(currentGameJam.theme_announcement_datetime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div>
                                <strong className="text-orange-100">🎨 Divulgação do tema</strong>
                                <p className="text-sm text-orange-300/70">Tema revelado aos participantes</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-orange-300 min-w-[80px]">
                                {new Date(new Date(currentGameJam.start_date).getTime() + 15*60000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div>
                                <strong className="text-orange-100">🎨 Divulgação do tema</strong>
                                <p className="text-sm text-orange-300/70">Tema revelado aos participantes</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-orange-300 min-w-[80px]">
                              {new Date(currentGameJam.start_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div>
                              <strong className="text-orange-100">🚀 Início do Jam</strong>
                              <p className="text-sm text-orange-300/70">Começa a contagem das 45 horas</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Day 2 - Middle day(s) */}
                      {(() => {
                        const start = new Date(currentGameJam.start_date);
                        const end = new Date(currentGameJam.end_date);
                        const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
                        
                        if (daysDiff >= 2) {
                          const middleDay = new Date(start.getTime() + (1000 * 60 * 60 * 24));
                          return (
                            <div>
                              <h4 className="text-xl font-semibold text-orange-200 mb-3 flex items-center gap-2">
                                📅 {middleDay.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', weekday: 'long' })}
                              </h4>
                              <div className="space-y-2 ml-4">
                                <div className="flex items-start gap-3">
                                  <span className="font-mono text-orange-300 min-w-[80px]">00:00-24:00</span>
                                  <div>
                                    <strong className="text-orange-100">Desenvolvimento Contínuo</strong>
                                    <p className="text-sm text-orange-300/70">Dia completo de criação</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Day 3 - End */}
                      <div>
                        <h4 className="text-xl font-semibold text-orange-200 mb-3 flex items-center gap-2">
                          📅 {new Date(currentGameJam.end_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </h4>
                        <div className="space-y-2 ml-4">
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-orange-300 min-w-[80px]">
                              {new Date(currentGameJam.end_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div>
                              <strong className="text-orange-100">⏰ FIM DO JAM!</strong>
                              <p className="text-sm text-orange-300/70">Término das 45 horas</p>
                            </div>
                          </div>
                          {/* Awards Ceremony - Use awards_ceremony_datetime if available */}
                          {currentGameJam.awards_ceremony_datetime ? (
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-orange-300 min-w-[80px]">
                                {new Date(currentGameJam.awards_ceremony_datetime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div>
                                <strong className="text-orange-100">🏆 Cerimónia de Entrega de Prémios</strong>
                                <p className="text-sm text-orange-300/70">Anúncio dos vencedores e entrega de prémios</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-orange-300 min-w-[80px]">
                                {new Date(currentGameJam.end_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}+
                              </span>
                              <div>
                                <strong className="text-orange-100">🏆 Cerimónia de Entrega de Prémios</strong>
                                <p className="text-sm text-orange-300/70">Anúncio dos vencedores e entrega de prémios</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-orange-300/70 text-center">A carregar horário...</p>
                  )}
                </div>
              </div>

            </div>

            {/* Action Button Section */}
            <div className="text-center p-8 border-t border-orange-500/30">
              {isLoading ? (
                <div className="animate-pulse bg-orange-500/30 text-transparent rounded-lg py-4 px-6 inline-block">
                  A verificar status do evento...
                </div>
              ) : hasEventEnded ? (
                <Link 
                  href={latestArchiveUrl}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  {frontPageSettings.button_after_event_text || "Avaliação a Decorrer - Ver Jogos Submetidos"} <ArrowRight size={20} />
                </Link>
              ) : registrationClosed ? (
                <span className="bg-gray-500 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 cursor-not-allowed">
                  Inscrições Encerradas
                </span>
              ) : registrationOpen ? (
                <>
                  {hasEventStarted && (
                    <div className="inline-block bg-green-500/80 text-white px-4 py-2 rounded-md mb-4">
                      {frontPageSettings.status_event_running || "Evento a decorrer!"}
                    </div>
                  )}
                  <Link 
                    href={
                      hasEventStarted
                        ? frontPageSettings.button_during_event_url || "/rules"
                        : frontPageSettings.button_before_start_url || "/enlist-now"
                    }
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 transition-all hover:scale-105"
                  >
                    {hasEventStarted
                      ? `Evento em Progresso - ${frontPageSettings.button_during_event_text || "Ver Regras"}`
                      : frontPageSettings.button_before_start_text || "Inscrever Agora"
                    } <ArrowRight size={20} />
                  </Link>
                </>
              ) : (
                <span className="bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 cursor-not-allowed">
                  Em Breve
                </span>
              )}

              {fetchError && (
                <div className="mt-4 text-amber-300 text-sm">
                  <p>{frontPageSettings.status_fallback_message || "Nota: Estamos a usar informação guardada."}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Floating Rules Update Notification */}
      {showRulesNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-2xl p-4 pr-12 max-w-sm relative hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105">
            <button
              onClick={handleDismissRulesNotification}
              className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close notification temporarily"
              title="Fechar temporariamente"
            >
              <X className="w-5 h-5" />
            </button>
            
            <Link href="/rules" className="flex items-start gap-3">
              <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Regras Atualizadas!</h4>
                <p className="text-xs text-white/90 mb-2">
                  O livro de regras foi atualizado. Leia até ao fim para dispensar esta notificação.
                </p>
                <span className="text-xs font-semibold underline">Ver Regras →</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}