import { gameJams } from '../../../data/gameJamData';
import { notFound, redirect } from 'next/navigation';

// Generate static params for all available years
export function generateStaticParams() {
  return Object.keys(gameJams).map((year) => ({
    year: year,
  }));
}

export default async function YearIndexPage({ params }) {
  const { year } = await params;
  
  // Check if the year exists
  if (!gameJams[year]) {
    notFound();
  }
  
  // Get the most recent season for this year
  const seasons = Object.keys(gameJams[year]);
  const latestSeason = seasons[0]; // Assuming seasons are ordered with most recent first
  
  // Use Next.js redirect instead of useRouter
  if (latestSeason) {
    redirect(`/archive/${year}/${latestSeason}`);
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecionando...</h1>
      </div>
    </div>
  );
}