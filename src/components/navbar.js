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
    ? "bg-transparent bg-gradient-to-b from-orange-950/90 to-transparent sticky top-0 z-50 backdrop-blur-sm"
    : "bg-gray-900 sticky top-0 z-50 backdrop-blur-sm";

  const linkClassName = isGamesPage
    ? "text-orange-200/80 hover:text-orange-100 hover:bg-orange-900/20"
    : "text-gray-200 hover:text-white hover:bg-gray-800";

  const brandTextClassName = isGamesPage
    ? "text-orange-100"
    : "text-white";

  const toggleClassName = isGamesPage
    ? "text-orange-100 hover:bg-orange-900/20"
    : "text-white hover:bg-gray-800";

  const dropdownClassName = isGamesPage
    ? "bg-orange-950/80 backdrop-blur-sm border-orange-900"
    : "bg-gray-800/90 backdrop-blur-sm border-gray-700";

  // Fetch game jams from backend API
  useEffect(() => {
    const fetchGameJams = async () => {
      try {
        const { gameJamApi } = await import('../utils/api');
        const gameJams = await gameJamApi.getAll();
        
        // Convert to navbar format
        const archiveItemsFromAPI = gameJams.map(jam => {
          // Extract year from start_date
          const year = new Date(jam.start_date).getFullYear();
          
          // Determine season from name (you might want to improve this logic)
          let season = 'winter'; // default
          if (jam.name.toLowerCase().includes('summer')) season = 'summer';
          if (jam.name.toLowerCase().includes('spring')) season = 'spring';
          if (jam.name.toLowerCase().includes('fall') || jam.name.toLowerCase().includes('autumn')) season = 'fall';
          
          return {
            id: jam.id,
            name: jam.name,
            path: `/archive/${year}/${season}`,
            isCurrent: jam.is_active // Use is_active to determine current
          };
        });
        
        setArchiveItems(archiveItemsFromAPI);
      } catch (error) {
        console.error('Error fetching game jams for navbar:', error);
        // Fallback to hardcoded data
        const fallbackItems = getAllGameJams();
        setArchiveItems(fallbackItems);
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
                        className={`block px-4 py-2 ${linkClassName} flex justify-between items-center w-full`}
                        onClick={() => setIsArchiveOpen(false)}
                      >
                        <span>{item.name}</span>
                        {item.isCurrent && (
                          <span className="bg-green-600 text-xs px-1.5 py-0.5 rounded text-white whitespace-nowrap">Atual</span>
                        )}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-400">Nenhum evento encontrado</div>
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
