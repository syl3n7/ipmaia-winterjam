'use client';

import React from 'react';
import { Mail, Instagram, Music } from 'lucide-react';
import Background from "../../components/Background";
import { useBackground } from "../../contexts/BackgroundContext";

export default function ContactPage() {
  const { bannerImage } = useBackground();

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
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Email Bubble */}
            <a
              href="mailto:gamejam.at.ipmaia@gmail.com"
              className="group bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)]"
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Mail className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Email</h3>
                <p className="text-sm text-gray-700 break-all">
                  gamejam.at.ipmaia@gmail.com
                </p>
                <span className="text-orange-600 font-semibold group-hover:underline">
                  Enviar Email →
                </span>
              </div>
            </a>

            {/* Instagram Bubble */}
            <div
              className="bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 relative overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-2xl shadow-lg">
                  <Instagram className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Instagram</h3>
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-4 py-2 mt-2">
                  <span className="text-yellow-800 font-semibold text-sm">
                    🚧 Em Breve
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Perfil em construção
                </p>
              </div>
            </div>

            {/* TikTok Bubble */}
            <div
              className="bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-8 relative overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-gradient-to-r from-black to-gray-800 p-6 rounded-2xl shadow-lg">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">TikTok</h3>
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-4 py-2 mt-2">
                  <span className="text-yellow-800 font-semibold text-sm">
                    🚧 Em Breve
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Perfil em construção
                </p>
              </div>
            </div>
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
