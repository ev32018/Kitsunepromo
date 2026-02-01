import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Move } from "lucide-react";

export type KenBurnsDirection = "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down" | "random";

export interface KenBurnsConfig {
  enabled: boolean;
  direction: KenBurnsDirection;
  speed: number;
  intensity: number;
}

interface KenBurnsSettingsProps {
  config: KenBurnsConfig;
  onConfigChange: (config: KenBurnsConfig) => void;
  hasImage: boolean;
}

const directionOptions: { value: KenBurnsDirection; label: string }[] = [
  { value: "zoom-in", label: "Zoom In" },
  { value: "zoom-out", label: "Zoom Out" },
  { value: "pan-left", label: "Pan Left" },
  { value: "pan-right", label: "Pan Right" },
  { value: "pan-up", label: "Pan Up" },
  { value: "pan-down", label: "Pan Down" },
  { value: "random", label: "Random" },
];

export const defaultKenBurnsConfig: KenBurnsConfig = {
  enabled: false,
  direction: "zoom-in",
  speed: 0.3,
  intensity: 0.2,
};

export function KenBurnsSettings({
  config,
  onConfigChange,
  hasImage,
}: KenBurnsSettingsProps) {
  if (!hasImage) {
    return null;
  }

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Ken Burns Effect</h3>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => onConfigChange({ ...config, enabled: v })}
          data-testid="switch-ken-burns"
        />
      </div>

      {config.enabled && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Direction</Label>
            <Select
              value={config.direction}
              onValueChange={(v) => onConfigChange({ ...config, direction: v as KenBurnsDirection })}
            >
              <SelectTrigger data-testid="select-ken-burns-direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {directionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              step={0.05}
              data-testid="slider-ken-burns-speed"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Intensity</Label>
              <span className="text-xs text-muted-foreground">{Math.round(config.intensity * 100)}%</span>
            </div>
            <Slider
              value={[config.intensity]}
              onValueChange={([v]) => onConfigChange({ ...config, intensity: v })}
              min={0.1}
              max={0.5}
              step={0.05}
              data-testid="slider-ken-burns-intensity"
            />
          </div>

          <p className="text-[10px] text-muted-foreground">
            Slow cinematic pan and zoom across your image
          </p>
        </div>
      )}
    </Card>
  );
}
