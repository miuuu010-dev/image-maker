import React, { useState, useRef } from 'react';
import { Upload, X, Wand2, ImagePlus, Check, Sparkles, AlertCircle, Layers } from 'lucide-react';
import { ImageRole, UploadedImage } from '../types';
import vintageImg from '../assets/images/sample_vintage_photo_1790834861782.jpg';
import casualImg from '../assets/images/sample_casual_portrait_1790834876453.jpg';
import puppyImg from '../assets/images/sample_cutout_puppy_1790834889233.jpg';

interface InputPanelProps {
  userIdea: string;
  setUserIdea: (val: string) => void;
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  onAutoGeneratePrompt: () => void;
  isGeneratingPrompt: boolean;
  activeModeLabel: string;
  onExecute: () => void;
  isProcessing: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  userIdea,
  setUserIdea,
  images,
  setImages,
  onAutoGeneratePrompt,
  isGeneratingPrompt,
  activeModeLabel,
  onExecute,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) {
      alert('이미지는 최대 3장까지 업로드할 수 있습니다.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Auto assign role: first is original, second is composite, third is reference
        let role: ImageRole = 'original';
        if (images.some((i) => i.role === 'original')) {
          role = images.some((i) => i.role === 'composite') ? 'reference' : 'composite';
        }

        const roleLabels: Record<ImageRole, string> = {
          original: '원본 사진',
          composite: '합성/개체 사진',
          reference: '참고 사진',
        };

        const newImage: UploadedImage = {
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          file,
          dataUrl,
          role,
          label: roleLabels[role],
        };

        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRoleChange = (id: string, newRole: ImageRole) => {
    const roleLabels: Record<ImageRole, string> = {
      original: '원본 사진',
      composite: '합성/개체 사진',
      reference: '참고 사진',
    };
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, role: newRole, label: roleLabels[newRole] } : img))
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleAddSampleOriginal = () => {
    if (images.length >= 3) return;
    setImages((prev) => [
      ...prev,
      {
        id: 'sample_orig_' + Date.now(),
        dataUrl: casualImg,
        role: 'original',
        label: '원본 사진',
      },
    ]);
  };

  const handleAddSampleComposite = () => {
    if (images.length >= 3) return;
    setImages((prev) => [
      ...prev,
      {
        id: 'sample_comp_' + Date.now(),
        dataUrl: puppyImg,
        role: 'composite',
        label: '합성/개체 사진',
      },
    ]);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-5 flex flex-col h-full shadow-xl">
      {/* Panel Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
            1
          </div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            입력 파트 (Input)
          </h2>
        </div>
        <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          모드: {activeModeLabel}
        </span>
      </div>

      {/* 1. Idea Input Box & Prompt Auto-Generator */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span>아이디어 입력</span>
            <span className="text-slate-500 font-normal">(자유 프롬프트)</span>
          </label>

          {/* AI Auto Prompt Button */}
          <button
            type="button"
            onClick={onAutoGeneratePrompt}
            disabled={isGeneratingPrompt}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-lg shadow-md shadow-amber-500/10 transition-all disabled:opacity-50 active:scale-95"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
            <span>AI 프롬프트 자동 생성</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            value={userIdea}
            onChange={(e) => setUserIdea(e.target.value)}
            placeholder={`예: 인물 얼굴을 유지하면서 선명한 흰색 배경의 표준 여권사진으로 제작해줘...\n혹은 오래된 흑백 사진의 스크래치를 없애고 선명한 컬러로 복원해줘.`}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all resize-none"
          />
          {userIdea && (
            <button
              onClick={() => setUserIdea('')}
              className="absolute top-2.5 right-2.5 text-slate-500 hover:text-slate-300 p-1"
              title="지우기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Image Upload Box (Max 3 Images) */}
      <div className="space-y-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span>이미지 업로드</span>
            <span className="text-slate-500 font-normal">(선택, 최대 3장)</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {images.length} / 3 장
          </span>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          onClick={() => images.length < 3 && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : images.length >= 3
              ? 'border-slate-800 bg-slate-950/40 opacity-60 cursor-not-allowed'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
            <Upload className="w-4 h-4 text-amber-400" />
          </div>

          <p className="text-xs font-medium text-slate-300">
            클릭하여 이미지 선택 또는 Drag & Drop
          </p>
          <p className="text-[11px] text-slate-500">
            JPG, PNG, WEBP 지원 (원본사진 / 합성개체 / 참고사진)
          </p>
        </div>

        {/* Quick Sample Buttons */}
        {images.length < 3 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500">빠른 테스트:</span>
            <button
              type="button"
              onClick={handleAddSampleOriginal}
              className="text-[11px] font-medium text-amber-300 hover:text-amber-200 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              + 인물 샘플
            </button>
            <button
              type="button"
              onClick={handleAddSampleComposite}
              className="text-[11px] font-medium text-amber-300 hover:text-amber-200 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              + 합성 개체
            </button>
          </div>
        )}

        {/* Uploaded Image Cards List */}
        <div className="space-y-2.5 overflow-y-auto max-h-[280px] pr-1">
          {images.map((img) => (
            <div
              key={img.id}
              className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center gap-3 relative group hover:border-slate-700 transition-all"
            >
              <img
                src={img.dataUrl}
                alt={img.label}
                className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-900"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {img.label}
                  </span>
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Role Selector Tabs */}
                <div className="flex items-center gap-1">
                  {(['original', 'composite', 'reference'] as ImageRole[]).map((r) => {
                    const rNames: Record<ImageRole, string> = {
                      original: '원본',
                      composite: '합성개체',
                      reference: '참고',
                    };
                    const isSelected = img.role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(img.id, r)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {rNames[r]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-800/40 text-center">
              <p className="text-xs text-slate-500">
                업로드된 이미지가 없습니다. 위 영역에서 이미지를 추가하세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Generate Button in Input Panel */}
      <div className="pt-2 mt-auto border-t border-slate-800">
        <button
          onClick={onExecute}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? '이미지 변환 진행 중...' : '✨ 이미지 생성 실행하기'}</span>
        </button>
      </div>
    </div>
  );
};
