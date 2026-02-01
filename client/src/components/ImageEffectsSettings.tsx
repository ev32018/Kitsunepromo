import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export interface ImageEffectSettings {
  enabled: boolean;
  pulse: boolean;
  pulseIntensity: number;
  wave: boolean;
  waveIntensity: number;
  colorShift: boolean;
  colorShiftIntensity: number;
  glitch: boolean;
  glitchIntensity: number;
  zoom: boolean;
  zoomIntensity: number;
}

interface ImageEffectsSettingsProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  effects: ImageEffectSettings;
  onEffectsChange: (effects: ImageEffectSettings) => void;
}

export const defaultImageEffects: ImageEffectSettings = {
  enabled: true,
  pulse: true,
  pulseIntensity: 0.5,
  wave: false,
  waveIntensity: 0.3,
  colorShift: false,
  colorShiftIntensity: 0.3,
  glitch: false,
  glitchIntensity: 0.2,
  zoom: false,
  zoomIntensity: 0.3,
};

export function ImageEffectsSettings({
  imageUrl,
  onImageChange,
  effects,
  onEffectsChange,
}: ImageEffectsSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const updateEffect = (key: keyof ImageEffectSettings, value: boolean | number) => {
    onEffectsChange({ ...effects, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Image Effects
      </h3>

      {!imageUrl ? (
        <Card
          className={`p-6 border-dashed cursor-pointer transition-all ${
            isDragging ? "border-primary bg-primary/10" : "border-border/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone-image-upload"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            data-testid="input-image-file"
          />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-8 h-8" />
            <p className="text-xs text-center">
              Drop an image or click to upload
            </p>
            <p className="text-[10px]">Apply audio-reactive effects</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-24 object-cover rounded-md"
              data-testid="img-uploaded-preview"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => onImageChange(null)}
              data-testid="button-remove-image"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Enable Effects</Label>
            <Switch
              checked={effects.enabled}
              onCheckedChange={(v) => updateEffect("enabled", v)}
              data-testid="switch-effects-enabled"
            />
          </div>

          {effects.enabled && (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Pulse (Bass)</Label>
                  <Switch
                    checked={effects.pulse}
                    onCheckedChange={(v) => updateEffect("pulse", v)}
                    data-testid="switch-pulse"
                  />
                </div>
                {effects.pulse && (
                  <Slider
                    value={[effects.pulseIntensity]}
                    onValueChange={([v]) => updateEffect("pulseIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-pulse-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Wave Distortion</Label>
                  <Switch
                    checked={effects.wave}
                    onCheckedChange={(v) => updateEffect("wave", v)}
                    data-testid="switch-wave"
                  />
                </div>
                {effects.wave && (
                  <Slider
                    value={[effects.waveIntensity]}
                    onValueChange={([v]) => updateEffect("waveIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-wave-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Color Shift (Treble)</Label>
                  <Switch
                    checked={effects.colorShift}
                    onCheckedChange={(v) => updateEffect("colorShift", v)}
                    data-testid="switch-color-shift"
                  />
                </div>
                {effects.colorShift && (
                  <Slider
                    value={[effects.colorShiftIntensity]}
                    onValueChange={([v]) => updateEffect("colorShiftIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-color-shift-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Glitch Effect</Label>
                  <Switch
                    checked={effects.glitch}
                    onCheckedChange={(v) => updateEffect("glitch", v)}
                    data-testid="switch-glitch"
                  />
                </div>
                {effects.glitch && (
                  <Slider
                    value={[effects.glitchIntensity]}
                    onValueChange={([v]) => updateEffect("glitchIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-glitch-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Zoom Pulse</Label>
                  <Switch
                    checked={effects.zoom}
                    onCheckedChange={(v) => updateEffect("zoom", v)}
                    data-testid="switch-zoom"
                  />
                </div>
                {effects.zoom && (
                  <Slider
                    value={[effects.zoomIntensity]}
                    onValueChange={([v]) => updateEffect("zoomIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-zoom-intensity"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
