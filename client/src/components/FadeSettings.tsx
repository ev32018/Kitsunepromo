import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FadeType = "none" | "fade" | "fade-blur" | "fade-zoom" | "slide-left" | "slide-right" | "slide-up" | "slide-down";

export interface FadeConfig {
  introEnabled: boolean;
  introDuration: number;
  introType: FadeType;
  outroEnabled: boolean;
  outroDuration: number;
  outroType: FadeType;
  introColor: string;
  outroColor: string;
}

const FADE_TYPES: { value: FadeType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "fade-blur", label: "Fade + Blur" },
  { value: "fade-zoom", label: "Fade + Zoom" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
];

const FADE_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#ffffff", label: "White" },
  { value: "#1a1a2e", label: "Dark Blue" },
  { value: "#16213e", label: "Navy" },
];

interface FadeSettingsProps {
  config: FadeConfig;
  onConfigChange: (config: FadeConfig) => void;
}

export function FadeSettings({ config, onConfigChange }: FadeSettingsProps) {
  const updateConfig = (updates: Partial<FadeConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Intro Transition</Label>
          <Switch
            checked={config.introEnabled}
            onCheckedChange={checked => updateConfig({ introEnabled: checked })}
            data-testid="switch-intro-enabled"
          />
        </div>

        {config.introEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Badge variant="secondary">{config.introDuration.toFixed(1)}s</Badge>
              </div>
              <Slider
                value={[config.introDuration]}
                onValueChange={([value]) => updateConfig({ introDuration: value })}
                min={0.5}
                max={5}
                step={0.1}
                data-testid="slider-intro-duration"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Effect</Label>
              <Select
                value={config.introType}
                onValueChange={value => updateConfig({ introType: value as FadeType })}
              >
                <SelectTrigger data-testid="select-intro-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FADE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Background Color</Label>
              <div className="flex gap-2">
                {FADE_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateConfig({ introColor: color.value })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      config.introColor === color.value
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    data-testid={`button-intro-color-${color.label.toLowerCase()}`}
                  />
                ))}
                <input
                  type="color"
                  value={config.introColor}
                  onChange={e => updateConfig({ introColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                  data-testid="input-intro-custom-color"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Outro Transition</Label>
          <Switch
            checked={config.outroEnabled}
            onCheckedChange={checked => updateConfig({ outroEnabled: checked })}
            data-testid="switch-outro-enabled"
          />
        </div>

        {config.outroEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Badge variant="secondary">{config.outroDuration.toFixed(1)}s</Badge>
              </div>
              <Slider
                value={[config.outroDuration]}
                onValueChange={([value]) => updateConfig({ outroDuration: value })}
                min={0.5}
                max={5}
                step={0.1}
                data-testid="slider-outro-duration"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Effect</Label>
              <Select
                value={config.outroType}
                onValueChange={value => updateConfig({ outroType: value as FadeType })}
              >
                <SelectTrigger data-testid="select-outro-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FADE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Background Color</Label>
              <div className="flex gap-2">
                {FADE_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateConfig({ outroColor: color.value })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      config.outroColor === color.value
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    data-testid={`button-outro-color-${color.label.toLowerCase()}`}
                  />
                ))}
                <input
                  type="color"
                  value={config.outroColor}
                  onChange={e => updateConfig({ outroColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                  data-testid="input-outro-custom-color"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
