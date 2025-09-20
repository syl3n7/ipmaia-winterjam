'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import Background from "../../../../../components/Background";
import { ArrowLeft, ExternalLink, Github, Users } from 'lucide-react';

export default function AllGames2025() {
  const [games, setGames] = useState([]);
  const [gameJam, setGameJam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { gameJamApi, archiveApi, processGameData, sortGames } = await import('../../../../../utils/api');
        
        // Fetch specific game jam for 2025 winter (not current)
        const specificGameJam = await archiveApi.getGameJamByYearAndSeason(2025, 'winter');
        setGameJam(specificGameJam);
        
        // Fetch games for this specific game jam
        const gamesData = await gameJamApi.getGames(specificGameJam.id);
        
        // Process and sort games data
        const processedGames = gamesData.map(processGameData);
        const sortedGames = sortGames(processedGames);
        
        setGames(sortedGames);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-xl">A carregar todos os jogos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-red-500 text-xl">Erro ao carregar: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Background
        imageUrl="/images/IPMAIA_SiteBanner.png"
        fallbackContent={
          <div className="text-gray-500 text-center">
            <p>Não foi possível carregar a imagem de fundo</p>
          </div>
        }
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 text-white">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/archive/2025/winter" 
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar ao Resumo
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {gameJam ? gameJam.name : 'WinterJam 2025'} - Todos os Jogos
          </h1>
          
          {gameJam && (
            <div className="mb-8">
              <p className="text-orange-400 text-xl mb-2">Tema: {gameJam.theme}</p>
              {gameJam.required_object && (
                <p className="text-gray-300">Objeto Obrigatório: {gameJam.required_object}</p>
              )}
            </div>
          )}

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <div 
                key={game.id} 
                className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-orange-500"
              >
                {/* Game Thumbnail */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={game.thumbnail} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src, 'for game:', game);
                      e.target.src = '/images/placeholder-game.png'; // Fallback image
                    }}
                  />
                  {game.ranking && (
                    <div className="absolute top-4 right-4 z-10">
                      {game.ranking === 1 && <span className="text-3xl">🥇</span>}
                      {game.ranking === 2 && <span className="text-3xl">🥈</span>}
                      {game.ranking === 3 && <span className="text-3xl">🥉</span>}
                    </div>
                  )}
                  {game.is_featured && !game.ranking && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold">
                        ⭐ DESTAQUE
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Game Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                  
                  {/* Team Info */}
                  <div className="flex items-center gap-2 mb-3 text-gray-300">
                    <Users size={16} />
                    <span>{game.team_name}</span>
                  </div>
                  
                  {/* Team Members */}
                  {game.team_members && game.team_members.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-1">Equipa:</p>
                      <div className="text-sm text-gray-300">
                        {game.team_members.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {/* Description */}
                  {game.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {game.description}
                    </p>
                  )}
                  
                  {/* Links */}
                  <div className="flex gap-2">
                    {game.itch_url && (
                      <a 
                        href={game.itch_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        <ExternalLink size={14} />
                        Jogar
                      </a>
                    )}
                    
                    {game.github_url && (
                      <a 
                        href={game.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        <Github size={14} />
                        Código
                      </a>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {game.tags && game.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {game.tags.filter(tag => !tag.startsWith('rank_')).map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {games.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhum jogo encontrado para este evento.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}