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
      </div>
    </div>
  );
}
