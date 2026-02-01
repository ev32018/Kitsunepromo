import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Monitor } from "lucide-react";

export type QualityLevel = "low" | "medium" | "high" | "ultra";

export interface PerformanceConfig {
  performanceMode: boolean;
  qualityLevel: QualityLevel;
  maxFps: number;
  reduceParticles: boolean;
  disableGlow: boolean;
}

interface PerformanceSettingsProps {
  config: PerformanceConfig;
  onConfigChange: (config: PerformanceConfig) => void;
}

const qualityOptions: { value: QualityLevel; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Best performance, reduced effects" },
  { value: "medium", label: "Medium", description: "Balanced quality and performance" },
  { value: "high", label: "High", description: "High quality, more effects" },
  { value: "ultra", label: "Ultra", description: "Maximum quality, full effects" },
];

const fpsOptions = [
  { value: 24, label: "24 FPS" },
  { value: 30, label: "30 FPS" },
  { value: 60, label: "60 FPS" },
];

export function PerformanceSettings({ config, onConfigChange }: PerformanceSettingsProps) {
  const handlePerformanceModeChange = (enabled: boolean) => {
    if (enabled) {
      onConfigChange({
        ...config,
        performanceMode: true,
        qualityLevel: "medium",
        maxFps: 30,
        reduceParticles: true,
        disableGlow: true,
      });
    } else {
      onConfigChange({
        ...config,
        performanceMode: false,
        qualityLevel: "high",
        maxFps: 60,
        reduceParticles: false,
        disableGlow: false,
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Performance</Label>
        </div>
        <div className="flex items-center gap-2">
          {config.performanceMode && (
            <Badge variant="secondary" className="text-xs">Power Saver</Badge>
          )}
          <Switch
            checked={config.performanceMode}
            onCheckedChange={handlePerformanceModeChange}
            data-testid="switch-performance-mode"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-3 h-3 text-muted-foreground" />
            <Label className="text-xs">Preview Quality</Label>
          </div>
          <Select
            value={config.qualityLevel}
            onValueChange={(value: QualityLevel) => 
              onConfigChange({ ...config, qualityLevel: value })
            }
          >
            <SelectTrigger data-testid="select-quality-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Preview Frame Rate</Label>
          <Select
            value={config.maxFps.toString()}
            onValueChange={(value) => 
              onConfigChange({ ...config, maxFps: parseInt(value) })
            }
          >
            <SelectTrigger data-testid="select-max-fps">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fpsOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Reduce Particle Count</Label>
            <Switch
              checked={config.reduceParticles}
              onCheckedChange={(v) => onConfigChange({ ...config, reduceParticles: v })}
              data-testid="switch-reduce-particles"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Disable Glow Effects</Label>
            <Switch
              checked={config.disableGlow}
              onCheckedChange={(v) => onConfigChange({ ...config, disableGlow: v })}
              data-testid="switch-disable-glow"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {config.performanceMode 
            ? "Performance mode enabled - preview may differ from export"
            : "Full quality preview - may be slow on older devices"
          }
        </p>
      </div>
    </Card>
  );
}

export const defaultPerformanceConfig: PerformanceConfig = {
  performanceMode: false,
  qualityLevel: "high",
  maxFps: 60,
  reduceParticles: false,
  disableGlow: false,
};
