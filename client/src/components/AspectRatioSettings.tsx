import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone, Square, RectangleVertical } from "lucide-react";

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5" | "custom";

export interface AspectRatioConfig {
  ratio: AspectRatio;
  letterboxColor: string;
}

interface AspectRatioSettingsProps {
  config: AspectRatioConfig;
  onConfigChange: (config: AspectRatioConfig) => void;
}

const aspectRatioPresets: { value: AspectRatio; label: string; icon: typeof Monitor; description: string }[] = [
  { value: "16:9", label: "16:9", icon: Monitor, description: "YouTube, Landscape" },
  { value: "9:16", label: "9:16", icon: Smartphone, description: "TikTok, Reels, Shorts" },
  { value: "1:1", label: "1:1", icon: Square, description: "Instagram, Facebook" },
  { value: "4:5", label: "4:5", icon: RectangleVertical, description: "Instagram Portrait" },
];

export const defaultAspectRatioConfig: AspectRatioConfig = {
  ratio: "16:9",
  letterboxColor: "#000000",
};

export function getAspectRatioDimensions(ratio: AspectRatio, baseWidth: number): { width: number; height: number } {
  switch (ratio) {
    case "16:9":
      return { width: baseWidth, height: Math.round(baseWidth * 9 / 16) };
    case "9:16":
      return { width: Math.round(baseWidth * 9 / 16), height: baseWidth };
    case "1:1":
      return { width: baseWidth, height: baseWidth };
    case "4:5":
      return { width: Math.round(baseWidth * 4 / 5), height: baseWidth };
    default:
      return { width: baseWidth, height: Math.round(baseWidth * 9 / 16) };
  }
}

export function AspectRatioSettings({
  config,
  onConfigChange,
}: AspectRatioSettingsProps) {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Aspect Ratio</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {aspectRatioPresets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = config.ratio === preset.value;
          return (
            <Button
              key={preset.value}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="flex flex-col h-auto py-2 gap-0.5"
              onClick={() => onConfigChange({ ...config, ratio: preset.value })}
              data-testid={`button-ratio-${preset.value}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{preset.label}</span>
              <span className="text-[9px] text-muted-foreground">{preset.description}</span>
            </Button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Letterbox Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={config.letterboxColor}
            onChange={(e) => onConfigChange({ ...config, letterboxColor: e.target.value })}
            className="w-12 h-8 p-0.5 cursor-pointer"
            data-testid="input-letterbox-color"
          />
          <Input
            type="text"
            value={config.letterboxColor}
            onChange={(e) => onConfigChange({ ...config, letterboxColor: e.target.value })}
            className="flex-1 text-xs font-mono"
            placeholder="#000000"
            data-testid="input-letterbox-color-text"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Background color for letterboxing when aspect ratio differs
        </p>
      </div>
    </Card>
  );
}
