'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import Background from "../../components/Background";
import { useBackground } from "../../contexts/BackgroundContext";

export default function Page() {
  const [pdfUrl, setPdfUrl] = useState('/WinterJam_Rulebook.pdf');
  const [currentGameJam, setCurrentGameJam] = useState(null);
  const { bannerImage } = useBackground();

  useEffect(() => {
    // Fetch PDF URL and current game jam from API
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        
        // Fetch PDF URL
        const pdfResponse = await fetch(`${apiUrl}/rules/pdf-url`);
        const pdfData = await pdfResponse.json();
        if (pdfData.pdfUrl) {
          setPdfUrl(pdfData.pdfUrl);
        }

        // Fetch current game jam data
        const { gameJamApi } = await import('../../utils/api');
        const gameJam = await gameJamApi.getCurrent();
        setCurrentGameJam(gameJam);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Keep default values on error
      }
    };
    
    fetchData();
  }, []);

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
      
      <div className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Ice effect container - WinterJam themed */}
          <div className="bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-blue-100/80 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-cyan-200/60 p-6 md:p-8"
               style={{
                 boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.1)'
               }}>
            {/* Compact Header */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 pb-6 border-b-2 border-gray-200">
                {/* Title row with icon */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gray-900 rounded-xl shadow-md flex-shrink-0">
                    <FileText className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">
                      Livro de Regras WinterJam 2025
                    </h1>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      Regras oficiais e diretrizes para participantes
                    </p>
                  </div>
                </div>
            
            {/* Download button - full width on mobile */}
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full md:w-auto md:self-end"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </a>
          </div>
        </div>

        {/* Rules Content */}
        <div className="space-y-8">
          
          {/* Section 1: Code of Conduct */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">1.</span> Código de Conduta
            </h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-gray-700 mb-4">
                Todos os participantes devem aderir a este código para garantir um ambiente inclusivo, seguro e respeitoso.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">✅ Regras de Conduta</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Trate todos com respeito, independentemente de origem, género, orientação sexual, etnia, religião ou capacidade</li>
                  <li>Assédio, intimidação, perseguição ou insultos de qualquer forma não são tolerados</li>
                  <li>Competição saudável é incentivada, mas fomentar um espírito de comunidade colaborativa é igualmente importante</li>
                  <li>Reporte imediatamente aos organizadores qualquer situação desconfortável ou insegura</li>
                  <li>Respeite outros participantes e organizadores do evento</li>
                  <li>Mantenha conduta educada durante todo o evento</li>
                  <li>Não interfira negativamente com a experiência de outros participantes</li>
                  <li>Não danifique materiais usados durante o evento</li>
                  <li>Siga o cronograma e horário do evento</li>
                  <li>Mantenha as instalações limpas e organizadas</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-semibold text-red-800">
                  ⚠️ Violações do código de conduta podem resultar em desqualificação imediata do evento sem reembolso ou prémios.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Inclusion Policy */}
          <section className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">2.</span> Política de Inclusão
            </h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-gray-700 mb-4">
                A Game Jam promove inclusão e acessibilidade para todos os participantes.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>A organização está comprometida em criar um ambiente acessível, incluindo para participantes com necessidades especiais</li>
                <li>Incentivamos a participação de indivíduos de todos os contextos, promovendo uma diversidade de ideias e habilidades</li>
                <li>Jogos com conteúdo ofensivo, discriminatório ou inapropriado serão desqualificados</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Jam Rules & Guidelines */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">3.</span> Regras da Jam e Diretrizes
            </h2>
            <div className="space-y-6 text-gray-800">
              
              {/* Timing & Teams */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">⏱️ Tempo e Equipas</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                  <li><strong>Duração:</strong> O jogo deve ser criado dentro da janela de 45 horas</li>
                  <li><strong>Tamanho da Equipa:</strong> 2 a 4 pessoas por equipa</li>
                </ul>
              </div>

              {/* Tools & Assets */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🛠️ Ferramentas e Assets</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Permitido</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Pode usar quaisquer ferramentas, engines, bibliotecas ou bases de código pré-existentes</li>
                    <li>Arte, música ou assets de áudio de terceiros (pagos ou gratuitos) são permitidos</li>
                    <li>A quantidade de assets pagos usados influenciará a pontuação final</li>
                    <li>Use apenas assets para os quais tem direitos legais (domínio público, licenciados ou criados por si)</li>
                  </ul>
                </div>
              </div>

              {/* Competition Rules */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🏆 Regras da Competição</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>O jogo deve ser criado do zero durante as 45 horas</li>
                    <li>O código-fonte ou ficheiros do projeto devem ser incluídos com a submissão do jogo</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Submission & Rights */}
          <section className="bg-purple-50 rounded-2xl p-8 border-2 border-purple-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">4.</span> Submissão e Direitos
            </h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-gray-700 mb-4">
                Como submeter o seu projeto e informações sobre propriedade.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                <li>Os projetos devem ser submetidos no Itch.io após as 45 horas concluírem, e o link partilhado no Discord</li>
                <li>Correção de bugs ou adição de novas funcionalidades após a submissão NÃO são permitidas</li>
                <li>O jogo é propriedade do criador. A organização pode usá-lo para promoção do evento</li>
              </ul>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-semibold text-red-800">
                  ⚠️ Importante: Submissões após o prazo não serão aceites. Guardem tempo para upload e testes!
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Judging Criteria */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">5.</span> Critérios de Avaliação
            </h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-gray-700 mb-4">
                Os projetos serão avaliados com os seguintes critérios (0-20 pontos cada):
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Relação/Aderência ao Tema</h3>
                  <p className="text-sm text-gray-700">Como o jogo interpreta e incorpora o tema revelado</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">💡 Criatividade/USP</h3>
                  <p className="text-sm text-gray-700">Proposta de venda única e originalidade do conceito</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎮 Qualidade (Fator Diversão)</h3>
                  <p className="text-sm text-gray-700">Quão divertido e envolvente é o jogo</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 Aderência/Quebra de Regras</h3>
                  <p className="text-sm text-gray-700">Cumprimento das regras estabelecidas</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2">🎨 Apresentação Visual/Estética e Quantidade de Assets Usados</h3>
                  <p className="text-sm text-gray-700">Qualidade visual e quantidade de assets utilizados</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Schedule */}
          <section className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">6.</span> Horário do Evento
            </h2>
            <div className="space-y-6 text-gray-800">
              {currentGameJam ? (
                <>
                  <p className="text-gray-700 mb-4">
                    Cronograma do evento ({new Date(currentGameJam.start_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'numeric' })} - {new Date(currentGameJam.end_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'numeric' })})
                  </p>
                  
                  {/* Day 1 - Start */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      📅 Dia 1 ({new Date(currentGameJam.start_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'numeric' })})
                    </h3>
                    <div className="space-y-2 ml-4">
                      {/* Reception */}
                      {currentGameJam.reception_datetime && (
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-gray-700 font-semibold min-w-[80px]">
                            {new Date(currentGameJam.reception_datetime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <strong>Receção</strong>
                            <p className="text-sm text-gray-600">Check-in dos participantes</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Theme Announcement */}
                      {currentGameJam.theme_announcement_datetime ? (
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-gray-700 font-semibold min-w-[80px]">
                            {new Date(currentGameJam.theme_announcement_datetime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <strong>Anúncio do Tema</strong>
                            <p className="text-sm text-gray-600">Revelação do tema da jam</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-gray-700 font-semibold min-w-[80px]">
                            {new Date(new Date(currentGameJam.start_date).getTime() + 15*60000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <strong>Anúncio do Tema</strong>
                            <p className="text-sm text-gray-600">Revelação do tema da jam</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Jam Start */}
                      <div className="flex items-start gap-3 bg-green-100 border-l-4 border-green-500 pl-3 py-2 -ml-4">
                        <span className="font-mono text-green-700 font-bold min-w-[80px]">
                          {new Date(currentGameJam.start_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div>
                          <strong className="text-green-700">🚀 INÍCIO DA JAM!</strong>
                          <p className="text-sm text-green-600">Começa a contagem das 45 horas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Day 2 - Middle day(s) if applicable */}
                  {(() => {
                    const start = new Date(currentGameJam.start_date);
                    const end = new Date(currentGameJam.end_date);
                    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff >= 2) {
                      const middleDay = new Date(start.getTime() + (1000 * 60 * 60 * 24));
                      return (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            📅 Dia 2 ({middleDay.toLocaleDateString('pt-PT', { day: 'numeric', month: 'numeric' })})
                          </h3>
                          <div className="space-y-2 ml-4">
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-gray-700 font-semibold min-w-[80px]">Todo o dia</span>
                              <div>
                                <strong>Desenvolvimento Contínuo</strong>
                                <p className="text-sm text-gray-600">Dia completo de criação</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Day 3 - End */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      📅 Dia {(() => {
                        const start = new Date(currentGameJam.start_date);
                        const end = new Date(currentGameJam.end_date);
                        const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
                        return daysDiff >= 2 ? '3' : '2';
                      })()} ({new Date(currentGameJam.end_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'numeric' })})
                    </h3>
                    <div className="space-y-2 ml-4">
                      {/* Jam End */}
                      <div className="flex items-start gap-3 bg-red-100 border-l-4 border-red-500 pl-3 py-2 -ml-4">
                        <span className="font-mono text-red-700 font-bold min-w-[80px]">
                          {new Date(currentGameJam.end_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div>
                          <strong className="text-red-700">⏰ FIM DA JAM!</strong>
                          <p className="text-sm text-red-600">Submissão obrigatória dos projetos</p>
                        </div>
                      </div>
                      
                      {/* Project Evaluation */}
                      {currentGameJam.evaluation_datetime ? (
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-gray-700 font-semibold min-w-[80px]">
                            {new Date(currentGameJam.evaluation_datetime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <strong>📊 Avaliação dos Projetos</strong>
                            <p className="text-sm text-gray-600">Júri avalia os jogos submetidos</p>
                          </div>
                        </div>
                      ) : currentGameJam.awards_ceremony_datetime && (
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-gray-700 font-semibold min-w-[80px]">
                            {new Date(new Date(currentGameJam.awards_ceremony_datetime).getTime() - 30*60000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <strong>📊 Avaliação dos Projetos</strong>
                            <p className="text-sm text-gray-600">Júri avalia os jogos submetidos</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Awards Ceremony */}
                      {currentGameJam.awards_ceremony_datetime ? (
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-gray-700 font-semibold min-w-[80px]">
                            {new Date(currentGameJam.awards_ceremony_datetime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <strong>🏆 Cerimónia de Entrega de Prémios</strong>
                            <p className="text-sm text-gray-600">Anúncio dos vencedores e entrega de prémios</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-gray-700 font-semibold min-w-[80px]">
                            {new Date(new Date(currentGameJam.end_date).getTime() + 90*60000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <strong>🏆 Cerimónia de Entrega de Prémios</strong>
                            <p className="text-sm text-gray-600">Anúncio dos vencedores e entrega de prémios</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-center">A carregar horário...</p>
              )}

              <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mt-6">
                <p className="text-blue-800">
                  <strong>ℹ️ Nota:</strong> O horário pode sofrer pequenas alterações. 
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
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-gray-300"
            >
              ✉️ Contactar Organização
            </a>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}