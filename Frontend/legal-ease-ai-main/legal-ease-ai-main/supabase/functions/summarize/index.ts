import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SummarizeRequest {
  content: string;
  language: "english" | "hindi" | "marathi";
  fileName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, language, fileName }: SummarizeRequest = await req.json();

    if (!content || !language) {
      return new Response(
        JSON.stringify({ error: "Content and language are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageName = language === "english" ? "English" : language === "hindi" ? "Hindi (हिंदी)" : "Marathi (मराठी)";

    const systemPrompt = `You are an expert legal document summarizer specializing in Indian legal documents. Your task is to summarize legal documents in ${languageName}.

Guidelines:
1. Provide a clear, concise summary of the legal document
2. Highlight key legal points, parties involved, and important dates
3. Use simple language that can be understood by non-lawyers
4. Write the ENTIRE summary in ${languageName}
5. Maintain accuracy of legal terminology while explaining in accessible terms
6. Structure the summary with clear sections if the document is long
7. Include any important deadlines, obligations, or rights mentioned

Output the summary entirely in ${languageName}. Do not use English in the summary.`;

    const userPrompt = `Please summarize the following legal document in ${languageName}. The document is named "${fileName}":

${content.substring(0, 15000)}

${content.length > 15000 ? "\n[Document truncated due to length...]" : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Unable to generate summary";

    return new Response(
      JSON.stringify({ summary }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Summarize error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
