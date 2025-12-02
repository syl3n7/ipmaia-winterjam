import { useState, useEffect } from 'react';

export function useLatestArchive() {
  const [latestArchiveUrl, setLatestArchiveUrl] = useState('/archive');

  useEffect(() => {
    const fetchLatestArchive = async () => {
      try {
        const { gameJamApi } = await import('../utils/api');
        const allGameJams = await gameJamApi.getAll();
        const inactiveJams = allGameJams.filter(jam => !jam.is_active);
        if (inactiveJams.length > 0) {
          // Sort by end_date descending
          inactiveJams.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
          const latest = inactiveJams[0];
          setLatestArchiveUrl(`/archive/${latest.id}`);
        }
      } catch (error) {
        // Keep default
      }
    };

    fetchLatestArchive();
  }, []);

  return latestArchiveUrl;
}