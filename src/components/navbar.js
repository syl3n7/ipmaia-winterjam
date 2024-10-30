"use client";
import Link from "next/link";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";

const MainNavbar = () => {
 
  return (
    <Navbar fluid 
    className="bg-[#d86f3a] sticky top-0 z-50 shadow-lg">
      <NavbarBrand as={Link} href="/">
        <img src="../../favicon.svg" className="mr-3 h-6 sm:h-9" alt="IPMAIA WinterJam" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink href="#" active>Home</NavbarLink>
        <NavbarLink as={Link} href="#">Quem Somos?</NavbarLink>
        <NavbarLink href="/rules">Regras</NavbarLink>
        <NavbarLink href="mailto:gamejam.at.ipmaia@gmail.com">Contact</NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default MainNavbar;
