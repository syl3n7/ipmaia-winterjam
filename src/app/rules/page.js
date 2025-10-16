'use client';

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function Page() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRulesContent() {
      try {
        const response = await fetch('/api/rules/content');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching rules content:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRulesContent();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p>A carregar regras...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p>Erro ao carregar regras.</p>
      </div>
    );
  }

  // Find sections by key
  const sections = {
    conduct: content.find(s => s.section_key === 'conduct')?.content || '',
    guidelines: content.find(s => s.section_key === 'guidelines')?.content || '',
    prizes: content.find(s => s.section_key === 'prizes')?.content || '',
    evaluation: content.find(s => s.section_key === 'evaluation')?.content || '',
    participation: content.find(s => s.section_key === 'participation')?.content || '',
    schedule: content.find(s => s.section_key === 'schedule')?.content || '',
    pdf_url: content.find(s => s.section_key === 'pdf_url')?.content || '/WinterJam_Rulebook.pdf'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Livro de Regras da WinterJam</h1>
        <a 
          href={sections.pdf_url} 
          download 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          <span>Baixar PDF</span>
        </a>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Código de Conduta</h2>
        <div dangerouslySetInnerHTML={{ __html: sections.conduct }} />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. Diretrizes para a Criação de Jogos</h2>
        <div dangerouslySetInnerHTML={{ __html: sections.guidelines }} />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. Prémios</h2>
        <div dangerouslySetInnerHTML={{ __html: sections.prizes }} />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. Critérios de Avaliação</h2>
        <div dangerouslySetInnerHTML={{ __html: sections.evaluation }} />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">5. Regras de Participação</h2>
        <div dangerouslySetInnerHTML={{ __html: sections.participation }} />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">6. Horário do Evento (14 a 16 de fevereiro)</h2>
        <div dangerouslySetInnerHTML={{ __html: sections.schedule }} />
      </section>
    </div>
  );
}