import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Copy,
  Maximize2,
  Sparkles,
  ArrowLeftRight,
  RotateCcw,
  Check,
  Share2,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { GeneratedResult } from '../types';

interface ResultPanelProps {
  currentResult: GeneratedResult | null;
  history: GeneratedResult[];
  onSelectResult: (res: GeneratedResult) => void;
  onRefreshView: () => void;
  onReuseAsInput: (imageUrl: string) => void;
  isProcessing: boolean;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  currentResult,
  history,
  onSelectResult,
  onRefreshView,
  onReuseAsInput,
  isProcessing,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag for Before/After comparison slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPos(pos);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleGlobalUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDragging]);

  const handleDownload = () => {
    if (!currentResult) return;
    const link = document.createElement('a');
    link.href = currentResult.imageUrl;
    link.download = `nano_banana_${currentResult.mode}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!currentResult) return;
    try {
      const response = await fetch(currentResult.imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('클립보드 복사 실패');
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 flex flex-col h-full shadow-xl relative">
      {/* Panel Top Header with REQUIRED Refresh Button at Top-Right */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
            3
          </div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            생성물 결과 파트 (Output)
          </h2>
        </div>

        {/* REQUIRED: Top-Right Refresh Button */}
        <button
          onClick={onRefreshView}
          disabled={isProcessing}
          title="결과 화면 새로고침"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all disabled:opacity-50 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Main Result Display Area */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        {currentResult ? (
          <div className="flex-1 flex flex-col justify-between space-y-3 min-h-0">
            {/* Image Viewer Container */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              className="relative w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden select-none group cursor-ew-resize min-h-[280px]"
            >
              {/* After Image (Full width background) */}
              <img
                src={currentResult.imageUrl}
                alt="결과 이미지"
                className="absolute inset-0 w-full h-full object-contain bg-slate-950"
              />

              {/* Before Image (Clipped by sliderPos) if originalUrl exists */}
              {currentResult.originalUrl && (
                <div
                  className="absolute inset-0 overflow-hidden border-r-2 border-amber-400"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={currentResult.originalUrl}
                    alt="원본 이미지"
                    className="absolute inset-0 w-full h-full object-contain bg-slate-950"
                    style={{
                      width: containerRef.current?.offsetWidth || '100%',
                      maxWidth: 'none',
                    }}
                  />
                  {/* Before Badge */}
                  <span className="absolute top-3 left-3 bg-slate-950/80 text-slate-300 border border-slate-700/80 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    BEFORE (원본)
                  </span>
                </div>
              )}

              {/* After Badge */}
              <span className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                AFTER (나노 변환)
              </span>

              {/* Slider Handle Divider line & circle */}
              {currentResult.originalUrl && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-lg">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Compare Helper Badge */}
              {currentResult.originalUrl && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] px-3 py-1 rounded-full backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3 h-3 text-amber-400" />
                  <span>좌우로 드래그하여 변경전후 비교</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {currentResult.modeLabel}
                </span>
                <span className="text-[10px] text-slate-500 block truncate font-mono">
                  {currentResult.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onReuseAsInput(currentResult.imageUrl)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  title="입력 사진으로 재사용"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">재사용</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors"
                  title="클립보드 복사"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-md shadow-amber-500/10 transition-all"
                  title="다운로드"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>다운로드</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Waiting state */
          <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800/80 rounded-xl text-center bg-slate-950/40">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">
              생성된 결과물이 이곳에 표시됩니다
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              왼쪽 입력 파트에서 사진과 요구사항을 넣고, 제어 파트에서 [나노 바나나 이미지 생성 실행] 버튼을 클릭해보세요.
            </p>
          </div>
        )}

        {/* History Gallery Grid */}
        {history.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>최근 히스토리 ({history.length})</span>
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {history.map((h) => {
                const isSelected = currentResult?.id === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => onSelectResult(h)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      isSelected
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <img src={h.imageUrl} alt={h.modeLabel} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-amber-300 font-medium truncate px-1 text-center">
                      {h.modeLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
