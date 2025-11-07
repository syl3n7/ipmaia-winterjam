"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllGameJams } from "../data/gameJamData";

const MainNavbar = () => {
  const pathname = usePathname();
  const isGamesPage = pathname === "/games" || pathname.includes("/archive");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveItems, setArchiveItems] = useState([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(true);

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
        
        setArchiveItems(archiveItemsFromAPI);
      } catch (error) {
        console.error('Error fetching game jams for navbar:', error);
        // Set empty array on error
        setArchiveItems([]);
      } finally {
        setIsLoadingArchive(false);
      }
    };

    fetchGameJams();
  }, []);

  return (
    <Navbar fluid className={navbarClassName}>
      <NavbarBrand as={Link} href="/">
        <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="IPMAIA WinterJam favicon" />
        <span className={`${brandTextClassName} self-center whitespace-nowrap text-xl font-semibold`}>
          IPMAIA WinterJam
        </span>
      </NavbarBrand>
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
            href="mailto:gamejam.at.ipmaia@gmail.com" 
            className={`${linkClassName} flex items-center px-3 py-2 w-full md:w-auto`}
          >
            Contacto
          </NavbarLink>
          
          {/* Inscrever Agora Button - Stands out on desktop and mobile */}
          <div className="mt-2 md:mt-0 md:ml-2">
            <Link 
              href="/enlist-now"
              className="block w-full md:inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-orange-400 text-center"
            >
              ✍️ Inscrever Agora
            </Link>
          </div>
        </div>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MainNavbar;
