import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type } from "lucide-react";

interface OverlaySettingsProps {
  text: string;
  onTextChange: (text: string) => void;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  onPositionChange: (position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center") => void;
}

export function OverlaySettings({
  text,
  onTextChange,
  position,
  onPositionChange,
}: OverlaySettingsProps) {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Overlay Text</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Text / Watermark</Label>
          <Input
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Enter text or logo name..."
            className="text-sm"
            maxLength={50}
            data-testid="input-overlay-text"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Position</Label>
          <Select value={position} onValueChange={onPositionChange}>
            <SelectTrigger data-testid="select-overlay-position">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top-left">Top Left</SelectItem>
              <SelectItem value="top-right">Top Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
              <SelectItem value="center">Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {text && (
          <p className="text-[10px] text-muted-foreground">
            Text will appear on visualization and exports
          </p>
        )}
      </div>
    </Card>
  );
}
