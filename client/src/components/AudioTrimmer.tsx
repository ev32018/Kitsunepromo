import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Scissors, Play, Pause, RotateCcw } from "lucide-react";

export interface TrimConfig {
  enabled: boolean;
  startTime: number;
  endTime: number;
}

interface AudioTrimmerProps {
  audioElement: HTMLAudioElement | null;
  duration: number;
  config: TrimConfig;
  onConfigChange: (config: TrimConfig) => void;
  onPreviewTrim: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0]) || 0;
    const secParts = parts[1].split('.');
    const secs = parseInt(secParts[0]) || 0;
    const ms = parseInt(secParts[1] || '0') || 0;
    return mins * 60 + secs + ms / 100;
  }
  return parseFloat(timeStr) || 0;
}

export function AudioTrimmer({ audioElement, duration, config, onConfigChange, onPreviewTrim }: AudioTrimmerProps) {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleToggle = (enabled: boolean) => {
    onConfigChange({ ...config, enabled });
  };

  const handleStartChange = (value: number) => {
    const newStart = Math.min(value, config.endTime - 0.1);
    onConfigChange({ ...config, startTime: Math.max(0, newStart) });
  };

  const handleEndChange = (value: number) => {
    const newEnd = Math.max(value, config.startTime + 0.1);
    onConfigChange({ ...config, endTime: Math.min(duration, newEnd) });
  };

  const handleReset = () => {
    onConfigChange({ ...config, startTime: 0, endTime: duration });
  };

  const handleSetStart = useCallback(() => {
    if (audioElement) {
      handleStartChange(audioElement.currentTime);
    }
  }, [audioElement, config.endTime]);

  const handleSetEnd = useCallback(() => {
    if (audioElement) {
      handleEndChange(audioElement.currentTime);
    }
  }, [audioElement, config.startTime]);

  const trimDuration = config.endTime - config.startTime;
  const trimPercentage = duration > 0 ? (trimDuration / duration) * 100 : 100;

  useEffect(() => {
    if (duration > 0 && config.endTime === 0) {
      onConfigChange({ ...config, endTime: duration });
    }
  }, [duration]);

  if (!audioElement || duration === 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Audio Trim</Label>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={handleToggle}
          data-testid="switch-trim-enabled"
        />
      </div>

      {config.enabled && (
        <div className="space-y-4">
          <div 
            ref={sliderRef}
            className="relative h-8 bg-muted rounded-md overflow-hidden"
            data-testid="trim-timeline"
          >
            <div 
              className="absolute h-full bg-primary/30"
              style={{ 
                left: `${(config.startTime / duration) * 100}%`,
                width: `${((config.endTime - config.startTime) / duration) * 100}%`
              }}
            />
            <div 
              className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
              style={{ left: `${(config.startTime / duration) * 100}%` }}
              data-testid="trim-start-handle"
            />
            <div 
              className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
              style={{ left: `${(config.endTime / duration) * 100}%` }}
              data-testid="trim-end-handle"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Start Time</Label>
              <div className="flex gap-2">
                <Input
                  value={formatTime(config.startTime)}
                  onChange={(e) => handleStartChange(parseTime(e.target.value))}
                  className="text-xs font-mono"
                  data-testid="input-trim-start"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSetStart}
                  title="Set to current position"
                  data-testid="button-set-start"
                >
                  Set
                </Button>
              </div>
              <Slider
                value={[config.startTime]}
                min={0}
                max={duration}
                step={0.01}
                onValueChange={([v]) => handleStartChange(v)}
                data-testid="slider-trim-start"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">End Time</Label>
              <div className="flex gap-2">
                <Input
                  value={formatTime(config.endTime)}
                  onChange={(e) => handleEndChange(parseTime(e.target.value))}
                  className="text-xs font-mono"
                  data-testid="input-trim-end"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSetEnd}
                  title="Set to current position"
                  data-testid="button-set-end"
                >
                  Set
                </Button>
              </div>
              <Slider
                value={[config.endTime]}
                min={0}
                max={duration}
                step={0.01}
                onValueChange={([v]) => handleEndChange(v)}
                data-testid="slider-trim-end"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Duration: {formatTime(trimDuration)} ({trimPercentage.toFixed(1)}%)</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleReset}
                className="h-7 px-2"
                data-testid="button-trim-reset"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onPreviewTrim}
                className="h-7 px-2"
                data-testid="button-preview-trim"
              >
                <Play className="w-3 h-3 mr-1" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export const defaultTrimConfig: TrimConfig = {
  enabled: false,
  startTime: 0,
  endTime: 0,
};
