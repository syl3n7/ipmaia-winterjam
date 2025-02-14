"use client";
import Link from "next/link";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";

const MainNavbar = () => {
 
  return (
    <Navbar fluid 
    className="bg-transparent bg-gradient-to-b from-[#d86f3a]/100 to-[#d86f3a]/0 sticky top-0 z-50">
      <NavbarBrand as={Link} href="/">
        <img src="../../favicon.ico" className="mr-3 h-6 sm:h-9" alt="IPMAIA WinterJam favicon" />
        <span className="text-gray-700 self-center whitespace-nowrap text-xl font-semibold dark:text-white">IPMAIA WinterJam</span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        {/* <NavbarLink href="#" active>Home</NavbarLink> */}
        {/* <NavbarLink as={Link} href="#">Quem Somos?</NavbarLink> */}
        <NavbarLink href="/rules">Regras</NavbarLink>
        <NavbarLink href="mailto:gamejam.at.ipmaia@gmail.com">Contacto</NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MainNavbar;
