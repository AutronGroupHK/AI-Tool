
import React, { useState, useEffect } from 'react';
import { ApiKeySelection } from './components/ApiKeySelection';
import { MainApp } from './components/MainApp';
import { Language } from './types';
import { TRANSLATIONS } from './constants';

declare const process: { env: { [key: string]: string | undefined } };

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('zh-TW');

  const t = TRANSLATIONS[language];

  const checkKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasSelected = await window.aistudio.hasSelectedApiKey();
        if (hasSelected) {
          setApiKey(process.env.API_KEY || "valid-key-placeholder");
        }
      } else {
         // Fallback for local development
         const envKey = process.env.API_KEY;
         if (envKey) {
            setApiKey(envKey);
         }
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setApiKey(null);
    } finally {
      setCheckingKey(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  if (checkingKey) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
            </div>
        </div>
    );
  }

  if (!apiKey) {
    return <ApiKeySelection t={t} onKeySelected={(key) => setApiKey(key)} />;
  }

  return <MainApp t={t} lang={language} setLang={setLanguage} />;
}
