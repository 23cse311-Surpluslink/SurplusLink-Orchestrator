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
    <div className={cn("flex items-center group", showText ? "gap-3" : "gap-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 relative",
          "ring-1 ring-emerald-200 dark:ring-emerald-800 transition-all duration-500",
          "group-hover:ring-primary group-hover:bg-primary/10 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]",
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
              <stop offset="0%" stopColor="#86efac" className="transition-all duration-500 group-hover:stop-color-[#34d399]" />
              <stop offset="100%" stopColor="#22c55e" className="transition-all duration-500 group-hover:stop-color-[#10b981]" />
            </linearGradient>
            <linearGradient id="hoverGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          <path
            d="M12 2C7 6 4 9.5 4 14a8 8 0 0016 0c0-4.5-3-8-8-12z"
            fill="url(#leafGradient)"
            className="transition-all duration-500 group-hover:fill-[url(#hoverGradient)]"
          />

          <path
            d="M12 7v10"
            stroke="#14532d"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
            className="transition-all duration-500 group-hover:stroke-white group-hover:opacity-100"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight text-foreground transition-all duration-500",
            "group-hover:tracking-normal",
            textSizes[size]
          )}
        >
          <span className="transition-colors duration-500 group-hover:text-primary">Surplus</span>
          <span className="text-emerald-600 dark:text-emerald-400 transition-colors duration-500 group-hover:text-blue-500">
            Link
          </span>
        </span>
      )}
    </div>
  );
}
