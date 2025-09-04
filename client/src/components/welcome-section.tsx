import { Button } from "@/components/ui/button";

interface WelcomeSectionProps {
  onStartJourney: () => void;
}

export function WelcomeSection({ onStartJourney }: WelcomeSectionProps) {
  return (
    <div className="animate-fade-in min-h-screen gradient-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 text-center">
        <div className="animate-slide-up">
          {/* Hero Section */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 font-display animate-sacred-float">
              <span className="divine-text">Krishna Path</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
              Find guidance for your emotions through ancient wisdom from the Bhagavad Gita
            </p>
          </div>
          

          {/* Clear Call to Action */}
          <div className="space-y-3 sm:space-y-4">
            <Button 
              onClick={onStartJourney}
              className="btn-sacred text-primary-foreground px-8 sm:px-12 md:px-16 py-4 sm:py-6 md:py-8 rounded-full font-bold text-lg sm:text-xl md:text-2xl hover:scale-105 group min-h-[64px] sm:min-h-[72px] animate-divine-pulse w-full sm:w-auto"
              data-testid="button-start-journey"
            >
              <span className="flex items-center gap-3">
                Start Now
                <span className="group-hover:translate-x-1 transition-transform duration-300 text-xl sm:text-2xl">→</span>
              </span>
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
              No signup required • Free to use
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
