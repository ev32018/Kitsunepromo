import { useCallback, useRef } from "react";
import { Upload, Music, X, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  currentFile: File | null;
  onClear: () => void;
  isLoading?: boolean;
  uploadProgress?: number;
}

export function AudioUploader({
  onFileSelect,
  currentFile,
  onClear,
  isLoading = false,
  uploadProgress = 0,
}: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateAndSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("audio/")) {
        alert("Please select a valid audio file.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 100MB limit. Please select a smaller file.");
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndSelect(file);
      }
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelect(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (currentFile) {
    return (
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/20">
            <FileAudio className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-audio-filename">
              {currentFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(currentFile.size)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClear}
            data-testid="button-clear-audio"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {isLoading && (
          <div className="mt-3">
            <Progress value={uploadProgress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              Loading audio...
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      className="group cursor-pointer"
      data-testid="dropzone-audio"
    >
      <Card className="p-8 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors bg-card/30 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-medium">Drop your audio file here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Music className="w-3 h-3" />
            <span>MP3, WAV, OGG, FLAC up to 100MB</span>
          </div>
        </div>
      </Card>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
        data-testid="input-audio-file"
      />
    </div>
  );
}
