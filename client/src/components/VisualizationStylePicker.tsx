import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { visualizationTypes, type VisualizationType } from "@shared/schema";
import {
  BarChart3,
  Activity,
  Circle,
  Sparkles,
  Waves,
  Box,
  Sun,
  Mountain,
  Radio,
  SlidersHorizontal,
  AudioWaveform,
  Droplets,
  Atom,
  Snowflake,
  Grid3X3,
} from "lucide-react";

interface VisualizationStylePickerProps {
  value: VisualizationType;
  onChange: (value: VisualizationType) => void;
}

const visualizationMeta: Record<
  VisualizationType,
  { icon: React.ElementType; label: string; description: string }
> = {
  bars: {
    icon: BarChart3,
    label: "Frequency Bars",
    description: "Classic vertical bars",
  },
  waveform: {
    icon: Activity,
    label: "Waveform",
    description: "Smooth audio wave",
  },
  circular: {
    icon: Circle,
    label: "Circular",
    description: "Radial frequency display",
  },
  particles: {
    icon: Sparkles,
    label: "Particles",
    description: "Dynamic particle system",
  },
  fluid: {
    icon: Waves,
    label: "Fluid Waves",
    description: "Layered fluid motion",
  },
  spectrum3d: {
    icon: Box,
    label: "3D Spectrum",
    description: "Perspective bars",
  },
  radialBurst: {
    icon: Sun,
    label: "Radial Burst",
    description: "Explosive rays",
  },
  mountainRange: {
    icon: Mountain,
    label: "Mountain Range",
    description: "Layered peaks",
  },
  spectrumAnalyzer: {
    icon: Radio,
    label: "Spectrum Analyzer",
    description: "LED-style display",
  },
  equalizer: {
    icon: SlidersHorizontal,
    label: "Equalizer",
    description: "EQ band display",
  },
  audioBars: {
    icon: AudioWaveform,
    label: "Audio Bars",
    description: "Centered wave bars",
  },
  perlinFluid: {
    icon: Droplets,
    label: "Perlin Fluid",
    description: "Organic flowing patterns",
  },
  audioBlob: {
    icon: Atom,
    label: "Audio Blob",
    description: "Morphing 3D sphere",
  },
  kaleidoscope: {
    icon: Snowflake,
    label: "Kaleidoscope",
    description: "Symmetrical patterns",
  },
  endlessMaze: {
    icon: Grid3X3,
    label: "Endless Maze",
    description: "Evolving labyrinth",
  },
};

export function VisualizationStylePicker({
  value,
  onChange,
}: VisualizationStylePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Visualization Style
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {visualizationTypes.map((type) => {
          const meta = visualizationMeta[type];
          const Icon = meta.icon;
          const isSelected = value === type;

          return (
            <Card
              key={type}
              onClick={() => onChange(type)}
              className={`p-2 cursor-pointer transition-all hover-elevate ${
                isSelected
                  ? "border-primary bg-primary/10 glow-sm"
                  : "border-border/50 bg-card/50"
              }`}
              data-testid={`button-style-${type}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1 rounded-md flex-shrink-0 ${
                    isSelected ? "bg-primary/20" : "bg-muted/50"
                  }`}
                >
                  <Icon
                    className={`w-3 h-3 ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[10px] font-medium leading-tight ${
                      isSelected ? "text-primary" : ""
                    }`}
                  >
                    {meta.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    {meta.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
