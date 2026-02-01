import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Volume2,
  BarChart2,
  Sparkles,
  Sun,
  RotateCw,
  FlipHorizontal2,
  Zap,
  Activity,
  Gauge,
} from "lucide-react";

interface VisualizationControlsProps {
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  barCount: number;
  onBarCountChange: (value: number) => void;
  particleCount: number;
  onParticleCountChange: (value: number) => void;
  glowIntensity: number;
  onGlowIntensityChange: (value: number) => void;
  rotationSpeed: number;
  onRotationSpeedChange: (value: number) => void;
  mirrorMode: boolean;
  onMirrorModeChange: (value: boolean) => void;
  // New professional features
  motionBlur?: boolean;
  onMotionBlurChange?: (value: boolean) => void;
  motionBlurIntensity?: number;
  onMotionBlurIntensityChange?: (value: number) => void;
  audioDucking?: boolean;
  onAudioDuckingChange?: (value: boolean) => void;
  bloomEnabled?: boolean;
  onBloomEnabledChange?: (value: boolean) => void;
  bloomIntensity?: number;
  onBloomIntensityChange?: (value: number) => void;
  peakHold?: boolean;
  onPeakHoldChange?: (value: boolean) => void;
}

export function VisualizationControls({
  sensitivity,
  onSensitivityChange,
  barCount,
  onBarCountChange,
  particleCount,
  onParticleCountChange,
  glowIntensity,
  onGlowIntensityChange,
  rotationSpeed,
  onRotationSpeedChange,
  mirrorMode,
  onMirrorModeChange,
  motionBlur = false,
  onMotionBlurChange,
  motionBlurIntensity = 0.3,
  onMotionBlurIntensityChange,
  audioDucking = false,
  onAudioDuckingChange,
  bloomEnabled = false,
  onBloomEnabledChange,
  bloomIntensity = 0.5,
  onBloomIntensityChange,
  peakHold = false,
  onPeakHoldChange,
}: VisualizationControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Visualization Controls
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-xs">
              <Volume2 className="w-3 h-3" />
              Sensitivity
            </Label>
            <span className="text-xs text-muted-foreground">
              {sensitivity.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[sensitivity]}
            onValueChange={([v]) => onSensitivityChange(v)}
            min={0.5}
            max={3}
            step={0.1}
            data-testid="slider-sensitivity"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-xs">
              <BarChart2 className="w-3 h-3" />
              Bar Count
            </Label>
            <span className="text-xs text-muted-foreground">{barCount}</span>
          </div>
          <Slider
            value={[barCount]}
            onValueChange={([v]) => onBarCountChange(v)}
            min={16}
            max={128}
            step={8}
            data-testid="slider-bar-count"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-xs">
              <Sparkles className="w-3 h-3" />
              Particles
            </Label>
            <span className="text-xs text-muted-foreground">
              {particleCount}
            </span>
          </div>
          <Slider
            value={[particleCount]}
            onValueChange={([v]) => onParticleCountChange(v)}
            min={50}
            max={300}
            step={10}
            data-testid="slider-particles"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-xs">
              <Sun className="w-3 h-3" />
              Glow Intensity
            </Label>
            <span className="text-xs text-muted-foreground">
              {glowIntensity.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[glowIntensity]}
            onValueChange={([v]) => onGlowIntensityChange(v)}
            min={0}
            max={2}
            step={0.1}
            data-testid="slider-glow"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-xs">
              <RotateCw className="w-3 h-3" />
              Rotation Speed
            </Label>
            <span className="text-xs text-muted-foreground">
              {rotationSpeed.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[rotationSpeed]}
            onValueChange={([v]) => onRotationSpeedChange(v)}
            min={0}
            max={2}
            step={0.1}
            data-testid="slider-rotation"
          />
        </div>

        <Card className="p-3 bg-card/50">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-xs">
              <FlipHorizontal2 className="w-3 h-3" />
              Mirror Mode
            </Label>
            <Switch
              checked={mirrorMode}
              onCheckedChange={onMirrorModeChange}
              data-testid="switch-mirror"
            />
          </div>
        </Card>

        <div className="pt-2 border-t border-border/50">
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Pro Features</h4>
          
          <div className="space-y-3">
            <Card className="p-3 bg-card/50 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs">
                  <Activity className="w-3 h-3" />
                  Motion Blur
                </Label>
                <Switch
                  checked={motionBlur}
                  onCheckedChange={onMotionBlurChange}
                  data-testid="switch-motion-blur"
                />
              </div>
              {motionBlur && onMotionBlurIntensityChange && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Intensity</span>
                    <span>{Math.round(motionBlurIntensity * 100)}%</span>
                  </div>
                  <Slider
                    value={[motionBlurIntensity]}
                    onValueChange={([v]) => onMotionBlurIntensityChange(v)}
                    min={0.1}
                    max={0.8}
                    step={0.1}
                    data-testid="slider-motion-blur"
                  />
                </div>
              )}
            </Card>

            <Card className="p-3 bg-card/50 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs">
                  <Zap className="w-3 h-3" />
                  Bloom Effect
                </Label>
                <Switch
                  checked={bloomEnabled}
                  onCheckedChange={onBloomEnabledChange}
                  data-testid="switch-bloom"
                />
              </div>
              {bloomEnabled && onBloomIntensityChange && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Intensity</span>
                    <span>{Math.round(bloomIntensity * 100)}%</span>
                  </div>
                  <Slider
                    value={[bloomIntensity]}
                    onValueChange={([v]) => onBloomIntensityChange(v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-bloom"
                  />
                </div>
              )}
            </Card>

            <Card className="p-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs">
                  <Volume2 className="w-3 h-3" />
                  Audio Ducking
                </Label>
                <Switch
                  checked={audioDucking}
                  onCheckedChange={onAudioDuckingChange}
                  data-testid="switch-ducking"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dims visuals during quiet parts
              </p>
            </Card>

            <Card className="p-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs">
                  <Gauge className="w-3 h-3" />
                  Peak Hold
                </Label>
                <Switch
                  checked={peakHold}
                  onCheckedChange={onPeakHoldChange}
                  data-testid="switch-peak-hold"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Shows peak level indicators
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
