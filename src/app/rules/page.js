'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle } from 'lucide-react';

export default function Page() {
  const [pdfUrl, setPdfUrl] = useState('/WinterJam_Rulebook.pdf');
  const [pdfExists, setPdfExists] = useState(true);
  const [rulesContent, setRulesContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if PDF exists
    fetch('/WinterJam_Rulebook.pdf', { method: 'HEAD' })
      .then(response => {
        setPdfExists(response.ok);
      })
      .catch(() => {
        setPdfExists(false);
      });

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/50">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Livro de Regras WinterJam 2025
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Regras oficiais e diretrizes para participantes
          </p>
          {pdfExists && (
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Baixar PDF</span>
            </a>
          )}
        </div>

        {/* Dynamic Rules Content */}
        {!isLoading && rulesContent && (
          <div className="space-y-8 mb-12">
            {rulesContent.code_of_conduct && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Código de Conduta</h2>
                <div 
                  className="prose prose-invert max-w-none text-gray-200"
                  dangerouslySetInnerHTML={{ __html: rulesContent.code_of_conduct }}
                />
              </div>
            )}

            {rulesContent.guidelines && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Diretrizes</h2>
                <div 
                  className="prose prose-invert max-w-none text-gray-200"
                  dangerouslySetInnerHTML={{ __html: rulesContent.guidelines }}
                />
              </div>
            )}

            {rulesContent.prizes && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Prémios</h2>
                <div 
                  className="prose prose-invert max-w-none text-gray-200"
                  dangerouslySetInnerHTML={{ __html: rulesContent.prizes }}
                />
              </div>
            )}

            {rulesContent.evaluation && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Avaliação</h2>
                <div 
                  className="prose prose-invert max-w-none text-gray-200"
                  dangerouslySetInnerHTML={{ __html: rulesContent.evaluation }}
                />
              </div>
            )}

            {rulesContent.participation && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Participação</h2>
                <div 
                  className="prose prose-invert max-w-none text-gray-200"
                  dangerouslySetInnerHTML={{ __html: rulesContent.participation }}
                />
              </div>
            )}

            {rulesContent.schedule && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6">Horário</h2>
                <div 
                  className="prose prose-invert max-w-none text-gray-200"
                  dangerouslySetInnerHTML={{ __html: rulesContent.schedule }}
                />
              </div>
            )}
          </div>
        )}

        {/* PDF Viewer or Error Message */}
        {pdfExists ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <iframe
              src={`${pdfUrl}#view=FitH`}
              className="w-full h-[800px] rounded-lg"
              title="WinterJam Rulebook"
            />
          </div>
        ) : (
          <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">PDF não encontrado</h2>
            <p className="text-gray-300">
              O ficheiro de regras não está disponível no momento. Por favor, contacte a organização.
            </p>
          </div>
        )}



        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-3">
            Pronto para Participar?
          </h3>
          <p className="text-gray-300 mb-6">
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              ✉️ Contactar Organização
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}