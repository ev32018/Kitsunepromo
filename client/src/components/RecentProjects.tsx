import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash2, FolderOpen } from "lucide-react";

export interface RecentProject {
  id: string;
  name: string;
  timestamp: number;
  settings: Record<string, unknown>;
  thumbnail?: string;
}

const STORAGE_KEY = "audioviz_recent_projects";
const MAX_RECENT = 10;

interface RecentProjectsProps {
  currentSettings: Record<string, unknown>;
  onLoadProject: (settings: Record<string, unknown>) => void;
  projectName?: string;
}

export function RecentProjects({ currentSettings, onLoadProject, projectName = "Untitled" }: RecentProjectsProps) {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentProjects(JSON.parse(stored));
      } catch {
        setRecentProjects([]);
      }
    }
  }, []);

  const saveToRecent = () => {
    const newProject: RecentProject = {
      id: `project-${Date.now()}`,
      name: projectName,
      timestamp: Date.now(),
      settings: currentSettings,
    };

    const updated = [newProject, ...recentProjects.filter(p => p.id !== newProject.id)].slice(0, MAX_RECENT);
    setRecentProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeProject = (id: string) => {
    const updated = recentProjects.filter(p => p.id !== id);
    setRecentProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setRecentProjects([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Recent Projects</Label>
        </div>
        {recentProjects.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearAll}
            className="h-6 text-xs"
            data-testid="button-clear-recent"
          >
            Clear All
          </Button>
        )}
      </div>

      {recentProjects.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          No recent projects. Save your current settings to see them here.
        </p>
      ) : (
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {recentProjects.map(project => (
              <div
                key={project.id}
                className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer group"
                onClick={() => onLoadProject(project.settings)}
                data-testid={`recent-project-${project.id}`}
              >
                <FolderOpen className="w-3 h-3 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(project.timestamp)}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProject(project.id);
                  }}
                  data-testid={`button-remove-${project.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={saveToRecent}
        className="w-full"
        data-testid="button-save-to-recent"
      >
        Save Current Settings
      </Button>
    </Card>
  );
}
