import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle } from "lucide-react";

export type ProgressBarStyle = "line" | "dots" | "wave" | "glow" | "minimal";
export type ProgressBarPosition = "bottom" | "top" | "center";

export interface ProgressBarConfig {
  enabled: boolean;
  style: ProgressBarStyle;
  position: ProgressBarPosition;
  height: number;
  color: string;
  backgroundColor: string;
  showTime: boolean;
}

interface ProgressBarSettingsProps {
  config: ProgressBarConfig;
  onConfigChange: (config: ProgressBarConfig) => void;
}

const styleOptions: { value: ProgressBarStyle; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "dots", label: "Dots" },
  { value: "wave", label: "Wave" },
  { value: "glow", label: "Glow" },
  { value: "minimal", label: "Minimal" },
];

const positionOptions: { value: ProgressBarPosition; label: string }[] = [
  { value: "bottom", label: "Bottom" },
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
];

export const defaultProgressBarConfig: ProgressBarConfig = {
  enabled: false,
  style: "glow",
  position: "bottom",
  height: 4,
  color: "#8b5cf6",
  backgroundColor: "rgba(255,255,255,0.2)",
  showTime: false,
};

export function ProgressBarSettings({
  config,
  onConfigChange,
}: ProgressBarSettingsProps) {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Progress Bar</h3>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => onConfigChange({ ...config, enabled: v })}
          data-testid="switch-progress-bar"
        />
      </div>

      {config.enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Style</Label>
              <Select
                value={config.style}
                onValueChange={(v) => onConfigChange({ ...config, style: v as ProgressBarStyle })}
              >
                <SelectTrigger className="text-xs" data-testid="select-progress-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Position</Label>
              <Select
                value={config.position}
                onValueChange={(v) => onConfigChange({ ...config, position: v as ProgressBarPosition })}
              >
                <SelectTrigger className="text-xs" data-testid="select-progress-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Height</Label>
              <span className="text-xs text-muted-foreground">{config.height}px</span>
            </div>
            <Slider
              value={[config.height]}
              onValueChange={([v]) => onConfigChange({ ...config, height: v })}
              min={2}
              max={20}
              step={1}
              data-testid="slider-progress-height"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Bar Color</Label>
              <input
                type="color"
                value={config.color}
                onChange={(e) => onConfigChange({ ...config, color: e.target.value })}
                className="w-full h-8 rounded cursor-pointer border-0"
                data-testid="input-progress-color"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Background</Label>
              <input
                type="color"
                value={config.backgroundColor.startsWith("rgba") ? "#333333" : config.backgroundColor}
                onChange={(e) => onConfigChange({ ...config, backgroundColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer border-0"
                data-testid="input-progress-bg-color"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Time</Label>
            <Switch
              checked={config.showTime}
              onCheckedChange={(v) => onConfigChange({ ...config, showTime: v })}
              data-testid="switch-show-time"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
