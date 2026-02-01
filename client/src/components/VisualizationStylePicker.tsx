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
              className={`p-3 cursor-pointer transition-all hover-elevate ${
                isSelected
                  ? "border-primary bg-primary/10 glow-sm"
                  : "border-border/50 bg-card/50"
              }`}
              data-testid={`button-style-${type}`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`p-1.5 rounded-md ${
                    isSelected ? "bg-primary/20" : "bg-muted/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      isSelected ? "text-primary" : ""
                    }`}
                  >
                    {meta.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
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
