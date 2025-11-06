'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { rulesApi } from '@/utils/api';

export default function Page() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRules() {
      try {
        const data = await rulesApi.getActive();
        setRules(data);
      } catch (error) {
        console.error('Error fetching rules:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRules();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">A carregar regras...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !rules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Erro ao Carregar Regras
            </h2>
            <p className="text-red-200">
              {error || 'Não foi possível carregar o livro de regras.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/50">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {rules.title}
          </h1>
          {rules.description && (
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {rules.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
              Versão {rules.version}
            </span>
          </div>
        </div>

        {/* PDF Viewer Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Livro de Regras
              </h2>
            </div>
            <a
              href={rules.pdf_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Baixar PDF</span>
            </a>
          </div>

          {/* PDF Embed */}
          <div className="relative w-full bg-gray-900 rounded-2xl overflow-hidden shadow-inner" style={{ height: '80vh' }}>
            <iframe
              src={rules.pdf_url}
              className="w-full h-full"
              title="WinterJam Rulebook"
              style={{ border: 'none' }}
            />
          </div>

          {/* Alternative View Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-3">
              Não consegue ver o PDF? 
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={rules.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline text-sm"
              >
                Abrir em nova aba
              </a>
              <span className="text-gray-600">|</span>
              <a
                href={rules.pdf_url}
                download
                className="text-purple-400 hover:text-purple-300 underline text-sm"
              >
                Download direto
              </a>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-purple-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              📋 Regras Oficiais
            </h3>
            <p className="text-white text-lg font-bold">
              Todas as equipas devem seguir
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-pink-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              🏆 Critérios de Avaliação
            </h3>
            <p className="text-white text-lg font-bold">
              Detalhados no documento
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              ⚖️ Código de Conduta
            </h3>
            <p className="text-white text-lg font-bold">
              Respeito e fair play
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-3">
            Tem Dúvidas sobre as Regras?
          </h3>
          <p className="text-gray-300 mb-6">
            Se tiver alguma questão sobre as regras, não hesite em contactar a organização.
          </p>
          <a
            href="mailto:winterjam@ipmaia.pt"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:scale-105"
          >
            ✉️ Contactar Organização
          </a>
        </div>
      </div>
    </div>
  );
}