import { ReactNode } from "react";
import Logo from "./Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <Logo size="lg" />
          <h2 className="mt-12 text-4xl font-serif font-bold leading-tight">
            Simplify Legal Documents
            <br />
            <span className="text-accent">In Your Language</span>
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-md">
            Upload complex legal documents and get clear, concise summaries in Hindi or Marathi. 
            Powered by advanced AI technology.
          </p>
          <div className="mt-12 flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">10K+</div>
              <div className="text-sm text-primary-foreground/70">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">2</div>
              <div className="text-sm text-primary-foreground/70">Languages Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">99%</div>
              <div className="text-sm text-primary-foreground/70">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="md:hidden mb-8">
            <Logo size="md" />
          </div>
          <div className="auth-card">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mb-6">{subtitle}</p>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
