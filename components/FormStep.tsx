import React, { useState } from 'react';
import { UserData } from '../types';

interface FormStepProps {
  onSubmit: (data: UserData) => void;
}

const FormStep: React.FC<FormStepProps> = ({ onSubmit }) => {
  const [data, setData] = useState<UserData>({
    name: '',
    phone: '',
    email: '',
    website: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.name && data.phone && data.email && data.website) {
      onSubmit(data);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in zoom-in duration-500">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Erstellen Sie Ihre <span className="text-gray-600">KI-Telefonassistenz</span></h2>
          <p className="text-gray-500 text-lg">Wir verwandeln Ihre Webseite in eine professionelle KI-Telefonassistenz.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vollständiger Name *</label>
            <input
              type="text"
              name="name"
              required
              value={data.name}
              onChange={handleChange}
              className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all hover:bg-white"
              placeholder="Max Mustermann"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon *</label>
              <input
                type="tel"
                name="phone"
                required
                value={data.phone}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all hover:bg-white"
                placeholder="+49 151..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-Mail *</label>
              <input
                type="email"
                name="email"
                required
                value={data.email}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all hover:bg-white"
                placeholder="max@..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Webseite URL *</label>
            <div className="relative group">
              <span className="absolute left-4 top-4 text-gray-400 font-medium">https://</span>
              <input
                type="text"
                name="website"
                required
                value={data.website}
                onChange={handleChange}
                className="w-full pl-20 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all hover:bg-white"
                placeholder="www.ihrefirma.de"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-1">Wir analysieren Ihre Webseite, um die KI-Telefonassistenz zu trainieren.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-gray-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-4 flex justify-center items-center gap-2"
          >
            <span>KI-Telefonassistenz starten</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center flex justify-center gap-6 text-gray-400 text-sm">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          DSGVO Konform
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          SSL Verschlüsselt
        </span>
      </div>
    </div>
  );
};

export default FormStep;