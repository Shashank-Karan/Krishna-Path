import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useCallback, useEffect } from "react";
import type { Emotion, EmotionConfig, EmotionRecord } from "@shared/schema";

interface EmotionSelectionProps {
  onEmotionSelect: (emotion: Emotion) => void;
  onBack: () => void;
}

const emotionConfigs: Record<Emotion, EmotionConfig> = {
  happy: {
    name: "Happy",
    color: "hsl(140, 85%, 45%)",
    icon: "🌺",
    description: "🌱 Feeling joyful and content",
    emoji: "🌱"
  },
  peace: {
    name: "Peace",
    color: "hsl(280, 75%, 65%)",
    icon: "🪷",
    description: "🕉️ Seeking divine tranquility",
    emoji: "🕉️"
  },
  anxious: {
    name: "Anxious",
    color: "hsl(200, 25%, 60%)",
    icon: "🌊",
    description: "💫 Finding calm in uncertainty",
    emoji: "💫"
  },
  angry: {
    name: "Angry",
    color: "hsl(15, 85%, 55%)",
    icon: "🔥",
    description: "⚡ Transform fire into wisdom",
    emoji: "⚡"
  },
  sad: {
    name: "Sad",
    color: "hsl(210, 85%, 60%)",
    icon: "🌧️",
    description: "💧 Finding light in darkness",
    emoji: "💧"
  },
  protection: {
    name: "Protection",
    color: "hsl(32, 95%, 55%)",
    icon: "🕉️",
    description: "🛡️ Seeking divine guidance",
    emoji: "🛡️"
  },
  lazy: {
    name: "Lazy",
    color: "hsl(45, 90%, 60%)",
    icon: "☀️",
    description: "🌅 Awakening inner energy",
    emoji: "🌅"
  },
  lonely: {
    name: "Lonely",
    color: "hsl(270, 80%, 65%)",
    icon: "🌙",
    description: "✨ Universal connection",
    emoji: "✨"
  }
};

export function EmotionSelection({ onEmotionSelect, onBack }: EmotionSelectionProps) {
  const queryClient = useQueryClient();
  
  // Fetch emotions from backend
  const { data: emotions = [], isLoading } = useQuery<EmotionRecord[]>({
    queryKey: ["/api/emotions"],
  });

  // Handle WebSocket messages for real-time emotion updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'emotion_created' || message.type === 'emotion_updated' || message.type === 'emotion_deleted') {
      // Refresh emotions data when changes occur
      queryClient.invalidateQueries({ queryKey: ["/api/emotions"] });
    }
  }, [queryClient]);

  // Connect to WebSocket for real-time updates
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  // Create emotion configs from dynamic data, falling back to defaults
  const dynamicEmotionConfigs: Record<string, EmotionConfig> = emotions.reduce((acc, emotion) => {
    acc[emotion.name] = {
      name: emotion.displayName || emotion.name,
      color: emotion.color || emotionConfigs[emotion.name as Emotion]?.color || "hsl(200, 50%, 50%)",
      icon: emotion.icon || emotionConfigs[emotion.name as Emotion]?.icon || "💫",
      description: emotion.description || emotionConfigs[emotion.name as Emotion]?.description || "Seeking guidance",
      emoji: emotion.emoji || emotionConfigs[emotion.name as Emotion]?.emoji || "💫"
    };
    return acc;
  }, {} as Record<string, EmotionConfig>);

  // Use dynamic emotions or fall back to static ones
  const activeEmotions = emotions.length > 0 
    ? emotions.filter(e => e.isActive !== false).map(e => e.name as Emotion)
    : Object.keys(emotionConfigs) as Emotion[];

  const displayConfigs = emotions.length > 0 ? dynamicEmotionConfigs : emotionConfigs;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading emotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 font-display">
          How are you feeling today?
        </h2>
        <div className="w-16 sm:w-24 md:w-32 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-4 sm:mb-6 md:mb-8"></div>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-2">
          Choose the color that resonates with your current emotion. Each color connects you to specific wisdom from the Bhagavad Gita.
        </p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12 md:mb-16">
        {activeEmotions.map((emotion) => {
          const config = displayConfigs[emotion];
          if (!config) return null;
          
          return (
            <div
              key={emotion}
              className="emotion-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[200px] cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() => onEmotionSelect(emotion)}
              data-testid={`emotion-${emotion}`}
            >
              <div 
                className="w-10 xs:w-12 sm:w-14 md:w-16 h-10 xs:h-12 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-all duration-300"
                style={{ backgroundColor: config.color }}
              >
                <span className="text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl filter drop-shadow-sm">{config.emoji}</span>
              </div>
              <h3 className="font-semibold text-center text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">{config.name}</h3>
              <p className="text-xs sm:text-xs md:text-sm text-center text-gray-600 leading-relaxed px-1 sm:px-0">{config.description}</p>
            </div>
          );
        })}
      </div>

      {/* Connection status indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center mb-4">
          <span className={`text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? '🟢 Live Updates' : '🔴 Offline'}
          </span>
        </div>
      )}

      <div className="text-center">
        <Button 
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold hover:bg-white/20 w-full sm:w-auto"
          data-testid="button-back-welcome"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}
