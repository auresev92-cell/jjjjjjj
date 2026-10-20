import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';

export interface TextSizeSettingsMenuProps {
  onClose: () => void;
  textScale: number;
  onChangeTextScale: (scale: number) => void;
}

export function TextSizeSettingsMenu({ 
  onClose, 
  textScale, 
  onChangeTextScale 
}: TextSizeSettingsMenuProps) {
  const options = [
    { label: 'Petit', scale: 0.9, desc: 'A-', detail: 'Économise de l\'espace' },
    { label: 'Normal', scale: 1.0, desc: 'A', detail: 'Taille par défaut' },
    { label: 'Grand', scale: 1.15, desc: 'A+', detail: 'Recommandé pour mobile' },
    { label: 'Très grand', scale: 1.3, desc: 'A++', detail: 'Lisibilité maximale' }
  ];

  return (
    <div className="absolute inset-0 bg-[#0c0517] z-[120] flex flex-col h-full overflow-hidden select-none font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between pt-10 pb-3 px-4 bg-[#160829] border-b border-white/10 shrink-0 relative">
        <button 
          onClick={onClose} 
          className="p-2 -ml-2 text-white/80 hover:text-white hover:opacity-90 transition-opacity cursor-pointer"
          aria-label="Retour"
        >
          <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
        </button>

        <h2 className="text-[17px] font-bold text-white tracking-tight pt-2">
          Taille du texte
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 pb-2">
        <div className="text-center space-y-2">
          <p className="text-[13.5px] text-purple-200/80 leading-relaxed px-2">
            Adaptez la taille des caractères pour une lecture fluide et parfaitement proportionnée à votre écran mobile.
          </p>
        </div>

        {/* Live Preview Box */}
        <div className="bg-[#1a0b30]/80 rounded-2xl p-5 border border-purple-500/20 shadow-xl space-y-4">
          <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">Aperçu en direct</span>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[14px]">💖</span>
              </div>
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 max-w-[80%] border border-white/10">
                <p className="text-[14px] text-white font-semibold">Aminata, 24 ans</p>
                <p className="text-[13px] text-purple-200/90 mt-1">
                  Bonjour ! Bienvenue sur Bavel. Trouvons ensemble l'amour à Abidjan ! ✨
                </p>
              </div>
            </div>

            <div className="flex items-start justify-end space-x-3">
              <div className="bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white rounded-2xl rounded-tr-none p-3 max-w-[80%] shadow-md">
                <p className="text-[13px] font-medium">
                  C'est parfait, les caractères s'adaptent instantanément ! 😍
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selector List */}
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = textScale === opt.scale;
            return (
              <button
                key={opt.scale}
                onClick={() => onChangeTextScale(opt.scale)}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-[#f43f5e] bg-rose-500/15 text-white' 
                    : 'border-white/10 bg-[#170a2c]/70 hover:border-white/20 text-white/90'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-[18px] font-bold w-10 text-center ${isSelected ? 'text-[#f43f5e]' : 'text-purple-300/50'}`}>
                    {opt.desc}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-white">{opt.label}</span>
                    <span className="text-[12px] text-purple-200/70">{opt.detail}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-[#f43f5e] bg-[#f43f5e]' : 'border-white/30'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tactile Slider */}
        <div className="bg-[#1a0b30]/80 rounded-2xl p-5 border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex justify-between items-center text-[12px] text-purple-300/70 font-bold px-1">
            <span>A- (PETIT)</span>
            <span>STANDARD</span>
            <span>A++ (GRAND)</span>
          </div>
          <div className="relative flex items-center px-1">
            <input 
              type="range" 
              min="0.9" 
              max="1.3" 
              step="0.05" 
              value={textScale} 
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                let snapped = val;
                if (Math.abs(val - 0.9) < 0.04) snapped = 0.9;
                else if (Math.abs(val - 1.0) < 0.04) snapped = 1.0;
                else if (Math.abs(val - 1.15) < 0.04) snapped = 1.15;
                else if (Math.abs(val - 1.3) < 0.04) snapped = 1.3;
                onChangeTextScale(snapped);
              }}
              className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-[#f43f5e]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
