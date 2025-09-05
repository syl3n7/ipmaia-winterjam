'use client';
import { useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { getGameJam, gameJams } from "../../../../data/gameJamData";
import { notFound } from 'next/navigation';
import Background from "../../../../components/Background";
import Link from "next/link";

// Generate static params for all available year/season combinations
export function generateStaticParams() {
  const params = [];
  
  Object.keys(gameJams).forEach(year => {
    Object.keys(gameJams[year]).forEach(season => {
      params.push({
        year: year,
        season: season,
      });
    });
  });
  
  return params;
}

export default function GameJamPage({ params }) {
  const { year, season } = params;
  const jamData = getGameJam(year, season);
  
  // If jam data doesn't exist, show 404
  if (!jamData) {
    notFound();
  }
  
  const [selectedGame, setSelectedGame] = useState(null);
  const games = jamData.games;
  
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
    <main className="min-h-screen">
      <Background
        imageUrl={jamData.banner}
        fallbackContent={
          <div className="text-gray-500 text-center">
            <p>Não foi possível carregar a imagem de fundo</p>
          </div>
        }
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">
            {jamData.name}
          </h1>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xl text-gray-200">
              <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">{jamData.duration}</span>
              <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">Tema: {jamData.theme}</span>
              <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">{jamData.requiredObject}</span>
            </div>
            
            <p className="max-w-2xl mx-auto text-orange-100/80 text-lg">
              Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em apenas {jamData.duration}.
            </p>
          </div>
        </div>

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

        {selectedGame && (
          <GameModal 
            game={selectedGame} 
            onClose={() => setSelectedGame(null)} 
          />
        )}
      </div>
    </main>
  );
}