import { Link } from "react-router-dom";
import { Scale, FileText, Languages, Shield, ArrowRight, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { useState } from "react";

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: "Multi-Format Support",
      description: "Upload PDF, DOC, DOCX, or TXT legal documents for instant processing",
    },
    {
      icon: Languages,
      title: "Hindi & Marathi",
      description: "Get accurate summaries in your preferred regional language",
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Your documents are encrypted and processed securely",
    },
  ];

  // ====== STATES ======
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ====== API CALL ======
  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMsg("Please enter some legal text first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSummary("");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text: inputText }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server Error ${response.status}`);
      }

      const data = await response.json();

      // Handle both formats
      if (typeof data === "string") {
        setSummary(data);
      } else if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary("No summary returned from AI.");
      }
    } catch (error: any) {
      console.error(error);

      if (error.name === "AbortError") {
        setErrorMsg("Request timeout. Try smaller text.");
      } else {
        setErrorMsg("Failed to summarize the document. Check backend.");
      }
    }

    setLoading(false);
  };

  const benefits = [
    "Save hours reading complex legal documents",
    "Understand legal terms in simple language",
    "Download summaries for offline reference",
    "Powered by advanced AI technology",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2.5 rounded-lg font-semibold text-primary-foreground transition-all hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Scale className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Legal Document Analysis</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
              Simplify Legal Documents
              <br />
              <span className="text-primary">In Your Language</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Upload complex legal documents and get clear, concise summaries in Hindi or Marathi.
              Powered by advanced AI to make legal text accessible to everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-accent-foreground transition-all hover:opacity-90 animate-pulse-glow"
                style={{ background: "var(--gradient-accent)" }}
              >
                Start Summarizing
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-border text-foreground hover:bg-secondary transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to understand legal documents quickly and accurately
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background rounded-2xl p-8 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                Why Choose LegalSum?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our AI-powered platform makes legal documents accessible to everyone,
                regardless of legal expertise or language preference.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border animate-scale-in">
              <div className="bg-primary/5 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">contract_agreement.pdf</p>
                    <p className="text-sm text-muted-foreground">2.4 MB • Uploaded</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-full bg-success rounded-full" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <span className="text-sm font-medium text-foreground">हिंदी (Hindi)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-success">Summary Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6">
            Ready to Simplify Legal Documents?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust LegalSum to make legal documents understandable.
            Start your free account today.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--gradient-accent)" }}
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LegalSum. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

