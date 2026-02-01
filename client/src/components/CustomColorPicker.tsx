import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Palette, Plus, X } from "lucide-react";

interface CustomColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  enabled: boolean;
}

const defaultCustomColors = ["#ff00ff", "#00ffff", "#ff0080", "#80ff00", "#0080ff"];

export function CustomColorPicker({ colors, onChange, enabled }: CustomColorPickerProps) {
  const isEnabled = enabled || colors.length > 0;

  const handleToggle = (checked: boolean) => {
    if (checked && colors.length === 0) {
      onChange(defaultCustomColors);
    } else if (!checked) {
      onChange([]);
    }
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    onChange(newColors);
  };

  const addColor = () => {
    if (colors.length < 8) {
      onChange([...colors, "#ffffff"]);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      onChange(newColors);
    }
  };

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Custom Colors</h3>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          data-testid="switch-custom-colors"
        />
      </div>

      {isEnabled && colors.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color, index) => (
              <div key={index} className="relative group">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-full h-10 p-1 cursor-pointer rounded-md"
                  data-testid={`input-color-${index}`}
                />
                {colors.length > 2 && (
                  <button
                    onClick={() => removeColor(index)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2 h-2 text-white" />
                  </button>
                )}
              </div>
            ))}
            {colors.length < 8 && (
              <Button
                variant="outline"
                size="icon"
                onClick={addColor}
                className="h-10 w-full"
                data-testid="button-add-color"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Custom colors override the selected color scheme
          </p>
        </div>
      )}
    </Card>
  );
}
