import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function Logo({
  className,
  iconClassName,
  size = "md",
  showText = true,
}: LogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={cn("flex items-center", showText ? "gap-3" : "gap-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 relative",
          "ring-1 ring-emerald-200 dark:ring-emerald-800",
          sizes[size],
          iconClassName
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5/6 w-5/6 relative z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="leafGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          <path
            d="M12 2C7 6 4 9.5 4 14a8 8 0 0016 0c0-4.5-3-8-8-12z"
            fill="url(#leafGradient)"
          />

          <path
            d="M12 7v10"
            stroke="#14532d"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={cn(
            "font-black tracking-tight text-foreground",
            textSizes[size]
          )}
        >
          <span className="text-primary">Surplus</span>
          <span className="text-foreground">Link</span>
        </span>
      )}
    </div>
  );
}
