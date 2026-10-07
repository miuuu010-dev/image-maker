import React from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/presets';
import { SamplePreset } from '../types';

interface SamplePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: SamplePreset) => void;
}

export const SamplePresetsModal: React.FC<SamplePresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">나노 바나나 샘플 시나리오</h3>
              <p className="text-xs text-slate-400">
                1-클릭으로 바로 기능을 테스트해보실 수 있는 프리셋입니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {SAMPLE_PRESETS.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onSelectPreset(p);
                onClose();
              }}
              className="p-3 bg-slate-950 border border-slate-800/90 hover:border-amber-500/60 rounded-xl space-y-2 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.sampleOriginalUrl}
                  alt={p.title}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-amber-400/90 font-medium pt-1 border-t border-slate-900">
                <span>모드: {p.mode}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>불러오기</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
