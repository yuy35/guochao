import React from 'react';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, language, setLanguage }) => {
  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-gray-900 border-x border-gray-800 shadow-2xl relative">
      <header className="flex-none p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur z-10 flex justify-between items-center">
        <div>
          <h1 className="font-serif-sc text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500">
            {language === 'en' ? 'Time Chaos' : '时空混乱'}
          </h1>
          <div className="text-xs text-gray-500 font-mono">
             {language === 'en' ? 'Changxindian' : '长辛店'}
          </div>
        </div>
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="px-3 py-1 text-xs border border-gray-600 rounded hover:bg-gray-800 text-teal-400 font-mono transition-colors"
        >
          {language === 'en' ? '中文' : 'EN'}
        </button>
      </header>
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>
    </div>
  );
};