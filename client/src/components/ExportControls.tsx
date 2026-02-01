import { useState, useRef, useCallback, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Video, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VisualizerCanvasHandle } from "@/components/VisualizerCanvas";

interface ExportControlsProps {
  canvasRef: RefObject<VisualizerCanvasHandle | null>;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
}

type ExportQuality = "720p" | "1080p" | "1440p";
type ExportFormat = "webm" | "mp4";

const qualitySettings: Record<ExportQuality, { width: number; height: number }> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
};

export function ExportControls({
  canvasRef,
  audioElement,
  isPlaying,
  onPlayStateChange,
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [quality, setQuality] = useState<ExportQuality>("1080p");
  const [format, setFormat] = useState<ExportFormat>("webm");
  const [exportComplete, setExportComplete] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

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

      const { width, height } = qualitySettings[quality];
      
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = width;
      exportCanvas.height = height;
      const exportCtx = exportCanvas.getContext("2d")!;

      const stream = exportCanvas.captureStream(60);
      
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

      const drawLoop = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") return;
        
        exportCtx.drawImage(canvas, 0, 0, width, height);
        
        const elapsed = Date.now() - startTime;
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
  }, [canvasRef, audioElement, quality, format, onPlayStateChange, toast]);

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
