import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Youtube, Instagram, Music2 } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export interface QuickExportConfig {
  name: string;
  aspectRatio: string;
  resolution: string;
  format: string;
  fps: number;
}

const QUICK_PRESETS: { id: string; config: QuickExportConfig; icon: React.ReactNode; color: string }[] = [
  {
    id: "youtube",
    config: { name: "YouTube", aspectRatio: "16:9", resolution: "1080p", format: "mp4", fps: 30 },
    icon: <Youtube className="w-4 h-4" />,
    color: "bg-red-500/10 text-red-500 border-red-500/30",
  },
  {
    id: "tiktok",
    config: { name: "TikTok", aspectRatio: "9:16", resolution: "1080p", format: "mp4", fps: 30 },
    icon: <SiTiktok className="w-4 h-4" />,
    color: "bg-pink-500/10 text-pink-500 border-pink-500/30",
  },
  {
    id: "instagram-reel",
    config: { name: "Instagram Reel", aspectRatio: "9:16", resolution: "1080p", format: "mp4", fps: 30 },
    icon: <Instagram className="w-4 h-4" />,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  },
  {
    id: "instagram-feed",
    config: { name: "Instagram Feed", aspectRatio: "1:1", resolution: "1080p", format: "mp4", fps: 30 },
    icon: <Instagram className="w-4 h-4" />,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  },
  {
    id: "spotify-canvas",
    config: { name: "Spotify Canvas", aspectRatio: "9:16", resolution: "720p", format: "mp4", fps: 24 },
    icon: <Music2 className="w-4 h-4" />,
    color: "bg-green-500/10 text-green-500 border-green-500/30",
  },
];

interface QuickExportPresetsProps {
  onSelectPreset: (config: QuickExportConfig) => void;
  isExporting: boolean;
}

export function QuickExportPresets({ onSelectPreset, isExporting }: QuickExportPresetsProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <Label className="text-sm font-medium">Quick Export</Label>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {QUICK_PRESETS.map(preset => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onSelectPreset(preset.config)}
            disabled={isExporting}
            className={`justify-start gap-2 border ${preset.color}`}
            data-testid={`button-quick-export-${preset.id}`}
          >
            {preset.icon}
            <span className="flex-1 text-left">{preset.config.name}</span>
            <Badge variant="secondary" className="text-xs">
              {preset.config.aspectRatio}
            </Badge>
          </Button>
        ))}
      </div>
    </Card>
  );
}
