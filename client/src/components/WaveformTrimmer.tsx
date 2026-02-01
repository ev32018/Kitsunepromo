import { useEffect, useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface WaveformTrimmerProps {
  audioUrl: string | null;
  duration: number;
  trimStart: number;
  trimEnd: number;
  currentTime: number;
  onTrimChange: (start: number, end: number) => void;
  beats?: number[];
}

export function WaveformTrimmer({
  audioUrl,
  duration,
  trimStart,
  trimEnd,
  currentTime,
  onTrimChange,
  beats = [],
}: WaveformTrimmerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const analyzeWaveform = async () => {
      try {
        const audioContext = new AudioContext();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channelData = audioBuffer.getChannelData(0);
        const samples = 200;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          waveform.push(sum / blockSize);
        }

        const max = Math.max(...waveform);
        setWaveformData(waveform.map(v => v / max));
        audioContext.close();
      } catch (error) {
        console.error("Failed to analyze waveform:", error);
      }
    };

    analyzeWaveform();
  }, [audioUrl]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
    ctx.fillRect(0, 0, width, height);

    const startX = (trimStart / duration) * width;
    const endX = (trimEnd / duration) * width;
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.fillRect(startX, 0, endX - startX, height);

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;

      const timePosition = (index / waveformData.length) * duration;
      const isInRange = timePosition >= trimStart && timePosition <= trimEnd;

      ctx.fillStyle = isInRange ? "rgba(59, 130, 246, 0.8)" : "rgba(100, 100, 100, 0.5)";
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    beats.forEach(beat => {
      const beatX = (beat / duration) * width;
      ctx.strokeStyle = "rgba(255, 100, 100, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(beatX, 0);
      ctx.lineTo(beatX, height);
      ctx.stroke();
    });

    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(startX - 4, 0, 8, height);
    ctx.fillRect(endX - 4, 0, 8, height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(startX - 1, height * 0.3, 2, height * 0.4);
    ctx.fillRect(endX - 1, height * 0.3, 2, height * 0.4);
  }, [waveformData, duration, trimStart, trimEnd, currentTime, beats]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = canvas.width;

    const startX = (trimStart / duration) * width;
    const endX = (trimEnd / duration) * width;

    if (Math.abs(x - startX) < 10) {
      setIsDragging("start");
    } else if (Math.abs(x - endX) < 10) {
      setIsDragging("end");
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / canvas.width) * duration;

    if (isDragging === "start") {
      onTrimChange(Math.max(0, Math.min(time, trimEnd - 1)), trimEnd);
    } else {
      onTrimChange(trimStart, Math.min(duration, Math.max(time, trimStart + 1)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Waveform Timeline</Label>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline">{formatTime(trimStart)}</Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="outline">{formatTime(trimEnd)}</Badge>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden cursor-col-resize"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-testid="waveform-trimmer"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          className="w-full h-20 bg-muted"
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
