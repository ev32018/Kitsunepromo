import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { AudioAnalyzer } from "@/lib/audioAnalyzer";
import { drawVisualization, clearParticles, resetRotation } from "@/lib/visualizers";
import type { VisualizationType, ColorScheme } from "@shared/schema";

interface VisualizerCanvasProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  visualizationType: VisualizationType;
  colorScheme: ColorScheme;
  sensitivity: number;
  barCount: number;
  particleCount: number;
  glowIntensity: number;
  rotationSpeed: number;
  mirrorMode: boolean;
  backgroundImage?: string | null;
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
      sensitivity,
      barCount,
      particleCount,
      glowIntensity,
      rotationSpeed,
      mirrorMode,
      backgroundImage,
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
        bgImageRef.current
      );

      animationFrameRef.current = requestAnimationFrame(draw);
    }, [
      visualizationType,
      colorScheme,
      sensitivity,
      barCount,
      particleCount,
      glowIntensity,
      rotationSpeed,
      mirrorMode,
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
