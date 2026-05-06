import { Scale } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-accent/20 rounded-lg blur-lg" />
        <div className="relative bg-primary rounded-lg p-2">
          <Scale className={`${iconSizes[size]} text-primary-foreground`} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-serif font-bold text-foreground leading-tight`}>
            LegalSum
          </span>
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            AI Document Summarizer
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
