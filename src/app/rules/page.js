import React from 'react';
import { Download } from 'lucide-react';

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Livro de Regras da WinterJam</h1>
        <a 
          href="/WinterJam_Rulebook.pdf" 
          download 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          <span>Baixar PDF</span>
        </a>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Código de Conduta</h2>
        <p className="mb-4">Todos os participantes da Game Jam devem aderir ao seguinte código de conduta para garantir um ambiente inclusivo, seguro e respeitoso:</p>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Respeito Mútuo</h3>
            <p>Trate todos com respeito, independentemente de origem, género, orientação sexual, etnia, religião ou habilidade. Qualquer forma de assédio ou discriminação não será tolerada.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Assédio</h3>
            <p>Não serão aceites comportamentos intimidatórios, perseguição, insultos, ou qualquer tipo de assédio, seja pessoalmente, online ou através de outros meios.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Colaboração</h3>
            <p>A Game Jam promove a colaboração entre os participantes. A competição saudável é incentivada, mas é igualmente importante fomentar o espírito de comunidade.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Segurança</h3>
            <p>Em caso de qualquer situação desconfortável ou insegura, comunique-se imediatamente com a organização.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. Diretrizes para a Criação de Jogos</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">Regras da Jam</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Duração: O jogo deve ser criado em 45 horas (de sexta-feira às 17h até domingo às 14h)</li>
              <li>Participação em Equipa: Pode trabalhar sozinho ou em equipa (máximo de 4 pessoas)</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-bold mb-2">Ferramentas e Ativos</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pode utilizar qualquer ferramenta, motor, biblioteca ou código-base pré-existente</li>
              <li>É permitido o uso de ativos de arte, música ou áudio de terceiros, sejam gratuitos ou pagos</li>
              <li>Apenas utilize ativos sobre os quais detenha os direitos legais</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. Prémios</h2>
        <div className="grid gap-4">
          <div className="p-4 bg-yellow-50 rounded">
            <h3 className="font-bold">1º Lugar</h3>
            <ul className="list-disc pl-5">
              <li>Gift card InstantGaming de 10€ (por cada elemento)</li>
              <li>Certificado</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Ofertas para todos os participantes</h3>
            <ul className="list-disc pl-5">
              <li>Fita ou porta-chaves do evento</li>
              <li>Certificado</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. Critérios de Avaliação</h2>
        <div className="grid gap-3">
          <div className="p-3 bg-gray-50 rounded flex justify-between">
            <span>Relação/Cumprimento do tema</span>
            <span>0/20 pontos</span>
          </div>
          <div className="p-3 bg-gray-50 rounded flex justify-between">
            <span>Criatividade/USP</span>
            <span>0/20 pontos</span>
          </div>
          <div className="p-3 bg-gray-50 rounded flex justify-between">
            <span>Qualidade (diversão)</span>
            <span>0/20 pontos</span>
          </div>
          <div className="p-3 bg-gray-50 rounded flex justify-between">
            <span>Cumprimento/Quebra das regras</span>
            <span>0/20 pontos</span>
          </div>
          <div className="p-3 bg-gray-50 rounded flex justify-between">
            <span>Apresentação visual/estética</span>
            <span>0/20 pontos</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">5. Regras de Participação</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Submissão</h3>
            <p>Os projetos devem ser submetidos ao Itch.io após o término das 45 horas e o link partilhado no canal de discord devido.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Entrada livre</h3>
            <p>Para alunos e alumni do IPMAIA/UMAIA. A game jam será no formato online/presencial e será dirigido através do servidor de discord da gamejam.
            Caso o grupo queira estar a desenvolver presencialmente, devem manifestar o interesse aos organizadores da game jam.
</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Direitos</h3>
            <p>O jogo é propriedade sua. A organização da Game Jam não reivindica direitos sobre o seu jogo, mas pode utilizá-lo para fins de divulgação do evento.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">6. Horário do Evento (14 a 16 de fevereiro)</h2>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded">
            <span className="font-bold">Dia 14 - Início:</span>
            <ul className="list-disc pl-5 mt-2">
              <li>17:00 - Início do Jam</li>
              <li>17:15 - Divulgação do tema</li>
            </ul>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <span className="font-bold">Dia 16 - Fim:</span>
            <ul className="list-disc pl-5 mt-2">
              <li>14:00 - Fim do Jam</li>
              <li>Avaliação a cargo do júri após as 14:00</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}