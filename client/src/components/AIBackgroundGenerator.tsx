import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, X, Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIBackgroundGeneratorProps {
  onBackgroundGenerated: (url: string | null) => void;
  currentBackground: string | null;
}

const promptSuggestions = [
  "Abstract cosmic nebula with swirling colors",
  "Neon city skyline at night with rain",
  "Deep ocean underwater scene with bioluminescence",
  "Ethereal forest with magical particles",
  "Geometric patterns with vibrant gradients",
  "Retro synthwave sunset landscape",
];

export function AIBackgroundGenerator({
  onBackgroundGenerated,
  currentBackground,
}: AIBackgroundGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/generate-background", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.imageUrl) {
        onBackgroundGenerated(data.imageUrl);
        toast({
          title: "Background generated",
          description: "Your AI background has been created successfully.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate background. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your background.",
        variant: "destructive",
      });
      return;
    }
    if (prompt.length > 500) {
      toast({
        title: "Prompt too long",
        description: "Please keep your prompt under 500 characters.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(prompt);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const clearBackground = () => {
    onBackgroundGenerated(null);
  };

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">AI Background</h3>
        </div>
        {currentBackground && (
          <Button
            size="icon"
            variant="ghost"
            onClick={clearBackground}
            className="h-6 w-6"
            data-testid="button-clear-bg"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Describe your ideal background
        </Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Vibrant neon galaxy with swirling stars..."
          className="min-h-[80px] text-sm resize-none"
          maxLength={500}
          data-testid="input-ai-prompt"
        />
        <p className="text-[10px] text-muted-foreground text-right">
          {prompt.length}/500
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {promptSuggestions.slice(0, 3).map((suggestion, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="cursor-pointer text-[10px] hover-elevate"
            onClick={() => handleSuggestionClick(suggestion)}
            data-testid={`badge-suggestion-${i}`}
          >
            {suggestion.slice(0, 25)}...
          </Badge>
        ))}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || generateMutation.isPending}
        className="w-full"
        data-testid="button-generate-bg"
      >
        {generateMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Background
          </>
        )}
      </Button>

      {currentBackground && (
        <div className="relative rounded-md overflow-hidden">
          <img
            src={currentBackground}
            alt="AI Generated Background"
            className="w-full h-20 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <span className="absolute bottom-1 left-2 text-[10px] text-muted-foreground">
            Current background
          </span>
        </div>
      )}
    </Card>
  );
}
