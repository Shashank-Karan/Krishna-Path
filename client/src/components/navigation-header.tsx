import { Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavigationHeaderProps {
  onHomeClick?: () => void;
}

export function NavigationHeader({ onHomeClick }: NavigationHeaderProps) {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (onHomeClick) {
      onHomeClick();
    } else {
      setLocation("/");
      // Force page reload to reset state
      window.location.reload();
    }
  };

  const handleDonationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setLocation("/donate");
  };

  return (
    <nav className="sticky top-0 z-50 p-2 sm:p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-xl sm:rounded-2xl md:rounded-3xl px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 transition-all duration-300 hover:spiritual-shadow-medium">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleHomeClick}
              className="hover:opacity-90 transition-all duration-300 group"
            >
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg md:text-xl font-bold text-foreground font-display">Krishna Path</span>
                <span className="text-xs md:text-sm text-muted-foreground font-medium hidden sm:block">Spiritual Wisdom</span>
              </div>
            </button>
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <button 
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground transition-all duration-300 text-sm lg:text-base font-semibold px-3 lg:px-4 py-2 rounded-full hover:bg-accent/30"
              >
                Home
              </button>
              <button 
                onClick={handleDonationClick}
                className="text-muted-foreground hover:text-foreground transition-all duration-300 text-sm lg:text-base font-semibold px-3 lg:px-4 py-2 rounded-full hover:bg-accent/30"
              >
                Donation
              </button>
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden hover:opacity-80 transition-all duration-300 p-1 sm:p-2 rounded-full hover:bg-accent/30" data-testid="button-menu">
                  <Menu className="text-foreground w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80 glass-card border-border spiritual-shadow-medium">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm">🕉️</span>
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-foreground font-display">Krishna Path</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Spiritual Wisdom</div>
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-4">
                  <Button
                    variant="ghost"
                    onClick={handleHomeClick}
                    className="justify-start text-left px-4 py-3 h-auto rounded-xl hover:bg-accent/30 transition-all duration-300"
                    data-testid="mobile-menu-home"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🏠</span>
                      </div>
                      <span className="text-foreground font-semibold">Home</span>
                    </div>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleDonationClick}
                    className="justify-start text-left px-4 py-3 h-auto rounded-xl hover:bg-accent/30 transition-all duration-300"
                    data-testid="mobile-menu-donation"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💝</span>
                      </div>
                      <span className="text-foreground font-semibold">Donation</span>
                    </div>
                  </Button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-border/50">
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Find peace and guidance through ancient wisdom
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
