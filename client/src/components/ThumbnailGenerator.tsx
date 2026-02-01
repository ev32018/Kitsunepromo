import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Image, Download, Clock, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ThumbnailFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: string;
}

const THUMBNAIL_FORMATS: ThumbnailFormat[] = [
  { id: "youtube", name: "YouTube", width: 1280, height: 720, platform: "YouTube" },
  { id: "tiktok", name: "TikTok", width: 1080, height: 1920, platform: "TikTok" },
  { id: "instagram", name: "Instagram Square", width: 1080, height: 1080, platform: "Instagram" },
  { id: "instagram-story", name: "Instagram Story", width: 1080, height: 1920, platform: "Instagram" },
  { id: "twitter", name: "Twitter/X", width: 1200, height: 675, platform: "Twitter" },
  { id: "facebook", name: "Facebook", width: 1200, height: 630, platform: "Facebook" },
];

interface ThumbnailGeneratorProps {
  canvasRef: HTMLCanvasElement | null;
  audioDuration: number;
  audioElement?: HTMLAudioElement | null;
  onSeek?: (time: number) => void;
}

export function ThumbnailGenerator({ canvasRef, audioDuration, audioElement, onSeek }: ThumbnailGeneratorProps) {
  const { toast } = useToast();
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["youtube"]);
  const [captureTime, setCaptureTime] = useState(0);
  const [autoCapture, setAutoCapture] = useState(false);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<{ id: string; dataUrl: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(f => f !== formatId)
        : [...prev, formatId]
    );
  };

  const captureFrame = useCallback(async () => {
    if (!canvasRef) {
      toast({
        title: "No Canvas",
        description: "Please load an audio file and start visualization first.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFormats.length === 0) {
      toast({
        title: "No Format Selected",
        description: "Please select at least one thumbnail format.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      if (audioElement && onSeek) {
        onSeek(captureTime);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const thumbnails: { id: string; dataUrl: string }[] = [];

      for (const formatId of selectedFormats) {
        const format = THUMBNAIL_FORMATS.find(f => f.id === formatId);
        if (!format) continue;

        const offscreen = document.createElement("canvas");
        offscreen.width = format.width;
        offscreen.height = format.height;
        const ctx = offscreen.getContext("2d");

        if (ctx) {
          const sourceWidth = canvasRef.width;
          const sourceHeight = canvasRef.height;
          const sourceAspect = sourceWidth / sourceHeight;
          const targetAspect = format.width / format.height;

          let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;

          if (sourceAspect > targetAspect) {
            sw = sourceHeight * targetAspect;
            sx = (sourceWidth - sw) / 2;
          } else {
            sh = sourceWidth / targetAspect;
            sy = (sourceHeight - sh) / 2;
          }

          ctx.drawImage(canvasRef, sx, sy, sw, sh, 0, 0, format.width, format.height);

          const dataUrl = offscreen.toDataURL("image/jpeg", 0.95);
          thumbnails.push({ id: formatId, dataUrl });
        }
      }

      setGeneratedThumbnails(thumbnails);
      toast({
        title: "Thumbnails Generated",
        description: `Created ${thumbnails.length} thumbnail(s) successfully.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate thumbnails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [canvasRef, selectedFormats, captureTime, audioElement, onSeek, toast]);

  const downloadThumbnail = (thumbnail: { id: string; dataUrl: string }) => {
    const format = THUMBNAIL_FORMATS.find(f => f.id === thumbnail.id);
    if (!format) return;

    const link = document.createElement("a");
    link.download = `thumbnail-${format.name.toLowerCase().replace(/\s+/g, "-")}-${format.width}x${format.height}.jpg`;
    link.href = thumbnail.dataUrl;
    link.click();
  };

  const downloadAllThumbnails = () => {
    generatedThumbnails.forEach(thumb => {
      setTimeout(() => downloadThumbnail(thumb), 100);
    });
  };

  const previewTime = () => {
    if (audioElement && onSeek) {
      onSeek(captureTime);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Thumbnail Formats</Label>
        <div className="grid grid-cols-2 gap-2">
          {THUMBNAIL_FORMATS.map(format => (
            <button
              key={format.id}
              onClick={() => toggleFormat(format.id)}
              className={`p-2 rounded-md border text-left transition-colors ${
                selectedFormats.includes(format.id)
                  ? "border-primary bg-primary/10"
                  : "border-border hover-elevate"
              }`}
              data-testid={`button-format-${format.id}`}
            >
              <div className="text-sm font-medium">{format.name}</div>
              <div className="text-xs text-muted-foreground">
                {format.width}×{format.height}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Capture Time</Label>
          <Badge variant="secondary">{formatTime(captureTime)}</Badge>
        </div>
        <div className="flex gap-2 items-center">
          <Slider
            value={[captureTime]}
            onValueChange={([value]) => setCaptureTime(value)}
            min={0}
            max={audioDuration || 100}
            step={0.1}
            className="flex-1"
            data-testid="slider-capture-time"
          />
          <Button size="sm" variant="ghost" onClick={previewTime} data-testid="button-preview-time">
            <Clock className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm">Auto-capture at best moment</Label>
        <Switch
          checked={autoCapture}
          onCheckedChange={setAutoCapture}
          data-testid="switch-auto-capture"
        />
      </div>

      <Button
        onClick={captureFrame}
        disabled={isGenerating || selectedFormats.length === 0}
        className="w-full"
        data-testid="button-capture-thumbnail"
      >
        <Camera className="w-4 h-4 mr-2" />
        {isGenerating ? "Generating..." : "Capture Thumbnails"}
      </Button>

      {generatedThumbnails.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Generated Thumbnails</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadAllThumbnails}
              data-testid="button-download-all-thumbnails"
            >
              <Download className="w-4 h-4 mr-1" />
              Download All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {generatedThumbnails.map(thumb => {
              const format = THUMBNAIL_FORMATS.find(f => f.id === thumb.id);
              return (
                <Card key={thumb.id} className="overflow-hidden">
                  <CardContent className="p-2 space-y-2">
                    <img
                      src={thumb.dataUrl}
                      alt={format?.name}
                      className="w-full h-24 object-cover rounded"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{format?.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => downloadThumbnail(thumb)}
                        data-testid={`button-download-${thumb.id}`}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
