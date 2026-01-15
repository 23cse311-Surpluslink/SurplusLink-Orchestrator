import { cn } from '@/lib/utils';

interface MapPlaceholderProps {
  className?: string;
  children?: React.ReactNode;
}

export function MapPlaceholder({ className, children }: MapPlaceholderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-muted border border-border",
      className
    )}>
      {/* Map grid background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 h-3 w-3 rounded-full bg-primary animate-pulse" />
      <div className="absolute top-1/2 right-1/3 h-3 w-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/3 left-1/2 h-3 w-3 rounded-full bg-success animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Route lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path
          d="M100,75 Q150,100 160,150 T200,200"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <path
          d="M260,100 Q280,150 220,200"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>

      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center h-full min-h-[300px] p-6 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <svg 
            className="h-8 w-8 text-primary" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h3 className="font-semibold text-lg mb-1">Interactive Map</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Real-time tracking of donations and delivery routes would appear here
        </p>
        {children}
      </div>
    </div>
  );
}
