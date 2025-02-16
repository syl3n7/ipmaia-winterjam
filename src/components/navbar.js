"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";

const MainNavbar = () => {
  const pathname = usePathname();
  const isGamesPage = pathname === "/games";

  const navbarClassName = isGamesPage
    ? "bg-transparent bg-gradient-to-b from-orange-950/90 to-transparent sticky top-0 z-50 backdrop-blur-sm border-b border-orange-900/20"
    : "bg-gray-900 sticky top-0 z-50 border-b border-gray-800";

  const linkClassName = isGamesPage
    ? "text-orange-200/80 hover:text-orange-100 hover:bg-orange-900/20"
    : "text-gray-300 hover:text-white hover:bg-gray-800";

  const brandTextClassName = isGamesPage
    ? "text-orange-100"
    : "text-white";

  const toggleClassName = isGamesPage
    ? "text-orange-100 hover:bg-orange-900/20"
    : "text-gray-300 hover:bg-gray-800";

  return (
    <Navbar fluid className={navbarClassName}>
      <NavbarBrand as={Link} href="/">
        <img src="../../favicon.ico" className="mr-3 h-6 sm:h-9" alt="IPMAIA WinterJam favicon" />
        <span className={`${brandTextClassName} self-center whitespace-nowrap text-xl font-semibold`}>
          IPMAIA WinterJam
        </span>
      </NavbarBrand>
      <NavbarToggle className={toggleClassName} />
      <NavbarCollapse>
        <NavbarLink 
          href="/rules" 
          className={linkClassName}
        >
          Regras
        </NavbarLink>
        <NavbarLink 
          href="/games" 
          className={linkClassName}
        >
          Jogos
        </NavbarLink>
        <NavbarLink 
          href="mailto:gamejam.at.ipmaia@gmail.com" 
          className={linkClassName}
        >
          Contacto
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MainNavbar;
