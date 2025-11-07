import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, stageId } = await req.json();
    
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content;

    let relevantChunks: any[] = [];
    
    if (OPENAI_API_KEY) {
      // Generate embedding for the query
      const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: lastUserMessage,
          dimensions: 768
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        // Search for relevant chunks
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: chunks } = await supabaseClient.rpc('search_document_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: 3
        });

        relevantChunks = chunks || [];
      }
    }

    // Build context from relevant chunks
    const context = relevantChunks.length > 0
      ? relevantChunks.map(chunk => 
          `[Source: ${chunk.document_title}]\n${chunk.chunk_text}`
        ).join('\n\n---\n\n')
      : '';

    // Build system prompt with context
    const systemPrompt = `You are a helpful CPF (Central Provident Fund) assistant for Singapore residents. You provide clear, accurate information about CPF schemes, contributions, and policies.

${context ? `Use the following information from official CPF documents to answer questions:\n\n${context}\n\n` : ''}

Important guidelines:
- Explain CPF concepts in plain, simple English
- Be specific and accurate with numbers, rates, and policies
- If you're not certain about something, say so
- Focus on practical, actionable advice
- Tailor responses to the user's life stage: ${stageId}`;

    // Stream response from AI
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
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error("AI gateway error");
    }

    // Return the streaming response with sources metadata
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-Sources": JSON.stringify(relevantChunks.map(c => ({
          title: c.document_title,
          similarity: c.similarity
        })))
      },
    });

  } catch (error) {
    console.error("RAG chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});