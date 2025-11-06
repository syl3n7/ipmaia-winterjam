const { pool } = require('../config/database');

/**
 * Seed default rules content with rich HTML structure
 */
async function seedRulesContent() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding default rules content...');

    // Check if active rules exist
    const checkResult = await client.query('SELECT * FROM rules WHERE is_active = true');
    
    if (checkResult.rows.length === 0) {
      console.log('ℹ️  No active rules found. Please run migrate-rules.js first.');
      return;
    }

    const rulesId = checkResult.rows[0].id;

    // Update with rich content
    await client.query(`
      UPDATE rules 
      SET 
        code_of_conduct = $1,
        guidelines = $2,
        prizes = $3,
        evaluation = $4,
        participation = $5,
        schedule = $6,
        updated_at = NOW()
      WHERE id = $7
    `, [
      // Código de Conduta
      `<div class="space-y-4">
        <p>A WinterJam é um evento inclusivo e acolhedor para todos. Esperamos que todos os participantes:</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          <li>Sejam respeitosos com todos os participantes, organizadores e voluntários</li>
          <li>Evitem qualquer forma de assédio, discriminação ou comportamento ofensivo</li>
          <li>Respeitem o espaço e os materiais fornecidos</li>
          <li>Mantenham um ambiente colaborativo e positivo</li>
          <li>Sigam as instruções dos organizadores e da equipa de apoio</li>
        </ul>
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
          <p class="font-semibold text-yellow-800">⚠️ Violações do código de conduta podem resultar em desqualificação imediata do evento.</p>
        </div>
      </div>`,
      
      // Diretrizes
      `<div class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3">Tema e Objeto Obrigatório</h3>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li><strong>Tema:</strong> Será revelado no início do evento</li>
            <li><strong>Objeto Obrigatório:</strong> Deve estar presente no jogo de forma visível e significativa</li>
            <li>A interpretação do tema e objeto é livre e criativa</li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-semibold mb-3">Requisitos Técnicos</h3>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>O jogo deve ser criado durante as 45 horas do evento</li>
            <li>Código e assets pré-existentes só podem ser usados se forem de domínio público ou licença permissiva</li>
            <li>Engines e frameworks são permitidos (Unity, Unreal, Godot, etc.)</li>
            <li>Assets pré-feitos (som, música, sprites) são permitidos desde que creditados</li>
            <li>O jogo deve ser jogável e demonstrável no final do evento</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3">Entrega</h3>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Build executável ou versão web funcional</li>
            <li>Breve descrição do jogo e instruções de como jogar</li>
            <li>Créditos da equipa</li>
            <li>Link para repositório (se aplicável)</li>
          </ul>
        </div>
      </div>`,
      
      // Prémios
      `<div class="space-y-4">
        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl p-6 text-center">
            <div class="text-4xl mb-2">🥇</div>
            <h3 class="text-xl font-bold text-yellow-900 mb-2">1º Lugar</h3>
            <p class="text-sm text-yellow-800">Gift card 10€ por elemento + Certificado</p>
          </div>
          <div class="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-400 rounded-xl p-6 text-center">
            <div class="text-4xl mb-2">🥈</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">2º Lugar</h3>
            <p class="text-sm text-gray-800">Certificado</p>
          </div>
          <div class="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400 rounded-xl p-6 text-center">
            <div class="text-4xl mb-2">🥉</div>
            <h3 class="text-xl font-bold text-orange-900 mb-2">3º Lugar</h3>
            <p class="text-sm text-orange-800">Certificado</p>
          </div>
        </div>
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
          <p class="text-blue-800 text-center font-semibold">🎁 Todos os participantes receberão fita/porta-chaves do evento e certificado de participação!</p>
        </div>
      </div>`,
      
      // Avaliação
      `<div class="space-y-4">
        <p>Os jogos serão avaliados por um júri especializado com base nos seguintes critérios:</p>
        <div class="grid md:grid-cols-2 gap-4 mt-4">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 class="font-semibold text-purple-800 mb-2">🎨 Criatividade (25%)</h3>
            <p class="text-sm text-gray-700">Originalidade do conceito, interpretação do tema e uso do objeto obrigatório</p>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-semibold text-blue-800 mb-2">🎮 Gameplay (25%)</h3>
            <p class="text-sm text-gray-700">Mecânicas divertidas, jogabilidade fluida e experiência do jogador</p>
          </div>
          <div class="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h3 class="font-semibold text-pink-800 mb-2">🎨 Arte e Som (20%)</h3>
            <p class="text-sm text-gray-700">Qualidade visual, coerência estética e design de áudio</p>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 class="font-semibold text-green-800 mb-2">🔧 Técnica (20%)</h3>
            <p class="text-sm text-gray-700">Implementação técnica, otimização e ausência de bugs críticos</p>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:col-span-2">
            <h3 class="font-semibold text-yellow-800 mb-2">🎯 Tema & Objeto (10%)</h3>
            <p class="text-sm text-gray-700">Integração do tema e uso criativo do objeto obrigatório</p>
          </div>
        </div>
      </div>`,
      
      // Participação
      `<div class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3">Equipas</h3>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Equipas de 1 a 4 pessoas</li>
            <li>Participação individual também é permitida</li>
            <li>Equipas podem ser formadas antes ou durante o evento</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3">Elegibilidade</h3>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Aberto a estudantes e alumni do IPMAIA/UMAIA</li>
            <li>Formato online/presencial (manifestar interesse para presencial)</li>
            <li>Todos os níveis de experiência são bem-vindos</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3">Durante o Evento</h3>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>Submissão no Itch.io após as 45 horas</li>
            <li>Partilhar link no canal de Discord</li>
            <li>Suporte técnico e mentoria disponíveis</li>
          </ul>
        </div>

        <div class="bg-green-50 border-l-4 border-green-400 p-4 mt-4">
          <p class="text-green-800"><strong>📜 Direitos:</strong> O jogo é propriedade sua. A organização não reivindica direitos, mas pode usá-lo para divulgação do evento.</p>
        </div>
      </div>`,
      
      // Horário
      `<div class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 flex items-center gap-2">
            📅 Dia 5 de Dezembro (Sexta-feira)
          </h3>
          <div class="space-y-2 ml-4">
            <div class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
              <span class="font-mono text-purple-600 min-w-[80px] font-semibold">17:00</span>
              <div>
                <strong>Início do Jam</strong>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
              <span class="font-mono text-purple-600 min-w-[80px] font-semibold">17:15</span>
              <div>
                <strong>🚀 Divulgação do tema</strong>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 flex items-center gap-2">
            📅 Dia 7 de Dezembro (Domingo)
          </h3>
          <div class="space-y-2 ml-4">
            <div class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
              <span class="font-mono text-purple-600 min-w-[80px] font-semibold">14:00</span>
              <div>
                <strong>⏰ FIM DO JAM!</strong>
                <p class="text-sm text-gray-600">Submissão obrigatória dos projetos</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
              <span class="font-mono text-purple-600 min-w-[80px] font-semibold">14:00+</span>
              <div>
                <strong>Avaliação a cargo do júri</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
          <p class="text-blue-800">
            <strong>ℹ️ Nota:</strong> O horário é provisório e pode sofrer pequenas alterações. 
            Atualizações serão comunicadas aos participantes.
          </p>
        </div>
      </div>`,
      
      rulesId
    ]);

    console.log('✅ Rules content seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding rules content:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedRulesContent()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedRulesContent;
