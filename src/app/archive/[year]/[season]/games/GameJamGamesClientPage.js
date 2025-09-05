'use client';
import { useState } from 'react';
import { X, Trophy } from 'lucide-react';
import Background from "../../../../../components/Background";
import Link from "next/link";

export default function GameJamGamesClientPage({ jamData, params }) {
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
            className="w-full h-64 object-cover rounded-lg"
          />
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Descrição</h3>
              <p className="text-gray-700">{game.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Instruções</h3>
              <p className="text-gray-700 whitespace-pre-line">{game.instructions}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">História</h3>
              <p className="text-gray-700 whitespace-pre-line">{game.lore}</p>
            </div>

            {game.team && (
              <div>
                <h3 className="font-semibold text-lg">Equipa: {game.team.name}</h3>
                <div className="space-y-2">
                  {game.team.members.map((member, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                      {member.portfolio && (
                        <a 
                          href={member.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Portfolio
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <a 
              href={game.path} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Jogar Agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Background />
      
      <div className="relative z-10 pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">{jamData.name} - Todos os Jogos</h1>
            <p className="text-xl text-gray-300 mb-2">Tema: <span className="text-blue-400 font-semibold">{jamData.theme}</span></p>
            <p className="text-lg text-gray-300 mb-2">Objeto Obrigatório: <span className="text-blue-400 font-semibold">{jamData.requiredObject}</span></p>
            <p className="text-lg text-gray-300 mb-6">{jamData.date} • {jamData.duration}</p>
            
            <div className="flex justify-center gap-4 mb-8">
              <Link 
                href={`/archive/${params.year}/${params.season}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Ver Pódio
              </Link>
              <Link 
                href="/archive"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Voltar ao Arquivo
              </Link>
            </div>
          </div>

          {/* All Games Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {games.map((game) => (
                <div 
                  key={game.id}
                  className="relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedGame(game)}
                >
                  {game.ranking && <RankingBadge ranking={game.ranking} />}
                  
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
