import { useState, useRef, useCallback, useEffect } from "react";
import { AudioUploader } from "@/components/AudioUploader";
import { VisualizerCanvas, type VisualizerCanvasHandle } from "@/components/VisualizerCanvas";
import { AudioPlayer } from "@/components/AudioPlayer";
import { VisualizationStylePicker } from "@/components/VisualizationStylePicker";
import { ColorSchemePicker } from "@/components/ColorSchemePicker";
import { VisualizationControls } from "@/components/VisualizationControls";
import { ExportControls } from "@/components/ExportControls";
import { AIBackgroundGenerator } from "@/components/AIBackgroundGenerator";
import { PresetManager } from "@/components/PresetManager";
import { CustomColorPicker } from "@/components/CustomColorPicker";
import { ImageEffectsSettings, defaultImageEffects, type ImageEffectSettings } from "@/components/ImageEffectsSettings";
import { AspectRatioSettings, defaultAspectRatioConfig, type AspectRatioConfig } from "@/components/AspectRatioSettings";
import { BlendModeSettings, defaultBlendModeConfig, type BlendModeConfig } from "@/components/BlendModeSettings";
import { KenBurnsSettings, defaultKenBurnsConfig, type KenBurnsConfig } from "@/components/KenBurnsSettings";
import { ParticleOverlaySettings, defaultParticleOverlayConfig, type ParticleOverlayConfig } from "@/components/ParticleOverlaySettings";
import { TextOverlaySettings, defaultTextOverlayConfig, type TextOverlayConfig } from "@/components/TextOverlaySettings";
import { ProgressBarSettings, defaultProgressBarConfig, type ProgressBarConfig } from "@/components/ProgressBarSettings";
import { TemplateGallery, type Template } from "@/components/TemplateGallery";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VisualizationType, ColorScheme, VisualizationSettings } from "@shared/schema";
import { Music, Waves, Maximize, Minimize, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [visualizationType, setVisualizationType] = useState<VisualizationType>("circular");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("neon");
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [sensitivity, setSensitivity] = useState(1.5);
  const [barCount, setBarCount] = useState(64);
  const [particleCount, setParticleCount] = useState(150);
  const [glowIntensity, setGlowIntensity] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [aiBackground, setAiBackground] = useState<string | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [imageEffects, setImageEffects] = useState<ImageEffectSettings>(defaultImageEffects);
  const [aspectRatioConfig, setAspectRatioConfig] = useState<AspectRatioConfig>(defaultAspectRatioConfig);
  const [blendModeConfig, setBlendModeConfig] = useState<BlendModeConfig>(defaultBlendModeConfig);
  const [kenBurnsConfig, setKenBurnsConfig] = useState<KenBurnsConfig>(defaultKenBurnsConfig);
  const [particleOverlayConfig, setParticleOverlayConfig] = useState<ParticleOverlayConfig>(defaultParticleOverlayConfig);
  const [textOverlayConfig, setTextOverlayConfig] = useState<TextOverlayConfig>(defaultTextOverlayConfig);
  const [progressBarConfig, setProgressBarConfig] = useState<ProgressBarConfig>(defaultProgressBarConfig);

  const visualizerRef = useRef<VisualizerCanvasHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    setIsLoading(true);
    setAudioFile(file);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsLoading(false);
    setBpm(null);
  }, [audioUrl]);

  const handleClearAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    setAudioElement(null);
    setIsPlaying(false);
    setBpm(null);
  }, [audioUrl]);

  const handleAudioElement = useCallback((element: HTMLAudioElement | null) => {
    setAudioElement(element);
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (e) {
        console.error("Fullscreen failed:", e);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (e) {
        console.error("Exit fullscreen failed:", e);
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          if (audioElement) {
            if (isPlaying) {
              audioElement.pause();
              setIsPlaying(false);
            } else {
              audioElement.play();
              setIsPlaying(true);
            }
          }
          break;
        case "arrowleft":
          e.preventDefault();
          if (audioElement) {
            audioElement.currentTime = Math.max(0, audioElement.currentTime - 5);
          }
          break;
        case "arrowright":
          e.preventDefault();
          if (audioElement) {
            audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + 5);
          }
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          if (audioElement) {
            audioElement.muted = !audioElement.muted;
          }
          break;
        case "?":
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audioElement, isPlaying, toggleFullscreen]);

  const loadPreset = useCallback((preset: {
    visualizationType: VisualizationType;
    colorScheme: ColorScheme;
    customColors?: string[];
    settings: VisualizationSettings;
    overlayText?: string;
    overlayPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  }) => {
    setVisualizationType(preset.visualizationType);
    setColorScheme(preset.colorScheme);
    if (preset.customColors) setCustomColors(preset.customColors);
    setSensitivity(preset.settings.sensitivity);
    setBarCount(preset.settings.barCount);
    setParticleCount(preset.settings.particleCount);
    setGlowIntensity(preset.settings.glowIntensity);
    setRotationSpeed(preset.settings.rotationSpeed);
    setMirrorMode(preset.settings.mirrorMode);
    if (preset.overlayText || preset.overlayPosition) {
      setTextOverlayConfig(prev => ({
        ...prev,
        text: preset.overlayText || prev.text,
        position: preset.overlayPosition || prev.position,
      }));
    }
    toast({ title: "Preset loaded", description: "Visualization settings applied." });
  }, [toast]);

  const applyTemplate = useCallback((template: Template) => {
    const { config } = template;
    setVisualizationType(config.visualizationType);
    setColorScheme(config.colorScheme);
    if (config.customColors) setCustomColors(config.customColors);
    setSensitivity(config.sensitivity);
    setBarCount(config.barCount);
    setParticleCount(config.particleCount);
    setGlowIntensity(config.glowIntensity);
    setRotationSpeed(config.rotationSpeed);
    setMirrorMode(config.mirrorMode);
    if (config.aspectRatio) setAspectRatioConfig(config.aspectRatio);
    if (config.kenBurns) setKenBurnsConfig(config.kenBurns);
    if (config.blendMode) setBlendModeConfig(config.blendMode);
    if (config.particleOverlay) setParticleOverlayConfig(config.particleOverlay);
    if (config.textOverlay) setTextOverlayConfig(prev => ({ ...prev, ...config.textOverlay }));
    if (config.progressBar) setProgressBarConfig(config.progressBar);
    toast({ title: "Template applied", description: `"${template.name}" settings loaded.` });
  }, [toast]);

  const getCurrentSettings = useCallback((): VisualizationSettings => ({
    sensitivity,
    smoothing: 0.8,
    barCount,
    particleCount,
    glowIntensity,
    rotationSpeed,
    colorIntensity: 1,
    mirrorMode,
  }), [sensitivity, barCount, particleCount, glowIntensity, rotationSpeed, mirrorMode]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
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
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowShortcuts(prev => !prev)}
                className="h-8 w-8"
                data-testid="button-shortcuts"
              >
                <Keyboard className="w-4 h-4" />
              </Button>
            </div>
            {showShortcuts && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                <p className="font-medium mb-2">Keyboard Shortcuts</p>
                <div className="flex justify-between"><span>Play/Pause</span><Badge variant="secondary">Space</Badge></div>
                <div className="flex justify-between"><span>Seek -5s</span><Badge variant="secondary">←</Badge></div>
                <div className="flex justify-between"><span>Seek +5s</span><Badge variant="secondary">→</Badge></div>
                <div className="flex justify-between"><span>Fullscreen</span><Badge variant="secondary">F</Badge></div>
                <div className="flex justify-between"><span>Mute</span><Badge variant="secondary">M</Badge></div>
              </div>
            )}
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
                {bpm && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">BPM: {bpm}</Badge>
                  </div>
                )}
              </div>

              <Separator className="bg-border/50" />

              <TemplateGallery onApplyTemplate={applyTemplate} />

              <Separator className="bg-border/50" />

              <PresetManager
                currentSettings={{
                  visualizationType,
                  colorScheme,
                  customColors: customColors.length > 0 ? customColors : undefined,
                  settings: getCurrentSettings(),
                  overlayText: textOverlayConfig.text || undefined,
                  overlayPosition: textOverlayConfig.position,
                }}
                onLoadPreset={loadPreset}
              />

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

              <CustomColorPicker
                colors={customColors}
                onChange={setCustomColors}
                enabled={customColors.length > 0}
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

              <AspectRatioSettings
                config={aspectRatioConfig}
                onConfigChange={setAspectRatioConfig}
              />

              <Separator className="bg-border/50" />

              <TextOverlaySettings
                config={textOverlayConfig}
                onConfigChange={setTextOverlayConfig}
              />

              <Separator className="bg-border/50" />

              <ProgressBarSettings
                config={progressBarConfig}
                onConfigChange={setProgressBarConfig}
              />

              <Separator className="bg-border/50" />

              <AIBackgroundGenerator
                onBackgroundGenerated={setAiBackground}
                currentBackground={aiBackground}
              />

              <Separator className="bg-border/50" />

              <ImageEffectsSettings
                imageUrl={customImage}
                onImageChange={setCustomImage}
                effects={imageEffects}
                onEffectsChange={setImageEffects}
              />

              <BlendModeSettings
                config={blendModeConfig}
                onConfigChange={setBlendModeConfig}
                hasImageEffects={!!customImage && imageEffects.enabled}
              />

              <KenBurnsSettings
                config={kenBurnsConfig}
                onConfigChange={setKenBurnsConfig}
                hasImage={!!customImage}
              />

              <Separator className="bg-border/50" />

              <ParticleOverlaySettings
                config={particleOverlayConfig}
                onConfigChange={setParticleOverlayConfig}
              />

              <Separator className="bg-border/50" />

              <ExportControls
                canvasRef={visualizerRef}
                audioElement={audioElement}
                isPlaying={isPlaying}
                onPlayStateChange={handlePlayStateChange}
                aspectRatio={aspectRatioConfig.ratio}
                letterboxColor={aspectRatioConfig.letterboxColor}
              />
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex flex-col gap-4 h-full">
            <div 
              ref={containerRef}
              className={`relative w-full max-h-[60vh] rounded-xl overflow-hidden border border-border/30 ${
                aspectRatioConfig.ratio === "16:9" ? "aspect-video" :
                aspectRatioConfig.ratio === "9:16" ? "aspect-[9/16] max-w-[40%] mx-auto" :
                aspectRatioConfig.ratio === "1:1" ? "aspect-square max-w-[60%] mx-auto" :
                aspectRatioConfig.ratio === "4:5" ? "aspect-[4/5] max-w-[50%] mx-auto" :
                "aspect-video"
              }`}
              style={{ backgroundColor: aspectRatioConfig.letterboxColor }}
            >
              {audioUrl ? (
                <>
                  <VisualizerCanvas
                    ref={visualizerRef}
                    audioElement={audioElement}
                    isPlaying={isPlaying}
                    visualizationType={visualizationType}
                    colorScheme={colorScheme}
                    customColors={customColors.length > 0 ? customColors : undefined}
                    sensitivity={sensitivity}
                    barCount={barCount}
                    particleCount={particleCount}
                    glowIntensity={glowIntensity}
                    rotationSpeed={rotationSpeed}
                    mirrorMode={mirrorMode}
                    backgroundImage={aiBackground}
                    customImage={customImage}
                    imageEffects={imageEffects}
                    blendMode={blendModeConfig.mode}
                    blendOpacity={blendModeConfig.opacity}
                    kenBurnsConfig={kenBurnsConfig}
                    particleOverlayConfig={particleOverlayConfig}
                    textOverlayConfig={textOverlayConfig}
                    progressBarConfig={progressBarConfig}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                    data-testid="button-fullscreen"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </>
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

            <div className="w-full">
              <AudioPlayer
                audioUrl={audioUrl}
                onAudioElement={handleAudioElement}
                onPlayStateChange={handlePlayStateChange}
                onBpmDetected={setBpm}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
