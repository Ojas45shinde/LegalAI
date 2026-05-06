import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Languages,
  Sparkles,
  Download,
  LogOut,
  User,
  Loader2,
  CheckCircle,
  X
} from "lucide-react";
import Logo from "@/components/Logo";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

type Language = "english" | "hindi" | "marathi";

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [language, setLanguage] = useState<Language>("english");
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile({ file, name: file.name, size: file.size, type: file.type });
    setSummary("");
    toast.success("File uploaded successfully!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ===== FINAL SUMMARIZE LOGIC =====
  const handleSummarize = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a document first");
      return;
    }

    setSummarizing(true);
    setSummary("");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile.file);
      formData.append("language", language);

      const response = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to summarize document");
      }

      const data = await response.json();

      if (data?.summary) {
        setSummary(data.summary);
        toast.success("Document summarized successfully!");
      } else {
        throw new Error("No summary returned from server");
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to summarize document");
    } finally {
      setSummarizing(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary_${language}_${uploadedFile?.name || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
              Legal Document Summarizer
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload your legal documents and get AI-powered summaries in English, Hindi, or Marathi
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg animate-slide-up">
            {/* File Upload Zone */}
            <div
              className={`upload-zone ${dragActive ? "active" : ""} ${uploadedFile ? "border-success bg-success/5" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      setSummary("");
                    }}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Drop your document here or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports PDF, DOC, DOCX, TXT (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Languages className="w-4 h-4 inline-block mr-2" />
                Select Summary Language
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setLanguage("english")}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg border-2 font-medium transition-all ${language === "english"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("hindi")}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg border-2 font-medium transition-all ${language === "hindi"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => setLanguage("marathi")}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg border-2 font-medium transition-all ${language === "marathi"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                >
                  मराठी (Marathi)
                </button>
              </div>
            </div>

            {/* Summarize Button */}
            <button
              onClick={handleSummarize}
              disabled={!uploadedFile || summarizing}
              className="btn-accent mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summarizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Summarize Document
                </>
              )}
            </button>
          </div>

          {/* Summary Display */}
          {(summary || summarizing) && (
            <div className="mt-8 bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Summary ({language === "english" ? "English" : language === "hindi" ? "हिंदी" : "मराठी"})
                </h2>
                {summary && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>

              <div className="summary-display">
                {summarizing ? (
                  <div className="flex items-center justify-center h-40 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">
                      Analyzing document and generating summary...
                    </span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed text-lg">
                      {summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                title: "Upload Document",
                description: "Upload your legal document in PDF, DOC, DOCX, or TXT format",
              },
              {
                icon: Languages,
                title: "Select Language",
                description: "Choose English, Hindi, or Marathi for your summary output",
              },
              {
                icon: Sparkles,
                title: "Get Summary",
                description: "AI analyzes and summarizes the document in your selected language",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border border-border p-5 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
