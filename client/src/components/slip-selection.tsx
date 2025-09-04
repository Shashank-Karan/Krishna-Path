import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import type { Emotion, Verse, EmotionRecord } from "@shared/schema";

interface SlipSelectionProps {
  emotion: Emotion;
  onSlipSelect: (verse: Verse) => void;
  onBack: () => void;
}

const emotionGuidance: Record<Emotion, string> = {
  happy: "You've chosen the verdant path of joy. Select a slip to enhance your blissful energy with Krishna's wisdom.",
  peace: "You've chosen the lotus path of tranquility. Select a slip to deepen your inner peace with divine knowledge.",
  anxious: "You've chosen the ocean path for calm. Select a slip to find serenity and clarity in Krishna's guidance.",
  angry: "You've chosen the sacred fire path. Select a slip to transform your energy into divine wisdom.",
  sad: "You've chosen the deep waters path. Select a slip to find Krishna's light in difficult moments.",
  protection: "You've chosen the golden saffron path. Select a slip to connect with divine protection and strength.",
  lazy: "You've chosen the sunrise path of awakening. Select a slip to ignite your spiritual energy.",
  lonely: "You've chosen the starlight path of connection. Select a slip to remember your divine bond with all beings."
};

const emotionColors: Record<Emotion, string> = {
  happy: "hsl(140, 85%, 45%)",
  peace: "hsl(280, 75%, 65%)",
  anxious: "hsl(200, 25%, 60%)",
  angry: "hsl(15, 85%, 55%)",
  sad: "hsl(210, 85%, 60%)",
  protection: "hsl(32, 95%, 55%)",
  lazy: "hsl(45, 90%, 60%)",
  lonely: "hsl(270, 80%, 65%)"
};

export function SlipSelection({ emotion, onSlipSelect, onBack }: SlipSelectionProps) {
  const [selectedSlip, setSelectedSlip] = useState<number | null>(null);
  const queryClient = useQueryClient();
  
  // Handle WebSocket messages for real-time verse updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'verse_created' || message.type === 'verse_updated' || message.type === 'verse_deleted') {
      // Refresh verse data when changes occur in admin panel
      queryClient.invalidateQueries({ queryKey: ["/api/verses", emotion] });
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
    }
  }, [queryClient, emotion]);
  
  // Connect to WebSocket for real-time updates
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  const { data: verses, isLoading } = useQuery<Verse[]>({
    queryKey: ["/api/verses", emotion],
    enabled: !!emotion,
  });

  // Fetch emotions to get the dynamic color for this emotion
  const { data: emotions = [] } = useQuery<EmotionRecord[]>({
    queryKey: ["/api/emotions"],
  });

  // Find the current emotion's data from API or fallback to hardcoded colors
  const currentEmotion = emotions.find(e => e.name === emotion);
  const emotionColor = currentEmotion?.color || emotionColors[emotion] || "hsl(200, 50%, 50%)";

  const handleSlipClick = (index: number) => {
    if (verses && Array.isArray(verses) && verses.length > 0) {
      setSelectedSlip(index);
      // Add a small delay for animation effect
      setTimeout(() => {
        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        onSlipSelect(randomVerse);
      }, 300);
    }
  };

  // If no verses available, show message
  if (!verses || verses.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 font-display">
            No Verses Available
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-4 sm:px-2">
            There are currently no verses available for the {emotion} emotion.
          </p>
          <Button 
            variant="outline"
            onClick={onBack}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold w-full sm:w-auto"
            data-testid="button-back-emotions"
          >
            ← Choose Different Emotion
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-primary/20 rounded-full mx-auto animate-pulse"></div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 font-display">Preparing Your Wisdom</h3>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground animate-pulse px-4 sm:px-2">Gathering spiritual guidance just for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen gradient-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">
          Select Your Wisdom Slip
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed px-4 sm:px-2">
          {emotionGuidance[emotion]}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16">
          {Array.from({ length: Math.min(verses.length, 8) }, (_, index) => (
            <div
              key={index}
              className={`slip-card rounded-2xl sm:rounded-3xl h-32 sm:h-36 md:h-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                selectedSlip === index ? 'spiritual-shadow-divine scale-110' : ''
              }`}
              onClick={() => handleSlipClick(index)}
              data-testid={`slip-${index}`}
            >
              <div 
                className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 rounded-xl sm:rounded-2xl transition-all duration-300"
                style={{ backgroundColor: emotionColor }}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium transition-colors duration-300 w-full sm:w-auto"
            data-testid="button-back-emotions"
          >
            ← Choose Different Emotion
          </Button>
        </div>
      </div>
    </div>
  );
}
