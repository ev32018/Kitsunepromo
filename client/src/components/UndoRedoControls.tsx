import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Undo2, Redo2 } from "lucide-react";

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyLength?: number;
  futureLength?: number;
  currentIndex?: number;
}

export function UndoRedoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyLength = 0,
  currentIndex = 0,
}: UndoRedoControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8"
            data-testid="button-undo"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo {historyLength > 0 && `(${historyLength})`}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8"
            data-testid="button-redo"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo {futureLength > 0 && `(${futureLength})`}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
