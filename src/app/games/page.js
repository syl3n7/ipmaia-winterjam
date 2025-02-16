'use client';
import { useState } from 'react';
import { X, Trophy } from 'lucide-react';

const games = [
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
    path: "https://phoost.itch.io/eversleep",
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
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Add ranking badge component
  const RankingBadge = ({ ranking }) => {
    const badgeStyles = {
      1: 'bg-gradient-to-r from-yellow-400 to-amber-300 text-black',
      2: 'bg-gradient-to-r from-gray-300 to-gray-200 text-black',
      3: 'bg-gradient-to-r from-amber-700 to-amber-600 text-white'
    };

    return (
      <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full font-bold ${badgeStyles[ranking]} shadow-lg`}>
        {ranking}º Lugar
      </div>
    );
  };

  const GameModal = ({ game, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{game.title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <img 
            src={game.thumbnail} 
            alt={game.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-lg mb-2">Descrição</h3>
              <p className="text-gray-700">{game.description}</p>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">Instruções</h3>
              <p className="text-gray-700 whitespace-pre-line">{game.instructions}</p>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">Sobre o Jogo</h3>
              <p className="text-gray-700 whitespace-pre-line">{game.lore}</p>
            </section>

            {game.team && (
              <section>
                <h3 className="font-bold text-lg mb-2">Equipa - {game.team.name}</h3>
                <div className="space-y-2">
                  {game.team.members.map((member, index) => (
                    <p key={index} className="text-gray-700">
                      <span className="font-medium">{member.name}</span> - {member.role}
                    </p>
                  ))}
                </div>
              </section>
            )}
            
            <a
              href={game.path}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Jogar Agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-orange-950 via-gray-900 to-orange-950 opacity-95 z-[-1]" />
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] z-[-1]" />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section with adjusted text colors for better contrast */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">
            IPMAIA Winterjam
          </h1>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xl text-gray-200">
              <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">45 Horas</span>
              <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">Tema: Anomalia</span>
              <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">Ice Stalactite</span>
            </div>
            
            <p className="max-w-2xl mx-auto text-orange-100/80 text-lg">
              Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em apenas 45 horas.
            </p>
          </div>
        </div>

        {/* Rest of the existing content */}
        <h1 className="text-3xl font-bold mb-8 text-white">Jogos Submetidos</h1>
        
        {/* Winners Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-orange-400">Vencedores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games
              .filter(game => game.ranking)
              .sort((a, b) => a.ranking - b.ranking)
              .map((game) => (
                <div 
                  key={game.id}
                  className={`bg-black/50 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform cursor-pointer relative
                    ${game.ranking === 1 ? 'ring-4 ring-yellow-400 shadow-yellow-400/20 shadow-lg' : 
                      game.ranking === 2 ? 'ring-4 ring-gray-300 shadow-gray-300/20 shadow-lg' : 
                      'ring-4 ring-amber-700 shadow-amber-700/20 shadow-lg'}`}
                  onClick={() => setSelectedGame(game)}
                >
                  <RankingBadge ranking={game.ranking} />
                  <div className="absolute top-4 right-4 z-10">
                    <Trophy 
                      size={24} 
                      className={game.ranking === 1 ? 'text-yellow-400' : 
                        game.ranking === 2 ? 'text-gray-300' : 'text-amber-700'} 
                    />
                  </div>
                  <img 
                    src={game.thumbnail} 
                    alt={game.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-white mb-2">{game.title}</h2>
                    <p className="text-gray-300 line-clamp-2">{game.description}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Other Submissions */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Outras Submissões</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games
              .filter(game => !game.ranking)
              .map((game) => (
                <div 
                  key={game.id}
                  className="bg-black/50 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform cursor-pointer relative hover:ring-2 hover:ring-orange-400"
                  onClick={() => setSelectedGame(game)}
                >
                  <img 
                    src={game.thumbnail} 
                    alt={game.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-white mb-2">{game.title}</h2>
                    <p className="text-gray-300 line-clamp-2">{game.description}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Keep existing GameModal component */}
        {selectedGame && (
          <GameModal 
            game={selectedGame} 
            onClose={() => setSelectedGame(null)} 
          />
        )}
      </div>
    </>
  );
}