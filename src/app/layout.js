import localFont from "next/font/local";
import "./globals.css";
import React from "react";
import Footer from "../components/footer";
import MainNavbar from "../components/navbar";

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
  description: "Gamejam hosted by IPMAIA from game dev students, for game dev students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "288377c903af4e4187b8b239e29790e9"}'
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}>
        <MainNavbar />
        <main className="flex-1 flex flex-col overflow-auto">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}