#!/usr/bin/env node

/**
 * WinterJam Data Update Script
 * Updates database with correct data from JSON export
 * Usage: node backend/scripts/update-from-export.js
 */

require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Import the JSON export data
const exportData = {
  "exported_at": "2025-11-07T16:57:18.997Z",
  "total_game_jams": 2,
  "total_games": 8,
  "game_jams": [
    {
      "id": 161,
      "name": "2ª edição WinterJam IPMaia",
      "theme": "TBD",
      "description": "A WinterJam voltará a reunir estudantes de desenvolvimento de jogos numa intensa maratona criativa do dia 5 a dia 7 de dezembro de 2025, fica atento para mais informações.",
      "start_date": "2025-12-05T17:00:00.000Z",
      "end_date": "2025-12-07T16:30:00.000Z",
      "registration_start_date": "2025-11-01T00:00:00.000Z",
      "registration_end_date": "2025-12-04T23:59:00.000Z",
      "registration_url": "https://example.com",
      "rules_pdf_url": "/WinterJam_Rulebook.pdf",
      "is_active": true,
      "banner_image_url": "/images/IPMAIA_SiteBanner.png",
      "show_theme": false,
      "show_description": true,
      "show_start_date": true,
      "show_end_date": true,
      "date_fallback": "Coming Soon",
      "show_registration_dates": false,
      "registration_date_fallback": "Coming Soon",
      "show_registration_url": false,
      "show_rules_pdf_url": true,
      "show_banner_image": true,
      "banner_fallback": "default",
      "custom_fields": {},
      "custom_fields_visibility": {},
      "slug": "",
      "archive_url": "",
      "introduction": "Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!",
      "prizes_content": "Neste Evento serão sorteados mais de 40 jogos ao longo da GameJam , entre eles temos Detroit: Became Human, Resident Evil Series, Tomb raider trilogy, Devil may Cry, Little Nightmare Series e muitos mais.",
      "schedule_content": null
    },
    {
      "id": 160,
      "name": "WinterJam 2025",
      "theme": "Anomalia",
      "description": "A edição de 2025 do IPMAIA WinterJam 2025 reuniu 32 participantes formando 8 equipas para uma intensa maratona de desenvolvimento de jogos de 45 Horas. O tema \"Anomalia\" e o objeto obrigatório \"Ice Stalactite\" inspiraram diversas interpretações criativas e conceitos de jogo únicos.",
      "start_date": "2025-02-14T00:00:00.000Z",
      "end_date": "2025-02-16T00:00:00.000Z",
      "registration_start_date": null,
      "registration_end_date": null,
      "registration_url": null,
      "rules_pdf_url": "/WinterJam_Rulebook.pdf",
      "is_active": false,
      "banner_image_url": "/images/IPMAIA_SiteBanner.png",
      "show_theme": true,
      "show_description": true,
      "show_start_date": true,
      "show_end_date": true,
      "date_fallback": "TBD",
      "show_registration_dates": true,
      "registration_date_fallback": "TBD",
      "show_registration_url": true,
      "show_rules_pdf_url": true,
      "show_banner_image": true,
      "banner_fallback": "placeholder",
      "custom_fields": {},
      "custom_fields_visibility": {},
      "slug": null,
      "archive_url": null,
      "introduction": "Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!",
      "prizes_content": null,
      "schedule_content": null
    }
  ],
  "games": [
    {
      "id": 841,
      "game_jam_id": 160,
      "title": "Interdimensional Cat",
      "description": "1º LUGAR 🥇 - Team MALU\n\nInstruções:\nSalta e explora entre dimensões para encontrar o caminho para casa.\nRecolhe todos os peixes!\n\nNota: Por favor, joga em ecrã completo.\n\nSobre o Jogo:\nPerdido num mundo pixelizado e peculiar de \"Interdimensional Cat\", os jogadores guiam um felino corajoso através de uma realidade fraturada.\n\nEste platformer 2.5D combina movimento intuitivo com puzzles dimensionais inteligentes. O nosso herói bigodudo deve saltar e atravessar paisagens vibrantes, colecionando runas para ativar portais cintilantes que saltam entre dimensões.\n\nCada nível apresenta desafios únicos, enquanto os jogadores manipulam o ambiente para encontrar o caminho purrfeito para casa.\n\nTecnologias:\n• Unity\n• Sfxr\n• Aseprite\n• BeepBox\n\nLinguagens: C#",
      "team_name": "Team MALU",
      "team_members": [
        {"name": "Margarida Ramos", "role": "Artist, Game Designer, Sound Designer", "portfolio": "https://margarida4.artstation.com/"},
        {"name": "Luis Serra", "role": "Programmer, World Builder", "portfolio": "https://github.com/LuisSerra2/Interdimensional-Cat"}
      ],
      "github_url": null,
      "itch_url": "https://makimakesgames.itch.io/interdimensional-cat",
      "screenshot_urls": ["/images/interdimensional-cat.png"],
      "tags": ["Anomalia", "winter_2025", "rank_1"],
      "is_featured": true
    },
    {
      "id": 842,
      "game_jam_id": 160,
      "title": "Ever Sleep",
      "description": "2º LUGAR 🥈 - Lata D'Atum\n\nInstruções:\nCONTROLOS:\nMovimento - WASD ou Setas\nInteragir - E\nCorrer - Shift\n\nSobre o Jogo:\nEverSleep é um jogo onde exploramos o quão estranhos e reais os nossos sonhos podem ser.\n\nEntra na mente de uma criança que fica presa num ciclo de sonhos cheio de anomalias.\n\nNuma cidade onde todos dormem eternamente, descobre a anomalia que causou este fenómeno e tenta acordar os habitantes.\n\nAVISO: Como os vídeos não são suportados ao exportar para WebGL, foi necessário criar este post com o build disponível para download.",
      "team_name": "Lata D'Atum",
      "team_members": [
        {"name": "Rafael Rodrigues", "role": "Programmer", "portfolio": null},
        {"name": "Helena Carvalho", "role": "2D Artist, Animator", "portfolio": null},
        {"name": "Claudia Nunes", "role": "2D Artist, Animator", "portfolio": null},
        {"name": "Jéssica Santos", "role": "2D Artist, Animator", "portfolio": null}
      ],
      "github_url": null,
      "itch_url": "https://phoost.itch.io/eversleep-build",
      "screenshot_urls": ["/images/eversleep.png"],
      "tags": ["Anomalia", "winter_2025", "rank_2"],
      "is_featured": true
    },
    {
      "id": 843,
      "game_jam_id": 160,
      "title": "Deep Anomaly",
      "description": "3º LUGAR 🥉 - Vatanupe\n\nInstruções:\nCONTROLOS:\n• Movimento - WASD\n• Saltar - Espaço\n• Interagir - E\n\nSobre o Jogo:\nIPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite",
      "team_name": "Vatanupe",
      "team_members": [
        {"name": "Goncalo Valente", "role": "Programador Depressivo", "portfolio": null},
        {"name": "Beatriz Santos", "role": "Artista de Moda", "portfolio": null},
        {"name": "Filipi Cunha", "role": "Artista e Pianista", "portfolio": null},
        {"name": "Rita Games", "role": "Artista e Clown", "portfolio": null}
      ],
      "github_url": null,
      "itch_url": "https://kofkof.itch.io/deep-anomaly",
      "screenshot_urls": ["/images/deep-anomaly.png"],
      "tags": ["Anomalia", "winter_2025", "rank_3"],
      "is_featured": true
    },
    {
      "id": 844,
      "game_jam_id": 160,
      "title": "The Lab of Bizarre and Wacky Anomalies",
      "description": "Uma aventura gelada criada pela equipa Três e Meio\n\nInstruções:\nCONTROLOS:\n• WASD - Mover\n• Barra de Espaço - Saltar\n• E - Interagir com anomalias\n\nSobre o Jogo:\nIPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite\n\nAcordas num laboratório abandonado, como uma anomalia mutante, decides ver o exterior.\n\nMas há um problema, és feito de gelo. Chega ao fim antes de derreter. E vê o céu!\n\nUm pequeno jogo feito por mim e 3 amigos para a IPMAIA WinterGame Jam. Tivemos 45h para criar um jogo completo.",
      "team_name": "Três e Meio",
      "team_members": [
        {"name": "Daniela Monteiro", "role": "2D and Texture Artist", "portfolio": null},
        {"name": "Francisco Gonçalves", "role": "Programmer", "portfolio": null},
        {"name": "Jorge Daniel Alexandre", "role": "3D Artist", "portfolio": null},
        {"name": "Vasco Barradas", "role": "Audio and VFX", "portfolio": null}
      ],
      "github_url": null,
      "itch_url": "https://comandante-vicno.itch.io/the-lab-of-bizarre-and-wacky-anomalies",
      "screenshot_urls": ["/images/lab-of-anomalies.png"],
      "tags": ["Anomalia", "winter_2025", "participant"],
      "is_featured": null
    },
    {
      "id": 845,
      "game_jam_id": 160,
      "title": "Icicle Escape",
      "description": "Participa nesta aventura gelada criada pela equipa Croissants Dudes\n\nInstruções:\nCONTROLOS:\n• A ou Seta Esquerda - Mover para Esquerda\n• D ou Seta Direita - Mover para Direita\n• Espaço - Saltar\n\nSobre o Jogo:\nCriado durante a IPMAIA Winter Gamejam em 45 horas\nTema: Anomalia\nObjeto obrigatório: Icicle (Estalactite de Gelo)",
      "team_name": "Croissants Dudes",
      "team_members": [
        {"name": "Duarte Santos", "role": "UX, 2D Artist", "portfolio": null},
        {"name": "Francisco Sarmento", "role": "3D Artist, Animator", "portfolio": null},
        {"name": "Paulo Rodrigues", "role": "Programmer, Animator", "portfolio": null}
      ],
      "github_url": null,
      "itch_url": "https://pauloricardorodrigues.itch.io/icicle-escape",
      "screenshot_urls": ["/images/icicle-escape.jpg"],
      "tags": ["Anomalia", "winter_2025", "participant"],
      "is_featured": null
    },
    {
      "id": 846,
      "game_jam_id": 160,
      "title": "Arctic Escape",
      "description": "Uma aventura gelada criada pela equipa WD\n\nInstruções:\nCONTROLOS:\n• Andar - A / D\n• Correr - LShift + A / Shift + D\n• Disparar Arma - F\n• Saltar - Espaço\n• Saltar e agarrar ao teto - Shift + Espaço\n\nSobre o Jogo:\nIPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite\n\nNum mundo gelado, Luna, uma jovem aventureira, descobre um segredo antigo: a capacidade de inverter a gravidade e poder andar no teto da mesma forma que anda no chão. Perdida entre a imensidão gelada e perigos ocultos, Luna precisa superar desafios e derrotar criaturas sombrias para chegar ao próximo iglu e continuar sua jornada.\n\nInimigos tentam bloquear sua passagem, enquanto seu caminho está repleto de ameaças à sua vida. Com reflexos rápidos e estratégias, Luna deve alternar entre o chão e o teto para escapar de armadilhas, atacar inimigos no momento certo e avançar por este mundo congelado.\n\nApenas os mais habilidosos conseguirão dominar a arte da inversão e levar Luna ao seu destino final. Será que você conseguirá superar os perigos do gelo e desvendar o mistério que assombra essas terras?",
      "team_name": "WD",
      "team_members": [
        {"name": "Mariana Cardoso", "role": "Artista, Level Design", "portfolio": null},
        {"name": "Claudio Pinheiro", "role": "Programador", "portfolio": null}
      ],
      "github_url": null,
      "itch_url": "https://claudiopinheiro.pt/games/arcticescape/index.html",
      "screenshot_urls": ["/images/arctic-escape.png"],
      "tags": ["Anomalia", "winter_2025", "participant"],
      "is_featured": null
    },
    {
      "id": 847,
      "game_jam_id": 160,
      "title": "Inverse Protocol",
      "description": "Uma experiência única criada pela equipa Gamer Slug\n\nInstruções:\nCONTROLOS:\n• Movimento - WASD\n• Saltar - Espaço\n• Interagir - E\n\nSobre o Jogo:\nIPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite",
      "team_name": "Gamer Slug",
      "team_members": [
        {"name": "João Osório", "role": "Developer", "portfolio": null}
      ],
      "github_url": null,
      "itch_url": "https://joaoosorio.itch.io/inverse-protocol",
      "screenshot_urls": ["/images/inverse-protocol.png"],
      "tags": ["Anomalia", "winter_2025", "participant"],
      "is_featured": null
    },
    {
      "id": 848,
      "game_jam_id": 160,
      "title": "Ice Break",
      "description": "Uma experiência única criada pela equipa HUHGames\n\nInstruções:\nCONTROLOS:\n• Movimento - WASD\n• Saltar - Espaço\n• Interagir - E\n\nSobre o Jogo:\nIPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite",
      "team_name": "HUHGames",
      "team_members": [
        {"name": "Marco Rodrigues", "role": "Programador", "portfolio": null},
        {"name": "Alexandre Silva", "role": "Programador", "portfolio": null},
        {"name": "Madalena Jacinto", "role": "Designer / Animadora", "portfolio": null},
        {"name": "João d'Araujo", "role": "Artista", "portfolio": null}
      ],
      "github_url": null,
      "itch_url": "https://catotaman.itch.io/icebreak",
      "screenshot_urls": ["/images/ice-break.png"],
      "tags": ["Anomalia", "winter_2025", "participant"],
      "is_featured": null
    }
  ]
};

async function updateGameJam(jam) {
  const {
    id, name, theme, description, start_date, end_date,
    registration_start_date, registration_end_date, registration_url,
    rules_pdf_url, is_active, banner_image_url,
    introduction, prizes_content, schedule_content,
    reception_datetime, theme_announcement_datetime, awards_ceremony_datetime,
    show_theme, show_description, show_start_date, show_end_date,
    date_fallback, show_registration_dates, registration_date_fallback,
    show_registration_url, show_rules_pdf_url, show_banner_image,
    banner_fallback, custom_fields, custom_fields_visibility,
    slug, archive_url
  } = jam;

    const query = `
    INSERT INTO game_jams (
      id, name, theme, description, start_date, end_date,
      registration_start_date, registration_end_date, registration_url,
      rules_pdf_url, is_active, banner_image_url,
      introduction, prizes_content, schedule_content,
      reception_datetime, theme_announcement_datetime, awards_ceremony_datetime,
      show_theme, show_description, show_start_date, show_end_date,
      date_fallback, show_registration_dates, registration_date_fallback,
      show_registration_url, show_rules_pdf_url, show_banner_image,
      banner_fallback, custom_fields, custom_fields_visibility,
      slug, archive_url,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
      $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33,
      NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      theme = EXCLUDED.theme,
      description = EXCLUDED.description,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      registration_start_date = EXCLUDED.registration_start_date,
      registration_end_date = EXCLUDED.registration_end_date,
      registration_url = EXCLUDED.registration_url,
      rules_pdf_url = EXCLUDED.rules_pdf_url,
      is_active = EXCLUDED.is_active,
      banner_image_url = EXCLUDED.banner_image_url,
      introduction = EXCLUDED.introduction,
      prizes_content = EXCLUDED.prizes_content,
      schedule_content = EXCLUDED.schedule_content,
      reception_datetime = EXCLUDED.reception_datetime,
      theme_announcement_datetime = EXCLUDED.theme_announcement_datetime,
      awards_ceremony_datetime = EXCLUDED.awards_ceremony_datetime,
      show_theme = EXCLUDED.show_theme,
      show_description = EXCLUDED.show_description,
      show_start_date = EXCLUDED.show_start_date,
      show_end_date = EXCLUDED.show_end_date,
      date_fallback = EXCLUDED.date_fallback,
      show_registration_dates = EXCLUDED.show_registration_dates,
      registration_date_fallback = EXCLUDED.registration_date_fallback,
      show_registration_url = EXCLUDED.show_registration_url,
      show_rules_pdf_url = EXCLUDED.show_rules_pdf_url,
      show_banner_image = EXCLUDED.show_banner_image,
      banner_fallback = EXCLUDED.banner_fallback,
      custom_fields = EXCLUDED.custom_fields,
      custom_fields_visibility = EXCLUDED.custom_fields_visibility,
      slug = EXCLUDED.slug,
      archive_url = EXCLUDED.archive_url,
      updated_at = NOW()
  `;

  const values = [
    id, name, theme, description, start_date, end_date,
    registration_start_date, registration_end_date, registration_url,
    rules_pdf_url, is_active, banner_image_url,
    introduction, prizes_content, schedule_content,
    reception_datetime || null, theme_announcement_datetime || null, awards_ceremony_datetime || null,
    show_theme, show_description, show_start_date, show_end_date,
    date_fallback, show_registration_dates, registration_date_fallback,
    show_registration_url, show_rules_pdf_url, show_banner_image,
    banner_fallback, JSON.stringify(custom_fields), JSON.stringify(custom_fields_visibility),
    slug || null, archive_url || null
  ];  await pool.query(query, values);
  console.log(`✅ Updated Game Jam: ${name} (ID: ${id})`);
}

async function updateGame(game) {
  const {
    id, game_jam_id, title, description, team_name, team_members,
    github_url, itch_url, screenshot_urls, tags, is_featured
  } = game;

  const query = `
    INSERT INTO games (
      id, game_jam_id, title, description, team_name, team_members,
      github_url, itch_url, screenshot_urls, tags, is_featured,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      game_jam_id = EXCLUDED.game_jam_id,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      team_name = EXCLUDED.team_name,
      team_members = EXCLUDED.team_members,
      github_url = EXCLUDED.github_url,
      itch_url = EXCLUDED.itch_url,
      screenshot_urls = EXCLUDED.screenshot_urls,
      tags = EXCLUDED.tags,
      is_featured = EXCLUDED.is_featured,
      updated_at = NOW()
  `;

  const values = [
    id, game_jam_id, title, description, team_name,
    JSON.stringify(team_members),
    github_url, itch_url,
    JSON.stringify(screenshot_urls),
    JSON.stringify(tags),
    is_featured
  ];

  await pool.query(query, values);
  console.log(`✅ Updated Game: ${title} (ID: ${id})`);
}

async function main() {
  console.log('🚀 Starting database update from export...\n');
  console.log(`📦 Export date: ${exportData.exported_at}`);
  console.log(`📊 Game Jams: ${exportData.total_game_jams}`);
  console.log(`🎮 Games: ${exportData.total_games}\n`);

  try {
    // Update Game Jams
    console.log('🏆 Updating Game Jams...');
    for (const jam of exportData.game_jams) {
      await updateGameJam(jam);
    }

    // Update Games
    console.log('\n🎮 Updating Games...');
    for (const game of exportData.games) {
      await updateGame(game);
    }

    console.log('\n✨ Database update completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Game Jams updated: ${exportData.game_jams.length}`);
    console.log(`   - Games updated: ${exportData.games.length}`);
    console.log('\n💾 All data is now stored in PostgreSQL (Docker volume: postgres_data)');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
main().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});
