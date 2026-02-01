import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type } from "lucide-react";

export type TextPosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type TextAnimation = "none" | "pulse" | "bounce" | "glow" | "wave" | "typewriter" | "fade";

export interface TextOverlayConfig {
  text: string;
  position: TextPosition;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  animation: TextAnimation;
  audioReactive: boolean;
  opacity: number;
}

interface TextOverlaySettingsProps {
  config: TextOverlayConfig;
  onConfigChange: (config: TextOverlayConfig) => void;
}

const positionOptions: { value: TextPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "center-left", label: "Center Left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

const animationOptions: { value: TextAnimation; label: string }[] = [
  { value: "none", label: "None" },
  { value: "pulse", label: "Pulse" },
  { value: "bounce", label: "Bounce" },
  { value: "glow", label: "Glow" },
  { value: "wave", label: "Wave" },
  { value: "fade", label: "Fade In/Out" },
];

const fontOptions = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Courier New, monospace", label: "Courier" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans" },
];

export const defaultTextOverlayConfig: TextOverlayConfig = {
  text: "",
  position: "bottom-center",
  fontSize: 32,
  fontFamily: "Inter, sans-serif",
  color: "#ffffff",
  strokeColor: "#000000",
  strokeWidth: 2,
  animation: "none",
  audioReactive: false,
  opacity: 1,
};

export function TextOverlaySettings({
  config,
  onConfigChange,
}: TextOverlaySettingsProps) {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Text Overlay</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Text</Label>
          <Input
            value={config.text}
            onChange={(e) => onConfigChange({ ...config, text: e.target.value })}
            placeholder="Song title, artist, watermark..."
            className="text-sm"
            maxLength={100}
            data-testid="input-text-overlay"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Position</Label>
            <Select
              value={config.position}
              onValueChange={(v) => onConfigChange({ ...config, position: v as TextPosition })}
            >
              <SelectTrigger className="text-xs" data-testid="select-text-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Font</Label>
            <Select
              value={config.fontFamily}
              onValueChange={(v) => onConfigChange({ ...config, fontFamily: v })}
            >
              <SelectTrigger className="text-xs" data-testid="select-text-font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Font Size</Label>
            <span className="text-xs text-muted-foreground">{config.fontSize}px</span>
          </div>
          <Slider
            value={[config.fontSize]}
            onValueChange={([v]) => onConfigChange({ ...config, fontSize: v })}
            min={12}
            max={96}
            step={2}
            data-testid="slider-font-size"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Text Color</Label>
            <div className="flex gap-1">
              <input
                type="color"
                value={config.color}
                onChange={(e) => onConfigChange({ ...config, color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                data-testid="input-text-color"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Stroke Color</Label>
            <div className="flex gap-1">
              <input
                type="color"
                value={config.strokeColor}
                onChange={(e) => onConfigChange({ ...config, strokeColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                data-testid="input-stroke-color"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Stroke Width</Label>
            <span className="text-xs text-muted-foreground">{config.strokeWidth}px</span>
          </div>
          <Slider
            value={[config.strokeWidth]}
            onValueChange={([v]) => onConfigChange({ ...config, strokeWidth: v })}
            min={0}
            max={10}
            step={1}
            data-testid="slider-stroke-width"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Animation</Label>
          <Select
            value={config.animation}
            onValueChange={(v) => onConfigChange({ ...config, animation: v as TextAnimation })}
          >
            <SelectTrigger data-testid="select-text-animation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {animationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Audio Reactive</Label>
          <Switch
            checked={config.audioReactive}
            onCheckedChange={(v) => onConfigChange({ ...config, audioReactive: v })}
            data-testid="switch-text-audio-reactive"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Opacity</Label>
            <span className="text-xs text-muted-foreground">{Math.round(config.opacity * 100)}%</span>
          </div>
          <Slider
            value={[config.opacity]}
            onValueChange={([v]) => onConfigChange({ ...config, opacity: v })}
            min={0.1}
            max={1}
            step={0.1}
            data-testid="slider-text-opacity"
          />
        </div>
      </div>
    </Card>
  );
}
