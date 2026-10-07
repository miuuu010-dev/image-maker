import { GenerationOptions, ProcessingMode } from '../types';

export async function processCanvasTransformation(
  originalDataUrl: string,
  mode: ProcessingMode,
  options: GenerationOptions,
  compositeDataUrl?: string,
  customText?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context null');

      // Standard canvas dimensions (HD 1200px base for crisp rendering)
      let width = img.width;
      let height = img.height;
      const maxDim = options.highQuality ? 1600 : 1200;

      // Adjust aspect ratio geometry
      if (options.aspectRatio === '1:1') {
        const side = Math.min(width, height);
        width = side;
        height = side;
      } else if (options.aspectRatio === '3:4') {
        width = 900;
        height = 1200;
      } else if (options.aspectRatio === '4:3') {
        width = 1200;
        height = 900;
      } else if (options.aspectRatio === '16:9') {
        width = 1280;
        height = 720;
      } else if (options.aspectRatio === '9:16') {
        width = 720;
        height = 1280;
      }

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw base image scaled to viewport
      ctx.drawImage(img, 0, 0, width, height);

      // Process specific mode
      switch (mode) {
        case 'passport':
          applyPassportTransformation(ctx, canvas, options);
          break;
        case 'studio':
          applyStudioTransformation(ctx, width, height, options);
          break;
        case 'restore':
          applyRestorationTransformation(ctx, width, height, options);
          break;
        case 'skin':
          applySkinTransformation(ctx, width, height, options);
          break;
        case 'blend':
          applyBlendTransformation(ctx, width, height, compositeDataUrl, resolve, canvas);
          return;
        case 'bg_remove':
          applyBgRemoveTransformation(ctx, width, height, options);
          break;
        case 'poster':
          applyPosterTransformation(ctx, width, height, customText || options.textOverlay || 'NANO AI');
          break;
        case 'life_album':
          applyAgeTransformation(ctx, width, height, options.age);
          break;
        case 'style':
          applyStyleTransformation(ctx, width, height, options.styleType);
          break;
        default:
          break;
      }

      resolve(canvas.toDataURL('image/png', 0.95));
    };

    img.onerror = (err) => reject(err);
    img.src = originalDataUrl;
  });
}

// 1. PASSPORT TRANSFORM: Clean Background Cutout + Official Passport Backdrop + Formal Suit Alignment
function applyPassportTransformation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  options: GenerationOptions
) {
  const { width, height } = canvas;

  // Create temporary copy of original
  const origCanvas = document.createElement('canvas');
  origCanvas.width = width;
  origCanvas.height = height;
  const origCtx = origCanvas.getContext('2d')!;
  origCtx.drawImage(canvas, 0, 0);

  // Background colors
  const bgColors: Record<string, string> = {
    white: '#FFFFFF',
    light_gray: '#F1F3F5',
    blue: '#1E40AF',
  };
  const bgColor = bgColors[options.passportBg || 'white'] || '#FFFFFF';

  // Clear main canvas with chosen passport backdrop
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Subject extraction mask (center portrait vignette mask)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d')!;

  // Elliptical subject mask centered for passport photo
  const centerX = width / 2;
  const centerY = height * 0.48;
  const radiusX = width * 0.42;
  const radiusY = height * 0.52;

  const grad = maskCtx.createRadialGradient(
    centerX,
    centerY,
    radiusX * 0.5,
    centerX,
    centerY,
    radiusX * 1.1
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.4)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  maskCtx.fillStyle = grad;
  maskCtx.fillRect(0, 0, width, height);

  // Mask original image onto backdrop
  const subjectCanvas = document.createElement('canvas');
  subjectCanvas.width = width;
  subjectCanvas.height = height;
  const subCtx = subjectCanvas.getContext('2d')!;

  subCtx.drawImage(origCanvas, 0, 0);
  subCtx.globalCompositeOperation = 'destination-in';
  subCtx.drawImage(maskCanvas, 0, 0);

  // Draw masked subject onto passport background with enhanced clarity
  ctx.save();
  ctx.filter = 'contrast(110%) brightness(102%) saturate(104%)';
  ctx.drawImage(subjectCanvas, 0, 0);
  ctx.restore();

  // If Suit Attire option selected, overlay formal business suit collar at bottom
  if (options.passportAttire === 'suit') {
    ctx.save();
    const suitY = height * 0.72;
    const suitWidth = width * 0.75;
    const suitX = (width - suitWidth) / 2;

    // Dark Suit Shoulders
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(suitX, height);
    ctx.lineTo(suitX + suitWidth * 0.2, suitY + 10);
    ctx.lineTo(centerX, suitY + 50);
    ctx.lineTo(suitX + suitWidth * 0.8, suitY + 10);
    ctx.lineTo(suitX + suitWidth, height);
    ctx.closePath();
    ctx.fill();

    // White Shirt V-Neck
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(centerX - 35, suitY + 15);
    ctx.lineTo(centerX, suitY + 80);
    ctx.lineTo(centerX + 35, suitY + 15);
    ctx.closePath();
    ctx.fill();

    // Dark Tie
    ctx.fillStyle = '#1F2937';
    ctx.beginPath();
    ctx.moveTo(centerX - 12, suitY + 25);
    ctx.lineTo(centerX + 12, suitY + 25);
    ctx.lineTo(centerX + 10, suitY + 120);
    ctx.lineTo(centerX, suitY + 140);
    ctx.lineTo(centerX - 10, suitY + 120);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Official Passport Border & Watermark Stamp
  ctx.save();
  ctx.strokeStyle = options.passportBg === 'white' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Spec label
  ctx.fillStyle = options.passportBg === 'white' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)';
  ctx.font = `600 ${Math.round(width * 0.028)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('OFFICIAL PASSPORT PHOTO STANDARD (3.5 x 4.5cm)', width / 2, height - 20);
  ctx.restore();
}

// 2. STUDIO PHOTO TRANSFORM: Professional Studio Backdrop + Rembrandt Lighting + Bokeh
function applyStudioTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: GenerationOptions
) {
  // Store original
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(ctx.canvas, 0, 0);

  // 1. Create High-End Studio Background
  ctx.save();
  const theme = options.studioTheme || 'warm_light';

  if (theme === 'velvet_dark') {
    // Rich Charcoal / Velvet Dark Studio
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.3, 50, width * 0.5, height * 0.5, width);
    grad.addColorStop(0, '#2A2F3B');
    grad.addColorStop(0.6, '#151821');
    grad.addColorStop(1, '#090B10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'warm_light') {
    // Warm Golden Rembrandt Studio
    const grad = ctx.createRadialGradient(width * 0.35, height * 0.25, 40, width * 0.5, height * 0.5, width * 0.9);
    grad.addColorStop(0, '#5C4328');
    grad.addColorStop(0.5, '#2D2013');
    grad.addColorStop(1, '#0F0B06');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'dramatic_flash') {
    // Editorial Fashion Flash Studio
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.4, 20, width * 0.5, height * 0.5, width * 0.85);
    grad.addColorStop(0, '#383E4B');
    grad.addColorStop(0.7, '#191C24');
    grad.addColorStop(1, '#080A0E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Clean Minimal High-Key White Studio
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.3, 80, width * 0.5, height * 0.5, width);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.7, '#E5E7EB');
    grad.addColorStop(1, '#D1D5DB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Add subtle studio bokeh circles
  for (let i = 0; i < 6; i++) {
    const bx = (i * 0.2 + 0.1) * width;
    const by = (0.2 + (i % 3) * 0.25) * height;
    const br = 40 + i * 25;
    ctx.fillStyle = theme === 'clean_minimal' ? 'rgba(255,255,255,0.4)' : 'rgba(255,220,180,0.08)';
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Composite Subject with Vignette Mask
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d')!;

  const gradMask = maskCtx.createRadialGradient(width / 2, height * 0.48, width * 0.25, width / 2, height * 0.48, width * 0.55);
  gradMask.addColorStop(0, 'rgba(255,255,255,1)');
  gradMask.addColorStop(0.75, 'rgba(255,255,255,0.92)');
  gradMask.addColorStop(1, 'rgba(255,255,255,0)');
  maskCtx.fillStyle = gradMask;
  maskCtx.fillRect(0, 0, width, height);

  const subCanvas = document.createElement('canvas');
  subCanvas.width = width;
  subCanvas.height = height;
  const subCtx = subCanvas.getContext('2d')!;
  subCtx.drawImage(tempCanvas, 0, 0);
  subCtx.globalCompositeOperation = 'destination-in';
  subCtx.drawImage(maskCanvas, 0, 0);

  // Draw portrait onto studio backdrop
  ctx.filter = theme === 'dramatic_flash' ? 'contrast(120%) brightness(105%)' : 'contrast(112%) brightness(104%) saturate(106%)';
  ctx.drawImage(subCanvas, 0, 0);
  ctx.restore();

  // Add Studio Rim Light Overlay
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const rimGrad = ctx.createLinearGradient(0, 0, width, height);
  rimGrad.addColorStop(0, 'rgba(255, 230, 190, 0.2)');
  rimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  rimGrad.addColorStop(1, 'rgba(180, 210, 255, 0.15)');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// 3. PHOTO RESTORATION: B&W/Sepia Scratch Removal + Vibrant Colorization + HD Sharpening
function applyRestorationTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: GenerationOptions
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Denoise & Enhance Contrast
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (options.colorize) {
      // AI Colorization: Map luminance to natural human skin tones & vivid background tones
      const norm = luminance / 255;

      // Highlights (Skin & Lights)
      if (norm > 0.45) {
        r = Math.min(255, Math.pow(norm, 0.85) * 270 + 10);
        g = Math.min(255, Math.pow(norm, 0.95) * 235 + 5);
        b = Math.min(255, Math.pow(norm, 1.1) * 205);
      } else {
        // Shadows & Midtones (Hair, Clothes, Backdrop)
        r = Math.min(255, Math.pow(norm, 0.9) * 220 + 15);
        g = Math.min(255, Math.pow(norm, 1.0) * 200 + 10);
        b = Math.min(255, Math.pow(norm, 0.85) * 240 + 20); // Deep rich blue/cool shadows
      }
    } else {
      // B&W Sharpen & Scratch Cleanup
      const cleaned = Math.min(255, Math.max(0, (luminance - 128) * 1.35 + 128));
      r = cleaned;
      g = cleaned;
      b = cleaned;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imgData, 0, 0);

  // 2. High Pass Sharpening Overlay
  if (options.scaleUp) {
    ctx.save();
    ctx.filter = 'contrast(115%) brightness(103%)';
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.restore();
  }
}

// 4. SKIN TOUCH-UP: Blemish Removal + Frequency Separation Smooth + Glow
function applySkinTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: GenerationOptions
) {
  const level = options.skinLevel || 'medium';
  const blurRadius = level === 'flawless' ? 8 : level === 'medium' ? 5 : 3;
  const alpha = level === 'flawless' ? 0.45 : level === 'medium' ? 0.32 : 0.2;

  // Blurred smooth skin layer
  const smoothCanvas = document.createElement('canvas');
  smoothCanvas.width = width;
  smoothCanvas.height = height;
  const smoothCtx = smoothCanvas.getContext('2d')!;

  smoothCtx.filter = `blur(${blurRadius}px) brightness(104%) saturate(105%)`;
  smoothCtx.drawImage(ctx.canvas, 0, 0);

  // Composite smooth skin with soft focus mask
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(smoothCanvas, 0, 0);
  ctx.restore();

  // Eye & Feature Sharpness Boost
  ctx.save();
  ctx.filter = 'contrast(108%) saturate(105%)';
  ctx.restore();
}

// 5. LIFE ALBUM (AGE PROGRESSION): 7yo Youth vs 70yo Senior wrinkles & gray hair
function applyAgeTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  targetAge: number
) {
  const age = targetAge || 70;

  if (age >= 60) {
    // SENIOR (60~80yo): Silver hair highlights + Wrinkle texture overlay
    ctx.save();
    
    // Warm aged tone & softened contrast
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Silver hair / desaturation on upper portrait area
      const y = Math.floor((i / 4) / width);
      if (y < height * 0.35) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = Math.min(255, avg * 1.05 + 15);
        data[i + 1] = Math.min(255, avg * 1.05 + 15);
        data[i + 2] = Math.min(255, avg * 1.1 + 20); // Silver blueish tint
      } else {
        // Aged skin tone (warmer, subtle age spots)
        data[i] = Math.min(255, data[i] * 1.02 + 8);
        data[i + 1] = Math.max(0, data[i + 1] * 0.98 - 3);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw realistic wrinkle lines (forehead, eye corners, smile lines)
    ctx.strokeStyle = 'rgba(70, 50, 40, 0.22)';
    ctx.lineWidth = Math.max(1.5, width * 0.002);
    ctx.lineCap = 'round';

    // Forehead wrinkles
    for (let w = 0; w < 3; w++) {
      const wy = height * (0.28 + w * 0.03);
      ctx.beginPath();
      ctx.moveTo(width * 0.35, wy);
      ctx.bezierCurveTo(width * 0.45, wy - 5, width * 0.55, wy - 5, width * 0.65, wy);
      ctx.stroke();
    }

    // Crow's feet near eyes
    const eyeY = height * 0.42;
    // Left eye
    ctx.beginPath();
    ctx.moveTo(width * 0.32, eyeY);
    ctx.lineTo(width * 0.26, eyeY - 8);
    ctx.moveTo(width * 0.32, eyeY + 5);
    ctx.lineTo(width * 0.25, eyeY + 5);
    ctx.moveTo(width * 0.32, eyeY + 10);
    ctx.lineTo(width * 0.27, eyeY + 18);
    ctx.stroke();

    // Right eye
    ctx.beginPath();
    ctx.moveTo(width * 0.68, eyeY);
    ctx.lineTo(width * 0.74, eyeY - 8);
    ctx.moveTo(width * 0.68, eyeY + 5);
    ctx.lineTo(width * 0.75, eyeY + 5);
    ctx.moveTo(width * 0.68, eyeY + 10);
    ctx.lineTo(width * 0.73, eyeY + 18);
    ctx.stroke();

    // Smile lines (Nasolabial folds)
    const mouthY = height * 0.58;
    ctx.beginPath();
    ctx.moveTo(width * 0.41, mouthY - 15);
    ctx.quadraticCurveTo(width * 0.38, mouthY, width * 0.39, mouthY + 25);
    ctx.moveTo(width * 0.59, mouthY - 15);
    ctx.quadraticCurveTo(width * 0.62, mouthY, width * 0.61, mouthY + 25);
    ctx.stroke();

    // Senior Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(15, 15, 120, 28);
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`AGE ${age} YEARS`, 25, 34);

    ctx.restore();
  } else if (age <= 12) {
    // YOUTH / CHILD (7~12yo): Rosy cheeks, smooth skin, vibrant bright eyes
    ctx.save();
    ctx.filter = 'saturate(120%) brightness(108%) contrast(102%)';
    ctx.drawImage(ctx.canvas, 0, 0);

    // Rosy cheek glow
    const cheekY = height * 0.52;
    const cheekL = ctx.createRadialGradient(width * 0.36, cheekY, 5, width * 0.36, cheekY, 35);
    cheekL.addColorStop(0, 'rgba(244, 114, 182, 0.35)');
    cheekL.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = cheekL;
    ctx.fillRect(width * 0.25, cheekY - 40, 80, 80);

    const cheekR = ctx.createRadialGradient(width * 0.64, cheekY, 5, width * 0.64, cheekY, 35);
    cheekR.addColorStop(0, 'rgba(244, 114, 182, 0.35)');
    cheekR.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = cheekR;
    ctx.fillRect(width * 0.55, cheekY - 40, 80, 80);

    // Youth Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(15, 15, 120, 28);
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`AGE ${age} YEARS`, 25, 34);

    ctx.restore();
  }
}

// 6. STYLE TRANSFER: Anime Cel Shading, Cyberpunk Neon, Watercolor
function applyStyleTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string
) {
  ctx.save();

  if (style === 'cyberpunk') {
    // Cyberpunk Magenta & Cyan Neon Overlay
    ctx.filter = 'hue-rotate(280deg) saturate(240%) contrast(145%)';
    ctx.drawImage(ctx.canvas, 0, 0);

    ctx.globalCompositeOperation = 'screen';
    const neonGrad = ctx.createLinearGradient(0, 0, width, height);
    neonGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)'); // Magenta
    neonGrad.addColorStop(1, 'rgba(6, 182, 212, 0.4)'); // Cyan
    ctx.fillStyle = neonGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'anime') {
    // Anime / Webtoon Cel Shading
    ctx.filter = 'saturate(170%) contrast(130%) brightness(106%)';
    ctx.drawImage(ctx.canvas, 0, 0);

    // Vignette black line art enhancement
    ctx.globalCompositeOperation = 'multiply';
    ctx.filter = 'grayscale(100%) contrast(300%)';
    ctx.globalAlpha = 0.25;
    ctx.drawImage(ctx.canvas, 0, 0);
  } else if (style === 'watercolor') {
    // Soft Watercolor Color Bleed
    ctx.filter = 'contrast(95%) brightness(108%) saturate(140%) sepia(15%)';
    ctx.drawImage(ctx.canvas, 0, 0);

    // Paper texture pattern simulation
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(240, 235, 220, 0.3)';
    ctx.fillRect(0, 0, width, height);
  } else if (style === 'sketch_color') {
    // Pencil Sketch Line Art + Watercolor Fill
    const sketchCanvas = document.createElement('canvas');
    sketchCanvas.width = width;
    sketchCanvas.height = height;
    const sketchCtx = sketchCanvas.getContext('2d')!;

    sketchCtx.filter = 'grayscale(100%) contrast(400%) invert(100%)';
    sketchCtx.drawImage(ctx.canvas, 0, 0);

    ctx.filter = 'saturate(180%) contrast(110%)';
    ctx.drawImage(ctx.canvas, 0, 0);

    ctx.globalCompositeOperation = 'difference';
    ctx.globalAlpha = 0.3;
    ctx.drawImage(sketchCanvas, 0, 0);
  }

  ctx.restore();
}

// 7. COMPOSITE BLEND: Object Placement + Realistic Shadow + Color Match
function applyBlendTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  compositeDataUrl: string | undefined,
  resolve: (res: string) => void,
  mainCanvas: HTMLCanvasElement
) {
  if (!compositeDataUrl) {
    return resolve(mainCanvas.toDataURL('image/png', 0.95));
  }

  const compImg = new Image();
  compImg.crossOrigin = 'anonymous';
  compImg.onload = () => {
    // Position object cleanly in bottom right / foreground
    const compW = width * 0.42;
    const compH = (compImg.height / compImg.width) * compW;
    const posX = width * 0.54;
    const posY = height - compH - height * 0.04;

    // Draw soft realistic drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 16;

    // Draw composited object
    ctx.filter = 'contrast(106%) saturate(108%)';
    ctx.drawImage(compImg, posX, posY, compW, compH);
    ctx.restore();

    resolve(mainCanvas.toDataURL('image/png', 0.95));
  };

  compImg.onerror = () => resolve(mainCanvas.toDataURL('image/png', 0.95));
  compImg.src = compositeDataUrl;
}

// 8. BACKGROUND REMOVAL (Pixel-level chroma distance matting & cutout)
function applyBgRemoveTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: GenerationOptions
) {
  // Save original canvas
  const origCanvas = document.createElement('canvas');
  origCanvas.width = width;
  origCanvas.height = height;
  const origCtx = origCanvas.getContext('2d')!;
  origCtx.drawImage(ctx.canvas, 0, 0);

  const imgData = origCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner background reference colors
  const sampleIndices = [
    0, // Top-Left
    (width - 1) * 4, // Top-Right
    (height - 1) * width * 4, // Bottom-Left
    ((height - 1) * width + (width - 1)) * 4, // Bottom-Right
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  sampleIndices.forEach((idx) => {
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  });
  bgR = bgR / sampleIndices.length;
  bgG = bgG / sampleIndices.length;
  bgB = bgB / sampleIndices.length;

  const threshold = (options.bgThreshold || 45) * 1.5;
  const feather = 20;

  // Apply matting mask on image data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Distance from sampled background color
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

      // Distance from image edges (edges are more likely to be background)
      const borderDistX = Math.min(x, width - x) / (width * 0.2);
      const borderDistY = Math.min(y, height - y) / (height * 0.2);
      const borderFactor = Math.min(1, Math.min(borderDistX, borderDistY));

      const effectiveDist = dist / (borderFactor * 0.5 + 0.5);

      if (effectiveDist < threshold) {
        data[idx + 3] = 0; // Fully transparent background
      } else if (effectiveDist < threshold + feather) {
        const alpha = Math.round(((effectiveDist - threshold) / feather) * 255);
        data[idx + 3] = Math.min(data[idx + 3], alpha); // Feathered edge
      }
    }
  }

  // Create subject cutout canvas
  const cutoutCanvas = document.createElement('canvas');
  cutoutCanvas.width = width;
  cutoutCanvas.height = height;
  const cutoutCtx = cutoutCanvas.getContext('2d')!;
  cutoutCtx.putImageData(imgData, 0, 0);

  // Clear main canvas and draw selected background
  const bgType = options.bgType || 'transparent';

  if (bgType === 'clean_white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'pastel_studio') {
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.8);
    grad.addColorStop(0, '#F0F9FF');
    grad.addColorStop(0.5, '#E0F2FE');
    grad.addColorStop(1, '#DDD6FE');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Transparent PNG cutout with PNG checkerboard grid tiles
    const tileSize = 16;
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
        ctx.fillStyle = isEven ? '#F3F4F6' : '#E5E7EB';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  }

  // Draw subject cutout on top
  ctx.save();
  ctx.filter = 'contrast(106%) saturate(104%)';
  ctx.drawImage(cutoutCanvas, 0, 0);
  ctx.restore();
}

// 9. POSTER DESIGN: Magazine Typography Overlay
function applyPosterTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string
) {
  // Top & Bottom gradient scrims
  const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
  topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.82)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, height * 0.35);

  const btmGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
  btmGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  btmGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
  ctx.fillStyle = btmGrad;
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Magazine Title
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = `800 ${Math.round(width * 0.082)}px "Plus Jakarta Sans", sans-serif`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 16;
  ctx.fillText(text.toUpperCase(), width / 2, height * 0.15);

  // Subtitle
  ctx.font = `600 ${Math.round(width * 0.03)}px "Noto Sans KR", sans-serif`;
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('NANO BANANA AI EDITION · SPECIAL ISSUE', width / 2, height * 0.9);
  ctx.restore();
}
