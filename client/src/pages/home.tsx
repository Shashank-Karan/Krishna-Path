import { useState } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { WelcomeSection } from "@/components/welcome-section";
import { EmotionSelection } from "@/components/emotion-selection";
import { SlipSelection } from "@/components/slip-selection";
import { VerseDisplay } from "@/components/verse-display";
import type { Emotion, Verse } from "@shared/schema";

type ViewState = "welcome" | "emotions" | "slip" | "verse";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>("welcome");
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const smoothTransition = (newView: ViewState, callback?: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (callback) callback();
      setCurrentView(newView);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 150);
  };

  const handleStartJourney = () => {
    smoothTransition("emotions");
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    smoothTransition("slip", () => setSelectedEmotion(emotion));
  };

  const handleSlipSelect = (verse: Verse) => {
    smoothTransition("verse", () => setSelectedVerse(verse));
  };

  const handleBackToWelcome = () => {
    smoothTransition("welcome", () => {
      setSelectedEmotion(null);
      setSelectedVerse(null);
    });
  };

  const handleBackToEmotions = () => {
    smoothTransition("emotions", () => setSelectedVerse(null));
  };

  const handleBackToSlips = () => {
    smoothTransition("slip", () => setSelectedVerse(null));
  };

  const handleHomeClick = () => {
    handleBackToWelcome();
  };

  return (
    <div className="min-h-screen gradient-bg">
      <NavigationHeader onHomeClick={handleHomeClick} />
      
      <main className={`flex-1 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {currentView === "welcome" && (
          <WelcomeSection onStartJourney={handleStartJourney} />
        )}
        
        {currentView === "emotions" && (
          <EmotionSelection 
            onEmotionSelect={handleEmotionSelect}
            onBack={handleBackToWelcome}
          />
        )}
        
        {currentView === "slip" && selectedEmotion && (
          <SlipSelection 
            emotion={selectedEmotion}
            onSlipSelect={handleSlipSelect}
            onBack={handleBackToEmotions}
          />
        )}
        
        {currentView === "verse" && selectedVerse && selectedEmotion && (
          <VerseDisplay 
            verse={selectedVerse}
            emotion={selectedEmotion}
            onNewVerse={() => handleBackToSlips()}
            onBackHome={handleBackToWelcome}
          />
        )}
      </main>
    </div>
  );
}
