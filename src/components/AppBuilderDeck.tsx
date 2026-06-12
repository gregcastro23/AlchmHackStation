import React from 'react';
import { Settings, LayoutGrid, Palette, Database as DbIcon, Braces } from 'lucide-react';
import { LANGUAGES } from '../lib/swarmEngine';

interface AppBuilderDeckProps {
  language: string;
  setLanguage: (language: string) => void;
  framework: string;
  setFramework: (framework: string) => void;
  cssEngine: string;
  setCssEngine: (css: string) => void;
  database: string;
  setDatabase: (db: string) => void;
  onApplyConfig: () => void;
}

export const AppBuilderDeck: React.FC<AppBuilderDeckProps> = ({
  language,
  setLanguage,
  framework,
  setFramework,
  cssEngine,
  setCssEngine,
  database,
  setDatabase,
  onApplyConfig,
}) => {
  const frameworks = ['Vite React', 'Next.js', 'Tauri V2'];
  const cssEngines = ['Tailwind v4', 'Vanilla CSS', 'CSS Modules'];
  const databases = ['SpaceTimeDB', 'PostgreSQL', 'SQLite'];
  const activeLang = LANGUAGES.find((l) => l.name === language);

  return (
    <section className="bg-[#12140e] border border-[#44483a] p-5 flex flex-col space-y-4 select-none">
      <header className="border-b border-[#44483a] pb-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-[#9ddf2e]" />
          <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
            APP BUILDER CONFIGURATOR
          </h2>
        </div>
        <span className="font-mono text-[9px] text-[#8f9282] uppercase">on_config_update()</span>
      </header>

      <div className="space-y-3">
        {/* Core Language Matrix */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#c5c8b6]">
              <Braces className="w-3.5 h-3.5 text-[#8f9282]" />
              <span className="uppercase font-bold tracking-wide">Core Language</span>
            </div>
            {activeLang && (
              <span className="font-mono text-[9px] text-[#ffb020] uppercase">
                {activeLang.toolchain} // {activeLang.testCmd}
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.name;
              return (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.name)}
                  title={`${lang.name} — ${lang.toolchain}`}
                  className={`py-1.5 font-mono text-[10px] border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5 font-bold shadow-[0_0_8px_rgba(157,223,46,0.05)]'
                      : 'border-[#44483a] text-[#c5c8b6] hover:border-[#8f9282] hover:text-[#e3e3d8] bg-transparent'
                  }`}
                >
                  {lang.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Framework Toggle Row */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#c5c8b6]">
            <LayoutGrid className="w-3.5 h-3.5 text-[#8f9282]" />
            <span className="uppercase font-bold tracking-wide">Target Framework</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {frameworks.map((fw) => {
              const isSelected = framework === fw;
              return (
                <button
                  key={fw}
                  onClick={() => setFramework(fw)}
                  className={`py-1.5 font-mono text-[11px] border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5 font-bold shadow-[0_0_8px_rgba(157,223,46,0.05)]'
                      : 'border-[#44483a] text-[#c5c8b6] hover:border-[#8f9282] hover:text-[#e3e3d8] bg-transparent'
                  }`}
                >
                  {fw}
                </button>
              );
            })}
          </div>
        </div>

        {/* CSS Engine Row */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#c5c8b6]">
            <Palette className="w-3.5 h-3.5 text-[#8f9282]" />
            <span className="uppercase font-bold tracking-wide">Styling Engine</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {cssEngines.map((css) => {
              const isSelected = cssEngine === css;
              return (
                <button
                  key={css}
                  onClick={() => setCssEngine(css)}
                  className={`py-1.5 font-mono text-[11px] border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5 font-bold shadow-[0_0_8px_rgba(157,223,46,0.05)]'
                      : 'border-[#44483a] text-[#c5c8b6] hover:border-[#8f9282] hover:text-[#e3e3d8] bg-transparent'
                  }`}
                >
                  {css}
                </button>
              );
            })}
          </div>
        </div>

        {/* Database Toggle Row */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#c5c8b6]">
            <DbIcon className="w-3.5 h-3.5 text-[#8f9282]" />
            <span className="uppercase font-bold tracking-wide">Data Infrastructure</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {databases.map((db) => {
              const isSelected = database === db;
              return (
                <button
                  key={db}
                  onClick={() => setDatabase(db)}
                  className={`py-1.5 font-mono text-[11px] border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5 font-bold shadow-[0_0_8px_rgba(157,223,46,0.05)]'
                      : 'border-[#44483a] text-[#c5c8b6] hover:border-[#8f9282] hover:text-[#e3e3d8] bg-transparent'
                  }`}
                >
                  {db}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={onApplyConfig}
        className="w-full mt-2 py-2 border border-[#9ddf2e] text-[#9ddf2e] hover:bg-[#9ddf2e]/10 font-mono text-[11px] uppercase tracking-widest font-bold transition-all duration-150 cursor-pointer active:scale-[0.98]"
      >
        APPLY CONFIGURATION
      </button>
    </section>
  );
};
