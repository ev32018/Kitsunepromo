import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Play } from "lucide-react";

interface PresetItem {
  id: number | string;
  name: string;
  visualizationType: string;
  colorScheme: string;
}

interface DraggablePresetListProps {
  presets: PresetItem[];
  onReorder: (presets: PresetItem[]) => void;
  onDelete?: (id: number | string) => void;
  onApply?: (preset: PresetItem) => void;
}

export function DraggablePresetList({
  presets,
  onReorder,
  onDelete,
  onApply,
}: DraggablePresetListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const newPresets = [...presets];
    const [draggedItem] = newPresets.splice(draggedIndex, 1);
    newPresets.splice(dropIndex, 0, draggedItem);
    onReorder(newPresets);
    handleDragEnd();
  }, [draggedIndex, presets, onReorder, handleDragEnd]);

  if (presets.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No saved presets yet
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="draggable-preset-list">
      {presets.map((preset, index) => (
        <Card
          key={preset.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            p-3 cursor-move transition-all duration-200
            ${draggedIndex === index ? "opacity-50 scale-95" : ""}
            ${dragOverIndex === index ? "border-primary border-2" : ""}
            hover:bg-accent/50
          `}
          data-testid={`preset-item-${preset.id}`}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{preset.name}</p>
              <div className="flex gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {preset.visualizationType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {preset.colorScheme}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-1 flex-shrink-0">
              {onApply && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(preset);
                  }}
                  data-testid={`button-apply-preset-${preset.id}`}
                >
                  <Play className="w-3 h-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(preset.id);
                  }}
                  data-testid={`button-delete-preset-${preset.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
