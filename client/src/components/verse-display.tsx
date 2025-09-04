import { Button } from "@/components/ui/button";
import { Share, RefreshCw } from "lucide-react";
import type { Emotion, Verse } from "@shared/schema";

interface VerseDisplayProps {
  verse: Verse;
  emotion: Emotion;
  onNewVerse: () => void;
  onBackHome: () => void;
}

const emotionIcons: Record<Emotion, string> = {
  happy: "🌺",
  peace: "🪷",
  anxious: "🌊",
  angry: "🔥",
  sad: "🌧️",
  protection: "🕉️",
  lazy: "☀️",
  lonely: "🌙"
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

export function VerseDisplay({ verse, emotion, onNewVerse, onBackHome }: VerseDisplayProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Krishna Path - ${verse.chapter}`,
          text: `${verse.english}\n\n- ${verse.chapter}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `${verse.english}\n\n- ${verse.chapter}`;
      try {
        await navigator.clipboard.writeText(shareText);
        // You could show a toast here
        alert("Verse copied to clipboard!");
      } catch (error) {
        console.log("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <div className="animate-fade-in min-h-screen gradient-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="verse-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 font-display">Your Spiritual Guidance</h2>
            <p className="text-sm text-muted-foreground" data-testid="text-chapter">
              {verse.chapter}
            </p>
          </div>

          {/* Sanskrit Shloka */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 glass-card rounded-2xl sm:rounded-3xl">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 text-center font-display">Sanskrit Original</h3>
            <p 
              className="sanskrit-text text-sm sm:text-base md:text-lg text-center text-gray-800 leading-relaxed px-2 sm:px-0"
              data-testid="text-sanskrit"
              dangerouslySetInnerHTML={{ __html: verse.sanskrit.replace(/\n/g, '<br/>') }}
            />
          </div>

          {/* Hindi Translation */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 glass-card rounded-2xl sm:rounded-3xl">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 font-display">Hindi Translation</h3>
            <p 
              className="text-sm sm:text-base text-card-foreground leading-relaxed font-devanagari px-2 sm:px-0"
              data-testid="text-hindi"
              dangerouslySetInnerHTML={{ __html: verse.hindi.replace(/\n/g, '<br/>') }}
            />
          </div>

          {/* English Translation */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 glass-card rounded-2xl sm:rounded-3xl">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 font-display">English Translation</h3>
            <p 
              className="text-sm sm:text-base text-card-foreground leading-relaxed px-2 sm:px-0"
              data-testid="text-english"
              dangerouslySetInnerHTML={{ __html: verse.english.replace(/\n/g, '<br/>') }}
            />
          </div>

          {/* Practical Explanation */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 font-display">Explanation</h3>
            <p 
              className="text-card-foreground leading-relaxed text-sm sm:text-base px-2 sm:px-0"
              data-testid="text-explanation"
              dangerouslySetInnerHTML={{ __html: verse.explanation.replace(/\n/g, '<br/>') }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              onClick={onNewVerse}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 spiritual-shadow-soft hover:spiritual-shadow-medium w-full sm:w-auto"
              data-testid="button-new-verse"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Get Another Verse
            </Button>
            <Button 
              onClick={handleShare}
              variant="outline"
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto"
              data-testid="button-share"
            >
              <Share className="mr-2 h-4 w-4" />
              Share Wisdom
            </Button>
            <Button 
              onClick={onBackHome}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 w-full sm:w-auto"
              data-testid="button-back-home"
            >
              ← Start Over
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
