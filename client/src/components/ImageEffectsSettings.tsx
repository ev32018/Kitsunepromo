import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Image as ImageIcon, Eye, EyeOff } from "lucide-react";

export interface ImageEffectSettings {
  enabled: boolean;
  hideVisualization: boolean;
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
  blur: boolean;
  blurIntensity: number;
  chromatic: boolean;
  chromaticIntensity: number;
  rotation: boolean;
  rotationIntensity: number;
  mirror: boolean;
  mirrorMode: 'horizontal' | 'vertical' | 'quad';
  scanlines: boolean;
  scanlinesIntensity: number;
  vignette: boolean;
  vignetteIntensity: number;
}

interface ImageEffectsSettingsProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  effects: ImageEffectSettings;
  onEffectsChange: (effects: ImageEffectSettings) => void;
}

export const defaultImageEffects: ImageEffectSettings = {
  enabled: true,
  hideVisualization: false,
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
  blur: false,
  blurIntensity: 0.3,
  chromatic: false,
  chromaticIntensity: 0.4,
  rotation: false,
  rotationIntensity: 0.3,
  mirror: false,
  mirrorMode: 'horizontal',
  scanlines: false,
  scanlinesIntensity: 0.3,
  vignette: false,
  vignetteIntensity: 0.5,
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

  const updateEffect = (key: keyof ImageEffectSettings, value: boolean | number | string) => {
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
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  {effects.hideVisualization ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <Label className="text-xs">Hide Visualization</Label>
                </div>
                <Switch
                  checked={effects.hideVisualization}
                  onCheckedChange={(v) => updateEffect("hideVisualization", v)}
                  data-testid="switch-hide-visualization"
                />
              </div>

              <div className="border-t border-border/50 pt-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Transform Effects</Label>
              </div>

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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Rotation</Label>
                  <Switch
                    checked={effects.rotation}
                    onCheckedChange={(v) => updateEffect("rotation", v)}
                    data-testid="switch-rotation"
                  />
                </div>
                {effects.rotation && (
                  <Slider
                    value={[effects.rotationIntensity]}
                    onValueChange={([v]) => updateEffect("rotationIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-rotation-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Mirror</Label>
                  <Switch
                    checked={effects.mirror}
                    onCheckedChange={(v) => updateEffect("mirror", v)}
                    data-testid="switch-mirror"
                  />
                </div>
                {effects.mirror && (
                  <Select
                    value={effects.mirrorMode}
                    onValueChange={(v) => updateEffect("mirrorMode", v as 'horizontal' | 'vertical' | 'quad')}
                  >
                    <SelectTrigger className="h-8" data-testid="select-mirror-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="quad">Quad (4-way)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="border-t border-border/50 pt-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Distortion Effects</Label>
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
                  <Label className="text-xs">Glitch</Label>
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
                  <Label className="text-xs">Blur Pulse</Label>
                  <Switch
                    checked={effects.blur}
                    onCheckedChange={(v) => updateEffect("blur", v)}
                    data-testid="switch-blur"
                  />
                </div>
                {effects.blur && (
                  <Slider
                    value={[effects.blurIntensity]}
                    onValueChange={([v]) => updateEffect("blurIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-blur-intensity"
                  />
                )}
              </div>

              <div className="border-t border-border/50 pt-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Color Effects</Label>
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
                  <Label className="text-xs">Chromatic Aberration</Label>
                  <Switch
                    checked={effects.chromatic}
                    onCheckedChange={(v) => updateEffect("chromatic", v)}
                    data-testid="switch-chromatic"
                  />
                </div>
                {effects.chromatic && (
                  <Slider
                    value={[effects.chromaticIntensity]}
                    onValueChange={([v]) => updateEffect("chromaticIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-chromatic-intensity"
                  />
                )}
              </div>

              <div className="border-t border-border/50 pt-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Overlay Effects</Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Scanlines</Label>
                  <Switch
                    checked={effects.scanlines}
                    onCheckedChange={(v) => updateEffect("scanlines", v)}
                    data-testid="switch-scanlines"
                  />
                </div>
                {effects.scanlines && (
                  <Slider
                    value={[effects.scanlinesIntensity]}
                    onValueChange={([v]) => updateEffect("scanlinesIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-scanlines-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Vignette</Label>
                  <Switch
                    checked={effects.vignette}
                    onCheckedChange={(v) => updateEffect("vignette", v)}
                    data-testid="switch-vignette"
                  />
                </div>
                {effects.vignette && (
                  <Slider
                    value={[effects.vignetteIntensity]}
                    onValueChange={([v]) => updateEffect("vignetteIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-vignette-intensity"
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
