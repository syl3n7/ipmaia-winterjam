import { useState, useEffect } from 'react';

export function useFrontPageSettings() {
  const [frontPageSettings, setFrontPageSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFrontPageSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/frontpage/settings`);
        if (!response.ok) throw new Error('Failed to fetch');
        const settings = await response.json();
        setFrontPageSettings(settings);
      } catch (error) {
        // Fallback settings
        setFrontPageSettings({
          button_before_start_text: 'Inscrever Agora',
          button_before_start_url: '/enlist-now',
          button_during_event_text: 'Ver Regras',
          button_during_event_url: '/rules',
          button_after_event_text: 'Avaliação a Decorrer - Ver Jogos Submetidos',
          button_after_event_url: '/archive/2025/winter',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrontPageSettings();
  }, []);

  return { frontPageSettings, isLoading };
}