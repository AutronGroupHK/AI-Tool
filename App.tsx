import React, { useState, useEffect } from 'react';
import { ApiKeySelection } from './components/ApiKeySelection';
import { MainApp } from './components/MainApp';
import { Language } from './types';
import { TRANSLATIONS } from './constants';

declare const process: { env: { [key: string]: string | undefined } };

export default function App() {
  // Use process.env.API_KEY directly as per guidelines
  const [apiKey, setApiKey] = useState<string | boolean>(process.env.API_KEY || "");
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('zh-TW');

  const t = TRANSLATIONS[language];

  const checkKey = async () => {
    try {
      // Check AI Studio Key Selection state
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setApiKey(selected);
      } else {
         // Fallback: Check process.env.API_KEY which is assumed to be pre-configured
         setApiKey(!!process.env.API_KEY);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setApiKey(false);
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
                <div className="w-12 h-12 border-4 border-stone-200 border-t-black rounded-full animate-spin"></div>
            </div>
        </div>
    );
  }

  // If apiKey is false, null, or empty string -> Show selection
  if (!apiKey) {
    return <ApiKeySelection t={t} onKeySelected={(key) => {
        // If the selection component returns a specific key string, set it in env
        if (key && typeof key === 'string') {
            process.env.API_KEY = key;
        }
        setApiKey(true);
    }} />;
  }

  return <MainApp t={t} lang={language} setLang={setLanguage} />;
}