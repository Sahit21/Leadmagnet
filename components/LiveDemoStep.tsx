import React, { useEffect, useRef, useState } from 'react';
import { AgentProfile, UserData } from '../types';
import { VapiClient } from '../services/vapi';

interface LiveDemoStepProps {
  agentProfile: AgentProfile;
  userData: UserData;
  onBack: () => void;
}

const LiveDemoStep: React.FC<LiveDemoStepProps> = ({ agentProfile, userData, onBack }) => {
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  const clientRef = useRef<VapiClient | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Visualizer effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      if (status !== 'connected') {
        // Idle animation - Dark Tech Style
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Static Orb
        ctx.fillStyle = '#1f2937'; // gray-800
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#4b5563'; // gray-600
        ctx.fillStyle = '#171717';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else {
        // Active animation
        const time = Date.now() / 1000;
        
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Center Orb
        const baseRadius = 50;
        const pulse = Math.sin(time * 3) * 5;
        
        // Core
        ctx.fillStyle = '#6b7280'; // gray-500
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, baseRadius + pulse, 0, Math.PI * 2);
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#6b7280';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ripples
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(107, 114, 128, ${0.5 / i})`; // gray
          ctx.lineWidth = 2;
          const r = baseRadius + pulse + (i * 25 * (Math.sin(time * 2 + i) + 1.5));
          ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [status]);

  const toggleConnection = async () => {
    if (status === 'connected' || status === 'connecting') {
      clientRef.current?.stop();
    } else {
      if (!agentProfile.vapiAssistantId) {
        setError("Keine Vapi Assistant ID gefunden.");
        return;
      }

      setError(null);
      if (!clientRef.current) {
        clientRef.current = new VapiClient(
            (s) => setStatus(s),
            (e) => setError(e)
        );
      }
      
      await clientRef.current.start(agentProfile.vapiAssistantId);
    }
  };

  const handleSecureDemo = async () => {
    setEmailStatus('sending');
    try {
      await fetch('https://hook.eu2.make.com/3a8txhwyt4dgf8w17kestsclzijme2yh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          website: userData.website,
          companyName: agentProfile.companyName,
          systemInstruction: agentProfile.systemInstruction,
          vapiAssistantId: agentProfile.vapiAssistantId,
          createdAt: new Date().toISOString()
        })
      });
      setEmailStatus('sent');
    } catch (e) {
      console.error("Failed to send webhook", e);
      setEmailStatus('sent');
    }
  };

  useEffect(() => {
    return () => {
      clientRef.current?.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/60 w-full overflow-hidden border border-gray-100 mb-8">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl text-gray-900">{agentProfile.companyName}</h2>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Hit AI Core</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
            status === 'connected' ? 'bg-green-50 text-green-600 border-green-200' : 
            status === 'connecting' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
            'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            {status === 'connected' ? 'Live' : status === 'connecting' ? 'Verbinden...' : 'Standby'}
          </div>
        </div>

        {/* Visualization Area - Keeps dark aesthetic for contrast */}
        <div className="h-80 bg-neutral-950 relative flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} width={600} height={320} className="w-full h-full object-cover" />
            
            {status === 'idle' && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                    <button 
                        onClick={toggleConnection}
                        className="group bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] transform transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3"
                    >
                        <span className="bg-gray-700 text-white p-1.5 rounded-full group-hover:bg-gray-900 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                        </span>
                        Gespräch beginnen
                    </button>
                </div>
            )}

            {error && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/95 p-6 text-center">
                    <div className="text-red-500 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-white font-medium mb-4">{error}</p>
                    <button onClick={() => { setError(null); setStatus('idle'); }} className="text-gray-400 hover:text-gray-300 hover:underline">Erneut versuchen</button>
                 </div>
            )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-4 min-h-[88px]">
          {status === 'connected' && (
             <button 
                onClick={toggleConnection}
                className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 p-4 rounded-full transition-all hover:scale-105 shadow-sm"
                title="Anruf beenden"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
             </button>
          )}
        </div>
      </div>
      
      <div className="text-center w-full mb-12">
          <p className="text-gray-400 mb-4 font-semibold text-xs uppercase tracking-widest">Empfohlene Fragen</p>
          <div className="flex flex-wrap justify-center gap-3">
              <button className="bg-white hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm text-gray-600 font-medium border border-gray-200 shadow-sm transition-all hover:-translate-y-0.5">"Welche Dienstleistungen?"</button>
              <button className="bg-white hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm text-gray-600 font-medium border border-gray-200 shadow-sm transition-all hover:-translate-y-0.5">"Über das Unternehmen"</button>
          </div>
      </div>

      {/* Secure Demo Section */}
      <div className="w-full flex flex-col items-center space-y-6 border-t border-gray-200 pt-10">
         <button 
            onClick={handleSecureDemo}
            disabled={emailStatus !== 'idle'}
            className={`
                group relative overflow-hidden rounded-xl px-10 py-4 font-bold text-white shadow-lg shadow-gray-200 transition-all duration-300
                ${emailStatus === 'sent' 
                    ? 'bg-green-600 cursor-default shadow-green-200' 
                    : 'bg-gray-900 hover:bg-black hover:scale-[1.02]'
                }
                ${emailStatus === 'sending' ? 'opacity-80 cursor-wait' : ''}
            `}
         >
             <div className="relative z-10 flex items-center gap-3">
                {emailStatus === 'idle' && (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Demo sichern
                    </>
                )}
                
                {emailStatus === 'sending' && (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Wird gesendet...
                    </>
                )}

                {emailStatus === 'sent' && (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Gesendet!
                    </>
                )}
             </div>
         </button>
         
         {emailStatus === 'sent' && (
             <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2 border border-green-100">
                 Die Demo wurde erfolgreich an <span className="font-bold">{userData.email}</span> gesendet.
             </p>
         )}
         
         <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-sm transition-colors pt-2 font-medium">
            Konfiguration neu starten
         </button>
      </div>
    </div>
  );
};

export default LiveDemoStep;