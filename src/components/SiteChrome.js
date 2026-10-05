"use client";

import { usePathname } from 'next/navigation';
import Footer from './footer';
import MainNavbar from './navbar';

export default function SiteChrome({ children }) {
  const isMaintenancePage = usePathname() === '/maintenance';

  return (
    <>
      {!isMaintenancePage && <MainNavbar />}
      <main className={isMaintenancePage ? 'flex flex-1 flex-col' : 'flex flex-1 flex-col overflow-auto'}>
        {children}
      </main>
      {!isMaintenancePage && <Footer />}
    </>
  );
}