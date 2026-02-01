import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
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
import { AudioTrimmer, defaultTrimConfig, type TrimConfig } from "@/components/AudioTrimmer";
import { WatermarkSettings, defaultWatermarkConfig, type WatermarkConfig } from "@/components/WatermarkSettings";
import { PerformanceSettings, defaultPerformanceConfig, type PerformanceConfig } from "@/components/PerformanceSettings";
import { ThumbnailGenerator } from "@/components/ThumbnailGenerator";
import { FadeSettings, type FadeConfig } from "@/components/FadeSettings";
import { UndoRedoControls } from "@/components/UndoRedoControls";
import { ProjectManager } from "@/components/ProjectManager";
import { QuickExportPresets, type QuickExportConfig } from "@/components/QuickExportPresets";
import { LoopRegion } from "@/components/LoopRegion";
import { RecentProjects } from "@/components/RecentProjects";
import { VisualizationScheduler, defaultSchedulerConfig, type ScheduleSegment } from "@/components/VisualizationScheduler";
import { WaveformTrimmer } from "@/components/WaveformTrimmer";
import { KeyboardShortcutSettings, defaultShortcuts, type ShortcutConfig } from "@/components/KeyboardShortcutSettings";
import EffectAutomation from "@/components/EffectAutomation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VisualizationType, ColorScheme, VisualizationSettings } from "@shared/schema";
import { visualizationTypes, colorSchemes } from "@shared/schema";
import { Music, Waves, Maximize, Minimize, Keyboard, X, Menu, Shuffle, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioLevelMeter } from "@/components/AudioLevelMeter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuickStartGuide } from "@/components/QuickStartGuide";

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
  const [motionBlur, setMotionBlur] = useState(false);
  const [motionBlurIntensity, setMotionBlurIntensity] = useState(0.3);
  const [audioDucking, setAudioDucking] = useState(false);
  const [bloomEnabled, setBloomEnabled] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(0.5);
  const [peakHold, setPeakHold] = useState(false);
  const [aiBackground, setAiBackground] = useState<string | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [imageEffects, setImageEffects] = useState<ImageEffectSettings>(defaultImageEffects);
  const [aspectRatioConfig, setAspectRatioConfig] = useState<AspectRatioConfig>(defaultAspectRatioConfig);
  const [blendModeConfig, setBlendModeConfig] = useState<BlendModeConfig>(defaultBlendModeConfig);
  const [kenBurnsConfig, setKenBurnsConfig] = useState<KenBurnsConfig>(defaultKenBurnsConfig);
  const [particleOverlayConfig, setParticleOverlayConfig] = useState<ParticleOverlayConfig>(defaultParticleOverlayConfig);
  const [textOverlayConfig, setTextOverlayConfig] = useState<TextOverlayConfig>(defaultTextOverlayConfig);
  const [progressBarConfig, setProgressBarConfig] = useState<ProgressBarConfig>(defaultProgressBarConfig);
  const [trimConfig, setTrimConfig] = useState<TrimConfig>(defaultTrimConfig);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(defaultWatermarkConfig);
  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig>(defaultPerformanceConfig);
  const [fadeConfig, setFadeConfig] = useState<FadeConfig>({
    introEnabled: false,
    introDuration: 1.5,
    introType: "fade",
    outroEnabled: false,
    outroDuration: 1.5,
    outroType: "fade",
    introColor: "#000000",
    outroColor: "#000000",
  });
  const [audioDuration, setAudioDuration] = useState(0);
  const [schedulerConfig, setSchedulerConfig] = useState(defaultSchedulerConfig);
  const [shortcuts, setShortcuts] = useState<ShortcutConfig>(defaultShortcuts);
  const [settingsHistory, setSettingsHistory] = useState<Record<string, unknown>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  useEffect(() => {
    if (!audioElement) {
      setAudioDuration(0);
      return;
    }
    
    const handleLoadedMetadata = () => {
      setAudioDuration(audioElement.duration);
      if (trimConfig.endTime === 0) {
        setTrimConfig(prev => ({ ...prev, endTime: audioElement.duration }));
      }
    };
    
    if (audioElement.duration) {
      handleLoadedMetadata();
    }
    
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [audioElement]);

  // Track current time for automation
  useEffect(() => {
    if (!audioElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };
    
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => audioElement.removeEventListener('timeupdate', handleTimeUpdate);
  }, [audioElement]);

  useEffect(() => {
    const currentSettings = { visualizationType, colorScheme };
    if (settingsHistory.length === 0) {
      setSettingsHistory([currentSettings]);
      setHistoryIndex(0);
    } else {
      const lastSettings = settingsHistory[historyIndex];
      if (lastSettings?.visualizationType !== visualizationType || lastSettings?.colorScheme !== colorScheme) {
        const newHistory = settingsHistory.slice(0, historyIndex + 1);
        newHistory.push(currentSettings);
        if (newHistory.length > 50) newHistory.shift();
        setSettingsHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  }, [visualizationType, colorScheme]);

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

  const randomizeSettings = useCallback(() => {
    const randomViz = visualizationTypes[Math.floor(Math.random() * visualizationTypes.length)];
    const randomColor = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    
    setVisualizationType(randomViz);
    setColorScheme(randomColor);
    setSensitivity(0.5 + Math.random() * 2);
    setBarCount(Math.floor(32 + Math.random() * 96));
    setParticleCount(Math.floor(50 + Math.random() * 200));
    setGlowIntensity(0.3 + Math.random() * 1.2);
    setRotationSpeed(Math.random() * 2);
    setMirrorMode(Math.random() > 0.5);
    setMotionBlur(Math.random() > 0.6);
    setBloomEnabled(Math.random() > 0.5);
    setPeakHold(Math.random() > 0.5);
    
    toast({ title: "Randomized!", description: "Fresh visualization settings applied." });
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
    motionBlur,
    motionBlurIntensity,
    audioDucking,
    audioDuckingThreshold: 0.5,
    bloomEnabled,
    bloomIntensity,
    peakHold,
    peakHoldDecay: 0.95,
    bassStart: 0,
    bassEnd: 10,
    midStart: 10,
    midEnd: 50,
    trebleStart: 50,
    trebleEnd: 100,
  }), [sensitivity, barCount, particleCount, glowIntensity, rotationSpeed, mirrorMode, motionBlur, motionBlurIntensity, audioDucking, bloomEnabled, bloomIntensity, peakHold]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:relative z-50 lg:z-auto
          w-80 max-w-[85vw] lg:w-80
          h-full lg:h-auto
          border-r border-border/50 bg-card/95 lg:bg-card/30 backdrop-blur-sm 
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'}
        `}>
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 glow-sm">
                  <Waves className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold gradient-text">Kitsune Promo</h1>
                  <p className="text-xs text-muted-foreground">
                    Audio Visualization Studio
                  </p>
                </div>
              </div>
              {/* Close button for mobile */}
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Link href="/editor">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    data-testid="button-video-editor"
                    title="Video Editor"
                  >
                    <Film className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowShortcuts(prev => !prev)}
                  className="h-8 w-8"
                  data-testid="button-shortcuts"
                >
                  <Keyboard className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                  data-testid="button-close-sidebar"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
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

              <UndoRedoControls
                canUndo={historyIndex > 0}
                canRedo={historyIndex < settingsHistory.length - 1}
                onUndo={() => {
                  if (historyIndex > 0) {
                    const prevState = settingsHistory[historyIndex - 1];
                    setHistoryIndex(historyIndex - 1);
                    if (prevState.visualizationType) setVisualizationType(prevState.visualizationType as VisualizationType);
                    if (prevState.colorScheme) setColorScheme(prevState.colorScheme as ColorScheme);
                  }
                }}
                onRedo={() => {
                  if (historyIndex < settingsHistory.length - 1) {
                    const nextState = settingsHistory[historyIndex + 1];
                    setHistoryIndex(historyIndex + 1);
                    if (nextState.visualizationType) setVisualizationType(nextState.visualizationType as VisualizationType);
                    if (nextState.colorScheme) setColorScheme(nextState.colorScheme as ColorScheme);
                  }
                }}
                historyLength={settingsHistory.length}
                currentIndex={historyIndex}
              />

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

              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <VisualizationStylePicker
                    value={visualizationType}
                    onChange={setVisualizationType}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={randomizeSettings}
                  className="shrink-0"
                  data-testid="button-randomize"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Randomize
                </Button>
              </div>

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
                motionBlur={motionBlur}
                onMotionBlurChange={setMotionBlur}
                motionBlurIntensity={motionBlurIntensity}
                onMotionBlurIntensityChange={setMotionBlurIntensity}
                audioDucking={audioDucking}
                onAudioDuckingChange={setAudioDucking}
                bloomEnabled={bloomEnabled}
                onBloomEnabledChange={setBloomEnabled}
                bloomIntensity={bloomIntensity}
                onBloomIntensityChange={setBloomIntensity}
                peakHold={peakHold}
                onPeakHoldChange={setPeakHold}
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

              <EffectAutomation
                currentTime={currentTime}
                isPlaying={isPlaying}
                bpm={bpm}
                imageEffects={imageEffects}
                onEffectsChange={(effects) => setImageEffects(prev => ({ ...prev, ...effects }))}
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

              <WatermarkSettings
                config={watermarkConfig}
                onConfigChange={setWatermarkConfig}
              />

              <Separator className="bg-border/50" />

              <AudioTrimmer
                audioElement={audioElement}
                duration={audioDuration}
                config={trimConfig}
                onConfigChange={setTrimConfig}
                onPreviewTrim={() => {
                  if (audioElement && trimConfig.enabled) {
                    audioElement.currentTime = trimConfig.startTime;
                    audioElement.play();
                    toast({ title: "Preview", description: "Playing trimmed section" });
                  }
                }}
              />

              <Separator className="bg-border/50" />

              <PerformanceSettings
                config={performanceConfig}
                onConfigChange={setPerformanceConfig}
              />

              <Separator className="bg-border/50" />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80">Intro/Outro Fades</h3>
                <FadeSettings
                  config={fadeConfig}
                  onConfigChange={setFadeConfig}
                />
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80">Thumbnail Generator</h3>
                <ThumbnailGenerator
                  canvasRef={visualizerRef.current?.getCanvas() ?? null}
                  audioDuration={audioDuration}
                  audioElement={audioElement}
                  onSeek={(time) => {
                    if (audioElement) {
                      audioElement.currentTime = time;
                    }
                  }}
                />
              </div>

              <Separator className="bg-border/50" />

              <QuickExportPresets
                onSelectPreset={(config) => {
                  setAspectRatioConfig(prev => ({ ...prev, ratio: config.aspectRatio as "16:9" | "9:16" | "1:1" | "4:5" }));
                  toast({ title: `${config.name} preset applied`, description: `Aspect ratio set to ${config.aspectRatio}` });
                }}
                isExporting={false}
              />

              <Separator className="bg-border/50" />

              {audioUrl && (
                <>
                  <LoopRegion
                    duration={audioDuration}
                    currentTime={audioElement?.currentTime || 0}
                    audioElement={audioElement}
                    isPlaying={isPlaying}
                    onSeek={(time) => {
                      if (audioElement) audioElement.currentTime = time;
                    }}
                  />
                  <Separator className="bg-border/50" />
                </>
              )}

              <VisualizationScheduler
                segments={schedulerConfig.segments}
                onSegmentsChange={(segments) => setSchedulerConfig(prev => ({ ...prev, segments }))}
                duration={audioDuration}
                enabled={schedulerConfig.enabled}
                onEnabledChange={(enabled) => setSchedulerConfig(prev => ({ ...prev, enabled }))}
              />

              <Separator className="bg-border/50" />

              <ProjectManager
                currentSettings={{
                  visualizationType,
                  colorScheme,
                  customColors,
                  sensitivity,
                  barCount,
                  particleCount,
                  glowIntensity,
                  rotationSpeed,
                  mirrorMode,
                  aspectRatioConfig,
                  blendModeConfig,
                  kenBurnsConfig,
                  particleOverlayConfig,
                  textOverlayConfig,
                  progressBarConfig,
                  fadeConfig,
                  watermarkConfig,
                }}
                onLoadProject={(settings) => {
                  if (settings.visualizationType) setVisualizationType(settings.visualizationType as VisualizationType);
                  if (settings.colorScheme) setColorScheme(settings.colorScheme as ColorScheme);
                  if (settings.customColors) setCustomColors(settings.customColors as string[]);
                  if (settings.sensitivity) setSensitivity(settings.sensitivity as number);
                  if (settings.barCount) setBarCount(settings.barCount as number);
                  if (settings.particleCount) setParticleCount(settings.particleCount as number);
                  if (settings.glowIntensity) setGlowIntensity(settings.glowIntensity as number);
                  if (settings.rotationSpeed) setRotationSpeed(settings.rotationSpeed as number);
                  if (settings.mirrorMode !== undefined) setMirrorMode(settings.mirrorMode as boolean);
                  if (settings.aspectRatioConfig) setAspectRatioConfig(settings.aspectRatioConfig as AspectRatioConfig);
                  if (settings.blendModeConfig) setBlendModeConfig(settings.blendModeConfig as BlendModeConfig);
                  if (settings.kenBurnsConfig) setKenBurnsConfig(settings.kenBurnsConfig as KenBurnsConfig);
                  if (settings.particleOverlayConfig) setParticleOverlayConfig(settings.particleOverlayConfig as ParticleOverlayConfig);
                  if (settings.textOverlayConfig) setTextOverlayConfig(settings.textOverlayConfig as TextOverlayConfig);
                  if (settings.progressBarConfig) setProgressBarConfig(settings.progressBarConfig as ProgressBarConfig);
                  if (settings.fadeConfig) setFadeConfig(settings.fadeConfig as FadeConfig);
                  if (settings.watermarkConfig) setWatermarkConfig(settings.watermarkConfig as WatermarkConfig);
                  toast({ title: "Project Loaded", description: "Settings have been applied" });
                }}
              />

              <Separator className="bg-border/50" />

              <RecentProjects
                currentSettings={{
                  visualizationType,
                  colorScheme,
                  sensitivity,
                  barCount,
                }}
                onLoadProject={(settings) => {
                  if (settings.visualizationType) setVisualizationType(settings.visualizationType as VisualizationType);
                  if (settings.colorScheme) setColorScheme(settings.colorScheme as ColorScheme);
                  if (settings.sensitivity) setSensitivity(settings.sensitivity as number);
                  if (settings.barCount) setBarCount(settings.barCount as number);
                }}
              />

              <Separator className="bg-border/50" />

              <KeyboardShortcutSettings
                shortcuts={shortcuts}
                onShortcutsChange={setShortcuts}
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
          {/* Mobile header with menu toggle */}
          <div className="lg:hidden p-3 border-b border-border/50 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-primary" />
              <span className="font-semibold gradient-text">Kitsune Promo</span>
            </div>
            {audioFile && (
              <Badge variant="secondary" className="ml-auto text-xs truncate max-w-[150px]">
                {audioFile.name}
              </Badge>
            )}
          </div>
          
          <div className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 h-full overflow-auto">
            <div 
              ref={containerRef}
              className={`relative w-full max-h-[50vh] sm:max-h-[60vh] rounded-lg sm:rounded-xl overflow-hidden border border-border/30 ${
                aspectRatioConfig.ratio === "16:9" ? "aspect-video" :
                aspectRatioConfig.ratio === "9:16" ? "aspect-[9/16] max-w-[60%] sm:max-w-[40%] mx-auto" :
                aspectRatioConfig.ratio === "1:1" ? "aspect-square max-w-[80%] sm:max-w-[60%] mx-auto" :
                aspectRatioConfig.ratio === "4:5" ? "aspect-[4/5] max-w-[70%] sm:max-w-[50%] mx-auto" :
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
                    motionBlur={motionBlur}
                    motionBlurIntensity={motionBlurIntensity}
                    audioDucking={audioDucking}
                    bloomEnabled={bloomEnabled}
                    bloomIntensity={bloomIntensity}
                    peakHold={peakHold}
                    backgroundImage={aiBackground}
                    customImage={customImage}
                    imageEffects={imageEffects}
                    blendMode={blendModeConfig.mode}
                    blendOpacity={blendModeConfig.opacity}
                    kenBurnsConfig={kenBurnsConfig}
                    particleOverlayConfig={particleOverlayConfig}
                    textOverlayConfig={textOverlayConfig}
                    progressBarConfig={progressBarConfig}
                    watermarkConfig={watermarkConfig}
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
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex-1">
                  <AudioPlayer
                    audioUrl={audioUrl}
                    onAudioElement={handleAudioElement}
                    onPlayStateChange={handlePlayStateChange}
                    onBpmDetected={setBpm}
                  />
                </div>
                {audioElement && (
                  <AudioLevelMeter
                    audioElement={audioElement}
                    isPlaying={isPlaying}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {!audioFile && (
        <QuickStartGuide
          onDismiss={() => {}}
          hasAudio={!!audioFile}
        />
      )}
    </div>
  );
}
