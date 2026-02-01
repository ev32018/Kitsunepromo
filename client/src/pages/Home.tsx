import { useState, useRef, useCallback } from "react";
import { AudioUploader } from "@/components/AudioUploader";
import { VisualizerCanvas, type VisualizerCanvasHandle } from "@/components/VisualizerCanvas";
import { AudioPlayer } from "@/components/AudioPlayer";
import { VisualizationStylePicker } from "@/components/VisualizationStylePicker";
import { ColorSchemePicker } from "@/components/ColorSchemePicker";
import { VisualizationControls } from "@/components/VisualizationControls";
import { ExportControls } from "@/components/ExportControls";
import { AIBackgroundGenerator } from "@/components/AIBackgroundGenerator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { VisualizationType, ColorScheme } from "@shared/schema";
import { Music, Waves } from "lucide-react";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [visualizationType, setVisualizationType] = useState<VisualizationType>("circular");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("neon");
  const [sensitivity, setSensitivity] = useState(1.5);
  const [barCount, setBarCount] = useState(64);
  const [particleCount, setParticleCount] = useState(150);
  const [glowIntensity, setGlowIntensity] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [aiBackground, setAiBackground] = useState<string | null>(null);

  const visualizerRef = useRef<VisualizerCanvasHandle>(null);

  const handleFileSelect = useCallback((file: File) => {
    setIsLoading(true);
    setAudioFile(file);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsLoading(false);
  }, [audioUrl]);

  const handleClearAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    setAudioElement(null);
    setIsPlaying(false);
  }, [audioUrl]);

  const handleAudioElement = useCallback((element: HTMLAudioElement | null) => {
    setAudioElement(element);
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-80 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 glow-sm">
              <Waves className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold gradient-text">AudioViz</h1>
              <p className="text-xs text-muted-foreground">
                Audio Visualization Studio
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Music className="w-3 h-3" />
                Audio Source
              </h3>
              <AudioUploader
                onFileSelect={handleFileSelect}
                currentFile={audioFile}
                onClear={handleClearAudio}
                isLoading={isLoading}
              />
            </div>

            <Separator className="bg-border/50" />

            <VisualizationStylePicker
              value={visualizationType}
              onChange={setVisualizationType}
            />

            <Separator className="bg-border/50" />

            <ColorSchemePicker
              value={colorScheme}
              onChange={setColorScheme}
            />

            <Separator className="bg-border/50" />

            <VisualizationControls
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
              barCount={barCount}
              onBarCountChange={setBarCount}
              particleCount={particleCount}
              onParticleCountChange={setParticleCount}
              glowIntensity={glowIntensity}
              onGlowIntensityChange={setGlowIntensity}
              rotationSpeed={rotationSpeed}
              onRotationSpeedChange={setRotationSpeed}
              mirrorMode={mirrorMode}
              onMirrorModeChange={setMirrorMode}
            />

            <Separator className="bg-border/50" />

            <AIBackgroundGenerator
              onBackgroundGenerated={setAiBackground}
              currentBackground={aiBackground}
            />

            <Separator className="bg-border/50" />

            <ExportControls
              canvasRef={visualizerRef}
              audioElement={audioElement}
              isPlaying={isPlaying}
              onPlayStateChange={handlePlayStateChange}
            />
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex-1 rounded-xl overflow-hidden border border-border/30 bg-black/50 relative">
            {audioUrl ? (
              <VisualizerCanvas
                ref={visualizerRef}
                audioElement={audioElement}
                isPlaying={isPlaying}
                visualizationType={visualizationType}
                colorScheme={colorScheme}
                sensitivity={sensitivity}
                barCount={barCount}
                particleCount={particleCount}
                glowIntensity={glowIntensity}
                rotationSpeed={rotationSpeed}
                mirrorMode={mirrorMode}
                backgroundImage={aiBackground}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="p-6 rounded-full bg-primary/10 mx-auto w-fit">
                    <Waves className="w-16 h-16 text-primary/50" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-muted-foreground">
                      No Audio Loaded
                    </h2>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Upload an audio file to start visualizing
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <AudioPlayer
              audioUrl={audioUrl}
              onAudioElement={handleAudioElement}
              onPlayStateChange={handlePlayStateChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
