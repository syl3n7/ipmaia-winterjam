import localFont from "next/font/local";
import "./globals.css";
import Image from "next/image";
import  Footer  from "@/components/footer";
import MainNavbar from "@/components/navbar";  
import React from "react";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "WinterJam - Hosted by IPMAIA",
  description:
    "Gamejam hosted by IPMAIA from game dev students, for game dev students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css"></link>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "288377c903af4e4187b8b239e29790e9"}'
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainNavbar/>
        {children}
        <Footer />
        <script src="../path/to/flowbite/dist/flowbite.min.js"></script>
      </body>
    </html>
  );
}
