import { getGameJam, gameJams } from "../../../../data/gameJamData";
import { notFound } from 'next/navigation';
import GameJamClientPage from './GameJamClientPage';

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

export default async function GameJamPage({ params }) {
  const { year, season } = await params;
  const jamData = getGameJam(year, season);
  
  // If jam data doesn't exist, show 404
  if (!jamData) {
    notFound();
  }

  // Pass data to client component
  return <GameJamClientPage jamData={jamData} params={{ year, season }} />;
}
