'use client';

import React, { useState } from 'react';
import { Mail, Instagram, Check, MessageCircle } from 'lucide-react';
import Background from "../../components/Background";
import { useBackground } from "../../contexts/BackgroundContext";

export default function ContactPage() {
  const { bannerImage } = useBackground();
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmailToClipboard = (e) => {
    e.preventDefault();
    const email = 'gamejam.at.ipmaia@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen">
      <Background
        imageUrl={bannerImage}
        fallbackContent={
          <div className="text-gray-500 text-center">
            <p>Não foi possível carregar a imagem de fundo</p>
          </div>
        }
      />
      
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-blue-100/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8"
               style={{
                 boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
               }}>
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-4">
              Contacta-nos
            </h1>
            <p className="text-xl text-gray-800 font-medium">
              Encontra-nos nas redes sociais ou envia-nos um email
            </p>
          </div>

          {/* Social Media Bubbles */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Email Bubble */}
            <div
              onClick={copyEmailToClipboard}
              className="group bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)] cursor-pointer"
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  {emailCopied ? (
                    <Check className="w-12 h-12 text-white" />
                  ) : (
                    <Mail className="w-12 h-12 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Email</h3>
                <p className="text-sm text-gray-700 break-all">
                  gamejam.at.ipmaia@gmail.com
                </p>
                <span className="text-orange-600 font-semibold group-hover:underline">
                  {emailCopied ? '✓ Copiado!' : 'Clica para copiar'}
                </span>
              </div>
            </div>

            {/* Instagram Bubble */}
            <a
              href="https://instagram.com/winterjam_ipmaia"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)] relative overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Instagram className="w-12 h-12 text-white" />
                  </div>
                  {/* QR Code overlay on hover */}
                  <div className="absolute inset-0 bg-white p-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <img
                      src="/images/instagram-custom.png"
                      alt="Instagram QR Code"
                      className="w-full h-full object-contain rounded-2xl group-hover:scale-150 transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Instagram</h3>
                <p className="text-sm text-gray-700 break-all">
                  @winterjam_ipmaia
                </p>
                <span className="text-pink-600 font-semibold group-hover:underline">
                  Seguir →
                </span>
              </div>
            </a>

            {/* TikTok Bubble */}
            <a
              href="https://tiktok.com/@wintergamejam"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)] relative overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <img src="/images/tiktok-icon.svg" alt="TikTok" className="w-12 h-12" />
                  </div>
                  {/* QR Code overlay on hover */}
                  <div className="absolute inset-0 p-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <img
                      src="/images/tiktok-custom.png"
                      alt="TikTok QR Code"
                      className="w-full h-full object-contain rounded-2xl group-hover:scale-150 transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">TikTok</h3>
                <p className="text-sm text-gray-700 break-all">
                  @wintergamejam
                </p>
                <span className="text-black font-semibold group-hover:underline">
                  Seguir →
                </span>
              </div>
            </a>

            {/* Discord Bubble */}
            <a
              href="http://discord.gg/X97GAg7F6E"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)] relative overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  {/* QR Code overlay on hover */}
                  <div className="absolute inset-0 bg-white p-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <img
                      src="/images/discord-custom.png"
                      alt="Discord QR Code"
                      className="w-full h-full object-contain rounded-2xl group-hover:scale-150 transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Discord</h3>
                <p className="text-sm text-gray-700 break-all">
                  @staff para questões
                </p>
                <span className="text-indigo-600 font-semibold group-hover:underline">
                  Entrar →
                </span>
              </div>
            </a>
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 text-center"
               style={{
                 boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
               }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              💬 Tens dúvidas?
            </h3>
            <p className="text-gray-700 text-lg">
              Envia-nos um email e responderemos em até 48 horas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
