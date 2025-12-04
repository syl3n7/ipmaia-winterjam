"use client";

import { useState, useEffect } from 'react';

export default function AdminGameJams() {
  const [gameJams, setGameJams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // basic, dates, content, visibility
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    theme: '',
    description: '',
    is_active: true,
    
    // Dates
    start_date: '',
    end_date: '',
    registration_start_date: '',
    registration_end_date: '',
    
    // URLs
    registration_url: '',
    
    // Homepage content
    introduction: 'Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!',
    prizes_content: '',
    schedule_content: '',
    
    // Schedule datetimes
    reception_datetime: '',
    theme_announcement_datetime: '',
    awards_ceremony_datetime: '',
    evaluation_datetime: '',
    
    // Visibility toggles
    show_theme: true,
    show_description: true,
    show_start_date: true,
    show_end_date: true,
    date_fallback: 'TBD',
    show_registration_dates: true,
    registration_date_fallback: 'TBD',
    show_registration_url: true,
  });

  useEffect(() => {
    fetchGameJams();
  }, []);

  // Auto-generate schedule content from datetime fields
  const generateScheduleContent = () => {
    const formatDateTime = (datetime) => {
      if (!datetime) return null;
      const date = new Date(datetime);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', datetime);
        return null;
      }
      
      const dayName = date.toLocaleDateString('pt-PT', { weekday: 'long' });
      const day = date.getDate();
      const month = date.toLocaleDateString('pt-PT', { month: 'long' });
      const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD for sorting
      return { dayName, day, month, time, dateKey, fullDate: date };
    };

    // Define events with their labels and emojis
    const events = [
      { key: 'reception_datetime', label: '🎉 Receção', description: 'Check-in dos participantes' },
      { key: 'theme_announcement_datetime', label: '🎨 Anúncio do Tema', description: 'Revelação do tema da jam' },
      { key: 'evaluation_datetime', label: '📊 Avaliação dos Projetos', description: 'Júri avalia os jogos submetidos' },
      { key: 'awards_ceremony_datetime', label: '🏆 Cerimónia de Entrega de Prémios', description: 'Anúncio dos vencedores e entrega de prémios' },
    ];

    // Also include start and end dates with special formatting
    const startDate = formData.start_date ? new Date(formData.start_date) : null;
    const endDate = formData.end_date ? new Date(formData.end_date) : null;

    // Group events by date
    const schedule = {};
    
    events.forEach(({ key, label, description }) => {
      if (formData[key]) {
        const dt = formatDateTime(formData[key]);
        if (dt) {
          const dayHeader = `${dt.dayName.charAt(0).toUpperCase() + dt.dayName.slice(1)}, ${dt.day} de ${dt.month}`;
          if (!schedule[dt.dateKey]) {
            schedule[dt.dateKey] = { header: dayHeader, events: [] };
          }
          schedule[dt.dateKey].events.push(`- **${dt.time}** - ${label}  \n  *${description}*`);
        }
      }
    });

    // Add special markers for jam start and end
    if (startDate) {
      const startDt = formatDateTime(startDate.toISOString());
      if (startDt) {
        const dayHeader = `${startDt.dayName.charAt(0).toUpperCase() + startDt.dayName.slice(1)}, ${startDt.day} de ${startDt.month}`;
        if (!schedule[startDt.dateKey]) {
          schedule[startDt.dateKey] = { header: dayHeader, events: [] };
        }
        // Add at the end of the day's events
        schedule[startDt.dateKey].events.push(`- **${startDt.time}** - 🚀 **INÍCIO DA JAM!**  \n  *Começa a contagem das 45 horas*`);
      }
    }

    if (endDate) {
      const endDt = formatDateTime(endDate.toISOString());
      if (endDt) {
        const dayHeader = `${endDt.dayName.charAt(0).toUpperCase() + endDt.dayName.slice(1)}, ${endDt.day} de ${endDt.month}`;
        if (!schedule[endDt.dateKey]) {
          schedule[endDt.dateKey] = { header: dayHeader, events: [] };
        }
        // Add at the beginning of the day's events
        schedule[endDt.dateKey].events.unshift(`- **${endDt.time}** - ⏰ **FIM DA JAM!**  \n  *Submissão obrigatória dos projetos*`);
      }
    }

    // Sort by date and build the markdown
    let scheduleText = '';
    const sortedDates = Object.keys(schedule).sort();
    
    sortedDates.forEach((dateKey, index) => {
      const { header, events } = schedule[dateKey];
      scheduleText += `**📅 ${header}:**\n\n${events.join('\n\n')}\n`;
      if (index < sortedDates.length - 1) {
        scheduleText += '\n---\n\n'; // Separator between days
      }
    });

    return scheduleText.trim() || ''; 
  };

  const handleGenerateSchedule = () => {
    const generated = generateScheduleContent();
    if (generated) {
      setFormData({ ...formData, schedule_content: generated });
    } else {
      alert('⚠️ Preencha pelo menos uma data/hora de evento para gerar o conteúdo do horário.');
    }
  };

  const fetchGameJams = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setGameJams(data);
      }
    } catch (error) {
      console.error('Failed to fetch game jams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams/${editing}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams`;
      
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchGameJams();
        resetForm();
        alert(editing ? 'Game Jam updated!' : 'Game Jam created!');
      }
    } catch (error) {
      console.error('Failed to save game jam:', error);
      alert('Failed to save game jam');
    }
  };

  const handleEdit = (gameJam) => {
    setEditing(gameJam.id);
    setFormData({
      name: gameJam.name || '',
      theme: gameJam.theme || '',
      description: gameJam.description || '',
      is_active: gameJam.is_active ?? true,
      
      // Format datetime fields for datetime-local input (YYYY-MM-DDTHH:mm)
      start_date: gameJam.start_date?.slice(0, 16) || '',
      end_date: gameJam.end_date?.slice(0, 16) || '',
      registration_start_date: gameJam.registration_start_date?.slice(0, 16) || '',
      registration_end_date: gameJam.registration_end_date?.slice(0, 16) || '',
      
      registration_url: gameJam.registration_url || '',
      
      introduction: gameJam.introduction || 'Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!',
      prizes_content: gameJam.prizes_content || '',
      schedule_content: gameJam.schedule_content || '',
      
      reception_datetime: gameJam.reception_datetime?.slice(0, 16) || '',
      theme_announcement_datetime: gameJam.theme_announcement_datetime?.slice(0, 16) || '',
      awards_ceremony_datetime: gameJam.awards_ceremony_datetime?.slice(0, 16) || '',
      evaluation_datetime: gameJam.evaluation_datetime?.slice(0, 16) || '',
      
      show_theme: gameJam.show_theme ?? true,
      show_description: gameJam.show_description ?? true,
      show_start_date: gameJam.show_start_date ?? true,
      show_end_date: gameJam.show_end_date ?? true,
      date_fallback: gameJam.date_fallback || 'TBD',
      show_registration_dates: gameJam.show_registration_dates ?? true,
      registration_date_fallback: gameJam.registration_date_fallback || 'TBD',
      show_registration_url: gameJam.show_registration_url ?? true,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this game jam?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/gamejams/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        await fetchGameJams();
        alert('Game Jam deleted!');
      }
    } catch (error) {
      console.error('Failed to delete game jam:', error);
      alert('Failed to delete game jam');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      theme: '',
      description: '',
      is_active: true,
      
      start_date: '',
      end_date: '',
      registration_start_date: '',
      registration_end_date: '',
      
      registration_url: '',
      
      introduction: 'Uma game jam onde estudantes de desenvolvimento de jogos e entusiastas se juntam para criar experiências únicas em 45 horas. É um evento presencial no IPMAIA com mentores disponíveis, workshops, e muita colaboração. Todos os níveis de experiência são bem-vindos!',
      prizes_content: '',
      schedule_content: '',
      
      reception_datetime: '',
      theme_announcement_datetime: '',
      awards_ceremony_datetime: '',
      evaluation_datetime: '',
      
      show_theme: true,
      show_description: true,
      show_start_date: true,
      show_end_date: true,
      date_fallback: 'TBD',
      show_registration_dates: true,
      registration_date_fallback: 'TBD',
      show_registration_url: true,
    });
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">🎮 Game Jams Management</h2>
      </div>

      {/* Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          {editing ? 'Edit Game Jam' : 'Create New Game Jam'}
        </h3>
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-gray-700">
          {[
            { id: 'basic', label: '📝 Basic Info' },
            { id: 'dates', label: '📅 Dates & Schedule' },
            { id: 'content', label: '📄 Content & URLs' },
            { id: 'visibility', label: '👁️ Visibility' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name * <span className="text-gray-500 text-xs">(e.g., &quot;Winter Game Jam 2025&quot;)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme <span className="text-gray-500 text-xs">(e.g., &quot;Ancient Civilizations&quot;)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-gray-500 text-xs">(Short description for listings)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-300">Active (Show on website)</label>
              </div>
            </div>
          )}

          {/* Dates & Schedule Tab */}
          {activeTab === 'dates' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Event Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Registration Period</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Registration Opens
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registration_start_date}
                      onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Registration Closes
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registration_end_date}
                      onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Event Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reception Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.reception_datetime}
                      onChange={(e) => setFormData({ ...formData, reception_datetime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme Announcement
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.theme_announcement_datetime}
                      onChange={(e) => setFormData({ ...formData, theme_announcement_datetime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Evaluation Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.evaluation_datetime}
                      onChange={(e) => setFormData({ ...formData, evaluation_datetime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Awards Ceremony
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.awards_ceremony_datetime}
                      onChange={(e) => setFormData({ ...formData, awards_ceremony_datetime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content & URLs Tab */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Introduction Text <span className="text-gray-500 text-xs">(Homepage hero section)</span>
                </label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prizes Content <span className="text-gray-500 text-xs">(Markdown supported)</span>
                </label>
                <textarea
                  value={formData.prizes_content}
                  onChange={(e) => setFormData({ ...formData, prizes_content: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="🥇 1st Place: €500 + Trophy&#10;🥈 2nd Place: €300&#10;🥉 3rd Place: €200"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Schedule Content <span className="text-gray-500 text-xs">(Markdown supported)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSchedule}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                  >
                    ✨ Auto-Generate from Dates
                  </button>
                </div>
                <textarea
                  value={formData.schedule_content}
                  onChange={(e) => setFormData({ ...formData, schedule_content: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                  placeholder="Click 'Auto-Generate' to create schedule from the datetime fields in the Dates & Schedule tab, or write your own markdown..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 Tip: Fill in the schedule times in the &quot;Dates &amp; Schedule&quot; tab, then click &quot;Auto-Generate&quot; to create formatted schedule content automatically.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration URL <span className="text-gray-500 text-xs">(Sign-up link)</span>
                </label>
                <input
                  type="url"
                  value={formData.registration_url}
                  onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://forms.gle/..."
                />
              </div>
              
              <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  💡 <strong>Note:</strong> Rules PDF and Banner Image are managed through their dedicated admin pages (Rules & Front Page sections).
                </p>
              </div>
            </div>
          )}

          {/* Visibility Tab */}
          {activeTab === 'visibility' && (
            <div className="space-y-6">
              <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-300">
                  💡 Control what information is displayed on the public website. Use fallback text when data is not yet available.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <label className="text-sm text-gray-300">Show Theme</label>
                  <input
                    type="checkbox"
                    checked={formData.show_theme}
                    onChange={(e) => setFormData({ ...formData, show_theme: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <label className="text-sm text-gray-300">Show Description</label>
                  <input
                    type="checkbox"
                    checked={formData.show_description}
                    onChange={(e) => setFormData({ ...formData, show_description: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <label className="text-sm text-gray-300">Show Start Date</label>
                  <input
                    type="checkbox"
                    checked={formData.show_start_date}
                    onChange={(e) => setFormData({ ...formData, show_start_date: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <label className="text-sm text-gray-300">Show End Date</label>
                  <input
                    type="checkbox"
                    checked={formData.show_end_date}
                    onChange={(e) => setFormData({ ...formData, show_end_date: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Fallback Text <span className="text-gray-500 text-xs">(When dates are hidden)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.date_fallback}
                    onChange={(e) => setFormData({ ...formData, date_fallback: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <label className="text-sm text-gray-300">Show Registration Dates</label>
                  <input
                    type="checkbox"
                    checked={formData.show_registration_dates}
                    onChange={(e) => setFormData({ ...formData, show_registration_dates: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Date Fallback
                  </label>
                  <input
                    type="text"
                    value={formData.registration_date_fallback}
                    onChange={(e) => setFormData({ ...formData, registration_date_fallback: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <label className="text-sm text-gray-300">Show Registration URL</label>
                  <input
                    type="checkbox"
                    checked={formData.show_registration_url}
                    onChange={(e) => setFormData({ ...formData, show_registration_url: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-300">
                  💡 <strong>Note:</strong> Rules PDF and Banner Image visibility are managed through their respective admin pages (Rules & Front Page sections).
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-semibold"
            >
              {editing ? '💾 Update Game Jam' : '✨ Create Game Jam'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                ✖️ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Theme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Event Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {gameJams.map((jam) => (
                <tr key={jam.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {jam.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {jam.theme ? (
                      <>
                        {jam.show_theme ? (
                          <span className="text-green-400">👁️ {jam.theme}</span>
                        ) : (
                          <span className="text-gray-500">🔒 {jam.theme}</span>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {jam.start_date ? (
                      <>
                        {new Date(jam.start_date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        <span className="text-xs text-gray-400 ml-1">
                          {new Date(jam.start_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          to {new Date(jam.end_date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          <span className="text-gray-400 ml-1">
                            {new Date(jam.end_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                      </>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {jam.registration_start_date ? (
                      <>
                        {new Date(jam.registration_start_date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        <span className="text-xs text-gray-400 ml-1">
                          {new Date(jam.registration_start_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          to {new Date(jam.registration_end_date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          <span className="text-gray-400 ml-1">
                            {new Date(jam.registration_end_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        jam.is_active
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {jam.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {jam.registration_url && (
                      <span className="ml-2 text-xs text-green-400" title="Has registration URL">🔗</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(jam)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(jam.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {gameJams.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No game jams found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
