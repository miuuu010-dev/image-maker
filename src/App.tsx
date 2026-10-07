import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ControlPanel } from './components/ControlPanel';
import { ResultPanel } from './components/ResultPanel';
import { SamplePresetsModal } from './components/SamplePresetsModal';
import { GenerationOptions, GeneratedResult, ProcessingMode, UploadedImage, SamplePreset } from './types';
import { processCanvasTransformation } from './utils/canvasEngine';
import casualImg from './assets/images/sample_casual_portrait_1790834876453.jpg';

const DEFAULT_OPTIONS: GenerationOptions = {
  aspectRatio: '1:1',
  count: 1,
  highQuality: true,
  colorize: true,
  scaleUp: true,
  scratchFix: true,
  passportBg: 'white',
  passportAttire: 'suit',
  studioTheme: 'warm_light',
  skinLevel: 'medium',
  textOverlay: 'NANO AI STUDIO',
  textStyle: 'luxury_serif',
  styleType: 'anime',
  age: 30,
  bgType: 'transparent',
  bgThreshold: 45,
};

export default function App() {
  const [userIdea, setUserIdea] = useState<string>('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [activeMode, setActiveMode] = useState<ProcessingMode>('passport');
  const [options, setOptions] = useState<GenerationOptions>(DEFAULT_OPTIONS);

  const [currentResult, setCurrentResult] = useState<GeneratedResult | null>(null);
  const [history, setHistory] = useState<GeneratedResult[]>([]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);

  const modeLabels: Record<ProcessingMode, string> = {
    blend: '이미지 생성/합성',
    restore: '사진복원/업스케일',
    bg_remove: '배경제거/삭제',
    poster: '텍스트 포스터',
    passport: '여권사진 제작',
    studio: '스튜디오 사진',
    skin: '피부 보정',
    style: '스타일/채색',
    life_album: '인생앨범 (나이)',
  };

  // AI Prompt Auto Generator Handler
  const handleAutoGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const origImg = images.find((i) => i.role === 'original');
      const compImg = images.find((i) => i.role === 'composite');

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: modeLabels[activeMode],
          userIdea,
          hasOriginal: !!origImg,
          hasComposite: !!compImg,
          extraOptions: options,
        }),
      });

      const data = await response.json();
      if (data.promptEn || data.explanationKo) {
        setUserIdea(data.promptEn || data.explanationKo);
      }
    } catch (e) {
      console.error('Prompt Auto-Gen Error:', e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Main Image Execution Handler
  const handleExecute = async () => {
    setIsProcessing(true);

    try {
      // If no images uploaded yet, auto add default sample image
      let currentImages = [...images];
      if (currentImages.length === 0) {
        const sampleOrig: UploadedImage = {
          id: 'auto_sample_' + Date.now(),
          dataUrl: casualImg,
          role: 'original',
          label: '원본 사진',
        };
        currentImages = [sampleOrig];
        setImages(currentImages);
      }

      const origImg = currentImages.find((i) => i.role === 'original') || currentImages[0];
      const compImg = currentImages.find((i) => i.role === 'composite');

      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          prompt: userIdea,
          images: currentImages.map((img) => ({
            id: img.id,
            role: img.role,
            dataUrl: img.dataUrl,
          })),
          options,
        }),
      });

      const data = await response.json();

      let finalImageUrl = '';

      if (data.images && data.images.length > 0) {
        finalImageUrl = data.images[0];
      } else {
        // Fallback to high-precision Canvas engine
        finalImageUrl = await processCanvasTransformation(
          origImg.dataUrl,
          activeMode,
          options,
          compImg?.dataUrl,
          userIdea || options.textOverlay
        );
      }

      const newResult: GeneratedResult = {
        id: 'res_' + Date.now(),
        imageUrl: finalImageUrl,
        originalUrl: origImg.dataUrl,
        prompt: userIdea || `${modeLabels[activeMode]} 변환`,
        mode: activeMode,
        modeLabel: modeLabels[activeMode],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        options: { ...options },
      };

      setCurrentResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
    } catch (error) {
      console.error('Processing Execution Error:', error);
      alert('이미지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Preset Selection Loader
  const handleSelectPreset = (preset: SamplePreset) => {
    setActiveMode(preset.mode);
    setUserIdea(preset.idea);
    if (preset.optionsPartial) {
      setOptions((prev) => ({ ...prev, ...preset.optionsPartial }));
    }

    const newImages: UploadedImage[] = [
      {
        id: 'preset_orig_' + Date.now(),
        dataUrl: preset.sampleOriginalUrl,
        role: 'original',
        label: '원본 사진',
      },
    ];

    if (preset.sampleCompositeUrl) {
      newImages.push({
        id: 'preset_comp_' + Date.now(),
        dataUrl: preset.sampleCompositeUrl,
        role: 'composite',
        label: '합성/개체 사진',
      });
    }

    setImages(newImages);
  };

  // Reset All State
  const handleResetAll = () => {
    setUserIdea('');
    setImages([]);
    setOptions(DEFAULT_OPTIONS);
    setCurrentResult(null);
  };

  // Reset Options Only
  const handleResetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
  };

  // Refresh Output View
  const handleRefreshView = () => {
    if (currentResult) {
      handleExecute();
    } else {
      setCurrentResult(null);
    }
  };

  // Reuse Output as Input
  const handleReuseAsInput = (imgUrl: string) => {
    setImages([
      {
        id: 'reuse_' + Date.now(),
        dataUrl: imgUrl,
        role: 'original',
        label: '원본 사진 (재사용)',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Noto_Sans_KR','Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <Header
        onOpenPresets={() => setIsPresetsOpen(true)}
        onResetAll={handleResetAll}
        isProcessing={isProcessing}
      />

      {/* Main Workspace 3-Column Layout */}
      <main className="flex-1 p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch max-w-[1720px] mx-auto w-full">
        {/* Left Column: Input Part (입력 파트) - Col span 4 */}
        <section className="lg:col-span-4 h-[780px] lg:h-auto">
          <InputPanel
            userIdea={userIdea}
            setUserIdea={setUserIdea}
            images={images}
            setImages={setImages}
            onAutoGeneratePrompt={handleAutoGeneratePrompt}
            isGeneratingPrompt={isGeneratingPrompt}
            activeModeLabel={modeLabels[activeMode]}
            onExecute={handleExecute}
            isProcessing={isProcessing}
          />
        </section>

        {/* Middle Column: Control Part (제어 파트) - Col span 4 */}
        <section className="lg:col-span-4 h-[780px] lg:h-auto">
          <ControlPanel
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            options={options}
            setOptions={setOptions}
            onResetOptions={handleResetOptions}
            onExecute={handleExecute}
            isProcessing={isProcessing}
          />
        </section>

        {/* Right Column: Result Output Part (생성물 결과 파트) - Col span 4 */}
        <section className="lg:col-span-4 h-[780px] lg:h-auto">
          <ResultPanel
            currentResult={currentResult}
            history={history}
            onSelectResult={setCurrentResult}
            onRefreshView={handleRefreshView}
            onReuseAsInput={handleReuseAsInput}
            isProcessing={isProcessing}
          />
        </section>
      </main>

      {/* Sample Presets Modal */}
      <SamplePresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
