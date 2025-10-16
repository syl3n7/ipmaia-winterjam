require('dotenv').config();
const { pool } = require('../config/database');

/**
 * Migration to add rules content management
 */
async function addRulesContent() {
  try {
    console.log('🔄 Adding rules content table...');

    // Create rules_content table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rules_content (
        id SERIAL PRIMARY KEY,
        section_key VARCHAR(100) UNIQUE NOT NULL,
        section_title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_rules_content_key ON rules_content(section_key);
      CREATE INDEX IF NOT EXISTS idx_rules_content_order ON rules_content(display_order);
    `);

    // Insert default rules content
    await pool.query(`
      INSERT INTO rules_content (section_key, section_title, content, display_order) 
      VALUES 
        ('pdf_url', 'URL do PDF', '/WinterJam_Rulebook.pdf', 0),
        ('conduct', 'Código de Conduta', '<p class="mb-4">Todos os participantes da Game Jam devem aderir ao seguinte código de conduta para garantir um ambiente inclusivo, seguro e respeitoso:</p>
<div class="space-y-3">
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Respeito Mútuo</h3>
    <p>Trate todos com respeito, independentemente de origem, género, orientação sexual, etnia, religião ou habilidade. Qualquer forma de assédio ou discriminação não será tolerada.</p>
  </div>
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Assédio</h3>
    <p>Não serão aceites comportamentos intimidatórios, perseguição, insultos, ou qualquer tipo de assédio, seja pessoalmente, online ou através de outros meios.</p>
  </div>
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Colaboração</h3>
    <p>A Game Jam promove a colaboração entre os participantes. A competição saudável é incentivada, mas é igualmente importante fomentar o espírito de comunidade.</p>
  </div>
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Segurança</h3>
    <p>Em caso de qualquer situação desconfortável ou insegura, comunique-se imediatamente com a organização.</p>
  </div>
</div>', 1),
        ('guidelines', 'Diretrizes para a Criação de Jogos', '<div class="space-y-4">
  <div class="p-4 bg-blue-50 rounded">
    <h3 class="font-bold mb-2">Regras da Jam</h3>
    <ul class="list-disc pl-5 space-y-2">
      <li>Duração: O jogo deve ser criado em 45 horas (de sexta-feira às 17h até domingo às 14h)</li>
      <li>Participação em Equipa: Pode trabalhar sozinho ou em equipa (máximo de 4 pessoas)</li>
    </ul>
  </div>
  <div class="p-4 bg-green-50 rounded">
    <h3 class="font-bold mb-2">Ferramentas e Ativos</h3>
    <ul class="list-disc pl-5 space-y-2">
      <li>Pode utilizar qualquer ferramenta, motor, biblioteca ou código-base pré-existente</li>
      <li>É permitido o uso de ativos de arte, música ou áudio de terceiros, sejam gratuitos ou pagos</li>
      <li>Apenas utilize ativos sobre os quais detenha os direitos legais</li>
    </ul>
  </div>
</div>', 2),
        ('prizes', 'Prémios', '<div class="grid gap-4">
  <div class="p-4 bg-yellow-50 rounded">
    <h3 class="font-bold">1º Lugar</h3>
    <ul class="list-disc pl-5">
      <li>Gift card InstantGaming de 10€ (por cada elemento)</li>
      <li>Certificado</li>
    </ul>
  </div>
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Ofertas para todos os participantes</h3>
    <ul class="list-disc pl-5">
      <li>Fita ou porta-chaves do evento</li>
      <li>Certificado</li>
    </ul>
  </div>
</div>', 3),
        ('evaluation', 'Critérios de Avaliação', '<div class="grid gap-3">
  <div class="p-3 bg-gray-50 rounded flex justify-between">
    <span>Relação/Cumprimento do tema</span>
    <span>0/20 pontos</span>
  </div>
  <div class="p-3 bg-gray-50 rounded flex justify-between">
    <span>Criatividade/USP</span>
    <span>0/20 pontos</span>
  </div>
  <div class="p-3 bg-gray-50 rounded flex justify-between">
    <span>Qualidade (diversão)</span>
    <span>0/20 pontos</span>
  </div>
  <div class="p-3 bg-gray-50 rounded flex justify-between">
    <span>Cumprimento/Quebra das regras</span>
    <span>0/20 pontos</span>
  </div>
  <div class="p-3 bg-gray-50 rounded flex justify-between">
    <span>Apresentação visual/estética</span>
    <span>0/20 pontos</span>
  </div>
</div>', 4),
        ('participation', 'Regras de Participação', '<div class="space-y-4">
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Submissão</h3>
    <p>Os projetos devem ser submetidos ao Itch.io após o término das 45 horas e o link partilhado no canal de discord devido.</p>
  </div>
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Entrada livre</h3>
    <p>Para alunos e alumni do IPMAIA/UMAIA. A game jam será no formato online/presencial e será dirigido através do servidor de discord da gamejam. Caso o grupo queira estar a desenvolver presencialmente, devem manifestar o interesse aos organizadores da game jam.</p>
  </div>
  <div class="p-4 bg-gray-50 rounded">
    <h3 class="font-bold">Direitos</h3>
    <p>O jogo é propriedade sua. A organização da Game Jam não reivindica direitos sobre o seu jogo, mas pode utilizá-lo para fins de divulgação do evento.</p>
  </div>
</div>', 5),
        ('schedule', 'Horário do Evento', '<div class="space-y-2">
  <div class="p-3 bg-gray-50 rounded">
    <span class="font-bold">Dia 14 - Início:</span>
    <ul class="list-disc pl-5 mt-2">
      <li>17:00 - Início do Jam</li>
      <li>17:15 - Divulgação do tema</li>
    </ul>
  </div>
  <div class="p-3 bg-gray-50 rounded">
    <span class="font-bold">Dia 16 - Fim:</span>
    <ul class="list-disc pl-5 mt-2">
      <li>14:00 - Fim do Jam</li>
      <li>Avaliação a cargo do júri após as 14:00</li>
    </ul>
  </div>
</div>', 6)
      ON CONFLICT (section_key) DO NOTHING;
    `);

    console.log('✅ Rules content table created and populated!');
    
  } catch (error) {
    console.error('❌ Error adding rules content:', error);
    throw error;
  }
}

async function migrate() {
  try {
    await addRulesContent();
    console.log('🎉 Rules content migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = { addRulesContent };
