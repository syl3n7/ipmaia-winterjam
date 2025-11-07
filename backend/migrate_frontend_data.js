require('dotenv').config();
const { pool } = require('./config/database');
// Note: Base tables should already exist from smart-migrate system

// Frontend data to import
const frontendData = {
  "2025": {
    "winter": {
      id: "winter-2025",
      name: "WinterJam 2025",
      theme: "Anomalia",
      requiredObject: "Ice Stalactite",
      duration: "45 Horas",
      date: "14-16 Fevereiro 2025",
      participants: 32,
      teams: 8,
      banner: "/images/IPMAIA_SiteBanner.png",
      games: [
        {
          id: 1,
          title: "Interdimensional Cat",
          thumbnail: "/images/interdimensional-cat.png",
          description: "1º LUGAR 🥇 - Team MALU",
          instructions: "Salta e explora entre dimensões para encontrar o caminho para casa.\nRecolhe todos os peixes!\n\nNota: Por favor, joga em ecrã completo.",
          lore: "Perdido num mundo pixelizado e peculiar de \"Interdimensional Cat\", os jogadores guiam um felino corajoso através de uma realidade fraturada.\n\nEste platformer 2.5D combina movimento intuitivo com puzzles dimensionais inteligentes. O nosso herói bigodudo deve saltar e atravessar paisagens vibrantes, colecionando runas para ativar portais cintilantes que saltam entre dimensões.\n\nCada nível apresenta desafios únicos, enquanto os jogadores manipulam o ambiente para encontrar o caminho purrfeito para casa.\n\nTecnologias:\n• Unity\n• Sfxr\n• Aseprite\n• BeepBox\n\nLinguagens: C#",
          path: "https://makimakesgames.itch.io/interdimensional-cat",
          ranking: 1,
          team: {
            name: "Team MALU",
            members: [
              {
                name: "Margarida Ramos",
                role: "Artist, Game Designer, Sound Designer",
                portfolio: "https://margarida4.artstation.com/"
              },
              {
                name: "Luis Serra",
                role: "Programmer, World Builder",
                portfolio: "https://github.com/LuisSerra2/Interdimensional-Cat"
              }
            ]
          }
        },
        {
          id: 2,
          title: "Ever Sleep",
          thumbnail: "/images/eversleep.png",
          description: "2º LUGAR 🥈 - Lata D'Atum",
          instructions: "CONTROLOS:\nMovimento - WASD ou Setas\nInteragir - E\nCorrer - Shift",
          lore: "EverSleep é um jogo onde exploramos o quão estranhos e reais os nossos sonhos podem ser.\n\nEntra na mente de uma criança que fica presa num ciclo de sonhos cheio de anomalias.\n\nNuma cidade onde todos dormem eternamente, descobre a anomalia que causou este fenómeno e tenta acordar os habitantes.\n\nAVISO: Como os vídeos não são suportados ao exportar para WebGL, foi necessário criar este post com o build disponível para download.",
          path: "https://phoost.itch.io/eversleep-build",
          ranking: 2,
          team: {
            name: "Lata D'Atum",
            members: [
              {
                name: "Rafael Rodrigues",
                role: "Programmer"
              },
              {
                name: "Helena Carvalho",
                role: "2D Artist, Animator"
              },
              {
                name: "Claudia Nunes",
                role: "2D Artist, Animator"
              },
              {
                name: "Jéssica Santos",
                role: "2D Artist, Animator"
              }
            ]
          }
        },
        {
          id: 3,
          title: "Deep Anomaly",
          thumbnail: "/images/deep-anomaly.png",
          description: "3º LUGAR 🥉 - Vatanupe",
          instructions: "CONTROLOS:\n• Movimento - WASD\n• Saltar - Espaço\n• Interagir - E",
          lore: "IPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite",
          path: "https://kofkof.itch.io/deep-anomaly",
          ranking: 3,
          team: {
            name: "Vatanupe",
            members: [
              {
                name: "Goncalo Valente",
                role: "Programador Depressivo"
              },
              {
                name: "Beatriz Santos",
                role: "Artista de Moda"
              },
              {
                name: "Filipi Cunha",
                role: "Artista e Pianista"
              },
              {
                name: "Rita Games",
                role: "Artista e Clown"
              }
            ]
          }
        },
        {
          id: 4,
          title: "The Lab of Bizarre and Wacky Anomalies",
          thumbnail: "/images/lab-of-anomalies.png",
          description: "Uma aventura gelada criada pela equipa Três e Meio",
          instructions: "CONTROLOS:\n• WASD - Mover\n• Barra de Espaço - Saltar\n• E - Interagir com anomalias",
          lore: "IPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite\n\nAcordas num laboratório abandonado, como uma anomalia mutante, decides ver o exterior.\n\nMas há um problema, és feito de gelo. Chega ao fim antes de derreter. E vê o céu!\n\nUm pequeno jogo feito por mim e 3 amigos para a IPMAIA WinterGame Jam. Tivemos 45h para criar um jogo completo.",
          path: "https://comandante-vicno.itch.io/the-lab-of-bizarre-and-wacky-anomalies",
          team: {
            name: "Três e Meio",
            members: [
              {
                name: "Daniela Monteiro",
                role: "2D and Texture Artist"
              },
              {
                name: "Francisco Gonçalves",
                role: "Programmer"
              },
              {
                name: "Jorge Daniel Alexandre",
                role: "3D Artist"
              },
              {
                name: "Vasco Barradas",
                role: "Audio and VFX"
              }
            ]
          }
        },
        {
          id: 5,
          title: "Icicle Escape",
          thumbnail: "/images/icicle-escape.jpg",
          description: "Participa nesta aventura gelada criada pela equipa Croissants Dudes",
          instructions: "CONTROLOS:\n• A ou Seta Esquerda - Mover para Esquerda\n• D ou Seta Direita - Mover para Direita\n• Espaço - Saltar",
          lore: "Criado durante a IPMAIA Winter Gamejam em 45 horas\nTema: Anomalia\nObjeto obrigatório: Icicle (Estalactite de Gelo)",
          path: "https://pauloricardorodrigues.itch.io/icicle-escape",
          team: {
            name: "Croissants Dudes",
            members: [
              {
                name: "Duarte Santos",
                role: "UX, 2D Artist"
              },
              {
                name: "Francisco Sarmento",
                role: "3D Artist, Animator"
              },
              {
                name: "Paulo Rodrigues",
                role: "Programmer, Animator"
              }
            ]
          }
        },
        {
          id: 6,
          title: "Arctic Escape",
          thumbnail: "/images/arctic-escape.png",
          description: "Uma aventura gelada criada pela equipa WD",
          instructions: "CONTROLOS:\n• Andar - A / D\n• Correr - LShift + A / Shift + D\n• Disparar Arma - F\n• Saltar - Espaço\n• Saltar e agarrar ao teto - Shift + Espaço",
          lore: "IPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite\n\nNum mundo gelado, Luna, uma jovem aventureira, descobre um segredo antigo: a capacidade de inverter a gravidade e poder andar no teto da mesma forma que anda no chão. Perdida entre a imensidão gelada e perigos ocultos, Luna precisa superar desafios e derrotar criaturas sombrias para chegar ao próximo iglu e continuar sua jornada.\n\nInimigos tentam bloquear sua passagem, enquanto seu caminho está repleto de ameaças à sua vida. Com reflexos rápidos e estratégias, Luna deve alternar entre o chão e o teto para escapar de armadilhas, atacar inimigos no momento certo e avançar por este mundo congelado.\n\nApenas os mais habilidosos conseguirão dominar a arte da inversão e levar Luna ao seu destino final. Será que você conseguirá superar os perigos do gelo e desvendar o mistério que assombra essas terras?",
          path: "https://claudiopinheiro.pt/games/arcticescape/index.html",
          team: {
            name: "WD",
            members: [
              {
                name: "Mariana Cardoso",
                role: "Artista, Level Design"
              },
              {
                name: "Claudio Pinheiro",
                role: "Programador"
              }
            ]
          }
        },
        {
          id: 7,
          title: "Inverse Protocol",
          thumbnail: "/images/inverse-protocol.png",
          description: "Uma experiência única criada pela equipa Gamer Slug",
          instructions: "CONTROLOS:\n• Movimento - WASD\n• Saltar - Espaço\n• Interagir - E",
          lore: "IPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite",
          path: "https://joaoosorio.itch.io/inverse-protocol",
          team: {
            name: "Gamer Slug",
            members: [
              {
                name: "João Osório",
                role: "Developer"
              }
            ]
          }
        },
        {
          id: 8,
          title: "Ice Break",
          thumbnail: "/images/ice-break.png",
          description: "Uma experiência única criada pela equipa HUHGames",
          instructions: "CONTROLOS:\n• Movimento - WASD\n• Saltar - Espaço\n• Interagir - E",
          lore: "IPMAIA Winter Gamejam - 45hrs Duration\nTema: Anomalia\nObjeto obrigatório: Ice Stalactite",
          path: "https://catotaman.itch.io/icebreak",
          team: {
            name: "HUHGames",
            members: [
              {
                name: "Marco Rodrigues",
                role: "Programador"
              },
              {
                name: "Alexandre Silva",
                role: "Programador"
              },
              {
                name: "Madalena Jacinto",
                role: "Designer / Animadora"
              },
              {
                name: "João d'Araujo",
                role: "Artista"
              }
            ]
          }
        }
      ]
    }
  }
};

async function migrateFromFrontend() {
    try {
        console.log('🚀 Starting migration from frontend data...');
        
        // Tables should already exist from smart-migrate system
        console.log('🗄️ Database tables should already exist from migrations');
        
        // Check if data already exists (to avoid wiping admin changes)
        const existingDataCheck = await pool.query('SELECT COUNT(*) FROM game_jams');
        const existingCount = parseInt(existingDataCheck.rows[0].count);
        
        if (existingCount > 0) {
            console.log('⏭️ Skipping frontend data migration - data already exists in database');
            console.log(`   Found ${existingCount} game jam(s) in database`);
            console.log('   To force re-import, manually clear the game_jams table');
            return;
        }
        
        console.log('📦 No existing data found - importing initial data...');
        
        // Import each year and season
        for (const [year, seasons] of Object.entries(frontendData)) {
            for (const [season, jamData] of Object.entries(seasons)) {
                console.log(`\n📅 Migrating ${jamData.name} (${season} ${year})...`);
                
                // Parse dates from the Portuguese format "14-16 Fevereiro 2025"
                const dateStr = jamData.date; // "14-16 Fevereiro 2025"
                const startDate = new Date('2025-02-14'); // Convert to proper date
                const endDate = new Date('2025-02-16');
                
                // Create the game jam with all available data
                const gameJamQuery = `
                    INSERT INTO game_jams (
                        name, theme, description, start_date, end_date,
                        registration_start_date, registration_end_date, 
                        registration_url, rules_pdf_url, is_active, banner_image_url,
                        created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
                    RETURNING *
                `;
                
                const description = `A edição de ${year} do IPMAIA ${jamData.name} reuniu ${jamData.participants} participantes formando ${jamData.teams} equipas para uma intensa maratona de desenvolvimento de jogos de ${jamData.duration}. O tema "${jamData.theme}" e o objeto obrigatório "${jamData.requiredObject}" inspiraram diversas interpretações criativas e conceitos de jogo únicos.`;
                
                const gameJamValues = [
                    jamData.name,                    // name
                    jamData.theme,                   // theme  
                    description,                     // description
                    startDate,                       // start_date
                    endDate,                         // end_date
                    null,                           // registration_start_date
                    null,                           // registration_end_date
                    null,                           // registration_url
                    '/WinterJam_Rulebook.pdf',      // rules_pdf_url
                    false,                          // is_active (set to false by default)
                    jamData.banner                  // banner_image_url
                ];
                
                const gameJamResult = await pool.query(gameJamQuery, gameJamValues);
                const gameJam = gameJamResult.rows[0];
                
                console.log(`✅ Created game jam: ${gameJam.name} (ID: ${gameJam.id})`);
                
                // Import all games for this jam
                for (const gameData of jamData.games) {
                    const teamMembers = gameData.team.members.map(member => ({
                        name: member.name,
                        role: member.role,
                        portfolio: member.portfolio || null
                    }));
                    
                    const gameQuery = `
                        INSERT INTO games (
                            game_jam_id, title, description, team_name, team_members,
                            github_url, itch_url, screenshot_urls, tags, is_featured,
                            created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                        RETURNING *
                    `;
                    
                    // Determine if this game should be featured (top 3)
                    const isFeatured = gameData.ranking && gameData.ranking <= 3;
                    
                    // Create tags from various data points
                    const tags = [
                        jamData.theme,
                        `${season}_${year}`,
                        gameData.ranking ? `rank_${gameData.ranking}` : 'participant'
                    ];
                    
                    const gameValues = [
                        gameJam.id,                         // game_jam_id
                        gameData.title,                     // title
                        `${gameData.description}\n\nInstruções:\n${gameData.instructions || 'N/A'}\n\nSobre o Jogo:\n${gameData.lore || 'N/A'}`, // description (combining all text)
                        gameData.team.name,                 // team_name  
                        JSON.stringify(teamMembers),        // team_members
                        null,                               // github_url (not available in frontend data)
                        gameData.path,                      // itch_url
                        JSON.stringify([gameData.thumbnail]), // screenshot_urls
                        JSON.stringify(tags),               // tags
                        isFeatured                          // is_featured
                    ];
                    
                    const gameResult = await pool.query(gameQuery, gameValues);
                    const game = gameResult.rows[0];
                    
                    console.log(`  🎮 Added game: ${game.title} by ${game.team_name}${gameData.ranking ? ` (Rank #${gameData.ranking})` : ''}`);
                }
                
                console.log(`✅ Migrated ${jamData.games.length} games for ${jamData.name}`);
            }
        }
        
        // Summary
        const totalJamsResult = await pool.query('SELECT COUNT(*) FROM game_jams');
        const totalGamesResult = await pool.query('SELECT COUNT(*) FROM games');
        const totalJams = parseInt(totalJamsResult.rows[0].count);
        const totalGames = parseInt(totalGamesResult.rows[0].count);
        
        console.log('\n🎉 Migration completed successfully!');
        console.log(`📊 Summary: ${totalJams} game jam(s), ${totalGames} game(s)`);
        
        // Show detailed results
        console.log('\n=== MIGRATED DATA ===');
        const jamsResult = await pool.query(`
            SELECT gj.*, COUNT(g.id) as game_count 
            FROM game_jams gj 
            LEFT JOIN games g ON gj.id = g.game_jam_id 
            GROUP BY gj.id 
            ORDER BY gj.start_date DESC
        `);
        
        for (const jam of jamsResult.rows) {
            console.log(`\n🏆 ${jam.name}`);
            console.log(`   Theme: ${jam.theme}`);
            console.log(`   Date: ${jam.start_date.toDateString()} - ${jam.end_date.toDateString()}`);
            console.log(`   Games: ${jam.game_count}`);
            
            // Show top games for this jam
            const gamesResult = await pool.query(`
                SELECT title, team_name, is_featured 
                FROM games 
                WHERE game_jam_id = $1 
                ORDER BY is_featured DESC, title ASC
            `, [jam.id]);
            
            gamesResult.rows.forEach((game, index) => {
                const icon = game.is_featured ? '🏆' : '🎮';
                console.log(`     ${icon} ${game.title} by ${game.team_name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
        process.exit(0);
    }
}

migrateFromFrontend();