import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Volume2, RotateCcw } from "lucide-react";

interface AudioNormalizationProps {
  audioElement: HTMLAudioElement | null;
  audioContext: AudioContext | null;
}

export function AudioNormalization({ audioElement, audioContext }: AudioNormalizationProps) {
  const [enabled, setEnabled] = useState(false);
  const [targetLevel, setTargetLevel] = useState(-14);
  const [currentPeak, setCurrentPeak] = useState<number | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  const analyzeAudio = useCallback(async () => {
    if (!audioElement || !audioContext) return;

    try {
      const response = await fetch(audioElement.src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      let maxSample = 0;
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          const abs = Math.abs(channelData[i]);
          if (abs > maxSample) maxSample = abs;
        }
      }

      const peakDb = 20 * Math.log10(maxSample);
      setCurrentPeak(Math.round(peakDb * 10) / 10);
    } catch (error) {
      console.error("Failed to analyze audio:", error);
    }
  }, [audioElement, audioContext]);

  useEffect(() => {
    if (audioElement && audioContext) {
      analyzeAudio();
    }
  }, [audioElement, audioContext, analyzeAudio]);

  useEffect(() => {
    if (!audioContext || !audioElement) return;

    if (enabled && !gainNode) {
      try {
        const source = audioContext.createMediaElementSource(audioElement);
        const gain = audioContext.createGain();
        source.connect(gain);
        gain.connect(audioContext.destination);
        setGainNode(gain);
      } catch {
        // Source may already be connected
      }
    }
  }, [enabled, audioContext, audioElement, gainNode]);

  useEffect(() => {
    if (gainNode && currentPeak !== null && enabled) {
      const gainDb = targetLevel - currentPeak;
      const gainLinear = Math.pow(10, gainDb / 20);
      gainNode.gain.value = Math.min(Math.max(gainLinear, 0.1), 4);
    } else if (gainNode && !enabled) {
      gainNode.gain.value = 1;
    }
  }, [gainNode, targetLevel, currentPeak, enabled]);

  const formatDb = (db: number): string => {
    return `${db >= 0 ? "+" : ""}${db.toFixed(1)} dB`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Audio Normalization</Label>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          data-testid="switch-normalization"
        />
      </div>

      {currentPeak !== null && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Current Peak</span>
          <Badge variant={currentPeak > -3 ? "destructive" : "secondary"}>
            {formatDb(currentPeak)}
          </Badge>
        </div>
      )}

      {enabled && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Target Level</Label>
              <Badge variant="outline">{formatDb(targetLevel)}</Badge>
            </div>
            <Slider
              value={[targetLevel]}
              onValueChange={([v]) => setTargetLevel(v)}
              min={-24}
              max={0}
              step={0.5}
              data-testid="slider-target-level"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTargetLevel(-14)}
              className={targetLevel === -14 ? "border-primary" : ""}
              data-testid="button-preset-streaming"
            >
              Streaming (-14 dB)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTargetLevel(-16)}
              className={targetLevel === -16 ? "border-primary" : ""}
              data-testid="button-preset-broadcast"
            >
              Broadcast (-16 dB)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTargetLevel(-9)}
              className={targetLevel === -9 ? "border-primary" : ""}
              data-testid="button-preset-loud"
            >
              Loud (-9 dB)
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={analyzeAudio}
            className="w-full"
            data-testid="button-reanalyze"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Re-analyze Audio
          </Button>
        </div>
      )}
    </Card>
  );
}
