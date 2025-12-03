'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import Background from "../../components/Background";
import { useBackground } from "../../contexts/BackgroundContext";
import { useFrontPageSettings } from "../../hooks/useFrontPageSettings";
import { useLatestArchive } from "../../hooks/useLatestArchive";

export default function Page() {
  const [pdfUrl, setPdfUrl] = useState('/WinterJam_Rulebook.pdf');
  const [currentGameJam, setCurrentGameJam] = useState(null);
  const { frontPageSettings } = useFrontPageSettings();
  const latestArchiveUrl = useLatestArchive();
  const [hasEventEnded, setHasEventEnded] = useState(false);
  const [hasEventStarted, setHasEventStarted] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [noActiveJam, setNoActiveJam] = useState(false);
  const { bannerImage } = useBackground();

  // Track if user has scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - scrollPosition;
      
      console.log('📜 Scroll detected:', {
        scrollPosition,
        documentHeight,
        distanceFromBottom
      });
      
      // Check if user has scrolled to within 200px of the bottom
      if (distanceFromBottom <= 200) {
        // Mark rules as read with current timestamp
        const timestamp = new Date().toISOString();
        localStorage.setItem('rulesReadComplete', timestamp);
        console.log('✅ Rules marked as read at:', timestamp);
        console.log('📦 localStorage check:', localStorage.getItem('rulesReadComplete'));
      }
    };

    // Check on initial load in case user is at bottom
    setTimeout(handleScroll, 1000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

        // Check if event has ended
        if (gameJam) {
          const now = new Date();
          const startDate = new Date(gameJam.start_date);
          const endDate = new Date(gameJam.end_date);
          const regStart = gameJam.registration_start_date ? new Date(gameJam.registration_start_date) : null;
          const regEnd = gameJam.registration_end_date ? new Date(gameJam.registration_end_date) : null;
          
          setHasEventStarted(now >= startDate);
          setHasEventEnded(now > endDate);
          setRegistrationOpen(regStart && now >= regStart);
          setRegistrationClosed(regEnd && now > regEnd);
          setNoActiveJam(false);
        } else {
          // No active game jam found
          setNoActiveJam(true);
        }
      } catch (error) {
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
                Todos os participantes da Game Jam devem aderir ao seguinte código de conduta para garantir um ambiente inclusivo, seguro e respeitoso:
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">✅ Regras de Conduta</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li><strong>Respeito Mútuo:</strong> Trate todos com respeito, independentemente de origem, género, orientação sexual, etnia, religião ou habilidade. Qualquer forma de assédio ou discriminação não será tolerada.</li>
                  <li><strong>Assédio:</strong> Não serão aceites comportamentos intimidatórios, perseguição, insultos ou qualquer tipo de assédio, seja pessoalmente, online ou através de outros meios.</li>
                  <li><strong>Colaboração:</strong> A Game Jam promove a colaboração entre os participantes. A competição saudável é incentivada, mas é igualmente importante fomentar o espírito de comunidade.</li>
                  <li><strong>Segurança:</strong> Em caso de qualquer situação desconfortável ou insegura, comunique-se imediatamente com a organização.</li>
                  <li><strong>Respeito aos Outros:</strong> Respeite os outros participantes e organizadores do evento.</li>
                  <li><strong>Conduta Educada:</strong> Mantenha uma conduta educada durante o evento.</li>
                  <li><strong>Experiência dos Outros:</strong> Não interfira negativamente na experiência de outros participantes.</li>
                  <li><strong>Preservação de Materiais:</strong> Não danifique os materiais utilizados no evento.</li>
                  <li><strong>Horário e Cronograma:</strong> Siga o horário e cronograma do evento.</li>
                  <li><strong>Limpeza e Organização:</strong> Mantenha os locais limpos e organizados.</li>
                  <li><strong>Itens proibidos:</strong> É estritamente proibido trazer, consumir ou expor durante o evento qualquer tipo de bebida alcoólica ou substâncias ilegais.</li>
                  <li><strong>Equipamento/Utensílios:</strong> A responsabilidade pelo equipamento utilizado (ex: monitor, rato, computador, prato, talheres), sejam estes da organização ou propriedade do participante, são da inteira responsabilidade do próprio utilizador. A organização não se responsabiliza por quaisquer danos ou perdas de equipamento.</li>
                </ol>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-semibold text-red-800">
                  ⚠️ Violações do código de conduta podem resultar em desqualificação imediata do evento sem reembolso ou prémios.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Regulamento Interno */}
          <section className="bg-yellow-50 rounded-2xl p-8 border-2 border-yellow-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">2.</span> Regulamento Interno
            </h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-gray-700 mb-4">
                São deveres do estudante:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                <li>Participar com empenho para atingir o aproveitamento mais elevado, sem afetar adversamente o rendimento dos colegas, a nível individual ou coletivo.</li>
                <li>Conservar todo o património em que tem lugar as atividades ou iniciativas da responsabilidade da Maiêutica/IES, bem como o património que lhes serve de apoio.</li>
                <li>Colaborar em iniciativas de natureza científica, cultural e desportiva, ou outras, que possam contribuir simultaneamente para a sua realização pessoal e prestígio da Maiêutica/IES.</li>
                <li>Respeitar e fazer-se respeitar no relacionamento com toda a comunidade académica.</li>
                <li>Proceder ao imediato pagamento de todo o prejuízo causado na instituição e nunca usar, colaborar no uso, ou incentivar a utilização do nome da Maiêutica/IES em qualquer atividade económica, sem que, para tanto, esteja expressamente autorizado pelo Conselho de Administração da Maiêutica - Cooperativa de Ensino Superior, C.R.L.</li>
                <li>Proteger a sua saúde, assim como a da Comunidade Escolar, não se permitindo fazer uso de qualquer substância proibida por lei, ou o consumo de qualquer tipo de bebidas alcoólicas. Os mesmos serão confiscados se usados ou expostos durante o evento.</li>
                <li>Abster-se de, pessoalmente ou em grupo, praticar atividades que sejam, por força da lei, de estatuto ou de regulamento, da exclusiva competência da Maiêutica, das IES ou das Associações de Estudantes.</li>
                <li>Abster-se de captar, de forma não autorizada, imagens e som durante os momentos letivos e avaliativos.</li>
                <li>Cumprir as normas e procedimentos estabelecidos, não se fazendo acompanhar, em qualquer atividade de avaliação, por meios de armazenamento de informação (escrita, gravada ou análoga), salvo se tais meios tiverem sido expressamente autorizados pelo professor, nem, durante as avaliações, comunicar ou tentar comunicar com outros colegas em avaliação ou terceiros.</li>
                <li>Respeitar os direitos de autor, não plagiando ou copiando quaisquer obras na realização de trabalhos, obrigando-se sempre a referenciar exaustivamente todas as fontes e, em nenhuma circunstância, assumir a autoria de trabalhos que não tenham, pessoalmente, realizado.</li>
              </ol>
            </div>
          </section>

          {/* Section 3: Inclusion Policy */}
          <section className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">3.</span> Política de Inclusão
            </h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-gray-700 mb-4">
                A Game Jam promove a inclusão e acessibilidade para todos os participantes:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Ambiente Acessível:</strong> A organização comprometesse a criar um ambiente acessível, incluindo para participantes com necessidades especiais.</li>
                <li><strong>Diversidade de Participantes:</strong> Encorajamos a participação de indivíduos de todas as esferas, promovendo diversidade de ideias e habilidades.</li>
                <li><strong>Conteúdos Inapropriados:</strong> Jogos com conteúdo ofensivo, discriminatório, sexualmente explícito, de violência extrema, que promova atividades ilegais ou que tenha como objetivo humilhar indivíduos ou grupos serão desqualificados, ficando a decisão final a cargo da organização.</li>
              </ol>
            </div>
          </section>

          {/* Section 4: Diretrizes para a Criação de Jogos */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">4.</span> Diretrizes para a Criação de Jogos
            </h2>
            <div className="space-y-6 text-gray-800">
              
              {/* Regras da Jam */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">⏱️ Regras da Jam</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                  <li><strong>Duração:</strong> O jogo deve ser criado do zero durante as 45 horas da game jam. É permitido o uso de ativos existentes (como arte, som ou música), desde que a criação do jogo em si como mecânicas, código e estrutura seja desenvolvida dentro do período da competição.</li>
                  <li><strong>Participação em Equipa:</strong> Equipas de 2 até 4 pessoas.</li>
                </ol>
              </div>

              {/* Ferramentas e Ativos */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🛠️ Ferramentas e Ativos</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li><strong>Ferramentas:</strong> Pode usar qualquer ferramenta, motor, biblioteca ou código-base pré-existente.</li>
                    <li><strong>Ativos de Terceiros:</strong> São permitidos ativos de arte, música ou áudio, pagos ou gratuitos. A quantidade de ativos pagos influenciará a pontuação final.</li>
                    <li><strong>Direitos:</strong> Utilize apenas ativos sobre os quais detém direitos legais (domínio público, licenciados ou criados por si).</li>
                  </ol>
                </div>
              </div>

              {/* Regras da Competição */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🏆 Regras da Competição</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li><strong>Duração:</strong> O jogo deve ser criado do zero em 45 horas.</li>
                    <li><strong>Código Fonte:</strong> O código fonte ou os ficheiros do projeto devem ser incluídos com o jogo.</li>
                  </ol>
                </div>
              </div>

              {/* Diretrizes do Código Fonte */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📁 Diretrizes do Código Fonte</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                  <li>Partilhar o código fonte contribui para a aprendizagem da comunidade.</li>
                  <li>Para ferramentas sem &apos;código&apos; (como GameMaker), o ficheiro do projeto e o &apos;código fonte&apos;.</li>
                  <li>Certifique-se de que todas as bibliotecas ou ferramentas de terceiros usadas estejam acessíveis publicamente.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 5: Regras de Participação */}
          <section className="bg-purple-50 rounded-2xl p-8 border-2 border-purple-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">5.</span> Regras de Participação
            </h2>
            <div className="space-y-6 text-gray-800">
              
              {/* Submissão */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📤 Submissão</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                  <li>Os projetos devem ser submetidos ao Itch.io após o término das 45 horas e o link partilhado no <a href="http://discord.gg/X97GAg7F6E" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Discord</a>.</li>
                </ol>
              </div>

              {/* Correções de Erros */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">🐛 Correções de Erros</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                  <li>Não são permitidas correções de erros ou adição de Features após a submissão.</li>
                </ol>
              </div>

              {/* Direitos */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">©️ Direitos</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                  <li>O jogo é propriedade do criador. A organização pode usá-lo para divulgação do evento.</li>
                </ol>
              </div>

              {/* Obrigações Logísticas e Financeiras */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">💰 Obrigações Logísticas e Financeiras</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li><strong>Confirmação de Refeições:</strong> Os participantes que confirmarem a sua presença em refeições organizadas pela Game Jam (ex: jantar de sexta-feira) e não comparecerem, ficam obrigados ao pagamento do custo da mesma, no valor de 1,50 € (um euro e cinquenta cêntimos).</li>
                    <li><strong>Entrada Livre:</strong> A participação é gratuita e aberta ao público em geral, incluindo alunos e alumni do IPMAIA. A game jam decorre principalmente em formato presencial, sendo permitido que apenas um membro da equipa participe online. A maioria dos elementos deve estar presente nas instalações do IPMaia.</li>
                    <li><strong>Organização e Comunicação:</strong> A organização e comunicação do evento serão feitas através do servidor de Discord da game jam. Caso a equipa deseje desenvolver o projeto presencialmente nas instalações, deve informar previamente os organizadores.</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="font-semibold text-red-800">
                  ⚠️ Importante: Submissões após o prazo não serão aceites. Guardem tempo para upload e testes!
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Judging Criteria */}
          <section className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">6.</span> Critérios de Avaliação
            </h2>
            <div className="space-y-4 text-gray-800">
              <p className="text-gray-700 mb-4">
                Os projetos serão avaliados com os seguintes critérios (0-20 pontos cada):
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Relação/Cumprimento do Tema</h3>
                  <p className="text-sm text-gray-700">Como o jogo interpreta e incorpora o tema revelado</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">💡 Criatividade/ÚSP</h3>
                  <p className="text-sm text-gray-700">Proposta de venda única e originalidade do conceito</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎮 Qualidade (diversão)</h3>
                  <p className="text-sm text-gray-700">Quão divertido e envolvente é o jogo</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 Cumprimento/Quebra das Regras</h3>
                  <p className="text-sm text-gray-700">Cumprimento das regras estabelecidas</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2">🎨 Apresentação Visual/Estética e Quantidade de Ativos Usados</h3>
                  <p className="text-sm text-gray-700">Qualidade visual e quantidade de ativos utilizados</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Schedule */}
          <section className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-gray-500">7.</span> Horário do Evento
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
                      📅 {new Date(currentGameJam.start_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', weekday: 'long' })}
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
                            📅 {middleDay.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', weekday: 'long' })}
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
                      📅 {new Date(currentGameJam.end_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', weekday: 'long' })}
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
            {noActiveJam ? (
              <a
                href={latestArchiveUrl}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:scale-105"
              >
                📁 Ver Arquivo do Último Evento
              </a>
            ) : registrationClosed || hasEventEnded ? (
              <span className="inline-flex items-center gap-2 px-8 py-4 bg-gray-500 text-white font-bold rounded-xl cursor-not-allowed">
                ✍️ Inscrições Encerradas
              </span>
            ) : registrationOpen ? (
              <a
                href={
                  hasEventStarted
                    ? frontPageSettings.button_during_event_url || "/rules"
                    : frontPageSettings.button_before_start_url || "/enlist-now"
                }
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:scale-105"
              >
                ✍️ {
                  hasEventStarted
                    ? `Evento em Progresso - ${frontPageSettings.button_during_event_text || "Ver Regras"}`
                    : frontPageSettings.button_before_start_text || "Inscrever-me Agora"
                }
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-8 py-4 bg-gray-400 text-white font-bold rounded-xl cursor-not-allowed">
                ✍️ Em Breve
              </span>
            )}
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