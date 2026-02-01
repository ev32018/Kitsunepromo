import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { AudioAnalyzer } from "@/lib/audioAnalyzer";
import { 
  drawVisualization, 
  clearParticles, 
  resetRotation, 
  applyImageEffects, 
  resetImageRotation,
  drawParticleOverlay,
  drawProgressBar,
  drawTextOverlay,
  drawWatermark,
  getKenBurnsTransform,
  resetKenBurns,
  clearOverlayParticles,
  type ParticleOverlayConfig,
  type ProgressBarConfig,
  type TextOverlayConfig,
  type KenBurnsConfig,
  type WatermarkConfig,
} from "@/lib/visualizers";
import type { VisualizationType, ColorScheme } from "@shared/schema";
import type { ImageEffectSettings } from "@/components/ImageEffectsSettings";
import type { BlendMode } from "@/components/BlendModeSettings";

interface VisualizerCanvasProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  visualizationType: VisualizationType;
  colorScheme: ColorScheme;
  customColors?: string[];
  sensitivity: number;
  barCount: number;
  particleCount: number;
  glowIntensity: number;
  rotationSpeed: number;
  mirrorMode: boolean;
  backgroundImage?: string | null;
  overlayText?: string;
  overlayPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  customImage?: string | null;
  imageEffects?: ImageEffectSettings;
  blendMode?: BlendMode;
  blendOpacity?: number;
  kenBurnsConfig?: KenBurnsConfig;
  particleOverlayConfig?: ParticleOverlayConfig;
  textOverlayConfig?: TextOverlayConfig;
  progressBarConfig?: ProgressBarConfig;
  watermarkConfig?: WatermarkConfig;
}

export interface VisualizerCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

export const VisualizerCanvas = forwardRef<VisualizerCanvasHandle, VisualizerCanvasProps>(
  (
    {
      audioElement,
      isPlaying,
      visualizationType,
      colorScheme,
      customColors,
      sensitivity,
      barCount,
      particleCount,
      glowIntensity,
      rotationSpeed,
      mirrorMode,
      backgroundImage,
      overlayText,
      overlayPosition = "bottom-right",
      customImage,
      imageEffects,
      blendMode = "normal",
      blendOpacity = 1,
      kenBurnsConfig,
      particleOverlayConfig,
      textOverlayConfig,
      progressBarConfig,
      watermarkConfig,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyzerRef = useRef<AudioAnalyzer | null>(null);
    const animationFrameRef = useRef<number>();
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const customImageRef = useRef<HTMLImageElement | null>(null);
    const lastTimeRef = useRef<number>(Date.now());

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      if (backgroundImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          bgImageRef.current = img;
        };
        img.src = backgroundImage;
      } else {
        bgImageRef.current = null;
      }
    }, [backgroundImage]);

    useEffect(() => {
      if (customImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          customImageRef.current = img;
          resetImageRotation();
        };
        img.src = customImage;
      } else {
        customImageRef.current = null;
        resetImageRotation();
      }
    }, [customImage]);

    useEffect(() => {
      if (!audioElement) return;

      const initAnalyzer = async () => {
        if (!analyzerRef.current) {
          analyzerRef.current = new AudioAnalyzer(2048);
        }
        try {
          await analyzerRef.current.initialize(audioElement);
        } catch (e) {
          console.error("Failed to initialize audio analyzer:", e);
        }
      };

      initAnalyzer();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [audioElement]);

    const drawOverlay = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      if (!overlayText) return;

      const padding = 20;
      const fontSize = Math.max(14, canvas.width * 0.02);
      
      ctx.save();
      ctx.font = `${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const textMetrics = ctx.measureText(overlayText);
      let x: number, y: number;

      switch (overlayPosition) {
        case "top-left":
          x = padding;
          y = padding + fontSize;
          ctx.textAlign = "left";
          break;
        case "top-right":
          x = canvas.width - padding;
          y = padding + fontSize;
          ctx.textAlign = "right";
          break;
        case "bottom-left":
          x = padding;
          y = canvas.height - padding;
          ctx.textAlign = "left";
          break;
        case "bottom-right":
          x = canvas.width - padding;
          y = canvas.height - padding;
          ctx.textAlign = "right";
          break;
        case "center":
          x = canvas.width / 2;
          y = canvas.height / 2;
          ctx.textAlign = "center";
          break;
        default:
          x = canvas.width - padding;
          y = canvas.height - padding;
          ctx.textAlign = "right";
      }

      ctx.fillText(overlayText, x, y);
      ctx.restore();
    }, [overlayText, overlayPosition]);

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const analyzer = analyzerRef.current;

      if (!canvas || !ctx || !analyzer) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const currentTime = Date.now();
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      const time = currentTime * 0.001;

      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const audioData = analyzer.getAudioData();

      const hasImageEffects = !!(customImageRef.current && imageEffects?.enabled);
      const shouldHideVisualization = hasImageEffects && imageEffects?.hideVisualization;
      
      // Apply Ken Burns effect to custom image
      if (hasImageEffects && kenBurnsConfig?.enabled) {
        const transform = getKenBurnsTransform(kenBurnsConfig, deltaTime);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(transform.scale, transform.scale);
        ctx.translate(-canvas.width / 2 + transform.x, -canvas.height / 2 + transform.y);
        applyImageEffects(ctx, canvas, audioData, customImageRef.current!, imageEffects);
        ctx.restore();
      } else if (hasImageEffects) {
        applyImageEffects(ctx, canvas, audioData, customImageRef.current!, imageEffects);
      }

      if (!shouldHideVisualization) {
        // Apply blend mode for visualization overlay
        if (hasImageEffects && blendMode !== "normal") {
          ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
          ctx.globalAlpha = blendOpacity;
        }

        drawVisualization(
          ctx,
          canvas,
          audioData,
          visualizationType,
          colorScheme,
          {
            sensitivity,
            barCount,
            particleCount,
            glowIntensity,
            rotationSpeed,
            mirrorMode,
            smoothing: 0.8,
            colorIntensity: 1,
          },
          hasImageEffects ? null : bgImageRef.current,
          customColors,
          hasImageEffects
        );

        // Reset blend mode
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }

      // Draw particle overlay
      if (particleOverlayConfig?.enabled) {
        drawParticleOverlay(ctx, canvas, audioData, particleOverlayConfig);
      }

      // Draw progress bar
      if (progressBarConfig?.enabled && audioElement) {
        drawProgressBar(ctx, canvas, audioElement.currentTime, audioElement.duration, audioData, progressBarConfig);
      }

      // Draw text overlay
      if (textOverlayConfig?.text) {
        drawTextOverlay(ctx, canvas, audioData, textOverlayConfig, time);
      }

      // Draw watermark
      if (watermarkConfig?.enabled && watermarkConfig?.imageUrl) {
        drawWatermark(ctx, canvas, watermarkConfig);
      }

      // Draw legacy overlay text (for backward compatibility)
      drawOverlay(ctx, canvas);

      animationFrameRef.current = requestAnimationFrame(draw);
    }, [
      visualizationType,
      colorScheme,
      customColors,
      sensitivity,
      barCount,
      particleCount,
      glowIntensity,
      rotationSpeed,
      mirrorMode,
      drawOverlay,
      imageEffects,
      blendMode,
      blendOpacity,
      kenBurnsConfig,
      particleOverlayConfig,
      textOverlayConfig,
      progressBarConfig,
      watermarkConfig,
      audioElement,
    ]);

    useEffect(() => {
      if (isPlaying) {
        analyzerRef.current?.resume();
        animationFrameRef.current = requestAnimationFrame(draw);
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isPlaying, draw]);

    useEffect(() => {
      clearParticles();
      resetRotation();
    }, [visualizationType]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full visualizer-canvas rounded-lg"
        data-testid="canvas-visualizer"
      />
    );
  }
);

VisualizerCanvas.displayName = "VisualizerCanvas";
