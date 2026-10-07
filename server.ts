import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Resolve image dataUrl, local path, or HTTP URL into clean base64 data
async function resolveImageBase64(dataUrl: string): Promise<{ mimeType: string; data: string }> {
  if (!dataUrl) {
    return { mimeType: 'image/png', data: '' };
  }

  if (dataUrl.startsWith('data:')) {
    const parts = dataUrl.split(';base64,');
    const mimeType = parts[0].replace('data:', '') || 'image/png';
    return { mimeType, data: parts[1] };
  }

  if (dataUrl.startsWith('/') || dataUrl.startsWith('src/')) {
    const cleanPath = dataUrl.startsWith('/') ? dataUrl.slice(1) : dataUrl;
    const fullPath = path.resolve(process.cwd(), cleanPath);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
      return { mimeType, data: buffer.toString('base64') };
    }
  }

  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    try {
      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/png';
      return { mimeType: contentType, data: buffer.toString('base64') };
    } catch (err) {
      console.warn('Failed to fetch remote image URL:', dataUrl, err);
    }
  }

  return { mimeType: 'image/png', data: dataUrl };
}

// 1. AI Prompt Auto-Generator Endpoint
app.post('/api/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { mode, userIdea, hasOriginal, hasComposite, extraOptions } = req.body;

    const promptText = `
Role: Expert AI Image Prompt Designer for Nano Banana Image Studio.
Task: Generate a detailed, highly effective AI image prompt in Korean and English based on the user's input idea and selected mode.

User Mode: ${mode || 'General'}
User Idea: ${userIdea || 'None provided'}
Uploaded Images Info: Original Photo present? ${hasOriginal ? 'Yes' : 'No'}, Composite/Object Photo present? ${hasComposite ? 'Yes' : 'No'}.
Extra Settings: ${JSON.stringify(extraOptions || {})}

Requirements:
1. Provide a concise, clear title.
2. Provide an expanded English prompt optimized for Gemini / Nano Banana image synthesis, preserving facial features, lighting, subject identity, and exact style instructions.
3. Provide a clear Korean summary explaining what the AI will do.
4. Output strict JSON with keys: "title", "promptEn", "explanationKo".
`;

    if (!apiKey) {
      return res.json({
        title: `${mode || 'AI'} 프롬프트 자동 완성`,
        promptEn: `High quality studio shot of ${userIdea || 'a subject'}, hyper-realistic, photorealistic details, 8k resolution, cinematic lighting, maintaining face subject identity.`,
        explanationKo: `'${userIdea || mode}' 아이디어를 기반으로 정밀한 일관성 유지 프롬프트가 작성되었습니다.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (e) {
        // fallback
      }
    }

    return res.json({
      title: `${mode || 'AI'} 프롬프트 자동 완성`,
      promptEn: `High quality image, ${userIdea}, photorealistic, studio lighting, detailed texture.`,
      explanationKo: `입력된 아이디어를 바탕으로 고화질 합성 프롬프트를 생성하였습니다.`,
    });
  } catch (error: any) {
    console.error('Prompt Gen Error:', error);
    return res.status(500).json({ error: error.message || 'Prompt generation failed' });
  }
});

// 2. Image Processing & Generation Endpoint
app.post('/api/process-image', async (req: Request, res: Response) => {
  try {
    const {
      mode,
      prompt,
      images, // array of { id, role, dataUrl }
      options, // { aspectRatio, count, age, passportBg, textOverlay, skinLevel, styleType, colorize, scaleUp }
    } = req.body;

    // Use gemini-3.1-flash-lite-image by default or gemini-3.1-flash-image when requested
    const selectedModel = options?.highQuality ? 'gemini-3.1-flash-image' : 'gemini-3.1-flash-lite-image';

    // Construct detailed prompt instruction depending on mode
    let masterPrompt = prompt || '';

    switch (mode) {
      case 'passport':
        masterPrompt = `[PASSPORT PHOTO MODE] Transform input photo into an official passport photo compliance standard. Plain white or off-white background, formal lighting, straight front camera angle, head and upper shoulders centered, sharp focus on eyes, clean facial features, formal business attire. ${masterPrompt}`;
        break;
      case 'studio':
        masterPrompt = `[STUDIO PORTRAIT MODE] Transform photo into a professional studio portrait photo shot with high-end camera, softbox studio lighting, rich depth of field, subtle bokeh background, professional photo studio atmosphere. ${masterPrompt}`;
        break;
      case 'restore':
        masterPrompt = `[PHOTO RESTORATION & UPSCALE MODE] Restore old vintage photo. Fix scratches, eliminate noise, restore faded colors, sharp detail upscale, clear skin and facial details while preserving original photo historic authenticity. ${options?.colorize ? 'Full vibrant realistic colorization.' : ''} ${masterPrompt}`;
        break;
      case 'skin':
        masterPrompt = `[SKIN TOUCH-UP MODE] Retouch skin naturally. Remove acne, blemishes, red spots, and wrinkles. Smooth skin texture while maintaining natural pore detail, realistic face identity, crisp eyes, and natural skin tone. Level: ${options?.skinLevel || 'High'}. ${masterPrompt}`;
        break;
      case 'blend':
        masterPrompt = `[NATURAL OBJECT BLEND MODE] Harmoniously blend objects from composite photo into the main original photo. Match lighting, shadows, perspective, color balance, and scale seamlessly while keeping subject facial identity intact. ${masterPrompt}`;
        break;
      case 'bg_remove':
        masterPrompt = `[BACKGROUND REMOVAL & ERASE MODE] Remove background or unwanted objects cleanly. Subject isolated with precise edge detection. ${masterPrompt}`;
        break;
      case 'poster':
        masterPrompt = `[TEXT POSTER MODE] Add stylish typographic layout to the photo. Poster style text overlay: "${options?.textOverlay || 'STORY'}". Professional graphic design composition, modern font styling, editorial branding look. ${masterPrompt}`;
        break;
      case 'life_album':
        masterPrompt = `[LIFE ALBUM AGE PROGRESSION MODE] Transform the subject's face naturally to age ${options?.age || 30} years old. Keep exact facial identity structure, eyes, and bone structure while adapting skin, hair, and age characteristics naturally. ${masterPrompt}`;
        break;
      case 'style':
        masterPrompt = `[STYLE TRANSFER MODE] Re-render image in ${options?.styleType || 'Anime'} artistic style. Artistic interpretation with vibrant colors, consistent line art, maintaining core subject pose and composition. ${masterPrompt}`;
        break;
      default:
        break;
    }

    // Build Gemini multimodal parts
    const parts: any[] = [];

    // Attach uploaded images with proper base64 resolution
    if (Array.isArray(images) && images.length > 0) {
      for (const imgObj of images) {
        if (imgObj.dataUrl) {
          const { mimeType, data } = await resolveImageBase64(imgObj.dataUrl);
          if (data) {
            parts.push({
              inlineData: {
                mimeType,
                data,
              },
            });
          }
        }
      }
    }

    // Attach text prompt
    parts.push({
      text: masterPrompt + ` Aspect Ratio: ${options?.aspectRatio || '1:1'}. Maintain strict character consistency from input images.`,
    });

    console.log(`Processing image with model ${selectedModel}, mode: ${mode}, parts count: ${parts.length}`);

    if (apiKey) {
      try {
        const genResponse = await ai.models.generateContent({
          model: selectedModel,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: options?.aspectRatio || '1:1',
            },
          },
        });

        const candidates = genResponse.candidates;
        if (candidates && candidates[0]?.content?.parts) {
          const outputImages: string[] = [];
          for (const part of candidates[0].content.parts) {
            if (part.inlineData) {
              const mime = part.inlineData.mimeType || 'image/png';
              outputImages.push(`data:${mime};base64,${part.inlineData.data}`);
            }
          }

          if (outputImages.length > 0) {
            return res.json({
              success: true,
              images: outputImages,
              promptUsed: masterPrompt,
              mode,
            });
          }
        }
      } catch (genError: any) {
        console.warn('Gemini image generation warning, falling back to smart canvas engine:', genError.message);
      }
    }

    // Return structured response for client canvas engine fallback
    return res.json({
      success: true,
      requiresCanvasRender: true,
      masterPrompt,
      mode,
      options,
    });
  } catch (error: any) {
    console.error('Process Image Error:', error);
    return res.status(500).json({ error: error.message || 'Image processing failed' });
  }
});

// Vite Integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
