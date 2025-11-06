'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';

export default function Page() {
  // Hardcoded for now - can be made dynamic later if needed
  const pdfUrl = '/WinterJam_Rulebook.pdf';

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-6 shadow-lg">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Baixar PDF</span>
          </a>
        </div>

        {/* Rules Content */}
        <div className="space-y-8">
          
          {/* Section 1: Elegibilidade e Inscrição */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">1.</span> Elegibilidade e Inscrição
            </h2>
            <div className="space-y-4 text-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Quem Pode Participar?</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Estudantes do IPMAIA ou de outras instituições</li>
                  <li>Entusiastas de desenvolvimento de jogos</li>
                  <li>Idade mínima: 16 anos</li>
                  <li>Todos os níveis de experiência são bem-vindos</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Formação de Equipas</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Equipas de 1 a 4 pessoas</li>
                  <li>Participação individual é permitida</li>
                  <li>Equipas podem ser formadas antes ou durante o evento</li>
                  <li>Recomendamos equipas multidisciplinares (programação, arte, áudio, design)</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="font-semibold text-blue-800">
                  💡 Dica: Se não tiveres equipa, haverá tempo para conhecer outros participantes e formar equipas no início do evento!
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Regras de Desenvolvimento */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">2.</span> Regras de Desenvolvimento
            </h2>
            <div className="space-y-4 text-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Tema e Objeto Obrigatório</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Tema:</strong> Será revelado 15 minutos após o início oficial do evento</li>
                  <li><strong>Objeto Obrigatório:</strong> Um elemento visual ou mecânico que deve estar presente no jogo</li>
                  <li>A interpretação é livre - seja criativo!</li>
                  <li>Ambos os elementos são obrigatórios para concorrer aos prémios</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">O Que É Permitido?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Permitido</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Engines e frameworks (Unity, Godot, Unreal, etc.)</li>
                      <li>Bibliotecas e plugins públicos</li>
                      <li>Assets gratuitos ou pagos (com créditos)</li>
                      <li>Ferramentas de IA para arte/código (com declaração)</li>
                      <li>Código de projetos anteriores (bibliotecas próprias)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">❌ Não Permitido</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Começar o desenvolvimento antes do evento</li>
                      <li>Reutilizar jogos existentes</li>
                      <li>Submeter trabalho feito por terceiros</li>
                      <li>Plagiar conceitos ou código</li>
                      <li>Continuar desenvolvimento após o prazo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Requisitos de Submissão</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Build executável (Windows/Mac/Linux) ou versão web jogável</li>
                  <li>Título do jogo e descrição breve (máx. 200 palavras)</li>
                  <li>Instruções de como jogar</li>
                  <li>Créditos completos da equipa e assets utilizados</li>
                  <li>Screenshots ou trailer (opcional mas recomendado)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="font-semibold text-yellow-800">
                  ⚠️ Importante: Submissões após o prazo não serão aceites. Guardem tempo para upload e testes!
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Prémios */}
          <section className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">3.</span> Prémios
            </h2>
            <div className="space-y-4 text-gray-800">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🥇</div>
                  <h3 className="text-xl font-bold text-yellow-700 mb-2">1º Lugar</h3>
                  <p className="text-sm text-gray-700">Prémio a anunciar</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-400 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🥈</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">2º Lugar</h3>
                  <p className="text-sm text-gray-700">Prémio a anunciar</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-2">🥉</div>
                  <h3 className="text-xl font-bold text-orange-700 mb-2">3º Lugar</h3>
                  <p className="text-sm text-gray-700">Prémio a anunciar</p>
                </div>
              </div>
              <p className="text-center mt-4 font-medium">
                Todos os participantes receberão certificado de participação!
              </p>
            </div>
          </section>

          {/* Section 4: Critérios de Avaliação */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">4.</span> Critérios de Avaliação
            </h2>
            <div className="space-y-4 text-gray-800">
              <p>Os jogos serão avaliados por um júri especializado com base nos seguintes critérios:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎨 Criatividade (25%)</h3>
                  <p className="text-sm text-gray-700">Originalidade do conceito, interpretação do tema e uso do objeto obrigatório</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎮 Gameplay (25%)</h3>
                  <p className="text-sm text-gray-700">Mecânicas divertidas, jogabilidade fluida e experiência do jogador</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎨 Arte e Som (20%)</h3>
                  <p className="text-sm text-gray-700">Qualidade visual, coerência estética e design de áudio</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🔧 Técnica (20%)</h3>
                  <p className="text-sm text-gray-700">Implementação técnica, otimização e ausência de bugs críticos</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Tema & Objeto (10%)</h3>
                  <p className="text-sm text-gray-700">Integração do tema e uso criativo do objeto obrigatório</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Código de Conduta */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">5.</span> Código de Conduta
            </h2>
            <div className="space-y-4 text-gray-800">
              <p>A WinterJam é um evento inclusivo e acolhedor para todos. Esperamos que todos os participantes:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✅ Comportamentos Esperados</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Respeito por todos os participantes</li>
                    <li>Colaboração e espírito de equipa</li>
                    <li>Comunicação construtiva</li>
                    <li>Cuidado com o espaço e materiais</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">❌ Comportamentos Proibidos</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Assédio ou discriminação</li>
                    <li>Linguagem ofensiva</li>
                    <li>Comportamento disruptivo</li>
                    <li>Desrespeito às regras</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-semibold text-red-800">
                  ⚠️ Violações do código de conduta podem resultar em desqualificação imediata do evento sem reembolso ou prémios.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: O Que Está Incluído */}
          <section className="bg-purple-50 rounded-2xl p-8 border-2 border-purple-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">6.</span> O Que Está Incluído
            </h2>
            <div className="space-y-4 text-gray-800">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-3xl mb-2">🍕</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Alimentação</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Pequeno-almoço</li>
                    <li>• Almoço e jantar</li>
                    <li>• Snacks e bebidas</li>
                    <li>• Coffee breaks</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-3xl mb-2">💻</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Infraestrutura</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Wi-Fi de alta velocidade</li>
                    <li>• Tomadas elétricas</li>
                    <li>• Espaço de trabalho</li>
                    <li>• Área de descanso</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-3xl mb-2">👨‍🏫</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Apoio</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Mentores especializados</li>
                    <li>• Workshops</li>
                    <li>• Suporte técnico</li>
                    <li>• Organização sempre presente</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-100 border-l-4 border-purple-500 p-4 mt-4">
                <p className="font-semibold text-purple-800">
                  📝 Nota: Traz o teu próprio equipamento (laptop, auriculares, rato, etc.)
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Horário */}
          <section className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">7.</span> Horário do Evento
            </h2>
            <div className="space-y-6 text-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📅 Dia 5 de Dezembro (Sexta-feira)
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-gray-700 font-semibold min-w-[80px]">18:00</span>
                    <div>
                      <strong>Check-in e Boas-vindas</strong>
                      <p className="text-sm text-gray-600">Registo dos participantes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-gray-700 font-semibold min-w-[80px]">19:00</span>
                    <div>
                      <strong>Abertura Oficial</strong>
                      <p className="text-sm text-gray-600">Revelação do tema e objeto obrigatório</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-green-100 border-l-4 border-green-500 pl-3 py-2 -ml-4">
                    <span className="font-mono text-green-700 font-bold min-w-[80px]">19:30</span>
                    <div>
                      <strong className="text-green-700">🚀 INÍCIO DA JAM!</strong>
                      <p className="text-sm text-green-600">Começa a contagem das 45 horas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📅 Dia 6 de Dezembro (Sábado)
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-gray-700 font-semibold min-w-[80px]">00:00-24:00</span>
                    <div>
                      <strong>Desenvolvimento Contínuo</strong>
                      <p className="text-sm text-gray-600">Workshops, mentoria e muito coding!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📅 Dia 7 de Dezembro (Domingo)
                </h3>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-3 bg-red-100 border-l-4 border-red-500 pl-3 py-2 -ml-4">
                    <span className="font-mono text-red-700 font-bold min-w-[80px]">16:30</span>
                    <div>
                      <strong className="text-red-700">⏰ FIM DA JAM!</strong>
                      <p className="text-sm text-red-600">Submissão obrigatória dos projetos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-gray-700 font-semibold min-w-[80px]">17:00</span>
                    <div>
                      <strong>Apresentações</strong>
                      <p className="text-sm text-gray-600">Cada equipa apresenta o seu jogo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-gray-700 font-semibold min-w-[80px]">18:00</span>
                    <div>
                      <strong>🏆 Cerimónia de Encerramento</strong>
                      <p className="text-sm text-gray-600">Anúncio dos vencedores e entrega de prémios</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mt-6">
                <p className="text-blue-800">
                  <strong>ℹ️ Nota:</strong> O horário é provisório e pode sofrer pequenas alterações. 
                  Atualizações serão comunicadas aos participantes.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gray-100 border-2 border-gray-300 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Pronto para Participar?
          </h3>
          <p className="text-gray-700 mb-6">
            Inscreve-te agora e faz parte da WinterJam 2025!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/enlist-now"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:scale-105"
            >
              ✍️ Inscrever-me Agora
            </a>
            <a
              href="mailto:gamejam.at.ipmaia@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-gray-300"
            >
              ✉️ Contactar Organização
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}