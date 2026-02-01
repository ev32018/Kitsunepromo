import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { AudioAnalyzer } from "@/lib/audioAnalyzer";
import { drawVisualization, clearParticles, resetRotation } from "@/lib/visualizers";
import type { VisualizationType, ColorScheme } from "@shared/schema";

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
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyzerRef = useRef<AudioAnalyzer | null>(null);
    const animationFrameRef = useRef<number>();
    const bgImageRef = useRef<HTMLImageElement | null>(null);

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

      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const audioData = analyzer.getAudioData();

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
        bgImageRef.current,
        customColors
      );

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
