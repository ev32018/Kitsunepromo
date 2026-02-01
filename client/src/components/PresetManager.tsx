import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Save, Share2, Trash2, Copy, Check, Link } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VisualizationType, ColorScheme, VisualizationSettings, Preset } from "@shared/schema";

interface PresetData {
  visualizationType: VisualizationType;
  colorScheme: ColorScheme;
  customColors?: string[];
  settings: VisualizationSettings;
  overlayText?: string;
  overlayPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

interface PresetManagerProps {
  currentSettings: PresetData;
  onLoadPreset: (preset: PresetData) => void;
}

export function PresetManager({ currentSettings, onLoadPreset }: PresetManagerProps) {
  const [presetName, setPresetName] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shareCodeInput, setShareCodeInput] = useState("");
  const { toast } = useToast();

  const { data: presets = [], isLoading } = useQuery<Preset[]>({
    queryKey: ["/api/presets"],
  });

  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/presets", {
        name,
        visualizationType: currentSettings.visualizationType,
        colorScheme: currentSettings.colorScheme,
        customColors: currentSettings.customColors,
        settings: currentSettings.settings,
        overlayText: currentSettings.overlayText,
        overlayPosition: currentSettings.overlayPosition,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presets"] });
      setPresetName("");
      toast({ title: "Preset saved", description: "Your visualization preset has been saved." });
    },
    onError: () => {
      toast({ title: "Save failed", description: "Failed to save preset.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/presets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presets"] });
      toast({ title: "Preset deleted" });
    },
  });

  const loadByCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("GET", `/api/presets/share/${code}`);
      return response.json();
    },
    onSuccess: (preset: Preset) => {
      onLoadPreset({
        visualizationType: preset.visualizationType as VisualizationType,
        colorScheme: preset.colorScheme as ColorScheme,
        customColors: preset.customColors || undefined,
        settings: preset.settings as VisualizationSettings,
        overlayText: preset.overlayText || undefined,
        overlayPosition: preset.overlayPosition as PresetData["overlayPosition"],
      });
      setShareCodeInput("");
      toast({ title: "Preset loaded from share code" });
    },
    onError: () => {
      toast({ title: "Invalid code", description: "Share code not found.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!presetName.trim()) return;
    saveMutation.mutate(presetName.trim());
  };

  const handleLoad = (preset: Preset) => {
    onLoadPreset({
      visualizationType: preset.visualizationType as VisualizationType,
      colorScheme: preset.colorScheme as ColorScheme,
      customColors: preset.customColors || undefined,
      settings: preset.settings as VisualizationSettings,
      overlayText: preset.overlayText || undefined,
      overlayPosition: preset.overlayPosition as PresetData["overlayPosition"],
    });
  };

  const copyShareCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({ title: "Share code copied!" });
  };

  const handleLoadByCode = () => {
    if (!shareCodeInput.trim()) return;
    loadByCodeMutation.mutate(shareCodeInput.trim());
  };

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium">Presets</h3>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="text-sm"
            data-testid="input-preset-name"
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!presetName.trim() || saveMutation.isPending}
            data-testid="button-save-preset"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Load from share code</Label>
        <div className="flex gap-2">
          <Input
            value={shareCodeInput}
            onChange={(e) => setShareCodeInput(e.target.value)}
            placeholder="Enter code..."
            className="text-sm"
            data-testid="input-share-code"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleLoadByCode}
            disabled={!shareCodeInput.trim() || loadByCodeMutation.isPending}
            data-testid="button-load-code"
          >
            <Link className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {presets.length > 0 && (
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover-elevate"
              >
                <button
                  onClick={() => handleLoad(preset)}
                  className="text-sm font-medium truncate flex-1 text-left"
                  data-testid={`button-load-preset-${preset.id}`}
                >
                  {preset.name}
                </button>
                <div className="flex items-center gap-1">
                  {preset.shareCode && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyShareCode(preset.shareCode!)}
                      data-testid={`button-share-${preset.id}`}
                    >
                      {copiedCode === preset.shareCode ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Share2 className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={() => deleteMutation.mutate(preset.id)}
                    data-testid={`button-delete-preset-${preset.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {presets.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No saved presets yet
        </p>
      )}
    </Card>
  );
}
