"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { getAllGameJams } from "../data/gameJamData";

const MainNavbar = () => {
  const pathname = usePathname();
  const isGamesPage = pathname === "/games" || pathname.includes("/archive");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

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

  // Get game jam entries from the centralized data
  const archiveItems = getAllGameJams();

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
              Jogos
              <ChevronDown size={16} className={`transition-transform ${isArchiveOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isArchiveOpen && (
              <div className={`absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg border ${dropdownClassName} z-50`}>
                <div className="py-1">
                  {archiveItems.map(item => (
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
                  ))}
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
