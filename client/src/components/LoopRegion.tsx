import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Repeat, Play, RotateCcw } from "lucide-react";

interface LoopRegionProps {
  duration: number;
  currentTime: number;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  onSeek: (time: number) => void;
}

export function LoopRegion({ duration, currentTime, audioElement, isPlaying, onSeek }: LoopRegionProps) {
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(duration);

  useEffect(() => {
    if (duration > 0 && loopEnd === 0) {
      setLoopEnd(duration);
    }
  }, [duration, loopEnd]);

  useEffect(() => {
    if (!loopEnabled || !audioElement) return;

    const handleTimeUpdate = () => {
      if (audioElement.currentTime >= loopEnd) {
        audioElement.currentTime = loopStart;
      }
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    return () => audioElement.removeEventListener("timeupdate", handleTimeUpdate);
  }, [loopEnabled, loopStart, loopEnd, audioElement]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const loopDuration = loopEnd - loopStart;

  const handlePlayLoop = () => {
    if (audioElement) {
      audioElement.currentTime = loopStart;
      if (!isPlaying) {
        audioElement.play();
      }
    }
  };

  const handleResetLoop = () => {
    setLoopStart(0);
    setLoopEnd(duration);
  };

  const handleRangeChange = (values: number[]) => {
    setLoopStart(values[0]);
    setLoopEnd(values[1]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Loop Region</Label>
        </div>
        <Switch
          checked={loopEnabled}
          onCheckedChange={setLoopEnabled}
          data-testid="switch-loop-enabled"
        />
      </div>

      {loopEnabled && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatTime(loopStart)}</span>
              <Badge variant="secondary">{formatTime(loopDuration)}</Badge>
              <span>{formatTime(loopEnd)}</span>
            </div>
            <Slider
              value={[loopStart, loopEnd]}
              onValueChange={handleRangeChange}
              min={0}
              max={duration || 100}
              step={0.1}
              data-testid="slider-loop-region"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayLoop}
              className="flex-1"
              data-testid="button-play-loop"
            >
              <Play className="w-3 h-3 mr-1" />
              Play Loop
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetLoop}
              data-testid="button-reset-loop"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Audio will loop between {formatTime(loopStart)} and {formatTime(loopEnd)}
          </div>
        </div>
      )}
    </div>
  );
}
