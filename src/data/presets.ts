import { SamplePreset } from '../types';
import vintageImg from '../assets/images/sample_vintage_photo_1790834861782.jpg';
import casualImg from '../assets/images/sample_casual_portrait_1790834876453.jpg';
import puppyImg from '../assets/images/sample_cutout_puppy_1790834889233.jpg';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'preset_passport',
    title: '여권사진 규격 변환',
    description: '일상 셀카/인물 사진을 단정한 흰색 배경의 공식 여권사진으로 자동 편집합니다.',
    mode: 'passport',
    idea: '자연스러운 정면 조명과 깨끗한 흰색 배경의 표준 여권사진으로 제작해줘',
    sampleOriginalUrl: casualImg,
    optionsPartial: {
      passportBg: 'white',
      passportAttire: 'suit',
      aspectRatio: '3:4',
    },
  },
  {
    id: 'preset_restore',
    title: '오래된 사진 복원 및 컬러화',
    description: '빛바랜 흑백 옛날 사진의 스크래치를 제거하고선명한 HD 컬러로 복원합니다.',
    mode: 'restore',
    idea: '1950년대 빛바랜 흑백 사진의 스크래치와 노이즈를 제거하고 선명한 자연스러운 컬러로 선명하게 복원해줘',
    sampleOriginalUrl: vintageImg,
    optionsPartial: {
      colorize: true,
      scaleUp: true,
      scratchFix: true,
      aspectRatio: '3:4',
    },
  },
  {
    id: 'preset_blend',
    title: '자연스러운 개체 정밀 합성',
    description: '원본 사진에 귀여운 강아지 개체를 자연스러운 조명과 그림자로 정밀 합성합니다.',
    mode: 'blend',
    idea: '인물 옆자리에 귀여운 골든 리트리버 강아지를 자연스러운 조명과 그림자로 조화롭게 합성해줘',
    sampleOriginalUrl: casualImg,
    sampleCompositeUrl: puppyImg,
    optionsPartial: {
      aspectRatio: '1:1',
    },
  },
  {
    id: 'preset_studio',
    title: '하이엔드 스튜디오 프로필',
    description: '평범한 인물 사진을 고급 스튜디오의 조명과 보케 배경 프로필 사진으로 변환합니다.',
    mode: 'studio',
    idea: '고급 프로필 스튜디오에서 촬영한 듯한 분위기 있는 조명과 소프트 보케 배경으로 제작해줘',
    sampleOriginalUrl: casualImg,
    optionsPartial: {
      studioTheme: 'warm_light',
      aspectRatio: '4:3',
    },
  },
  {
    id: 'preset_life_album',
    title: '인생앨범 70세 나이 변환',
    description: '인물의 원래 이목구비를 정확히 유지하면서 자연스럽게 70세 노년 모습으로 변환합니다.',
    mode: 'life_album',
    idea: '인물의 본래 고유한 얼굴 구조와 눈매를 유지하면서 자연스러운 70세 모습을 완성해줘',
    sampleOriginalUrl: casualImg,
    optionsPartial: {
      age: 70,
      aspectRatio: '1:1',
    },
  },
  {
    id: 'preset_poster',
    title: '감성 매거진 포스터 제작',
    description: '인물 사진에 스타일리시한 텍스트 포스터 타이포그래피를 레이아웃에 추가합니다.',
    mode: 'poster',
    idea: '사진 상단과 하단에 고품격 잡지 표지 스타일의 로고 및 영문 텍스트 타이포그래피를 디자인해줘',
    sampleOriginalUrl: casualImg,
    optionsPartial: {
      textOverlay: 'NANO AI MAGAZINE',
      textStyle: 'luxury_serif',
      aspectRatio: '3:4',
    },
  },
];
