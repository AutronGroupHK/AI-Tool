
import React, { useState } from 'react';
import { Translation } from '../types';
import { Key, AlertCircle, ArrowRight } from 'lucide-react';

declare const process: { env: { [key: string]: string | undefined } };

interface ApiKeySelectionProps {
  t: Translation;
  onKeySelected: (key: string) => void;
}

export const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ t, onKeySelected }) => {
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectKey = async () => {
    setError(null);
    setIsSelecting(true);
    try {
      await window.aistudio.openSelectKey();
      
      const envKey = process.env.API_KEY;
      
      if (envKey) {
        onKeySelected(envKey);
      } else {
        // Fallback simulation
        onKeySelected("key-selected");
      }
    } catch (e: any) {
      console.error("API Key Selection Error:", e);
      
      let errorMessage = t.errorGeneric;
      
      if (e.message && e.message.includes("Requested entity was not found")) {
         errorMessage = t.errorEntityNotFound;
      } else if (e.message && e.message.includes("User cancelled")) {
         errorMessage = ""; 
      } else {
         errorMessage = t.errorApiKey;
      }
      
      if (errorMessage) setError(errorMessage);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 font-sans selection:bg-black selection:text-white">
      <div className="max-w-md w-full text-center">
        
        <div className="mb-12">
           <h1 className="text-4xl font-serif font-bold tracking-tighter text-black mb-2">AUTRON</h1>
           <span className="text-[10px] font-medium tracking-[0.3em] text-stone-400 uppercase">ProPortrait Studio</span>
        </div>
        
        <h2 className="text-xl font-medium text-black mb-4 tracking-tight">{t.title}</h2>
        <p className="text-stone-500 mb-10 font-light text-sm leading-relaxed">{t.subtitle}</p>

        <div className="space-y-6">
          <button
            onClick={handleSelectKey}
            disabled={isSelecting}
            className="w-full bg-black hover:bg-stone-800 text-white font-bold text-[10px] uppercase tracking-[0.2em] py-5 px-6 transition-all duration-300 flex items-center justify-center gap-3 disabled:bg-stone-200 disabled:text-stone-400"
          >
            {isSelecting ? (
              <div className="w-4 h-4 border-2 border-stone-400 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                {t.selectKeyBtn}
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
          
          <div className="text-xs text-stone-400 space-y-4 pt-4 border-t border-stone-100">
            <p className="uppercase tracking-widest text-[9px] font-bold text-stone-300">Access Requirement</p>
            <p>{t.billingLinkText}</p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noreferrer"
              className="inline-block border-b border-stone-300 pb-0.5 text-stone-600 hover:text-black hover:border-black transition-colors"
            >
              Google AI Billing Documentation
            </a>
          </div>

          {error && (
            <div className="flex flex-col gap-3 p-4 bg-stone-50 text-red-900 text-xs rounded-sm border border-red-100 text-left animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                      <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">Error</p>
                      <p className="opacity-80 leading-relaxed font-light">{error}</p>
                  </div>
              </div>
              <button 
                onClick={handleSelectKey}
                className="self-end text-[10px] font-bold uppercase tracking-wider underline underline-offset-4 hover:text-red-700"
              >
                {t.retryBtn}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-16">
           <p className="text-[9px] uppercase tracking-[0.3em] text-stone-300">{t.footerRights}</p>
        </div>
      </div>
    </div>
  );
};
