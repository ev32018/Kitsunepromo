import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Layers, CheckCircle, Circle, Loader2 } from "lucide-react";

export interface ExportJob {
  id: string;
  format: string;
  aspectRatio: string;
  resolution: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  filename?: string;
}

interface BatchExportProps {
  onStartBatch: (jobs: ExportJob[]) => void;
  isExporting: boolean;
  currentJobs: ExportJob[];
}

const FORMAT_OPTIONS = [
  { id: "webm", label: "WebM", description: "Best quality, larger size" },
  { id: "mp4", label: "MP4", description: "Universal compatibility" },
];

const ASPECT_OPTIONS = [
  { id: "16:9", label: "16:9", platform: "YouTube" },
  { id: "9:16", label: "9:16", platform: "TikTok/Reels" },
  { id: "1:1", label: "1:1", platform: "Instagram" },
  { id: "4:5", label: "4:5", platform: "Instagram Portrait" },
];

const RESOLUTION_OPTIONS = [
  { id: "720p", label: "720p HD" },
  { id: "1080p", label: "1080p Full HD" },
  { id: "1440p", label: "1440p 2K" },
];

export function BatchExport({ onStartBatch, isExporting, currentJobs }: BatchExportProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["mp4"]);
  const [selectedAspects, setSelectedAspects] = useState<string[]>(["16:9"]);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>(["1080p"]);

  const toggleOption = (
    option: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) => {
    if (selected.includes(option)) {
      if (selected.length > 1) {
        setSelected(selected.filter(o => o !== option));
      }
    } else {
      setSelected([...selected, option]);
    }
  };

  const totalJobs = selectedFormats.length * selectedAspects.length * selectedResolutions.length;

  const generateJobs = (): ExportJob[] => {
    const jobs: ExportJob[] = [];
    let id = 0;
    
    for (const format of selectedFormats) {
      for (const aspect of selectedAspects) {
        for (const resolution of selectedResolutions) {
          jobs.push({
            id: `job-${id++}`,
            format,
            aspectRatio: aspect,
            resolution,
            status: "pending",
            progress: 0,
          });
        }
      }
    }
    
    return jobs;
  };

  const handleStartBatch = () => {
    const jobs = generateJobs();
    onStartBatch(jobs);
  };

  const completedJobs = currentJobs.filter(j => j.status === "completed").length;
  const overallProgress = currentJobs.length > 0 
    ? (completedJobs / currentJobs.length) * 100 
    : 0;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <Label className="text-sm font-medium">Batch Export</Label>
        {totalJobs > 1 && (
          <Badge variant="secondary" className="ml-auto">
            {totalJobs} videos
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Formats</Label>
          <div className="flex gap-2">
            {FORMAT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id, selectedFormats, setSelectedFormats)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedFormats.includes(opt.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover-elevate"
                }`}
                data-testid={`button-format-${opt.id}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Aspect Ratios</Label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id, selectedAspects, setSelectedAspects)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedAspects.includes(opt.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover-elevate"
                }`}
                data-testid={`button-aspect-${opt.id.replace(":", "-")}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Resolutions</Label>
          <div className="flex gap-2">
            {RESOLUTION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id, selectedResolutions, setSelectedResolutions)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedResolutions.includes(opt.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover-elevate"
                }`}
                data-testid={`button-resolution-${opt.id}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isExporting && currentJobs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{completedJobs}/{currentJobs.length} complete</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          
          <div className="max-h-32 overflow-y-auto space-y-1">
            {currentJobs.map(job => (
              <div key={job.id} className="flex items-center gap-2 text-xs">
                {job.status === "completed" ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : job.status === "processing" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">
                  {job.format.toUpperCase()} · {job.aspectRatio} · {job.resolution}
                </span>
                {job.status === "processing" && (
                  <span className="ml-auto">{job.progress}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleStartBatch}
        disabled={isExporting || totalJobs === 0}
        className="w-full"
        data-testid="button-start-batch-export"
      >
        <Download className="w-4 h-4 mr-2" />
        {isExporting ? "Exporting..." : `Export ${totalJobs} Video${totalJobs > 1 ? "s" : ""}`}
      </Button>
    </Card>
  );
}
