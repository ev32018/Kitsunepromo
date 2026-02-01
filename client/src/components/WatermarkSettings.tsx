import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Upload, X, Move } from "lucide-react";

export type WatermarkPosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface WatermarkConfig {
  enabled: boolean;
  imageUrl: string | null;
  position: WatermarkPosition;
  size: number;
  opacity: number;
  padding: number;
}

interface WatermarkSettingsProps {
  config: WatermarkConfig;
  onConfigChange: (config: WatermarkConfig) => void;
}

const positionOptions: { value: WatermarkPosition; label: string }[] = [
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

export function WatermarkSettings({ config, onConfigChange }: WatermarkSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleToggle = (enabled: boolean) => {
    onConfigChange({ ...config, enabled });
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onConfigChange({ ...config, imageUrl: e.target?.result as string, enabled: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
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

  const handleClear = () => {
    onConfigChange({ ...config, imageUrl: null, enabled: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Watermark/Logo</Label>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={handleToggle}
          disabled={!config.imageUrl}
          data-testid="switch-watermark"
        />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
        data-testid="input-watermark-file"
      />

      {!config.imageUrl ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid="watermark-dropzone"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop logo image or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG with transparency recommended
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={config.imageUrl}
              alt="Watermark preview"
              className="max-h-full max-w-full object-contain"
              style={{ opacity: config.opacity }}
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleClear}
              data-testid="button-clear-watermark"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Move className="w-3 h-3 text-muted-foreground" />
                <Label className="text-xs">Position</Label>
              </div>
              <Select
                value={config.position}
                onValueChange={(value: WatermarkPosition) => 
                  onConfigChange({ ...config, position: value })
                }
              >
                <SelectTrigger data-testid="select-watermark-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Size</Label>
                <span className="text-xs text-muted-foreground">{config.size}%</span>
              </div>
              <Slider
                value={[config.size]}
                min={5}
                max={50}
                step={1}
                onValueChange={([v]) => onConfigChange({ ...config, size: v })}
                data-testid="slider-watermark-size"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs text-muted-foreground">{Math.round(config.opacity * 100)}%</span>
              </div>
              <Slider
                value={[config.opacity]}
                min={0.1}
                max={1}
                step={0.05}
                onValueChange={([v]) => onConfigChange({ ...config, opacity: v })}
                data-testid="slider-watermark-opacity"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Padding</Label>
                <span className="text-xs text-muted-foreground">{config.padding}px</span>
              </div>
              <Slider
                value={[config.padding]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => onConfigChange({ ...config, padding: v })}
                data-testid="slider-watermark-padding"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export const defaultWatermarkConfig: WatermarkConfig = {
  enabled: false,
  imageUrl: null,
  position: "bottom-right",
  size: 15,
  opacity: 0.8,
  padding: 20,
};
