import React, { useEffect, useState } from 'react';

const AnalyzingStep: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("System initialisiert...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 800);

    const timeouts = [
      setTimeout(() => setStatusText("Webseite wird analysiert..."), 1000),
      setTimeout(() => setStatusText("Geschäftslogik wird extrahiert..."), 3000),
      setTimeout(() => setStatusText("KI-Telefonassistenz wird konfiguriert..."), 5000),
      setTimeout(() => setStatusText("Interface wird finalisiert..."), 7000),
    ];

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto text-center p-8">
      <div className="relative w-32 h-32 mx-auto mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-gray-600 rounded-full border-t-transparent animate-spin"></div>
        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
          {Math.round(progress)}%
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Hit AI arbeitet</h3>
      <p className="text-gray-500 h-6 transition-all duration-300 font-medium">{statusText}</p>
      
      <div className="mt-10 space-y-2 opacity-90 max-w-xs mx-auto">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-600 shadow-[0_0_10px_rgba(75,85,99,0.3)] transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzingStep;