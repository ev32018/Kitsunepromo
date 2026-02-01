import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

export type ParticleType = "sparkles" | "bokeh" | "confetti" | "snow" | "fireflies" | "bubbles" | "stars";

export interface ParticleOverlayConfig {
  enabled: boolean;
  type: ParticleType;
  count: number;
  size: number;
  speed: number;
  audioReactive: boolean;
  color: string;
}

interface ParticleOverlaySettingsProps {
  config: ParticleOverlayConfig;
  onConfigChange: (config: ParticleOverlayConfig) => void;
}

const particleTypeOptions: { value: ParticleType; label: string }[] = [
  { value: "sparkles", label: "Sparkles" },
  { value: "bokeh", label: "Bokeh" },
  { value: "confetti", label: "Confetti" },
  { value: "snow", label: "Snow" },
  { value: "fireflies", label: "Fireflies" },
  { value: "bubbles", label: "Bubbles" },
  { value: "stars", label: "Stars" },
];

export const defaultParticleOverlayConfig: ParticleOverlayConfig = {
  enabled: false,
  type: "sparkles",
  count: 50,
  size: 0.5,
  speed: 0.5,
  audioReactive: true,
  color: "#ffffff",
};

export function ParticleOverlaySettings({
  config,
  onConfigChange,
}: ParticleOverlaySettingsProps) {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Particle Overlay</h3>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => onConfigChange({ ...config, enabled: v })}
          data-testid="switch-particles"
        />
      </div>

      {config.enabled && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Particle Type</Label>
            <Select
              value={config.type}
              onValueChange={(v) => onConfigChange({ ...config, type: v as ParticleType })}
            >
              <SelectTrigger data-testid="select-particle-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {particleTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Count</Label>
              <span className="text-xs text-muted-foreground">{config.count}</span>
            </div>
            <Slider
              value={[config.count]}
              onValueChange={([v]) => onConfigChange({ ...config, count: v })}
              min={10}
              max={200}
              step={10}
              data-testid="slider-particle-count"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Size</Label>
              <span className="text-xs text-muted-foreground">{Math.round(config.size * 100)}%</span>
            </div>
            <Slider
              value={[config.size]}
              onValueChange={([v]) => onConfigChange({ ...config, size: v })}
              min={0.2}
              max={1}
              step={0.1}
              data-testid="slider-particle-size"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Speed</Label>
              <span className="text-xs text-muted-foreground">{Math.round(config.speed * 100)}%</span>
            </div>
            <Slider
              value={[config.speed]}
              onValueChange={([v]) => onConfigChange({ ...config, speed: v })}
              min={0.1}
              max={1}
              step={0.1}
              data-testid="slider-particle-speed"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Audio Reactive</Label>
            <Switch
              checked={config.audioReactive}
              onCheckedChange={(v) => onConfigChange({ ...config, audioReactive: v })}
              data-testid="switch-particle-audio-reactive"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.color}
                onChange={(e) => onConfigChange({ ...config, color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                data-testid="input-particle-color"
              />
              <span className="text-xs text-muted-foreground self-center font-mono">{config.color}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
