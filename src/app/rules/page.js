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
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Tema e Objeto Obrigatório</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Tema:</strong> Será revelado no início do evento</li>
                  <li><strong>Objeto Obrigatório:</strong> Deve estar presente no jogo de forma visível e significativa</li>
                  <li>A interpretação do tema e objeto é livre e criativa</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Requisitos Técnicos</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>O jogo deve ser criado durante as 45 horas do evento</li>
                  <li>Código e assets pré-existentes só podem ser usados se forem de domínio público ou licença permissiva</li>
                  <li>Engines e frameworks são permitidos (Unity, Unreal, Godot, etc.)</li>
                  <li>Assets pré-feitos (som, música, sprites) são permitidos desde que creditados</li>
                  <li>O jogo deve ser jogável e demonstrável no final do evento</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Entrega</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Build executável ou versão web funcional</li>
                  <li>Breve descrição do jogo e instruções de como jogar</li>
                  <li>Créditos da equipa</li>
                  <li>Link para repositório (se aplicável)</li>
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
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🥇</div>
                  <h3 className="text-xl font-bold text-yellow-300 mb-2">1º Lugar</h3>
                  <p className="text-sm">Prémio a anunciar</p>
                </div>
                <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 border border-gray-400/50 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🥈</div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">2º Lugar</h3>
                  <p className="text-sm">Prémio a anunciar</p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 border border-orange-600/50 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🥉</div>
                  <h3 className="text-xl font-bold text-orange-300 mb-2">3º Lugar</h3>
                  <p className="text-sm">Prémio a anunciar</p>
                </div>
              </div>
              <p className="text-center mt-4">
                Todos os participantes receberão certificado de participação!
              </p>
            </div>
          </section>

          {/* Section 4: Critérios de Avaliação */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">4.</span> Critérios de Avaliação
            </h2>
            <div className="space-y-4 text-gray-200">
              <p>Os jogos serão avaliados por um júri especializado com base nos seguintes critérios:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">🎨 Criatividade (25%)</h3>
                  <p className="text-sm">Originalidade do conceito, interpretação do tema e uso do objeto obrigatório</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">🎮 Gameplay (25%)</h3>
                  <p className="text-sm">Mecânicas divertidas, jogabilidade fluida e experiência do jogador</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-pink-300 mb-2">🎨 Arte e Som (20%)</h3>
                  <p className="text-sm">Qualidade visual, coerência estética e design de áudio</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-green-300 mb-2">🔧 Técnica (20%)</h3>
                  <p className="text-sm">Implementação técnica, otimização e ausência de bugs críticos</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 md:col-span-2">
                  <h3 className="font-semibold text-yellow-300 mb-2">🎯 Tema & Objeto (10%)</h3>
                  <p className="text-sm">Integração do tema e uso criativo do objeto obrigatório</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Regras de Participação */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">5.</span> Regras de Participação
            </h2>
            <div className="space-y-4 text-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Equipas</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Equipas de 2 a 5 pessoas</li>
                  <li>Participação individual também é permitida</li>
                  <li>Equipas podem ser formadas antes ou durante o evento</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Elegibilidade</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Aberto a estudantes e entusiastas de desenvolvimento de jogos</li>
                  <li>Todos os níveis de experiência são bem-vindos</li>
                  <li>Participantes devem ter 16+ anos</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Durante o Evento</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Participantes devem estar presentes nas instalações durante o evento</li>
                  <li>Refeições e coffee breaks serão fornecidos</li>
                  <li>Espaço para descanso disponível</li>
                  <li>Suporte técnico e mentoria disponíveis</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Horário */}
          <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-purple-400">6.</span> Horário do Evento
            </h2>
            <div className="space-y-6 text-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  📅 Dia 5 de Dezembro (Sexta-feira)
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-purple-300 min-w-[80px]">18:00</span>
                    <div>
                      <strong>Check-in e Boas-vindas</strong>
                      <p className="text-sm text-gray-400">Registo dos participantes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-purple-300 min-w-[80px]">19:00</span>
                    <div>
                      <strong>Abertura Oficial</strong>
                      <p className="text-sm text-gray-400">Revelação do tema e objeto obrigatório</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-purple-300 min-w-[80px]">19:30</span>
                    <div>
                      <strong>🚀 INÍCIO DA JAM!</strong>
                      <p className="text-sm text-gray-400">Começa a contagem das 45 horas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  📅 Dia 6 de Dezembro (Sábado)
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-purple-300 min-w-[80px]">00:00-24:00</span>
                    <div>
                      <strong>Desenvolvimento Contínuo</strong>
                      <p className="text-sm text-gray-400">Workshops, mentoria e muito coding!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  📅 Dia 7 de Dezembro (Domingo)
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-purple-300 min-w-[80px]">16:30</span>
                    <div>
                      <strong>⏰ FIM DA JAM!</strong>
                      <p className="text-sm text-gray-400">Submissão obrigatória dos projetos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-purple-300 min-w-[80px]">17:00</span>
                    <div>
                      <strong>Apresentações</strong>
                      <p className="text-sm text-gray-400">Cada equipa apresenta o seu jogo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-purple-300 min-w-[80px]">18:00</span>
                    <div>
                      <strong>🏆 Cerimónia de Encerramento</strong>
                      <p className="text-sm text-gray-400">Anúncio dos vencedores e entrega de prémios</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                <p className="text-blue-200">
                  <strong>ℹ️ Nota:</strong> O horário é provisório e pode sofrer pequenas alterações. 
                  Atualizações serão comunicadas aos participantes.
                </p>
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