import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string | null;
  onAudioElement: (element: HTMLAudioElement | null) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onBpmDetected?: (bpm: number | null) => void;
}

export function AudioPlayer({
  audioUrl,
  onAudioElement,
  onPlayStateChange,
  onBpmDetected,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      onAudioElement(audioRef.current);
    }
    return () => onAudioElement(null);
  }, [audioUrl, onAudioElement]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      onPlayStateChange(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, onPlayStateChange]);

  const analyzeAudio = useCallback(async () => {
    if (!audioUrl || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 100;
      const blockSize = Math.floor(channelData.length / samples);
      const waveform: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }
      
      const maxVal = Math.max(...waveform);
      const normalizedWaveform = waveform.map(v => v / maxVal);
      setWaveformData(normalizedWaveform);

      const bpm = detectBPM(channelData, audioBuffer.sampleRate);
      if (onBpmDetected) {
        onBpmDetected(bpm);
      }

      audioContext.close();
    } catch (e) {
      console.error("Failed to analyze audio:", e);
    }
    setIsAnalyzing(false);
  }, [audioUrl, onBpmDetected, isAnalyzing]);

  useEffect(() => {
    if (audioUrl) {
      analyzeAudio();
    } else {
      setWaveformData([]);
    }
  }, [audioUrl]);

  const detectBPM = (channelData: Float32Array, sampleRate: number): number | null => {
    try {
      const peaks: number[] = [];
      const threshold = 0.9;
      let max = 0;
      
      for (let i = 0; i < channelData.length; i++) {
        if (Math.abs(channelData[i]) > max) {
          max = Math.abs(channelData[i]);
        }
      }
      
      const adjustedThreshold = max * 0.5;
      let lastPeak = 0;
      
      for (let i = 0; i < channelData.length; i++) {
        if (Math.abs(channelData[i]) > adjustedThreshold && i - lastPeak > sampleRate * 0.2) {
          peaks.push(i);
          lastPeak = i;
        }
      }
      
      if (peaks.length < 4) return null;
      
      const intervals: number[] = [];
      for (let i = 1; i < peaks.length && i < 50; i++) {
        intervals.push(peaks[i] - peaks[i - 1]);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round((60 * sampleRate) / avgInterval);
      
      if (bpm >= 60 && bpm <= 200) {
        return bpm;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    waveformData.forEach((value, i) => {
      const x = i * barWidth;
      const height = value * canvas.height * 0.8;
      const y = (canvas.height - height) / 2;
      
      const isPlayed = i / waveformData.length <= progress;
      ctx.fillStyle = isPlayed ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)";
      ctx.fillRect(x, y, barWidth - 1, height);
    });
  }, [waveformData, currentTime, duration]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPlayStateChange(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        onPlayStateChange(true);
      } catch (e) {
        console.error("Failed to play audio:", e);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = waveformCanvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    const newTime = progress * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipBack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const formatTime = (time: number): string => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        crossOrigin="anonymous"
      />

      <div className="space-y-3">
        {waveformData.length > 0 ? (
          <div className="relative">
            <canvas
              ref={waveformCanvasRef}
              className="w-full h-12 cursor-pointer rounded"
              onClick={handleWaveformClick}
              data-testid="canvas-waveform"
            />
            <div className="absolute left-0 top-full mt-1 flex justify-between w-full text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="flex items-center justify-center h-12 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Analyzing audio...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={0.1}
              className="flex-1"
              data-testid="slider-seek"
            />
            <span className="text-xs text-muted-foreground w-12">
              {formatTime(duration)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={skipBack}
              data-testid="button-skip-back"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={skipForward}
              data-testid="button-skip-forward"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              data-testid="button-mute"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              className="w-24"
              data-testid="slider-volume"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
