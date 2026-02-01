import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, X, CheckCircle } from "lucide-react";

interface ExportProgressProps {
  isExporting: boolean;
  progress: number;
  startTime: number | null;
  totalFrames: number;
  currentFrame: number;
  onCancel?: () => void;
}

export function ExportProgress({
  isExporting,
  progress,
  startTime,
  totalFrames,
  currentFrame,
  onCancel,
}: ExportProgressProps) {
  const [eta, setEta] = useState<string>("Calculating...");
  const [elapsed, setElapsed] = useState<string>("0:00");

  useEffect(() => {
    if (!isExporting || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const elapsedMins = Math.floor(elapsedSecs / 60);
      const elapsedRemSecs = elapsedSecs % 60;
      setElapsed(`${elapsedMins}:${elapsedRemSecs.toString().padStart(2, "0")}`);

      if (currentFrame > 0 && progress > 0) {
        const msPerFrame = elapsedMs / currentFrame;
        const remainingFrames = totalFrames - currentFrame;
        const remainingMs = msPerFrame * remainingFrames;
        
        const remainingSecs = Math.floor(remainingMs / 1000);
        if (remainingSecs < 60) {
          setEta(`${remainingSecs}s`);
        } else {
          const mins = Math.floor(remainingSecs / 60);
          const secs = remainingSecs % 60;
          setEta(`${mins}:${secs.toString().padStart(2, "0")}`);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isExporting, startTime, currentFrame, totalFrames, progress]);

  if (!isExporting) return null;

  return (
    <Card className="p-4 space-y-3 border-primary/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Exporting...</span>
        </div>
        {onCancel && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            className="h-6 w-6"
            data-testid="button-cancel-export"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Frame {currentFrame} / {totalFrames}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Elapsed: {elapsed}</span>
          <Badge variant="secondary" className="text-xs">
            ETA: {eta}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

interface ExportCompleteProps {
  filename: string;
  duration: string;
  fileSize?: string;
  onDismiss: () => void;
}

export function ExportComplete({ filename, duration, fileSize, onDismiss }: ExportCompleteProps) {
  return (
    <Card className="p-4 space-y-3 border-green-500/50 bg-green-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-600">Export Complete!</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          className="h-6 w-6"
          data-testid="button-dismiss-export-complete"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{filename}</p>
        <p>Duration: {duration}{fileSize && ` • Size: ${fileSize}`}</p>
      </div>
    </Card>
  );
}
