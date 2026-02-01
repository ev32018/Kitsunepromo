import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Music, Shuffle, Play, Pause, RotateCcw } from "lucide-react";
import type { ImageEffectSettings } from "@/lib/visualizers";

interface AutomationPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  effects: Partial<ImageEffectSettings>[];
  transitionTime: number;
  cycleMode: 'sequential' | 'random' | 'beat-sync';
}

const AUTOMATION_PRESETS: AutomationPreset[] = [
  {
    id: 'edm-drop',
    name: 'EDM Drop',
    description: 'High energy cycling for drops',
    category: 'Energy',
    transitionTime: 2,
    cycleMode: 'beat-sync',
    effects: [
      { shatter: true, shatterIntensity: 0.8, shatterPieces: 8 },
      { glitch: true, glitchIntensity: 0.7, chromatic: true, chromaticIntensity: 0.5 },
      { zoom: true, zoomIntensity: 0.6, pulse: true, pulseIntensity: 0.8 },
      { circleRotation: true, circleRotationIntensity: 0.7, circleRotationCount: 6 },
    ]
  },
  {
    id: 'chill-vibes',
    name: 'Chill Vibes',
    description: 'Smooth, relaxing transitions',
    category: 'Ambient',
    transitionTime: 8,
    cycleMode: 'sequential',
    effects: [
      { liquidMorph: true, liquidMorphIntensity: 0.4, blur: true, blurIntensity: 0.3 },
      { wave: true, waveIntensity: 0.5, colorShift: true, colorShiftIntensity: 0.3 },
      { ripple: true, rippleIntensity: 0.5, rippleSpeed: 0.3 },
      { rotation: true, rotationIntensity: 0.2, vignette: true, vignetteIntensity: 0.4 },
    ]
  },
  {
    id: 'glitch-mode',
    name: 'Glitch Mode',
    description: 'Digital distortion effects',
    category: 'Glitch',
    transitionTime: 1.5,
    cycleMode: 'random',
    effects: [
      { glitch: true, glitchIntensity: 0.9, scanlines: true, scanlinesIntensity: 0.6 },
      { pixelSort: true, pixelSortIntensity: 0.7, chromatic: true, chromaticIntensity: 0.8 },
      { sliceShift: true, sliceShiftIntensity: 0.8, sliceShiftDirection: 'both' },
      { shatter: true, shatterIntensity: 0.6, shatterPieces: 16 },
    ]
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    description: 'Ethereal, floating effects',
    category: 'Ambient',
    transitionTime: 6,
    cycleMode: 'sequential',
    effects: [
      { blur: true, blurIntensity: 0.5, colorShift: true, colorShiftIntensity: 0.4 },
      { tunnelZoom: true, tunnelZoomIntensity: 0.4, vignette: true, vignetteIntensity: 0.5 },
      { liquidMorph: true, liquidMorphIntensity: 0.5 },
      { wave: true, waveIntensity: 0.4, pulse: true, pulseIntensity: 0.3 },
    ]
  },
  {
    id: 'rain-storm',
    name: 'Rain Storm',
    description: 'Atmospheric rain with mood',
    category: 'Weather',
    transitionTime: 5,
    cycleMode: 'sequential',
    effects: [
      { rainMask: true, rainMaskIntensity: 0.6, rainMaskSpeed: 0.4, blur: true, blurIntensity: 0.2 },
      { rainMask: true, rainMaskIntensity: 0.9, rainMaskSpeed: 0.7, glitch: true, glitchIntensity: 0.3 },
      { rainMask: true, rainMaskIntensity: 0.5, rainMaskSpeed: 0.5, colorShift: true, colorShiftIntensity: 0.4 },
    ]
  },
  {
    id: 'psychedelic',
    name: 'Psychedelic',
    description: 'Trippy color cycling',
    category: 'Creative',
    transitionTime: 3,
    cycleMode: 'sequential',
    effects: [
      { circleRotation: true, circleRotationIntensity: 0.9, circleRotationCount: 8, colorShift: true, colorShiftIntensity: 0.7 },
      { chromatic: true, chromaticIntensity: 0.9, mirror: true, mirrorMode: 'quad' },
      { tunnelZoom: true, tunnelZoomIntensity: 0.7, colorShift: true, colorShiftIntensity: 0.8 },
      { ripple: true, rippleIntensity: 0.8, rippleSpeed: 0.6, chromatic: true, chromaticIntensity: 0.6 },
    ]
  },
  {
    id: 'minimal-pulse',
    name: 'Minimal Pulse',
    description: 'Subtle, clean animations',
    category: 'Minimal',
    transitionTime: 4,
    cycleMode: 'sequential',
    effects: [
      { pulse: true, pulseIntensity: 0.4 },
      { zoom: true, zoomIntensity: 0.3 },
      { vignette: true, vignetteIntensity: 0.5 },
      { rotation: true, rotationIntensity: 0.2 },
    ]
  },
  {
    id: 'retro-vhs',
    name: 'Retro VHS',
    description: '80s VHS tape aesthetic',
    category: 'Retro',
    transitionTime: 2,
    cycleMode: 'random',
    effects: [
      { scanlines: true, scanlinesIntensity: 0.7, chromatic: true, chromaticIntensity: 0.4 },
      { glitch: true, glitchIntensity: 0.5, scanlines: true, scanlinesIntensity: 0.5 },
      { colorShift: true, colorShiftIntensity: 0.6, blur: true, blurIntensity: 0.2, scanlines: true, scanlinesIntensity: 0.4 },
    ]
  },
];

interface EffectAutomationProps {
  currentTime: number;
  isPlaying: boolean;
  bpm: number | null;
  imageEffects: ImageEffectSettings;
  onEffectsChange: (effects: Partial<ImageEffectSettings>) => void;
}

export default function EffectAutomation({
  currentTime,
  isPlaying,
  bpm,
  imageEffects,
  onEffectsChange,
}: EffectAutomationProps) {
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<AutomationPreset | null>(null);
  const [currentEffectIndex, setCurrentEffectIndex] = useState(0);
  const [customCycleTime, setCustomCycleTime] = useState(4);
  const [cycleMode, setCycleMode] = useState<'sequential' | 'random' | 'beat-sync'>('sequential');
  const [lastBeatTime, setLastBeatTime] = useState(0);
  const [beatCounter, setBeatCounter] = useState(0);
  const [beatsPerChange, setBeatsPerChange] = useState(4);

  const getDefaultEffects = useCallback((): Partial<ImageEffectSettings> => ({
    pulse: false,
    pulseIntensity: 0.5,
    wave: false,
    waveIntensity: 0.5,
    colorShift: false,
    colorShiftIntensity: 0.5,
    glitch: false,
    glitchIntensity: 0.5,
    zoom: false,
    zoomIntensity: 0.5,
    blur: false,
    blurIntensity: 0.5,
    chromatic: false,
    chromaticIntensity: 0.5,
    rotation: false,
    rotationIntensity: 0.5,
    mirror: false,
    mirrorMode: 'horizontal' as const,
    scanlines: false,
    scanlinesIntensity: 0.5,
    vignette: false,
    vignetteIntensity: 0.5,
    circleRotation: false,
    circleRotationIntensity: 0.5,
    circleRotationCount: 5,
    rainMask: false,
    rainMaskIntensity: 0.5,
    rainMaskSpeed: 0.5,
    sliceShift: false,
    sliceShiftIntensity: 0.5,
    sliceShiftDirection: 'horizontal' as const,
    ripple: false,
    rippleIntensity: 0.5,
    rippleSpeed: 0.5,
    pixelSort: false,
    pixelSortIntensity: 0.5,
    tunnelZoom: false,
    tunnelZoomIntensity: 0.5,
    shatter: false,
    shatterIntensity: 0.5,
    shatterPieces: 12,
    liquidMorph: false,
    liquidMorphIntensity: 0.5,
  }), []);

  const applyEffectPreset = useCallback((effectSettings: Partial<ImageEffectSettings>) => {
    const defaultEffects = getDefaultEffects();
    const mergedEffects = { ...defaultEffects, ...effectSettings, enabled: true };
    onEffectsChange(mergedEffects);
  }, [getDefaultEffects, onEffectsChange]);

  const getNextEffectIndex = useCallback((preset: AutomationPreset, currentIdx: number): number => {
    if (preset.effects.length <= 1) return 0;
    
    const mode = cycleMode || preset.cycleMode;
    if (mode === 'random') {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * preset.effects.length);
      } while (nextIdx === currentIdx && preset.effects.length > 1);
      return nextIdx;
    }
    return (currentIdx + 1) % preset.effects.length;
  }, [cycleMode]);

  useEffect(() => {
    if (!automationEnabled || !selectedPreset || !isPlaying) return;

    const mode = cycleMode || selectedPreset.cycleMode;
    const transitionTime = customCycleTime || selectedPreset.transitionTime;

    if (mode === 'beat-sync' && bpm) {
      const beatInterval = 60 / bpm;
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      if (timeSinceLastBeat >= beatInterval) {
        setLastBeatTime(currentTime);
        setBeatCounter(prev => {
          const newCount = prev + 1;
          if (newCount >= beatsPerChange) {
            const nextIdx = getNextEffectIndex(selectedPreset, currentEffectIndex);
            setCurrentEffectIndex(nextIdx);
            applyEffectPreset(selectedPreset.effects[nextIdx]);
            return 0;
          }
          return newCount;
        });
      }
    } else {
      const effectDuration = transitionTime * 1000;
      const effectIndex = Math.floor((currentTime * 1000 / effectDuration)) % selectedPreset.effects.length;
      
      if (effectIndex !== currentEffectIndex) {
        const nextIdx = mode === 'random' 
          ? getNextEffectIndex(selectedPreset, currentEffectIndex)
          : effectIndex;
        setCurrentEffectIndex(nextIdx);
        applyEffectPreset(selectedPreset.effects[nextIdx]);
      }
    }
  }, [currentTime, isPlaying, automationEnabled, selectedPreset, cycleMode, customCycleTime, bpm, beatsPerChange, currentEffectIndex, lastBeatTime, getNextEffectIndex, applyEffectPreset]);

  const handlePresetSelect = (presetId: string) => {
    const preset = AUTOMATION_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset);
      setCurrentEffectIndex(0);
      setCycleMode(preset.cycleMode);
      setCustomCycleTime(preset.transitionTime);
      if (automationEnabled) {
        applyEffectPreset(preset.effects[0]);
      }
    }
  };

  const toggleAutomation = () => {
    const newState = !automationEnabled;
    setAutomationEnabled(newState);
    if (newState && selectedPreset) {
      setCurrentEffectIndex(0);
      setBeatCounter(0);
      setLastBeatTime(currentTime);
      applyEffectPreset(selectedPreset.effects[0]);
    }
  };

  const resetAutomation = () => {
    setCurrentEffectIndex(0);
    setBeatCounter(0);
    setLastBeatTime(currentTime);
    if (selectedPreset) {
      applyEffectPreset(selectedPreset.effects[0]);
    }
  };

  const categories = Array.from(new Set(AUTOMATION_PRESETS.map(p => p.category)));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4" />
          Effect Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="automation-toggle">Enable Automation</Label>
          <div className="flex items-center gap-2">
            {automationEnabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetAutomation}
                data-testid="button-reset-automation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Switch
              id="automation-toggle"
              checked={automationEnabled}
              onCheckedChange={toggleAutomation}
              data-testid="switch-automation-toggle"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Automation Preset</Label>
          <Select
            value={selectedPreset?.id || ''}
            onValueChange={handlePresetSelect}
            data-testid="select-automation-preset"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {category}
                  </div>
                  {AUTOMATION_PRESETS.filter(p => p.category === category).map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex flex-col">
                        <span>{preset.name}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPreset && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {selectedPreset.effects.length} effects
              </Badge>
              {automationEnabled && (
                <Badge variant="secondary" className="text-xs">
                  {isPlaying ? (
                    <><Play className="h-3 w-3 mr-1" /> Running</>
                  ) : (
                    <><Pause className="h-3 w-3 mr-1" /> Paused</>
                  )}
                </Badge>
              )}
              {automationEnabled && (
                <Badge className="text-xs">
                  Effect {currentEffectIndex + 1}/{selectedPreset.effects.length}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cycle Mode</Label>
              <Select
                value={cycleMode}
                onValueChange={(v) => setCycleMode(v as typeof cycleMode)}
                data-testid="select-cycle-mode"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Sequential (Time-based)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="random">
                    <div className="flex items-center gap-2">
                      <Shuffle className="h-4 w-4" />
                      <span>Random</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="beat-sync">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      <span>Beat Sync {bpm ? `(${Math.round(bpm)} BPM)` : '(No BPM)'}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cycleMode !== 'beat-sync' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cycle Time: {customCycleTime.toFixed(1)}s</Label>
                </div>
                <Slider
                  value={[customCycleTime]}
                  onValueChange={([v]) => setCustomCycleTime(v)}
                  min={0.5}
                  max={15}
                  step={0.5}
                  data-testid="slider-cycle-time"
                />
              </div>
            )}

            {cycleMode === 'beat-sync' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Beats per Change: {beatsPerChange}</Label>
                </div>
                <Slider
                  value={[beatsPerChange]}
                  onValueChange={([v]) => setBeatsPerChange(v)}
                  min={1}
                  max={16}
                  step={1}
                  data-testid="slider-beats-per-change"
                />
                {!bpm && (
                  <p className="text-xs text-muted-foreground">
                    Upload audio to detect BPM for beat sync
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Effects in this preset:</Label>
              <div className="flex flex-wrap gap-1">
                {selectedPreset.effects.map((effect, idx) => {
                  const activeEffects = Object.entries(effect)
                    .filter(([key, val]) => val === true && !key.includes('Intensity') && !key.includes('Count') && !key.includes('Speed') && !key.includes('Pieces') && !key.includes('Direction') && !key.includes('Mode'))
                    .map(([key]) => key);
                  return (
                    <Badge
                      key={idx}
                      variant={currentEffectIndex === idx && automationEnabled ? "default" : "outline"}
                      className="text-xs"
                    >
                      {idx + 1}: {activeEffects.slice(0, 2).join(', ')}
                      {activeEffects.length > 2 && ` +${activeEffects.length - 2}`}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
