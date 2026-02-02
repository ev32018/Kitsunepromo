import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { VisualizationType, ColorScheme } from "@shared/schema";
import type { ParticleOverlayConfig } from "./ParticleOverlaySettings";
import type { TextOverlayConfig } from "./TextOverlaySettings";
import type { ProgressBarConfig } from "./ProgressBarSettings";
import type { AspectRatioConfig } from "./AspectRatioSettings";
import type { KenBurnsConfig } from "./KenBurnsSettings";
import type { BlendModeConfig } from "./BlendModeSettings";
import { Sparkles, Search, LayoutTemplate, Music, Palette, Monitor } from "lucide-react";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "social" | "genre" | "style";
  tags: string[];
  preview: {
    gradient: string;
    icon: string;
  };
  config: {
    visualizationType: VisualizationType;
    colorScheme: ColorScheme;
    customColors?: string[];
    sensitivity: number;
    barCount: number;
    particleCount: number;
    glowIntensity: number;
    rotationSpeed: number;
    mirrorMode: boolean;
    aspectRatio?: AspectRatioConfig;
    kenBurns?: KenBurnsConfig;
    blendMode?: BlendModeConfig;
    particleOverlay?: ParticleOverlayConfig;
    textOverlay?: Partial<TextOverlayConfig>;
    progressBar?: ProgressBarConfig;
  };
}

const templates: Template[] = [
  {
    id: "tiktok-viral",
    name: "TikTok Viral",
    description: "Vertical format with eye-catching particles and animated text",
    category: "social",
    tags: ["tiktok", "reels", "vertical", "trending"],
    preview: { gradient: "from-pink-500 via-purple-500 to-indigo-500", icon: "🎵" },
    config: {
      visualizationType: "radialBurst",
      colorScheme: "neon",
      sensitivity: 2.0,
      barCount: 48,
      particleCount: 200,
      glowIntensity: 1.5,
      rotationSpeed: 0.8,
      mirrorMode: false,
      aspectRatio: { ratio: "9:16", letterboxColor: "#000000" },
      particleOverlay: { enabled: true, type: "sparkles", count: 80, speed: 1.2, size: 1.0, audioReactive: true, color: "#ffffff" },
      textOverlay: { text: "", position: "bottom-center", fontFamily: "Inter", fontSize: 24, color: "#ffffff", animation: "pulse", audioReactive: true },
      progressBar: { enabled: true, style: "glow", position: "bottom", height: 4, color: "#ff00ff", backgroundColor: "rgba(255,255,255,0.2)", showTime: false },
    },
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    description: "Portrait format optimized for Instagram Stories and Reels",
    category: "social",
    tags: ["instagram", "story", "reels", "portrait"],
    preview: { gradient: "from-orange-400 via-pink-500 to-purple-600", icon: "📸" },
    config: {
      visualizationType: "audioBlob",
      colorScheme: "sunset",
      sensitivity: 1.8,
      barCount: 32,
      particleCount: 150,
      glowIntensity: 1.2,
      rotationSpeed: 0.3,
      mirrorMode: false,
      aspectRatio: { ratio: "9:16", letterboxColor: "#1a1a2e" },
      particleOverlay: { enabled: true, type: "bokeh", count: 40, speed: 0.5, size: 1.5, audioReactive: true, color: "#ffaa00" },
      progressBar: { enabled: true, style: "dots", position: "bottom", height: 6, color: "#ff6b6b", backgroundColor: "rgba(0,0,0,0.3)", showTime: false },
    },
  },
  {
    id: "youtube-intro",
    name: "YouTube Intro",
    description: "Widescreen format perfect for YouTube videos",
    category: "social",
    tags: ["youtube", "widescreen", "intro", "landscape"],
    preview: { gradient: "from-red-500 via-red-600 to-red-700", icon: "▶️" },
    config: {
      visualizationType: "spectrumAnalyzer",
      colorScheme: "fire",
      sensitivity: 1.5,
      barCount: 128,
      particleCount: 100,
      glowIntensity: 0.8,
      rotationSpeed: 0,
      mirrorMode: true,
      aspectRatio: { ratio: "16:9", letterboxColor: "#000000" },
      kenBurns: { enabled: false, direction: "zoom-in", speed: 0.5, intensity: 0.3 },
      progressBar: { enabled: false, style: "line", position: "bottom", height: 3, color: "#ff0000", backgroundColor: "rgba(255,255,255,0.1)", showTime: true },
    },
  },
  {
    id: "instagram-square",
    name: "Instagram Feed",
    description: "Square format for Instagram feed posts",
    category: "social",
    tags: ["instagram", "square", "feed", "post"],
    preview: { gradient: "from-purple-400 via-pink-400 to-orange-300", icon: "🖼️" },
    config: {
      visualizationType: "circular",
      colorScheme: "pastel",
      sensitivity: 1.6,
      barCount: 64,
      particleCount: 120,
      glowIntensity: 1.0,
      rotationSpeed: 0.4,
      mirrorMode: false,
      aspectRatio: { ratio: "1:1", letterboxColor: "#fef3e2" },
      particleOverlay: { enabled: true, type: "confetti", count: 30, speed: 0.8, size: 1.0, audioReactive: true, color: "#ff69b4" },
    },
  },
  {
    id: "edm-energy",
    name: "EDM Energy",
    description: "High-energy visuals for electronic dance music",
    category: "genre",
    tags: ["edm", "electronic", "dance", "rave", "bass"],
    preview: { gradient: "from-cyan-400 via-blue-500 to-purple-600", icon: "⚡" },
    config: {
      visualizationType: "radialBurst",
      colorScheme: "neon",
      sensitivity: 2.5,
      barCount: 96,
      particleCount: 300,
      glowIntensity: 2.0,
      rotationSpeed: 1.5,
      mirrorMode: true,
      particleOverlay: { enabled: true, type: "sparkles", count: 150, speed: 2.0, size: 0.8, audioReactive: true, color: "#00ffff" },
      progressBar: { enabled: true, style: "wave", position: "bottom", height: 8, color: "#00ffff", backgroundColor: "rgba(0,0,0,0.5)", showTime: false },
    },
  },
  {
    id: "hiphop-beats",
    name: "Hip-Hop Beats",
    description: "Bold visuals with urban aesthetic for hip-hop and rap",
    category: "genre",
    tags: ["hiphop", "rap", "beats", "urban", "trap"],
    preview: { gradient: "from-yellow-400 via-orange-500 to-red-600", icon: "🎤" },
    config: {
      visualizationType: "equalizer",
      colorScheme: "fire",
      sensitivity: 2.0,
      barCount: 32,
      particleCount: 80,
      glowIntensity: 1.2,
      rotationSpeed: 0,
      mirrorMode: false,
      blendMode: { mode: "screen", opacity: 0.9 },
      progressBar: { enabled: true, style: "line", position: "bottom", height: 6, color: "#ffd700", backgroundColor: "rgba(0,0,0,0.4)", showTime: true },
    },
  },
  {
    id: "lofi-chill",
    name: "Lo-fi Chill",
    description: "Relaxing aesthetics for lo-fi and chill beats",
    category: "genre",
    tags: ["lofi", "chill", "study", "relax", "ambient"],
    preview: { gradient: "from-indigo-300 via-purple-300 to-pink-300", icon: "☕" },
    config: {
      visualizationType: "fluid",
      colorScheme: "pastel",
      sensitivity: 1.0,
      barCount: 48,
      particleCount: 60,
      glowIntensity: 0.5,
      rotationSpeed: 0.2,
      mirrorMode: false,
      particleOverlay: { enabled: true, type: "fireflies", count: 25, speed: 0.3, size: 0.6, audioReactive: false, color: "#ffffaa" },
      kenBurns: { enabled: true, direction: "zoom-in", speed: 0.2, intensity: 0.15 },
    },
  },
  {
    id: "rock-anthem",
    name: "Rock Anthem",
    description: "Intense visuals for rock and metal music",
    category: "genre",
    tags: ["rock", "metal", "guitar", "intense", "concert"],
    preview: { gradient: "from-gray-700 via-red-800 to-black", icon: "🎸" },
    config: {
      visualizationType: "mountainRange",
      colorScheme: "fire",
      sensitivity: 2.2,
      barCount: 80,
      particleCount: 180,
      glowIntensity: 1.8,
      rotationSpeed: 0,
      mirrorMode: true,
      particleOverlay: { enabled: true, type: "sparkles", count: 100, speed: 1.5, size: 1.2, audioReactive: true, color: "#ff4400" },
    },
  },
  {
    id: "classical-elegance",
    name: "Classical Elegance",
    description: "Refined visuals for classical and orchestral music",
    category: "genre",
    tags: ["classical", "orchestra", "piano", "elegant", "symphony"],
    preview: { gradient: "from-amber-100 via-amber-200 to-amber-300", icon: "🎻" },
    config: {
      visualizationType: "waveform",
      colorScheme: "monochrome",
      sensitivity: 1.2,
      barCount: 256,
      particleCount: 40,
      glowIntensity: 0.3,
      rotationSpeed: 0,
      mirrorMode: true,
      particleOverlay: { enabled: true, type: "stars", count: 20, speed: 0.2, size: 0.5, audioReactive: false, color: "#d4af37" },
    },
  },
  {
    id: "pop-vibes",
    name: "Pop Vibes",
    description: "Colorful and fun visuals for pop music",
    category: "genre",
    tags: ["pop", "fun", "colorful", "upbeat", "dance"],
    preview: { gradient: "from-pink-400 via-purple-400 to-indigo-400", icon: "🎶" },
    config: {
      visualizationType: "particles",
      colorScheme: "galaxy",
      sensitivity: 1.7,
      barCount: 64,
      particleCount: 200,
      glowIntensity: 1.3,
      rotationSpeed: 0.6,
      mirrorMode: false,
      particleOverlay: { enabled: true, type: "confetti", count: 60, speed: 1.0, size: 1.0, audioReactive: true, color: "#ff69b4" },
      progressBar: { enabled: true, style: "dots", position: "bottom", height: 5, color: "#ff69b4", backgroundColor: "rgba(255,255,255,0.2)", showTime: false },
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic neon aesthetics with glitch effects",
    category: "style",
    tags: ["cyberpunk", "neon", "futuristic", "glitch", "sci-fi"],
    preview: { gradient: "from-cyan-500 via-purple-600 to-pink-500", icon: "🌆" },
    config: {
      visualizationType: "spectrumAnalyzer",
      colorScheme: "neon",
      sensitivity: 1.8,
      barCount: 128,
      particleCount: 150,
      glowIntensity: 2.0,
      rotationSpeed: 0,
      mirrorMode: true,
      blendMode: { mode: "screen", opacity: 0.85 },
      particleOverlay: { enabled: true, type: "sparkles", count: 80, speed: 1.5, size: 0.7, audioReactive: true, color: "#00ffff" },
    },
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean and simple design with subtle animations",
    category: "style",
    tags: ["minimal", "clean", "simple", "elegant", "modern"],
    preview: { gradient: "from-gray-100 via-gray-200 to-gray-300", icon: "◯" },
    config: {
      visualizationType: "waveform",
      colorScheme: "monochrome",
      sensitivity: 1.0,
      barCount: 64,
      particleCount: 0,
      glowIntensity: 0,
      rotationSpeed: 0,
      mirrorMode: false,
      progressBar: { enabled: true, style: "minimal", position: "bottom", height: 2, color: "#333333", backgroundColor: "rgba(0,0,0,0.1)", showTime: true },
    },
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    description: "80s inspired synthwave aesthetics",
    category: "style",
    tags: ["retro", "synthwave", "80s", "vaporwave", "vintage"],
    preview: { gradient: "from-purple-600 via-pink-500 to-orange-400", icon: "🌅" },
    config: {
      visualizationType: "mountainRange",
      colorScheme: "sunset",
      sensitivity: 1.6,
      barCount: 64,
      particleCount: 100,
      glowIntensity: 1.5,
      rotationSpeed: 0,
      mirrorMode: false,
      particleOverlay: { enabled: true, type: "stars", count: 50, speed: 0.3, size: 0.8, audioReactive: false, color: "#ff00ff" },
      kenBurns: { enabled: true, direction: "pan-up", speed: 0.3, intensity: 0.2 },
    },
  },
  {
    id: "neon-dreams",
    name: "Neon Dreams",
    description: "Vibrant neon colors with dreamy glow effects",
    category: "style",
    tags: ["neon", "glow", "vibrant", "colorful", "bright"],
    preview: { gradient: "from-green-400 via-cyan-500 to-blue-500", icon: "✨" },
    config: {
      visualizationType: "circular",
      colorScheme: "neon",
      sensitivity: 1.8,
      barCount: 72,
      particleCount: 180,
      glowIntensity: 2.5,
      rotationSpeed: 0.7,
      mirrorMode: false,
      particleOverlay: { enabled: true, type: "bokeh", count: 50, speed: 0.6, size: 1.5, audioReactive: true, color: "#00ff88" },
    },
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    description: "Sleek dark theme with subtle accents",
    category: "style",
    tags: ["dark", "night", "sleek", "subtle", "professional"],
    preview: { gradient: "from-gray-800 via-gray-900 to-black", icon: "🌙" },
    config: {
      visualizationType: "bars",
      colorScheme: "matrix",
      sensitivity: 1.4,
      barCount: 64,
      particleCount: 50,
      glowIntensity: 0.6,
      rotationSpeed: 0,
      mirrorMode: true,
      aspectRatio: { ratio: "16:9", letterboxColor: "#0a0a0a" },
      progressBar: { enabled: true, style: "glow", position: "bottom", height: 3, color: "#00ff00", backgroundColor: "rgba(0,255,0,0.1)", showTime: false },
    },
  },
  {
    id: "ocean-vibes",
    name: "Ocean Vibes",
    description: "Calm oceanic colors with fluid motion",
    category: "style",
    tags: ["ocean", "water", "calm", "blue", "wave"],
    preview: { gradient: "from-cyan-300 via-blue-500 to-indigo-600", icon: "🌊" },
    config: {
      visualizationType: "fluid",
      colorScheme: "ocean",
      sensitivity: 1.3,
      barCount: 48,
      particleCount: 80,
      glowIntensity: 0.8,
      rotationSpeed: 0.3,
      mirrorMode: false,
      particleOverlay: { enabled: true, type: "bubbles", count: 40, speed: 0.4, size: 1.2, audioReactive: true, color: "#88ddff" },
    },
  },
  {
    id: "galaxy-space",
    name: "Galaxy Space",
    description: "Cosmic visuals with starfield effects",
    category: "style",
    tags: ["galaxy", "space", "cosmic", "stars", "universe"],
    preview: { gradient: "from-indigo-900 via-purple-800 to-pink-700", icon: "🌌" },
    config: {
      visualizationType: "kaleidoscope",
      colorScheme: "galaxy",
      sensitivity: 1.5,
      barCount: 64,
      particleCount: 250,
      glowIntensity: 1.4,
      rotationSpeed: 0.4,
      mirrorMode: false,
      particleOverlay: { enabled: true, type: "stars", count: 100, speed: 0.5, size: 0.6, audioReactive: false, color: "#ffffff" },
      kenBurns: { enabled: true, direction: "zoom-out", speed: 0.15, intensity: 0.25 },
    },
  },
];

interface TemplateGalleryProps {
  onApplyTemplate: (template: Template) => void;
}

export function TemplateGallery({ onApplyTemplate }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "social" | "genre" | "style">("all");
  const [isOpen, setIsOpen] = useState(false);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "social": return <Monitor className="w-4 h-4" />;
      case "genre": return <Music className="w-4 h-4" />;
      case "style": return <Palette className="w-4 h-4" />;
      default: return <LayoutTemplate className="w-4 h-4" />;
    }
  };

  const handleApply = (template: Template) => {
    onApplyTemplate(template);
    setIsOpen(false);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Templates</span>
        </div>
        <Badge variant="secondary" className="text-xs">{templates.length} templates</Badge>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            data-testid="button-open-templates"
          >
            <LayoutTemplate className="w-4 h-4" />
            Browse Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Template Gallery
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-template-search"
                />
              </div>
            </div>

            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="social" data-testid="tab-social" className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  <span className="hidden sm:inline">Social</span>
                  <span className="sm:hidden">Soc</span>
                </TabsTrigger>
                <TabsTrigger value="genre" data-testid="tab-genre" className="flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  <span className="hidden sm:inline">Genre</span>
                  <span className="sm:hidden">Gen</span>
                </TabsTrigger>
                <TabsTrigger value="style" data-testid="tab-style" className="flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  <span className="hidden sm:inline">Style</span>
                  <span className="sm:hidden">Sty</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-4">
                <ScrollArea className="h-[50vh]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
                    {filteredTemplates.map((template) => (
                      <Card 
                        key={template.id}
                        className="overflow-hidden cursor-pointer hover-elevate transition-all"
                        onClick={() => handleApply(template)}
                        data-testid={`template-${template.id}`}
                      >
                        <div className={`h-24 bg-gradient-to-br ${template.preview.gradient} flex items-center justify-center text-3xl`}>
                          {template.preview.icon}
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{template.name}</span>
                            {getCategoryIcon(template.category)}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {filteredTemplates.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <Search className="w-8 h-8 mb-2" />
                      <p>No templates found</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 gap-2">
        {templates.slice(0, 4).map((template) => (
          <Button
            key={template.id}
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-2 flex flex-col items-start gap-1"
            onClick={() => onApplyTemplate(template)}
            data-testid={`quick-template-${template.id}`}
          >
            <div className={`w-full h-8 rounded bg-gradient-to-br ${template.preview.gradient} flex items-center justify-center text-sm`}>
              {template.preview.icon}
            </div>
            <span className="text-xs truncate w-full text-left">{template.name}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}

export { templates };
