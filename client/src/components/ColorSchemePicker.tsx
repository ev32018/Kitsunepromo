import { Card } from "@/components/ui/card";
import { colorSchemes, type ColorScheme } from "@shared/schema";
import { colorSchemes as colorPalettes } from "@/lib/visualizers";

interface ColorSchemePickerProps {
  value: ColorScheme;
  onChange: (value: ColorScheme) => void;
}

const schemeLabels: Record<ColorScheme, string> = {
  neon: "Neon",
  sunset: "Sunset",
  ocean: "Ocean",
  galaxy: "Galaxy",
  fire: "Fire",
  matrix: "Matrix",
  pastel: "Pastel",
  monochrome: "Mono",
};

export function ColorSchemePicker({ value, onChange }: ColorSchemePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Color Scheme</h3>
      <div className="grid grid-cols-4 gap-2">
        {colorSchemes.map((scheme) => {
          const colors = colorPalettes[scheme];
          const isSelected = value === scheme;

          return (
            <Card
              key={scheme}
              onClick={() => onChange(scheme)}
              className={`p-2 cursor-pointer transition-all hover-elevate ${
                isSelected
                  ? "border-primary ring-1 ring-primary/50"
                  : "border-border/50"
              }`}
              data-testid={`button-color-${scheme}`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex gap-0.5">
                  {colors.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {schemeLabels[scheme]}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
