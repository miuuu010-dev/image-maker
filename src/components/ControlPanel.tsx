import React from 'react';
import {
  Layers,
  Wand2,
  Sparkles,
  Scissors,
  Type,
  UserCheck,
  Camera,
  Smile,
  Palette,
  Clock,
  RotateCcw,
  Sliders,
  Zap,
} from 'lucide-react';
import { AspectRatio, GenerationOptions, ProcessingMode } from '../types';

interface ControlPanelProps {
  activeMode: ProcessingMode;
  setActiveMode: (mode: ProcessingMode) => void;
  options: GenerationOptions;
  setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
  onResetOptions: () => void;
  onExecute: () => void;
  isProcessing: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeMode,
  setActiveMode,
  options,
  setOptions,
  onResetOptions,
  onExecute,
  isProcessing,
}) => {
  const modesList: { id: ProcessingMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'blend', label: '생성/합성', icon: Layers },
    { id: 'restore', label: '사진복원/업스케일', icon: Wand2 },
    { id: 'bg_remove', label: '배경제거/삭제', icon: Scissors },
    { id: 'poster', label: '텍스트 포스터', icon: Type },
    { id: 'passport', label: '여권사진 제작', icon: UserCheck },
    { id: 'studio', label: '스튜디오 사진', icon: Camera },
    { id: 'skin', label: '피부 보정', icon: Smile },
    { id: 'style', label: '스타일/채색', icon: Palette },
    { id: 'life_album', label: '인생앨범 (나이)', icon: Clock },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-5 flex flex-col h-full shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
            2
          </div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            제어 파트 (Controls)
          </h2>
        </div>
        <button
          onClick={onResetOptions}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 transition-colors"
          title="옵션 초기화"
        >
          <RotateCcw className="w-3 h-3" />
          <span>옵션 초기화</span>
        </button>
      </div>

      {/* 1. Mode Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">작업 모드 선택</label>
        <div className="grid grid-cols-3 gap-1.5">
          {modesList.map((m) => {
            const Icon = m.icon;
            const isSelected = activeMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMode(m.id)}
                className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="text-[11px] leading-tight truncate w-full">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Mode Sub-Options */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-400 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>세부 기능 설정</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">MODE PARAMETERS</span>
        </div>

        {/* Passport Options */}
        {activeMode === 'passport' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">배경색 선택 (규격)</label>
              <div className="flex gap-2">
                {[
                  { id: 'white', label: '흰색 (표준 여권)' },
                  { id: 'light_gray', label: '연한 회색' },
                  { id: 'blue', label: '파란색 (비자)' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() =>
                      setOptions((prev) => ({ ...prev, passportBg: bg.id as any }))
                    }
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      options.passportBg === bg.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">복장 스타일 자동 변경</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOptions((prev) => ({ ...prev, passportAttire: 'suit' }))}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    options.passportAttire === 'suit'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  정장/셔츠 입히기
                </button>
                <button
                  onClick={() => setOptions((prev) => ({ ...prev, passportAttire: 'original' }))}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    options.passportAttire === 'original'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  현재 복장 유지
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Studio Photo Options */}
        {activeMode === 'studio' && (
          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block">스튜디오 조명 및 분위기</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'warm_light', label: '따뜻한 감성 조명' },
                { id: 'velvet_dark', label: '다크 벨벳 프로필' },
                { id: 'clean_minimal', label: '미니멀 화이트' },
                { id: 'dramatic_flash', label: '드라마틱 플래시' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOptions((prev) => ({ ...prev, studioTheme: st.id as any }))}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left transition-all ${
                    options.studioTheme === st.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Restore Options */}
        {activeMode === 'restore' && (
          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block">복원 및 컬러화 옵션</label>
            <div className="space-y-1.5">
              {[
                { key: 'colorize', label: '흑백 사진 AI 컬러화' },
                { key: 'scaleUp', label: 'HD/4K 고화질 스케일업' },
                { key: 'scratchFix', label: '스크래치 및 흠집 정밀 복구' },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  <span className="text-slate-300 text-[11px]">{opt.label}</span>
                  <input
                    type="checkbox"
                    checked={(options as any)[opt.key]}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                    }
                    className="accent-amber-500 rounded w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Skin Retouch Options */}
        {activeMode === 'skin' && (
          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block">피부 보정 강도 (여드름/트러블 제거)</label>
            <div className="flex gap-2">
              {[
                { id: 'natural', label: '자연스럽게' },
                { id: 'medium', label: '보통' },
                { id: 'flawless', label: '매끄러운 피부' },
              ].map((sk) => (
                <button
                  key={sk.id}
                  onClick={() => setOptions((prev) => ({ ...prev, skinLevel: sk.id as any }))}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    options.skinLevel === sk.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {sk.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Life Album (Age) Options */}
        {activeMode === 'life_album' && (
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-400">변환할 나이 선택</label>
              <span className="font-bold font-mono text-amber-400">{options.age} 세</span>
            </div>
            <input
              type="range"
              min={7}
              max={80}
              step={1}
              value={options.age}
              onChange={(e) => setOptions((prev) => ({ ...prev, age: parseInt(e.target.value) }))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>7세 (유년)</span>
              <span>18세 (청소년)</span>
              <span>25세 (청년)</span>
              <span>45세 (중년)</span>
              <span>70세 (노년)</span>
            </div>
          </div>
        )}

        {/* Poster Options */}
        {activeMode === 'poster' && (
          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">포스터 렌더링 문구</label>
              <input
                type="text"
                value={options.textOverlay}
                onChange={(e) => setOptions((prev) => ({ ...prev, textOverlay: e.target.value }))}
                placeholder="예: NANO AI MAGAZINE"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">타이포그래피 스타일</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bold_modern', label: '볼드 모던' },
                  { id: 'luxury_serif', label: '럭셔리 세리프' },
                  { id: 'cyber_neon', label: '사이버 네온' },
                  { id: 'editorial_clean', label: '에디토리얼 클린' },
                ].map((ts) => (
                  <button
                    key={ts.id}
                    onClick={() => setOptions((prev) => ({ ...prev, textStyle: ts.id as any }))}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                      options.textStyle === ts.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {ts.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Style Transfer Options */}
        {activeMode === 'style' && (
          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block">화풍 / 화풍 채색 스타일</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'anime', label: '아니메/웹툰' },
                { id: 'cyberpunk', label: '사이버펑크' },
                { id: 'watercolor', label: '수채화' },
                { id: 'oil_painting', label: '유화' },
                { id: 'sketch_color', label: '스케치 채색' },
                { id: 'vintage_film', label: '빈티지 필름' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOptions((prev) => ({ ...prev, styleType: st.id as any }))}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-medium border transition-all text-center ${
                    options.styleType === st.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Background Removal Options */}
        {activeMode === 'bg_remove' && (
          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">제거 후 배경 처리</label>
              <div className="flex gap-2">
                {[
                  { id: 'transparent', label: '투명 배경 (체크)' },
                  { id: 'clean_white', label: '클린 화이트' },
                  { id: 'pastel_studio', label: '파스텔 배경' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setOptions((prev) => ({ ...prev, bgType: bg.id as any }))}
                    className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium border transition-all ${
                      options.bgType === bg.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400">배경 감지 정밀도 (누끼 Sensitivity)</label>
                <span className="font-mono text-amber-400 font-bold">{options.bgThreshold || 45}</span>
              </div>
              <input
                type="range"
                min={20}
                max={80}
                step={1}
                value={options.bgThreshold || 45}
                onChange={(e) => setOptions((prev) => ({ ...prev, bgThreshold: parseInt(e.target.value) }))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>정밀 경계</span>
                <span>표준</span>
                <span>강한 배경 삭제</span>
              </div>
            </div>
          </div>
        )}

        {/* Blend / General helper info */}
        {(activeMode === 'blend' || activeMode === 'bg_remove') && (
          <p className="text-[11px] text-slate-400 leading-relaxed">
            💡 입력 파트에 업로드된 원본 사진과 합성 개체 사진의 인물 이목구비 및 조명 일관성을 정밀하게 분석하여 자연스럽게 조합합니다.
          </p>
        )}
      </div>

      {/* 3. Common Generation Options (공통 생성 옵션) */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-semibold text-slate-300">공통 생성 옵션</label>

        {/* Aspect Ratio Buttons */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5">이미지 비율</span>
          <div className="flex gap-1.5">
            {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ar) => (
              <button
                key={ar}
                onClick={() => setOptions((prev) => ({ ...prev, aspectRatio: ar }))}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                  options.aspectRatio === ar
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        {/* Image Count & Nano Banana Pro toggle */}
        <div className="flex gap-3">
          <div className="flex-1">
            <span className="text-[11px] text-slate-400 block mb-1.5">생성 장수</span>
            <div className="flex gap-1.5">
              {[1, 2, 4].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setOptions((prev) => ({ ...prev, count: cnt }))}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    options.count === cnt
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {cnt}장
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <span className="text-[11px] text-slate-400 block mb-1.5">화질 엔진</span>
            <button
              onClick={() => setOptions((prev) => ({ ...prev, highQuality: !prev.highQuality }))}
              className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                options.highQuality
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{options.highQuality ? 'Nano HD' : 'Standard'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Action Execution Button */}
      <div className="pt-2 mt-auto">
        <button
          onClick={onExecute}
          disabled={isProcessing}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? '나노 바나나 변환 중...' : '나노 바나나 이미지 생성 실행'}</span>
        </button>
      </div>
    </div>
  );
};
