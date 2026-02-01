import { useState, useRef, useCallback, useEffect, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Download, Video, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VisualizerCanvasHandle } from "@/components/VisualizerCanvas";
import type { AspectRatio } from "@/components/AspectRatioSettings";

interface ExportControlsProps {
  canvasRef: RefObject<VisualizerCanvasHandle | null>;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  aspectRatio?: AspectRatio;
  letterboxColor?: string;
}

type ExportQuality = "720p" | "1080p" | "1440p";
type ExportFormat = "webm" | "mp4";
type FrameRate = 24 | 30 | 60;

const qualitySettings: Record<ExportQuality, { width: number; height: number }> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
};

function getExportDimensions(quality: ExportQuality, aspectRatio: AspectRatio = "16:9"): { width: number; height: number } {
  const base = qualitySettings[quality];
  switch (aspectRatio) {
    case "16:9":
      return base;
    case "9:16":
      return { width: base.height * 9 / 16, height: base.height };
    case "1:1":
      return { width: base.height, height: base.height };
    case "4:5":
      return { width: base.height * 4 / 5, height: base.height };
    default:
      return base;
  }
}

export function ExportControls({
  canvasRef,
  audioElement,
  isPlaying,
  onPlayStateChange,
  aspectRatio = "16:9",
  letterboxColor = "#000000",
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [quality, setQuality] = useState<ExportQuality>("1080p");
  const [format, setFormat] = useState<ExportFormat>("webm");
  const [frameRate, setFrameRate] = useState<FrameRate>(30);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [loopPreview, setLoopPreview] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Handle loop preview by setting audio element loop property
  const handleLoopPreviewChange = useCallback((enabled: boolean) => {
    setLoopPreview(enabled);
    if (audioElement) {
      audioElement.loop = enabled;
    }
  }, [audioElement]);

  // Synchronize loop state with audioElement and cleanup on unmount
  useEffect(() => {
    if (audioElement) {
      audioElement.loop = loopPreview;
    }
    return () => {
      // Reset loop when component unmounts or audioElement changes
      if (audioElement) {
        audioElement.loop = false;
      }
    };
  }, [audioElement, loopPreview]);

  const startExport = useCallback(async () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas || !audioElement) {
      toast({
        title: "Export failed",
        description: "Please load audio and start playing before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportComplete(false);
      chunksRef.current = [];

      const { width, height } = getExportDimensions(quality, aspectRatio);
      
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = Math.round(width);
      exportCanvas.height = Math.round(height);
      const exportCtx = exportCanvas.getContext("2d")!;
      
      // Fill with letterbox color initially
      exportCtx.fillStyle = letterboxColor;
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      const stream = exportCanvas.captureStream(frameRate);
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audioElement);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      destination.stream.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });

      const mimeType = format === "webm" ? "video/webm;codecs=vp9" : "video/mp4";
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : "video/webm",
        videoBitsPerSecond: quality === "1440p" ? 12000000 : quality === "1080p" ? 8000000 : 5000000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `visualization-${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        setExportComplete(true);
        source.disconnect();
        audioContext.close();
        
        toast({
          title: "Export complete",
          description: "Your visualization video has been downloaded.",
        });
        
        setTimeout(() => setExportComplete(false), 3000);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setIsExporting(false);
        source.disconnect();
        audioContext.close();
        toast({
          title: "Export failed",
          description: "An error occurred while recording. Please try again.",
          variant: "destructive",
        });
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);

      audioElement.currentTime = 0;
      await audioElement.play();
      onPlayStateChange(true);

      const duration = audioElement.duration * 1000;
      const startTime = Date.now();

      const fadeInDuration = fadeIn * 1000;
      const fadeOutDuration = fadeOut * 1000;

      // Calculate aspect-ratio-aware draw dimensions
      const srcAspect = canvas.width / canvas.height;
      const dstAspect = exportCanvas.width / exportCanvas.height;
      let drawWidth = exportCanvas.width;
      let drawHeight = exportCanvas.height;
      let offsetX = 0;
      let offsetY = 0;
      
      if (srcAspect > dstAspect) {
        // Source is wider - letterbox top/bottom
        drawHeight = exportCanvas.width / srcAspect;
        offsetY = (exportCanvas.height - drawHeight) / 2;
      } else if (srcAspect < dstAspect) {
        // Source is taller - letterbox left/right
        drawWidth = exportCanvas.height * srcAspect;
        offsetX = (exportCanvas.width - drawWidth) / 2;
      }

      const drawLoop = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") return;
        
        const elapsed = Date.now() - startTime;
        const remaining = duration - elapsed;
        
        // Clear with letterbox color
        exportCtx.globalAlpha = 1;
        exportCtx.fillStyle = letterboxColor;
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        // Draw visualization preserving aspect ratio
        exportCtx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);
        
        // Apply fade-in/out effects
        let fadeAlpha = 0;
        if (fadeInDuration > 0 && elapsed < fadeInDuration) {
          // Fade in: black overlay fading from 1 to 0
          fadeAlpha = 1 - (elapsed / fadeInDuration);
        } else if (fadeOutDuration > 0 && remaining < fadeOutDuration) {
          // Fade out: black overlay fading from 0 to 1
          fadeAlpha = 1 - (remaining / fadeOutDuration);
        }
        
        if (fadeAlpha > 0) {
          exportCtx.globalAlpha = fadeAlpha;
          exportCtx.fillStyle = "#000000";
          exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
          exportCtx.globalAlpha = 1;
        }
        
        setExportProgress(Math.min(100, (elapsed / duration) * 100));
        
        if (elapsed < duration) {
          requestAnimationFrame(drawLoop);
        }
      };

      drawLoop();

      audioElement.onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          onPlayStateChange(false);
        }
      };
    } catch (error) {
      console.error("Export error:", error);
      setIsExporting(false);
      toast({
        title: "Export failed",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  }, [canvasRef, audioElement, quality, format, frameRate, fadeIn, fadeOut, aspectRatio, letterboxColor, onPlayStateChange, toast]);

  const cancelExport = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    onPlayStateChange(false);
    setIsExporting(false);
    setExportProgress(0);
    toast({
      title: "Export cancelled",
      description: "Video export has been cancelled.",
    });
  }, [audioElement, onPlayStateChange, toast]);

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Export Video</h3>
      </div>

      {!isExporting ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quality</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as ExportQuality)}>
                <SelectTrigger data-testid="select-quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="1440p">1440p QHD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                <SelectTrigger data-testid="select-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="mp4">MP4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Frame Rate</Label>
            <Select value={String(frameRate)} onValueChange={(v) => setFrameRate(Number(v) as FrameRate)}>
              <SelectTrigger data-testid="select-framerate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 fps (Cinematic)</SelectItem>
                <SelectItem value="30">30 fps (Standard)</SelectItem>
                <SelectItem value="60">60 fps (Smooth)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Fade In</Label>
                <span className="text-xs text-muted-foreground">{fadeIn}s</span>
              </div>
              <Slider
                value={[fadeIn]}
                onValueChange={([v]) => setFadeIn(v)}
                min={0}
                max={3}
                step={0.5}
                data-testid="slider-fade-in"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Fade Out</Label>
                <span className="text-xs text-muted-foreground">{fadeOut}s</span>
              </div>
              <Slider
                value={[fadeOut]}
                onValueChange={([v]) => setFadeOut(v)}
                min={0}
                max={3}
                step={0.5}
                data-testid="slider-fade-out"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Loop Preview</Label>
            <Switch
              checked={loopPreview}
              onCheckedChange={handleLoopPreviewChange}
              data-testid="switch-loop-preview"
            />
          </div>

          <Button
            onClick={startExport}
            disabled={!audioElement}
            className="w-full"
            data-testid="button-export"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Video
          </Button>

          {exportComplete && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle2 className="w-4 h-4" />
              Export complete! Download started.
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Note: Video is recorded in real-time during playback. Higher quality may affect performance.
          </p>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm">Recording visualization...</span>
          </div>
          <Progress value={exportProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(exportProgress)}% complete
          </p>
          <Button
            variant="outline"
            onClick={cancelExport}
            className="w-full"
            data-testid="button-cancel-export"
          >
            Cancel Export
          </Button>
        </div>
      )}
    </Card>
  );
}
