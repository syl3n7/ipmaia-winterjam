'use client';
import { useState, useEffect } from 'react';
import { X, Trophy, ChevronDown } from 'lucide-react';
import { notFound } from 'next/navigation';
import Background from "../../../components/Background";
import Link from "next/link";

export default function GameJamArchivePage({ params }) {
  const { jamId } = params;
  const [jamData, setJamData] = useState(null);
  const [games, setGames] = useState([]);
  const [showAllGames, setShowAllGames] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerImage, setBannerImage] = useState('/images/IPMAIA_SiteBanner.png');
  
  // Fetch jam data and games
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        
        // Fetch jam details
        const jamResponse = await fetch(`${apiUrl}/public/gamejams/${jamId}`);
        if (!jamResponse.ok) {
          throw new Error('Game jam not found');
        }
        const jam = await jamResponse.json();
        setJamData(jam);
        
        // Set banner if available
        if (jam.banner_image_url) {
          setBannerImage(jam.banner_image_url);
        }
        
        // Fetch games for this jam
        const gamesResponse = await fetch(`${apiUrl}/public/gamejams/${jamId}/games`);
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          
          // Process games to extract ranking from tags
          const processedGames = gamesData.map(game => {
            let tags = [];
            try {
              tags = typeof game.tags === 'string' ? JSON.parse(game.tags) : game.tags || [];
            } catch (e) {
              console.warn('Error parsing tags for game:', game.id);
            }
            
            // Determine ranking from tags
            let ranking = null;
            if (tags.includes('rank_1')) ranking = 1;
            else if (tags.includes('rank_2')) ranking = 2;
            else if (tags.includes('rank_3')) ranking = 3;
            
            // Parse team members
            let teamMembers = [];
            try {
              teamMembers = typeof game.team_members === 'string' 
                ? JSON.parse(game.team_members) 
                : game.team_members || [];
            } catch (e) {
              console.warn('Error parsing team_members for game:', game.id);
            }
            
            // Parse screenshot URLs
            let screenshotUrls = [];
            try {
              screenshotUrls = typeof game.screenshot_urls === 'string'
                ? JSON.parse(game.screenshot_urls)
                : game.screenshot_urls || [];
            } catch (e) {
              console.warn('Error parsing screenshot_urls for game:', game.id);
            }
            
            return {
              ...game,
              ranking,
              tags,
              team_members: teamMembers,
              screenshot_urls: screenshotUrls,
              thumbnail: game.thumbnail_url || screenshotUrls[0] || '/images/placeholder-game.png'
            };
          });
          
          setGames(processedGames);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching archive data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jamId]);
  
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Background imageUrl={bannerImage} />
        <div className="relative z-10 text-white text-2xl">A carregar...</div>
      </main>
    );
  }
  
  if (error || !jamData) {
    notFound();
  }
  
  // Separate winners and other games
  const winners = games.filter(game => game.ranking).sort((a, b) => a.ranking - b.ranking);
  const otherGames = games.filter(game => !game.ranking);
  
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
            {game.description && (
              <section>
                <h3 className="font-bold text-lg mb-2">Descrição</h3>
                <p className="text-gray-700">{game.description}</p>
              </section>
            )}
            
            {game.instructions && (
              <section>
                <h3 className="font-bold text-lg mb-2">Instruções</h3>
                <p className="text-gray-700 whitespace-pre-line">{game.instructions}</p>
              </section>
            )}
            
            {game.lore && (
              <section>
                <h3 className="font-bold text-lg mb-2">Sobre o Jogo</h3>
                <p className="text-gray-700 whitespace-pre-line">{game.lore}</p>
              </section>
            )}

            {game.team_name && (
              <section>
                <h3 className="font-bold text-lg mb-2">Equipa - {game.team_name}</h3>
                {game.team_members && game.team_members.length > 0 && (
                  <div className="space-y-2">
                    {game.team_members.map((member, index) => (
                      <p key={index} className="text-gray-700">
                        <span className="font-medium">{member.name || member}</span>
                        {member.role && ` - ${member.role}`}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            )}
            
            {game.itch_url && (
              <a
                href={game.itch_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Jogar Agora no Itch.io
              </a>
            )}
            
            {game.github_url && (
              <a
                href={game.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-800 text-white text-center py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Ver Código no GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      <Background
        imageUrl={bannerImage}
        fallbackContent={
          <div className="text-gray-500 text-center">
            <p>Não foi possível carregar a imagem de fundo</p>
          </div>
        }
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section with blurred background */}
        <div className="mb-16 text-center space-y-6 bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">
            {jamData.name === 'WinterJam 2025' ? '1ª edição WinterJam 2025' : jamData.name}
          </h1>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xl text-gray-200">
              {jamData.start_date && (
                <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">
                  {new Date(jamData.start_date).toLocaleDateString('pt-PT')}
                </span>
              )}
              {jamData.theme && (
                <span className="px-4 py-2 bg-orange-950/50 rounded-full backdrop-blur-sm">
                  Tema: {jamData.theme}
                </span>
              )}
            </div>
            
            {jamData.description && (
              <p className="max-w-2xl mx-auto text-orange-100/90 text-lg leading-relaxed">
                {jamData.description}
              </p>
            )}
          </div>
        </div>

        {/* Winners Section */}
        {winners.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-orange-400">🏆 Vencedores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((game) => (
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
                    {game.team_name && (
                      <p className="text-orange-300 text-sm mb-2">por {game.team_name}</p>
                    )}
                    {game.description && (
                      <p className="text-gray-300 line-clamp-2">{game.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Submissions */}
        {otherGames.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                {winners.length > 0 ? 'Outras Submissões' : 'Jogos Submetidos'}
              </h2>
              {!showAllGames && otherGames.length > 6 && (
                <button
                  onClick={() => setShowAllGames(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Ver Todos ({otherGames.length})
                  <ChevronDown size={20} />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showAllGames ? otherGames : otherGames.slice(0, 6)).map((game) => (
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
                    {game.team_name && (
                      <p className="text-orange-300 text-sm mb-2">por {game.team_name}</p>
                    )}
                    {game.description && (
                      <p className="text-gray-300 line-clamp-2">{game.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {showAllGames && otherGames.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllGames(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Ver Menos
                </button>
              </div>
            )}
          </div>
        )}
        
        {games.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400">Nenhum jogo encontrado para esta Game Jam.</p>
          </div>
        )}
      </div>

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </main>
  );
}
