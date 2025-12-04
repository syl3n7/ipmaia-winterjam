'use client';

import React, { useState } from 'react';
import Background from "./Background";
import { useBackground } from "../contexts/BackgroundContext";

const ResponsiveForm = () => {
  const { bannerImage } = useBackground();
  const [formData, setFormData] = useState({
    teamName: '',
    teamSize: '',
    teamMembers: '',
    email: '',
    phone: '',
    institution: '',
    fullAttendance: '',
    previousJam: '',
    equipmentNeeded: [],
    howHeard: '',
    dinnerAttendance: '',
    fridayDinner: [],
    allergies: '',
    allergiesDetails: '',
    diet: '',
    photoConsent: '',
    rulesAccepted: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentValues = prev[fieldName] || [];
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, value] };
      } else {
        return { ...prev, [fieldName]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission for dev environment
    console.log('Form data (dev mode):', formData);
    alert('Formulário submetido! (modo de desenvolvimento - dados não foram guardados)');
  };

  return (
    <div className="w-full min-h-screen relative">
      <Background
        imageUrl={bannerImage}
        fallbackContent={
          <div className="text-gray-500 text-center">
            <p>Não foi possível carregar a imagem de fundo</p>
          </div>
        }
      />
      
      <div className="relative z-10 w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 text-gray-900">
              Registo de Participação
            </h1>
            <p className="text-center text-gray-600 mb-8">WinterJam 2025</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Equipa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome da sua equipa"
                />
              </div>

              {/* Team Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Elementos da Equipa <span className="text-red-500">*</span>
                </label>
                <select
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="2">2 Elementos</option>
                  <option value="3">3 Elementos</option>
                  <option value="4">4 Elementos</option>
                </select>
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome dos Membros da Equipa <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome de todos os membros (separados por vírgulas)"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto Principal (Líder do Grupo) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="exemplo@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telemóvel de Contacto (Opcional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+351 XXX XXX XXX"
                />
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instituição / Curso (Se Aplicável)
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome da instituição e curso"
                />
              </div>

              {/* Full Attendance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  A equipa vai estar presente durante todo o evento? <span className="text-red-500">*</span>
                </label>
                <select
                  name="fullAttendance"
                  value={formData.fullAttendance}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não, apenas parte do evento">Não, apenas parte do evento</option>
                  <option value="Ainda não temos a certeza">Ainda não temos a certeza</option>
                </select>
              </div>

              {/* Previous Jam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Já participaram anteriormente em alguma Game Jam? <span className="text-red-500">*</span>
                </label>
                <select
                  name="previousJam"
                  value={formData.previousJam}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Equipment Needed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vão precisar de requisitar equipamento?
                </label>
                <div className="space-y-2">
                  {['Extensões', 'Mesas digitais', 'Pcs'].map(item => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        value={item}
                        checked={formData.equipmentNeeded.includes(item)}
                        onChange={(e) => handleCheckboxChange(e, 'equipmentNeeded')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* How Heard */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como souberam do evento?
                </label>
                <input
                  type="text"
                  name="howHeard"
                  value={formData.howHeard}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Redes sociais, amigos, escola..."
                />
              </div>

              {/* Dinner Attendance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  A equipa vai comparecer aos 2 jantares de sexta e sábado? <span className="text-red-500">*</span>
                </label>
                <select
                  name="dinnerAttendance"
                  value={formData.dinnerAttendance}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Apenas sábado">Apenas sábado</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Friday Dinner Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opção do Jantar de Sexta
                </label>
                <div className="space-y-2">
                  {[
                    'Arroz de Pato',
                    'Lasanha de Frango',
                    'Bacalhau com Natas',
                    'Tagliatelli com Ragout de Vitela Cremoso (massa com carne)',
                    'Não pretendo jantar sexta'
                  ].map(item => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        value={item}
                        checked={formData.fridayDinner.includes(item)}
                        onChange={(e) => handleCheckboxChange(e, 'fridayDinner')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algum membro da Equipa tem alergias ou restrições alimentares que devamos conhecer? <span className="text-red-500">*</span>
                </label>
                <select
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Allergies Details */}
              {formData.allergies === 'Sim' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especificar quais
                  </label>
                  <textarea
                    name="allergiesDetails"
                    value={formData.allergiesDetails}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva as alergias ou restrições alimentares"
                  />
                </div>
              )}

              {/* Diet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algum membro segue uma dieta específica?
                </label>
                <input
                  type="text"
                  name="diet"
                  value={formData.diet}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Vegetariana, Vegana, etc."
                />
              </div>

              {/* Photo Consent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autorizam o uso de fotos e vídeos do evento onde a equipa possa aparecer, para fins de divulgação promocional do evento? <span className="text-red-500">*</span>
                </label>
                <select
                  name="photoConsent"
                  value={formData.photoConsent}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Rules Accepted */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="rulesAccepted"
                    checked={formData.rulesAccepted === 'Sim'}
                    onChange={(e) => setFormData(prev => ({ ...prev, rulesAccepted: e.target.checked ? 'Sim' : '' }))}
                    required
                    className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Confirmam que leram e aceitaram o regulamento e regras da WinterJam IPMAIA <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 shadow-lg"
                >
                  Submeter Inscrição
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                * Campos obrigatórios | Modo de desenvolvimento - dados não serão guardados
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveForm;