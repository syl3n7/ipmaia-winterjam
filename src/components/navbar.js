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
      <NavbarCollapse className="flex md:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className={`flex items-center gap-1 px-3 py-2 rounded ${linkClassName}`}
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
            >
              Arquivo
              <ChevronDown size={16} className={`transition-transform ${isArchiveOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isArchiveOpen && (
              <div className={`absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg border ${dropdownClassName} z-50`}>
                <div className="py-1">
                  {isLoadingArchive ? (
                    <div className="px-4 py-2 text-gray-400">A carregar...</div>
                  ) : archiveItems.length > 0 ? (
                    archiveItems.map(item => (
                      <Link 
                        key={item.id}
                        href={item.path}
                        className={`block px-4 py-2 ${linkClassName} flex justify-between items-center`}
                        onClick={() => setIsArchiveOpen(false)}
                      >
                        <span>{item.name}</span>
                        {item.isCurrent && (
                          <span className="bg-green-600 text-xs px-1.5 py-0.5 rounded text-white">Atual</span>
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
            className={`${linkClassName} flex items-center px-3 py-2`}
          >
            Regras
          </NavbarLink>
          <NavbarLink 
            href="mailto:gamejam.at.ipmaia@gmail.com" 
            className={`${linkClassName} flex items-center px-3 py-2`}
          >
            Contacto
          </NavbarLink>
        </div>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MainNavbar;
