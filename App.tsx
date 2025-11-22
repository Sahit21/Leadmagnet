import React, { useState } from 'react';
import { AppStep, AgentProfile, UserData } from './types';
import { analyzeWebsiteForAgent } from './services/gemini';
import { createVapiAssistant } from './services/vapi';
import FormStep from './components/FormStep';
import AnalyzingStep from './components/AnalyzingStep';
import LiveDemoStep from './components/LiveDemoStep';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.FORM);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleFormSubmit = async (data: UserData) => {
    setUserData(data);
    
    // Send webhook for form submission (fire and forget)
    try {
      fetch('https://hook.eu2.make.com/1tif657rx6cuzrezjeefqit6y84acxh0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString()
        })
      }).catch(e => console.error("Form webhook error", e));
    } catch (e) {
       console.error("Form webhook trigger error", e);
    }

    setStep(AppStep.ANALYZING);
    try {
      // 1. Analyze website with Gemini
      const profile = await analyzeWebsiteForAgent(data);
      
      // 2. Create Assistant on Vapi (configured with Gemini & ElevenLabs)
      const vapiId = await createVapiAssistant(profile);
      const finalProfile = { ...profile, vapiAssistantId: vapiId };

      setAgentProfile(finalProfile);
      setStep(AppStep.READY);
      
      // Auto transition to live demo
      setTimeout(() => setStep(AppStep.LIVE_DEMO), 1500);
    } catch (error: any) {
      console.error("Analysis or Creation failed", error);
      alert(`Fehler: ${error.message || "Unbekannter Fehler bei der Erstellung."}`);
      setStep(AppStep.FORM);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation / Header */}
      <nav className="px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-md fixed w-full z-10 transition-all duration-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Software Service Agentur Hit Logo */}
            <div className="w-14 h-14 flex-shrink-0">
              <img 
                src="https://storage.googleapis.com/msgsndr/Dw9K5NnNvU9TB4HWyITi/media/68d26eaae6849c86e56be64c.png" 
                alt="Logo" 
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-800 leading-tight">Software Service</span>
                <span className="font-bold text-lg text-gray-600 leading-tight">Agentur Hit</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
             <a 
               href="https://ssahit.de" 
               target="_blank"
               rel="noopener noreferrer"
               className="text-sm font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all px-5 py-2.5 rounded-lg"
             >
               Zu Uns
             </a>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4 mt-24 mb-12">
        {step === AppStep.FORM && <FormStep onSubmit={handleFormSubmit} />}
        
        {step === AppStep.ANALYZING && <AnalyzingStep />}
        
        {step === AppStep.READY && (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">KI-Telefonassistenz bereit!</h2>
            <p className="text-gray-500">Wir haben Ihre individuelle KI-Telefonassistenz konfiguriert.</p>
          </div>
        )}

        {step === AppStep.LIVE_DEMO && agentProfile && userData && (
          <LiveDemoStep 
            agentProfile={agentProfile} 
            userData={userData}
            onBack={() => {
              setAgentProfile(null);
              setUserData(null);
              setStep(AppStep.FORM);
            }} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="p-8 text-center border-t border-gray-200 bg-white">
        <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Software Service Agentur Hit.</p>
      </footer>
    </div>
  );
};

export default App;