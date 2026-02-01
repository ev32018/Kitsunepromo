import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Layers, GripVertical } from "lucide-react";
import type { VisualizationType, ColorScheme } from "@shared/schema";

export interface ScheduleSegment {
  id: string;
  startTime: number;
  endTime: number;
  visualizationType: VisualizationType;
  colorScheme: ColorScheme;
  transitionDuration: number;
}

const VISUALIZATION_TYPES: { value: VisualizationType; label: string }[] = [
  { value: "bars", label: "Frequency Bars" },
  { value: "waveform", label: "Waveform" },
  { value: "circular", label: "Circular" },
  { value: "particles", label: "Particles" },
  { value: "spectrumAnalyzer", label: "Spectrum" },
];

const COLOR_SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: "neon", label: "Neon" },
  { value: "sunset", label: "Sunset" },
  { value: "ocean", label: "Ocean" },
  { value: "galaxy", label: "Galaxy" },
  { value: "fire", label: "Fire" },
  { value: "matrix", label: "Matrix" },
];

interface VisualizationSchedulerProps {
  segments: ScheduleSegment[];
  onSegmentsChange: (segments: ScheduleSegment[]) => void;
  duration: number;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function VisualizationScheduler({
  segments,
  onSegmentsChange,
  duration,
  enabled,
  onEnabledChange,
}: VisualizationSchedulerProps) {
  const addSegment = () => {
    const lastEnd = segments.length > 0 ? segments[segments.length - 1].endTime : 0;
    const newSegment: ScheduleSegment = {
      id: `segment-${Date.now()}`,
      startTime: lastEnd,
      endTime: Math.min(lastEnd + 30, duration),
      visualizationType: "circular",
      colorScheme: "neon",
      transitionDuration: 1,
    };
    onSegmentsChange([...segments, newSegment]);
  };

  const updateSegment = (id: string, updates: Partial<ScheduleSegment>) => {
    onSegmentsChange(
      segments.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeSegment = (id: string) => {
    onSegmentsChange(segments.filter(s => s.id !== id));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Visualization Schedule</Label>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          data-testid="switch-scheduler-enabled"
        />
      </div>

      {enabled && (
        <>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="p-3 rounded-md bg-muted/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                    <Badge variant="outline">Section {index + 1}</Badge>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => removeSegment(segment.id)}
                    data-testid={`button-remove-segment-${segment.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Start</Label>
                    <Badge variant="secondary" className="w-full justify-center">
                      {formatTime(segment.startTime)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End</Label>
                    <Badge variant="secondary" className="w-full justify-center">
                      {formatTime(segment.endTime)}
                    </Badge>
                  </div>
                </div>

                <Slider
                  value={[segment.startTime, segment.endTime]}
                  onValueChange={([start, end]) => 
                    updateSegment(segment.id, { startTime: start, endTime: end })
                  }
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  data-testid={`slider-segment-${segment.id}`}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={segment.visualizationType}
                    onValueChange={(v: VisualizationType) =>
                      updateSegment(segment.id, { visualizationType: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISUALIZATION_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={segment.colorScheme}
                    onValueChange={(v: ColorScheme) =>
                      updateSegment(segment.id, { colorScheme: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SCHEMES.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addSegment}
            className="w-full"
            data-testid="button-add-segment"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Section
          </Button>
        </>
      )}
    </Card>
  );
}

export const defaultSchedulerConfig = {
  enabled: false,
  segments: [] as ScheduleSegment[],
};
