'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';

export default function Page() {
  // Hardcoded for now - can be made dynamic later if needed
  const pdfUrl = '/WinterJam_Rulebook.pdf';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
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
        </div>

        {/* Rules Content */}
        <div className="space-y-8">
          
          {/* Section 1: Código de Conduta */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">1.</span> Código de Conduta
            </h2>
            <div className="space-y-4 text-gray-200">
              <p>A WinterJam é um evento inclusivo e acolhedor para todos. Esperamos que todos os participantes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sejam respeitosos com todos os participantes, organizadores e voluntários</li>
                <li>Evitem qualquer forma de assédio, discriminação ou comportamento ofensivo</li>
                <li>Respeitem o espaço e os materiais fornecidos</li>
                <li>Mantenham um ambiente colaborativo e positivo</li>
                <li>Sigam as instruções dos organizadores e da equipa de apoio</li>
              </ul>
              <p className="font-semibold text-yellow-300">
                ⚠️ Violações do código de conduta podem resultar em desqualificação imediata do evento.
              </p>
            </div>
          </section>

          {/* Section 2: Diretrizes para Criação de Jogos */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">2.</span> Diretrizes para Criação de Jogos
            </h2>
            <div className="space-y-4 text-gray-200">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-3">Regras da Jam</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Duração: O jogo deve ser criado em 45 horas (de sexta-feira às 17h até domingo às 14h)</li>
                  <li>Participação em Equipa: Equipas (máximo de 4 pessoas)</li>
                </ul>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-3">Ferramentas e Ativos</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Pode utilizar qualquer ferramenta, motor, biblioteca ou código-base pré-existente</li>
                  <li>É permitido o uso de ativos de arte, música ou áudio de terceiros, sejam gratuitos ou pagos</li>
                  <li>Apenas utilize ativos sobre os quais detenha os direitos legais</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Prémios */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">3.</span> Prémios
            </h2>
            <div className="space-y-4 text-gray-200">
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🥇</div>
                  <h3 className="text-2xl font-bold text-yellow-300">1º Lugar</h3>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Gift card InstantGaming de 10€ (por cada elemento)</li>
                  <li>Certificado</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🎁</div>
                  <h3 className="text-2xl font-bold text-purple-300">Ofertas para todos os participantes</h3>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Fita ou porta-chaves do evento</li>
                  <li>Certificado</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Critérios de Avaliação */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">4.</span> Critérios de Avaliação
            </h2>
            <div className="space-y-3 text-gray-200">
              <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold">Relação/Cumprimento do tema</span>
                <span className="text-purple-300 font-bold">0/20 pontos</span>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold">Criatividade/USP</span>
                <span className="text-purple-300 font-bold">0/20 pontos</span>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold">Qualidade (diversão)</span>
                <span className="text-purple-300 font-bold">0/20 pontos</span>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold">Cumprimento/Quebra das regras</span>
                <span className="text-purple-300 font-bold">0/20 pontos</span>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold">Apresentação visual/estética</span>
                <span className="text-purple-300 font-bold">0/20 pontos</span>
              </div>
            </div>
          </section>

          {/* Section 5: Regras de Participação */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">5.</span> Regras de Participação
            </h2>
            <div className="space-y-4 text-gray-200">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-3">Submissão</h3>
                <p>Os projetos devem ser submetidos ao Itch.io após o término das 45 horas e o link partilhado no canal de discord devido.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-3">Entrada livre</h3>
                <p>Para alunos e alumni do IPMAIA/UMAIA. A game jam será no formato online/presencial e será dirigido através do servidor de discord da gamejam. Caso o grupo queira estar a desenvolver presencialmente, devem manifestar o interesse aos organizadores da game jam.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-3">Direitos</h3>
                <p>O jogo é propriedade sua. A organização da Game Jam não reivindica direitos sobre o seu jogo, mas pode utilizá-lo para fins de divulgação do evento.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Horário */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">6.</span> Horário do Evento
            </h2>
            <div className="space-y-4 text-gray-200">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  📅 Dia 14 - Início
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><span className="font-mono text-purple-300">17:00</span> - Início do Jam</li>
                  <li><span className="font-mono text-purple-300">17:15</span> - Divulgação do tema</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  📅 Dia 16 - Fim
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><span className="font-mono text-purple-300">14:00</span> - Fim do Jam</li>
                  <li>Avaliação a cargo do júri após as 14:00</li>
                </ul>
              </div>
            </div>
          </section>

        </div>

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