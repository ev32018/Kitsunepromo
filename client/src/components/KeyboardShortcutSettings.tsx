import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Keyboard, RotateCcw } from "lucide-react";

export interface ShortcutConfig {
  playPause: string;
  seekBack: string;
  seekForward: string;
  fullscreen: string;
  mute: string;
  showHelp: string;
  undo: string;
  redo: string;
  export: string;
}

export const defaultShortcuts: ShortcutConfig = {
  playPause: "Space",
  seekBack: "ArrowLeft",
  seekForward: "ArrowRight",
  fullscreen: "f",
  mute: "m",
  showHelp: "?",
  undo: "Ctrl+Z",
  redo: "Ctrl+Y",
  export: "Ctrl+E",
};

const SHORTCUT_LABELS: Record<keyof ShortcutConfig, string> = {
  playPause: "Play/Pause",
  seekBack: "Seek Back",
  seekForward: "Seek Forward",
  fullscreen: "Toggle Fullscreen",
  mute: "Toggle Mute",
  showHelp: "Show Help",
  undo: "Undo",
  redo: "Redo",
  export: "Quick Export",
};

interface KeyboardShortcutSettingsProps {
  shortcuts: ShortcutConfig;
  onShortcutsChange: (shortcuts: ShortcutConfig) => void;
}

export function KeyboardShortcutSettings({ shortcuts, onShortcutsChange }: KeyboardShortcutSettingsProps) {
  const [editingKey, setEditingKey] = useState<keyof ShortcutConfig | null>(null);
  const [tempKey, setTempKey] = useState("");

  const handleKeyCapture = (e: React.KeyboardEvent, key: keyof ShortcutConfig) => {
    e.preventDefault();
    
    let captured = "";
    if (e.ctrlKey) captured += "Ctrl+";
    if (e.altKey) captured += "Alt+";
    if (e.shiftKey) captured += "Shift+";
    
    if (e.key !== "Control" && e.key !== "Alt" && e.key !== "Shift") {
      captured += e.key.length === 1 ? e.key.toLowerCase() : e.key;
      onShortcutsChange({ ...shortcuts, [key]: captured });
      setEditingKey(null);
    }
  };

  const handleReset = () => {
    onShortcutsChange(defaultShortcuts);
  };

  const formatShortcut = (shortcut: string): string => {
    return shortcut
      .replace("ArrowLeft", "←")
      .replace("ArrowRight", "→")
      .replace("ArrowUp", "↑")
      .replace("ArrowDown", "↓")
      .replace("Space", "␣");
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          data-testid="button-reset-shortcuts"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        {(Object.keys(shortcuts) as Array<keyof ShortcutConfig>).map(key => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {SHORTCUT_LABELS[key]}
            </Label>
            {editingKey === key ? (
              <Input
                className="w-24 h-7 text-xs text-center"
                placeholder="Press key..."
                onKeyDown={(e) => handleKeyCapture(e, key)}
                onBlur={() => setEditingKey(null)}
                autoFocus
                data-testid={`input-shortcut-${key}`}
              />
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 min-w-16"
                onClick={() => setEditingKey(key)}
                data-testid={`button-shortcut-${key}`}
              >
                <Badge variant="secondary" className="text-xs">
                  {formatShortcut(shortcuts[key])}
                </Badge>
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
