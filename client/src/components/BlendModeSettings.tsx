import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers } from "lucide-react";

export type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "soft-light" | "hard-light" | "color-dodge" | "color-burn" | "difference" | "exclusion" | "lighten" | "darken";

export interface BlendModeConfig {
  mode: BlendMode;
  opacity: number;
}

interface BlendModeSettingsProps {
  config: BlendModeConfig;
  onConfigChange: (config: BlendModeConfig) => void;
  hasImageEffects: boolean;
}

const blendModeOptions: { value: BlendMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "soft-light", label: "Soft Light" },
  { value: "hard-light", label: "Hard Light" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
  { value: "lighten", label: "Lighten" },
  { value: "darken", label: "Darken" },
];

export const defaultBlendModeConfig: BlendModeConfig = {
  mode: "normal",
  opacity: 1,
};

export function BlendModeSettings({
  config,
  onConfigChange,
  hasImageEffects,
}: BlendModeSettingsProps) {
  if (!hasImageEffects) {
    return null;
  }

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Visualization Blend</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Blend Mode</Label>
          <Select
            value={config.mode}
            onValueChange={(v) => onConfigChange({ ...config, mode: v as BlendMode })}
          >
            <SelectTrigger data-testid="select-blend-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blendModeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Visualization Opacity</Label>
            <span className="text-xs text-muted-foreground">{Math.round(config.opacity * 100)}%</span>
          </div>
          <Slider
            value={[config.opacity]}
            onValueChange={([v]) => onConfigChange({ ...config, opacity: v })}
            min={0}
            max={1}
            step={0.05}
            data-testid="slider-blend-opacity"
          />
        </div>

        <p className="text-[10px] text-muted-foreground">
          Controls how the visualization blends with your image
        </p>
      </div>
    </Card>
  );
}
