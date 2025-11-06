'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle } from 'lucide-react';

export default function Page() {
  // Add styles to override background colors in HTML content
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rules-content [class*="bg-gray"] { background-color: #f9fafb !important; color: #1f2937 !important; }
      .rules-content [class*="bg-blue"] { background-color: #eff6ff !important; color: #1e3a8a !important; }
      .rules-content [class*="bg-green"] { background-color: #f0fdf4 !important; color: #166534 !important; }
      .rules-content [class*="bg-yellow"] { background-color: #fefce8 !important; color: #854d0e !important; }
      .rules-content [class*="bg-red"] { background-color: #fef2f2 !important; color: #991b1b !important; }
      .rules-content p { color: #374151 !important; }
      .rules-content h3 { color: inherit !important; }
      .rules-content ul { color: #374151 !important; }
      .rules-content li { color: #374151 !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [pdfUrl, setPdfUrl] = useState('/WinterJam_Rulebook.pdf');
  const [rulesContent, setRulesContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch rules content from API
    fetch('/api/rules/active')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.rules) {
          setRulesContent(data.rules);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Livro de Regras WinterJam 2025
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Regras oficiais e diretrizes para participantes
          </p>
          <a
            href={pdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Baixar PDF</span>
          </a>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-700 mt-4 text-lg">Carregando regras...</p>
          </div>
        )}

        {/* Dynamic Rules Content */}
        {!isLoading && rulesContent && (
          <div className="space-y-8 mb-12">
            {rulesContent.code_of_conduct && (
              <div className="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-xl">
                <h2 className="text-3xl font-bold text-purple-900 mb-6 border-b-2 border-purple-200 pb-3">Código de Conduta</h2>
                <div 
                  className="rules-content prose prose-lg max-w-none text-gray-800 [&_h3]:text-purple-800 [&_h3]:font-bold [&_h3]:text-xl [&_p]:text-gray-700 [&_ul]:text-gray-700 [&_li]:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: rulesContent.code_of_conduct }}
                />
              </div>
            )}

            {rulesContent.guidelines && (
              <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-xl">
                <h2 className="text-3xl font-bold text-blue-900 mb-6 border-b-2 border-blue-200 pb-3">Diretrizes</h2>
                <div 
                  className="rules-content prose prose-lg max-w-none text-gray-800 [&_h3]:text-blue-800 [&_h3]:font-bold [&_h3]:text-xl [&_p]:text-gray-700 [&_ul]:text-gray-700 [&_li]:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: rulesContent.guidelines }}
                />
              </div>
            )}

            {rulesContent.prizes && (
              <div className="bg-white rounded-2xl p-8 border-2 border-yellow-300 shadow-xl">
                <h2 className="text-3xl font-bold text-yellow-900 mb-6 border-b-2 border-yellow-300 pb-3">Prémios</h2>
                <div 
                  className="rules-content prose prose-lg max-w-none text-gray-800 [&_h3]:text-yellow-800 [&_h3]:font-bold [&_h3]:text-xl [&_p]:text-gray-700 [&_ul]:text-gray-700 [&_li]:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: rulesContent.prizes }}
                />
              </div>
            )}

            {rulesContent.evaluation && (
              <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-xl">
                <h2 className="text-3xl font-bold text-green-900 mb-6 border-b-2 border-green-200 pb-3">Avaliação</h2>
                <div 
                  className="rules-content prose prose-lg max-w-none text-gray-800 [&_h3]:text-green-800 [&_h3]:font-bold [&_h3]:text-xl [&_p]:text-gray-700 [&_ul]:text-gray-700 [&_li]:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: rulesContent.evaluation }}
                />
              </div>
            )}

            {rulesContent.participation && (
              <div className="bg-white rounded-2xl p-8 border-2 border-pink-200 shadow-xl">
                <h2 className="text-3xl font-bold text-pink-900 mb-6 border-b-2 border-pink-200 pb-3">Participação</h2>
                <div 
                  className="rules-content prose prose-lg max-w-none text-gray-800 [&_h3]:text-pink-800 [&_h3]:font-bold [&_h3]:text-xl [&_p]:text-gray-700 [&_ul]:text-gray-700 [&_li]:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: rulesContent.participation }}
                />
              </div>
            )}

            {rulesContent.schedule && (
              <div className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-xl">
                <h2 className="text-3xl font-bold text-indigo-900 mb-6 border-b-2 border-indigo-200 pb-3">Horário</h2>
                <div 
                  className="rules-content prose prose-lg max-w-none text-gray-800 [&_h3]:text-indigo-800 [&_h3]:font-bold [&_h3]:text-xl [&_p]:text-gray-700 [&_ul]:text-gray-700 [&_li]:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: rulesContent.schedule }}
                />
              </div>
            )}
          </div>
        )}

        {/* No Content Message */}
        {!isLoading && !rulesContent && (
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl text-center">
            <AlertCircle className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Regras em breve</h2>
            <p className="text-gray-700 mb-4">
              As regras detalhadas serão publicadas em breve. Por favor, baixe o PDF ou contacte a organização para mais informações.
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Pronto para Participar?
          </h3>
          <p className="text-gray-700 mb-6">
            Inscreve-te agora e faz parte da WinterJam 2025!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/enlist-now"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:scale-105"
            >
              ✍️ Inscrever-me Agora
            </a>
            <a
              href="mailto:gamejam.at.ipmaia@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 border-2 border-gray-300"
            >
              ✉️ Contactar Organização
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}