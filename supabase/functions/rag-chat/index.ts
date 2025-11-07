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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return new Response(JSON.stringify({ error: 'Last message must be from user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userQuery = lastMessage.content;

    // Generate embedding for the user's question
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: userQuery,
        dimensions: 768,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar document chunks
    const { data: similarChunks, error: searchError } = await supabaseClient
      .rpc('search_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
      });

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error('Failed to search documents');
    }

    // Build context from retrieved chunks
    let context = '';
    const sources: { title: string; text: string }[] = [];
    
    if (similarChunks && similarChunks.length > 0) {
      context = similarChunks
        .map((chunk: any) => `[${chunk.document_title}]\n${chunk.chunk_text}`)
        .join('\n\n');
      
      sources.push(...similarChunks.map((chunk: any) => ({
        title: chunk.document_title,
        text: chunk.chunk_text.substring(0, 200) + '...',
      })));
    }

    // Create system prompt with context
    const systemPrompt = `You are a helpful CPF (Central Provident Fund) assistant for Singapore. Your role is to explain CPF policies, schemes, and regulations in simple, plain English.

Life Stage Context: ${stageId || 'general'}

${context ? `Reference Documents:\n${context}\n\n` : ''}

Guidelines:
- Explain CPF concepts in simple terms
- Use the provided reference documents when available
- If you don't know something, say so
- Be friendly and encouraging
- Focus on practical, actionable information`;

    // Call Lovable AI with context
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
          ...messages,
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

    // Stream the response back
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-Sources": JSON.stringify(sources),
      },
    });

  } catch (error) {
    console.error('RAG chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});