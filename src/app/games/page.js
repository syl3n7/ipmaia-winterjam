'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

// This would be replaced with your actual games data
const games = [
  {
    id: 1,
    title: "Game Name",
    thumbnail: "/games/game1/thumbnail.png",
    description: "Short description of the game",
    instructions: "How to play the game",
    lore: "Game's story or background",
    path: "/games/game1/index.html"
  },
  // Add more games here
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

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
              <p className="text-gray-700">{game.instructions}</p>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">História</h3>
              <p className="text-gray-700">{game.lore}</p>
            </section>
            
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Jogos Submetidos</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div 
            key={game.id}
            className="bg-black/50 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform cursor-pointer"
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

      {selectedGame && (
        <GameModal 
          game={selectedGame} 
          onClose={() => setSelectedGame(null)} 
        />
      )}
    </div>
  );
}