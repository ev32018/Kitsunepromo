import { useEffect, useState, useRef } from "react";
import { AudioAnalyzer } from "@/lib/audioAnalyzer";

interface AudioLevelMeterProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

export function AudioLevelMeter({ audioElement, isPlaying }: AudioLevelMeterProps) {
  const [levels, setLevels] = useState({ bass: 0, mid: 0, treble: 0 });
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioElement) {
      setLevels({ bass: 0, mid: 0, treble: 0 });
      return;
    }

    analyzerRef.current = new AudioAnalyzer();
    analyzerRef.current.initialize(audioElement);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      analyzerRef.current?.cleanup();
    };
  }, [audioElement]);

  useEffect(() => {
    if (!isPlaying || !analyzerRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const updateLevels = () => {
      if (analyzerRef.current) {
        const data = analyzerRef.current.getAudioData();
        setLevels({
          bass: data.bassLevel / 255,
          mid: data.midLevel / 255,
          treble: data.trebleLevel / 255,
        });
      }
      animationRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const getMeterColor = (level: number, type: 'bass' | 'mid' | 'treble') => {
    const colors = {
      bass: 'from-red-500 to-orange-500',
      mid: 'from-green-500 to-emerald-500',
      treble: 'from-blue-500 to-cyan-500',
    };
    return colors[type];
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/50 border border-border/50" data-testid="audio-level-meter">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground w-8">BASS</span>
        <div className="relative w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getMeterColor(levels.bass, 'bass')} transition-all duration-75`}
            style={{ width: `${levels.bass * 100}%` }}
            data-testid="meter-bass"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground w-8">MID</span>
        <div className="relative w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getMeterColor(levels.mid, 'mid')} transition-all duration-75`}
            style={{ width: `${levels.mid * 100}%` }}
            data-testid="meter-mid"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-muted-foreground w-8">HIGH</span>
        <div className="relative w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getMeterColor(levels.treble, 'treble')} transition-all duration-75`}
            style={{ width: `${levels.treble * 100}%` }}
            data-testid="meter-treble"
          />
        </div>
      </div>
    </div>
  );
}
