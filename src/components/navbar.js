"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllGameJams } from "../data/gameJamData";
import { useFrontPageSettings } from "../hooks/useFrontPageSettings";
import { useLatestArchive } from "../hooks/useLatestArchive";

const MainNavbar = () => {
  const pathname = usePathname();
  const isGamesPage = pathname === "/games" || pathname.includes("/archive");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveItems, setArchiveItems] = useState([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(true);
  const [latestArchiveUrl, setLatestArchiveUrl] = useState('/archive');
  const { frontPageSettings } = useFrontPageSettings();
  const latestArchiveUrlFromHook = useLatestArchive();
  const [hasEventStarted, setHasEventStarted] = useState(false);
  const [hasEventEnded, setHasEventEnded] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [noActiveJam, setNoActiveJam] = useState(false);

  // Fetch game jams from backend API
  useEffect(() => {
    const fetchGameJams = async () => {
      try {
        const { gameJamApi } = await import('../utils/api');
        const allGameJams = await gameJamApi.getAll();
        
        // Filter only inactive game jams for archive
        const inactiveJams = allGameJams.filter(jam => !jam.is_active);
        
        // Convert to navbar format
        const archiveItemsFromAPI = inactiveJams.map(jam => {
          return {
            id: jam.id,
            name: jam.name,
            path: `/archive/${jam.id}`,
            isCurrent: false // These are all inactive
          };
        });
        
        // Set latest archive URL
        if (inactiveJams.length > 0) {
          inactiveJams.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
          setLatestArchiveUrl(`/archive/${inactiveJams[0].id}`);
        }
        
        setArchiveItems(archiveItemsFromAPI);
      } catch (error) {
        // Set empty array on error
        setArchiveItems([]);
      } finally {
        setIsLoadingArchive(false);
      }
    };

    fetchGameJams();
  }, []);

  // Determine button state based on current game jam
  useEffect(() => {
    const checkEventStatus = async () => {
      try {
        const { gameJamApi } = await import('../utils/api');
        const currentJam = await gameJamApi.getCurrent();
        if (currentJam) {
          const now = new Date();
          const startDate = new Date(currentJam.start_date);
          const endDate = new Date(currentJam.end_date);
          const registrationDeadline = new Date(currentJam.registration_deadline);

          setHasEventStarted(now >= startDate);
          setHasEventEnded(now > endDate);
          setRegistrationOpen(now <= registrationDeadline);
          setRegistrationClosed(now > registrationDeadline);
          setNoActiveJam(false);
        } else {
          setNoActiveJam(true);
          setHasEventStarted(false);
          setHasEventEnded(false);
          setRegistrationOpen(false);
          setRegistrationClosed(false);
        }
      } catch (error) {
        console.error('Error checking event status:', error);
        setNoActiveJam(true);
      }
    };

    checkEventStatus();
  }, []);

  // Don't render navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navbarClassName = isGamesPage
    ? "bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-lg"
    : "bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-lg";

  const linkClassName = isGamesPage
    ? "text-orange-200/90 hover:text-orange-100 hover:bg-orange-900/30"
    : "text-gray-200 hover:text-white hover:bg-white/10";

  const brandTextClassName = isGamesPage
    ? "text-orange-100"
    : "text-white";

  const toggleClassName = isGamesPage
    ? "text-orange-100 hover:bg-orange-900/30"
    : "text-white hover:bg-white/10";

  const dropdownClassName = isGamesPage
    ? "bg-black/40 backdrop-blur-md border-orange-900/50 shadow-xl"
    : "bg-black/40 backdrop-blur-md border-white/20 shadow-xl";

  return (
    <Navbar fluid className={navbarClassName}>
      <NavbarBrand as={Link} href="/">
        <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="IPMAIA WinterJam favicon" />
        <span className={`${brandTextClassName} self-center whitespace-nowrap text-xl font-semibold`}>
          IPMAIA WinterJam
        </span>
      </NavbarBrand>

      {/* Sponsor removed from navbar per UX decision */}
      <NavbarToggle className={toggleClassName} />
      <NavbarCollapse>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <div className="relative w-full md:w-auto">
            <button 
              className={`flex items-center justify-between gap-1 px-3 py-2 rounded ${linkClassName} w-full`}
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
            >
              Arquivo
              <ChevronDown size={16} className={`transition-transform ${isArchiveOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isArchiveOpen && (
              <div className={`md:absolute static md:top-full md:left-0 md:mt-1 w-full md:w-48 rounded-md md:shadow-lg border ${dropdownClassName} md:z-50`}>
                <div className="py-1">
                  {isLoadingArchive ? (
                    <div className="px-4 py-2 text-gray-400">A carregar...</div>
                  ) : archiveItems.length > 0 ? (
                    archiveItems.map(item => (
                      <Link 
                        key={item.id}
                        href={item.path}
                        className={`block px-4 py-2 ${linkClassName} w-full`}
                        onClick={() => setIsArchiveOpen(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-400">Nenhum arquivo disponível</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <NavbarLink 
            href="/rules" 
            className={`${linkClassName} flex items-center px-3 py-2 w-full md:w-auto`}
          >
            Regras
          </NavbarLink>
          <NavbarLink 
            href="/contact" 
            className={`${linkClassName} flex items-center px-3 py-2 w-full md:w-auto`}
          >
            Contacto
          </NavbarLink>
          
          {/* Dynamic Button - Stands out on desktop and mobile */}
          <div className="mt-2 md:mt-0 md:ml-2">
            {noActiveJam ? (
              <Link
                href={latestArchiveUrlFromHook}
                className="block w-full md:inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-orange-400 text-center"
              >
                📁 Ver Arquivo
              </Link>
            ) : registrationClosed || hasEventEnded ? (
              <span className="block w-full md:inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-gray-500 text-white text-sm font-bold rounded-lg border border-gray-400 text-center cursor-not-allowed">
                ✍️ Inscrições Encerradas
              </span>
            ) : registrationOpen ? (
              <Link 
                href={
                  hasEventStarted
                    ? frontPageSettings.button_during_event_url || "/rules"
                    : frontPageSettings.button_before_start_url || "/enlist-now"
                }
                className="block w-full md:inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-orange-400 text-center"
              >
                ✍️ {
                  hasEventStarted
                    ? `Evento em Progresso - ${frontPageSettings.button_during_event_text || "Ver Regras"}`
                    : frontPageSettings.button_before_start_text || "Inscrever Agora"
                }
              </Link>
            ) : (
              <span className="block w-full md:inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-gray-400 text-white text-sm font-bold rounded-lg border border-gray-300 text-center cursor-not-allowed">
                ✍️ Em Breve
              </span>
            )}
          </div>
        </div>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MainNavbar;
