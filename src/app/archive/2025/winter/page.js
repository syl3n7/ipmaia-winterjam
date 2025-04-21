import Link from "next/link";
import Background from "../../../../components/Background";

export default function WinterJam2025() {
  // Reusing data from your games page
  const games = [
    {
      id: 1,
      title: "Interdimensional Cat",
      thumbnail: "/images/interdimensional-cat.png",
      description: "1º LUGAR 🥇 - Team MALU",
      path: "https://makimakesgames.itch.io/interdimensional-cat",
      ranking: 1,
    },
    {
      id: 2,
      title: "Ever Sleep",
      thumbnail: "/images/eversleep.png",
      description: "2º LUGAR 🥈 - Lata D'Atum",
      path: "https://phoost.itch.io/eversleep-build",
      ranking: 2,
    },
    {
      id: 3,
      title: "Deep Anomaly",
      thumbnail: "/images/deep-anomaly.png",
      description: "3º LUGAR 🥉 - Vatanupe",
      path: "https://kofkof.itch.io/deep-anomaly",
      ranking: 3,
    },
  ];

  const eventInfo = {
    year: 2025,
    season: "Winter",
    title: "WinterJam 2025",
    theme: "Anomalia",
    requiredObject: "Ice Stalactite",
    date: "14-16 Fevereiro 2025",
    participants: 32,
    teams: 8,
    banner: "/images/IPMAIA_SiteBanner.png",
  };

  return (
    <main className="min-h-screen">
      <Background
        imageUrl={eventInfo.banner}
        fallbackContent={
          <div className="text-gray-500 text-center">
            <p>Não foi possível carregar a imagem de fundo</p>
          </div>
        }
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 text-white mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{eventInfo.title}</h1>
          <h2 className="text-2xl text-orange-400 mb-6">Tema: {eventInfo.theme}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="col-span-2">
              <p className="text-gray-200 mb-4">
                A edição de 2025 do IPMAIA WinterJam reuniu {eventInfo.participants} participantes 
                formando {eventInfo.teams} equipas para uma intensa maratona de desenvolvimento de jogos de 45 horas. 
                O tema "{eventInfo.theme}" e o objeto obrigatório "{eventInfo.requiredObject}" inspiraram 
                diversas interpretações criativas e conceitos de jogo únicos.
              </p>
              <p className="text-gray-200">
                Esta game jam destacou o talento e criatividade da comunidade de desenvolvimento de jogos do IPMAIA,
                resultando em {games.length} jogos completos que demonstraram habilidade técnica, 
                visão artística e design inovador.
              </p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-400">Detalhes do Evento</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Tema</span>
                  <span className="font-medium text-white">{eventInfo.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Objeto Obrigatório</span>
                  <span className="font-medium text-white">{eventInfo.requiredObject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Duração</span>
                  <span className="font-medium text-white">45 Horas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Participantes</span>
                  <span className="font-medium text-white">{eventInfo.participants} Alunos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Equipas</span>
                  <span className="font-medium text-white">{eventInfo.teams} Equipas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Data</span>
                  <span className="font-medium text-white">{eventInfo.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Winners Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-orange-400">Vencedores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games
                .filter(game => game.ranking)
                .sort((a, b) => a.ranking - b.ranking)
                .map((game) => (
                  <a 
                    key={game.id}
                    href={game.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform cursor-pointer relative border-2 border-transparent hover:border-orange-500"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      {game.ranking === 1 && <span className="text-2xl">🥇</span>}
                      {game.ranking === 2 && <span className="text-2xl">🥈</span>}
                      {game.ranking === 3 && <span className="text-2xl">🥉</span>}
                    </div>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={game.thumbnail} 
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                      <p className="text-gray-300">{game.description}</p>
                    </div>
                  </a>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/archive/2025/winter/games" 
              className="inline-block bg-orange-500 px-8 py-3 text-white rounded-lg hover:bg-orange-600 transition-colors transform hover:scale-105"
            >
              Ver Todos os Jogos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}