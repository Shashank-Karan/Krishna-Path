export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🕉️</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Krishna Path</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Ancient wisdom for modern life
          </p>
          <p className="text-muted-foreground text-xs">
            &copy; 2024 Krishna Path. Made with 🕉️ for spiritual growth.
          </p>
        </div>
      </div>
    </footer>
  );
}
