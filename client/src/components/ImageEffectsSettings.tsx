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
  // New creative effects
  circleRotation: boolean;
  circleRotationIntensity: number;
  circleRotationCount: number;
  rainMask: boolean;
  rainMaskIntensity: number;
  rainMaskSpeed: number;
  sliceShift: boolean;
  sliceShiftIntensity: number;
  sliceShiftDirection: 'horizontal' | 'vertical' | 'both';
  ripple: boolean;
  rippleIntensity: number;
  rippleSpeed: number;
  pixelSort: boolean;
  pixelSortIntensity: number;
  tunnelZoom: boolean;
  tunnelZoomIntensity: number;
  shatter: boolean;
  shatterIntensity: number;
  shatterPieces: number;
  liquidMorph: boolean;
  liquidMorphIntensity: number;
  // Segmented effects (like circle rotation)
  spiralWedges: boolean;
  spiralWedgesIntensity: number;
  spiralWedgesCount: number;
  waveBands: boolean;
  waveBandsIntensity: number;
  waveBandsCount: number;
  gridWarp: boolean;
  gridWarpIntensity: number;
  gridWarpSize: number;
  radialZoom: boolean;
  radialZoomIntensity: number;
  radialZoomSegments: number;
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
  // New creative effects defaults
  circleRotation: false,
  circleRotationIntensity: 0.5,
  circleRotationCount: 5,
  rainMask: false,
  rainMaskIntensity: 0.5,
  rainMaskSpeed: 0.5,
  sliceShift: false,
  sliceShiftIntensity: 0.3,
  sliceShiftDirection: 'horizontal',
  ripple: false,
  rippleIntensity: 0.4,
  rippleSpeed: 0.5,
  pixelSort: false,
  pixelSortIntensity: 0.3,
  tunnelZoom: false,
  tunnelZoomIntensity: 0.4,
  shatter: false,
  shatterIntensity: 0.3,
  shatterPieces: 12,
  liquidMorph: false,
  liquidMorphIntensity: 0.4,
  // Segmented effects defaults
  spiralWedges: false,
  spiralWedgesIntensity: 0.5,
  spiralWedgesCount: 8,
  waveBands: false,
  waveBandsIntensity: 0.5,
  waveBandsCount: 6,
  gridWarp: false,
  gridWarpIntensity: 0.5,
  gridWarpSize: 4,
  radialZoom: false,
  radialZoomIntensity: 0.5,
  radialZoomSegments: 6,
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

              <div className="border-t border-border/50 pt-3">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Creative Effects</Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Circle Rotation</Label>
                  <Switch
                    checked={effects.circleRotation}
                    onCheckedChange={(v) => updateEffect("circleRotation", v)}
                    data-testid="switch-circle-rotation"
                  />
                </div>
                {effects.circleRotation && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.circleRotationIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.circleRotationIntensity]}
                      onValueChange={([v]) => updateEffect("circleRotationIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-circle-rotation-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Circles</span>
                      <span>{effects.circleRotationCount}</span>
                    </div>
                    <Slider
                      value={[effects.circleRotationCount]}
                      onValueChange={([v]) => updateEffect("circleRotationCount", v)}
                      min={2}
                      max={10}
                      step={1}
                      data-testid="slider-circle-rotation-count"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Spiral Wedges</Label>
                  <Switch
                    checked={effects.spiralWedges}
                    onCheckedChange={(v) => updateEffect("spiralWedges", v)}
                    data-testid="switch-spiral-wedges"
                  />
                </div>
                {effects.spiralWedges && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.spiralWedgesIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.spiralWedgesIntensity]}
                      onValueChange={([v]) => updateEffect("spiralWedgesIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-spiral-wedges-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Wedges</span>
                      <span>{effects.spiralWedgesCount}</span>
                    </div>
                    <Slider
                      value={[effects.spiralWedgesCount]}
                      onValueChange={([v]) => updateEffect("spiralWedgesCount", v)}
                      min={4}
                      max={16}
                      step={1}
                      data-testid="slider-spiral-wedges-count"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Wave Bands</Label>
                  <Switch
                    checked={effects.waveBands}
                    onCheckedChange={(v) => updateEffect("waveBands", v)}
                    data-testid="switch-wave-bands"
                  />
                </div>
                {effects.waveBands && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.waveBandsIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.waveBandsIntensity]}
                      onValueChange={([v]) => updateEffect("waveBandsIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-wave-bands-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Bands</span>
                      <span>{effects.waveBandsCount}</span>
                    </div>
                    <Slider
                      value={[effects.waveBandsCount]}
                      onValueChange={([v]) => updateEffect("waveBandsCount", v)}
                      min={3}
                      max={12}
                      step={1}
                      data-testid="slider-wave-bands-count"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Grid Warp</Label>
                  <Switch
                    checked={effects.gridWarp}
                    onCheckedChange={(v) => updateEffect("gridWarp", v)}
                    data-testid="switch-grid-warp"
                  />
                </div>
                {effects.gridWarp && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.gridWarpIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.gridWarpIntensity]}
                      onValueChange={([v]) => updateEffect("gridWarpIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-grid-warp-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Grid Size</span>
                      <span>{effects.gridWarpSize}x{effects.gridWarpSize}</span>
                    </div>
                    <Slider
                      value={[effects.gridWarpSize]}
                      onValueChange={([v]) => updateEffect("gridWarpSize", v)}
                      min={2}
                      max={8}
                      step={1}
                      data-testid="slider-grid-warp-size"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Radial Zoom</Label>
                  <Switch
                    checked={effects.radialZoom}
                    onCheckedChange={(v) => updateEffect("radialZoom", v)}
                    data-testid="switch-radial-zoom"
                  />
                </div>
                {effects.radialZoom && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.radialZoomIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.radialZoomIntensity]}
                      onValueChange={([v]) => updateEffect("radialZoomIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-radial-zoom-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Segments</span>
                      <span>{effects.radialZoomSegments}</span>
                    </div>
                    <Slider
                      value={[effects.radialZoomSegments]}
                      onValueChange={([v]) => updateEffect("radialZoomSegments", v)}
                      min={4}
                      max={12}
                      step={1}
                      data-testid="slider-radial-zoom-segments"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Rain Mask</Label>
                  <Switch
                    checked={effects.rainMask}
                    onCheckedChange={(v) => updateEffect("rainMask", v)}
                    data-testid="switch-rain-mask"
                  />
                </div>
                {effects.rainMask && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.rainMaskIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.rainMaskIntensity]}
                      onValueChange={([v]) => updateEffect("rainMaskIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-rain-mask-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Speed</span>
                      <span>{Math.round(effects.rainMaskSpeed * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.rainMaskSpeed]}
                      onValueChange={([v]) => updateEffect("rainMaskSpeed", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-rain-mask-speed"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Slice Shift</Label>
                  <Switch
                    checked={effects.sliceShift}
                    onCheckedChange={(v) => updateEffect("sliceShift", v)}
                    data-testid="switch-slice-shift"
                  />
                </div>
                {effects.sliceShift && (
                  <div className="space-y-2">
                    <Slider
                      value={[effects.sliceShiftIntensity]}
                      onValueChange={([v]) => updateEffect("sliceShiftIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-slice-shift-intensity"
                    />
                    <Select
                      value={effects.sliceShiftDirection}
                      onValueChange={(v) => updateEffect("sliceShiftDirection", v)}
                    >
                      <SelectTrigger className="h-7 text-xs" data-testid="select-slice-direction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                        <SelectItem value="vertical">Vertical</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Water Ripple</Label>
                  <Switch
                    checked={effects.ripple}
                    onCheckedChange={(v) => updateEffect("ripple", v)}
                    data-testid="switch-ripple"
                  />
                </div>
                {effects.ripple && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.rippleIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.rippleIntensity]}
                      onValueChange={([v]) => updateEffect("rippleIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-ripple-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Speed</span>
                      <span>{Math.round(effects.rippleSpeed * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.rippleSpeed]}
                      onValueChange={([v]) => updateEffect("rippleSpeed", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-ripple-speed"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Pixel Sort</Label>
                  <Switch
                    checked={effects.pixelSort}
                    onCheckedChange={(v) => updateEffect("pixelSort", v)}
                    data-testid="switch-pixel-sort"
                  />
                </div>
                {effects.pixelSort && (
                  <Slider
                    value={[effects.pixelSortIntensity]}
                    onValueChange={([v]) => updateEffect("pixelSortIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-pixel-sort-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Tunnel Zoom</Label>
                  <Switch
                    checked={effects.tunnelZoom}
                    onCheckedChange={(v) => updateEffect("tunnelZoom", v)}
                    data-testid="switch-tunnel-zoom"
                  />
                </div>
                {effects.tunnelZoom && (
                  <Slider
                    value={[effects.tunnelZoomIntensity]}
                    onValueChange={([v]) => updateEffect("tunnelZoomIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-tunnel-zoom-intensity"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Shatter</Label>
                  <Switch
                    checked={effects.shatter}
                    onCheckedChange={(v) => updateEffect("shatter", v)}
                    data-testid="switch-shatter"
                  />
                </div>
                {effects.shatter && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Intensity</span>
                      <span>{Math.round(effects.shatterIntensity * 100)}%</span>
                    </div>
                    <Slider
                      value={[effects.shatterIntensity]}
                      onValueChange={([v]) => updateEffect("shatterIntensity", v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      data-testid="slider-shatter-intensity"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Pieces</span>
                      <span>{effects.shatterPieces}</span>
                    </div>
                    <Slider
                      value={[effects.shatterPieces]}
                      onValueChange={([v]) => updateEffect("shatterPieces", v)}
                      min={4}
                      max={24}
                      step={1}
                      data-testid="slider-shatter-pieces"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Liquid Morph</Label>
                  <Switch
                    checked={effects.liquidMorph}
                    onCheckedChange={(v) => updateEffect("liquidMorph", v)}
                    data-testid="switch-liquid-morph"
                  />
                </div>
                {effects.liquidMorph && (
                  <Slider
                    value={[effects.liquidMorphIntensity]}
                    onValueChange={([v]) => updateEffect("liquidMorphIntensity", v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    data-testid="slider-liquid-morph-intensity"
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
