import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save, FolderOpen, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ProjectData {
  version: string;
  name: string;
  createdAt: string;
  settings: Record<string, unknown>;
}

interface ProjectManagerProps {
  currentSettings: Record<string, unknown>;
  onLoadProject: (settings: Record<string, unknown>) => void;
  projectName?: string;
}

export function ProjectManager({ currentSettings, onLoadProject, projectName = "Untitled Project" }: ProjectManagerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = () => {
    const projectData: ProjectData = {
      version: "1.0.0",
      name: projectName,
      createdAt: new Date().toISOString(),
      settings: currentSettings,
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.audioviz`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Project Saved",
      description: "Your project has been saved to a file.",
    });
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ProjectData;
        
        if (!data.version || !data.settings) {
          throw new Error("Invalid project file format");
        }

        onLoadProject(data.settings);
        
        toast({
          title: "Project Loaded",
          description: `Loaded "${data.name}" from ${new Date(data.createdAt).toLocaleDateString()}`,
        });
      } catch (error) {
        toast({
          title: "Load Failed",
          description: "Could not load the project file. It may be corrupted or invalid.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-primary" />
        <Label className="text-sm font-medium">Project</Label>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLoadProject}
        accept=".audioviz,.json"
        className="hidden"
        data-testid="input-load-project"
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveProject}
          className="flex-1"
          data-testid="button-save-project"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
          data-testid="button-load-project"
        >
          <Upload className="w-4 h-4 mr-2" />
          Load
        </Button>
      </div>
    </Card>
  );
}
