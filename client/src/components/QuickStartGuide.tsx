import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Play,
  Palette,
  Sparkles,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface QuickStartGuideProps {
  onDismiss: () => void;
  hasAudio: boolean;
}

const steps = [
  {
    icon: Upload,
    title: "Upload Audio",
    description: "Drag and drop an audio file or click to upload. Supports MP3, WAV, OGG, and FLAC up to 100MB.",
    tip: "Start with a high-energy track for the best visual impact!",
  },
  {
    icon: Play,
    title: "Play & Preview",
    description: "Press play to see your audio come to life with real-time visualizations synced to the beat.",
    tip: "Use keyboard shortcuts: Space to play/pause, arrow keys to seek.",
  },
  {
    icon: Palette,
    title: "Customize Style",
    description: "Choose from 15 visualization styles and 8 color schemes. Adjust sensitivity, glow, and more.",
    tip: "Try the Randomize button for quick inspiration!",
  },
  {
    icon: Sparkles,
    title: "Add Effects",
    description: "Upload a custom image, add AI-generated backgrounds, particle overlays, and text animations.",
    tip: "Pro features like Motion Blur and Bloom add polish to your videos.",
  },
  {
    icon: Download,
    title: "Export Video",
    description: "Export your creation as MP4 or WebM in up to 1440p quality with fade effects.",
    tip: "Use Quick Export presets for optimized YouTube, TikTok, or Instagram settings.",
  },
];

export function QuickStartGuide({ onDismiss, hasAudio }: QuickStartGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("quickstart-dismissed");
    if (dismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("quickstart-dismissed", "true");
    setIsVisible(false);
    onDismiss();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-primary/20" data-testid="quick-start-guide">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            Getting Started {currentStep + 1}/{steps.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            data-testid="button-dismiss-guide"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20 shrink-0">
            <StepIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-2 mb-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">Tip:</span> {step.tip}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                data-testid={`step-indicator-${index}`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                data-testid="button-prev-step"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                data-testid="button-next-step"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleDismiss}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
