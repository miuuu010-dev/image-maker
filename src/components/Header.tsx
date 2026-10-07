import React from 'react';
import { Sparkles, Image as ImageIcon, Layers, RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenPresets: () => void;
  onResetAll: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPresets, onResetAll, isProcessing }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Zone 1: Brand & Model Identifier */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold text-xl">
          🍌
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
              나노 바나나 AI Studio
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Zap className="w-3 h-3 fill-amber-400" />
              Nano Banana 2.5
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            정밀 합성 · 사진 복원 · 여권/스튜디오 · 피부보정 · 인생앨범
          </p>
        </div>
      </div>

      {/* Zone 2 & 3: Preset Loader & Quick Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>샘플 시나리오 체험</span>
        </button>

        <button
          onClick={onResetAll}
          disabled={isProcessing}
          title="전체 작업 초기화"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">초기화</span>
        </button>
      </div>
    </header>
  );
};
