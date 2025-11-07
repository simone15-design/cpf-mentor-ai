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

    // Define stage-specific contexts
    const stageContexts: Record<string, string> = {
      'fresh-graduate': `The user is a fresh graduate who has just started working. Focus on:
- Basic CPF account types (Ordinary, Special, MediSave)
- Understanding monthly CPF contributions and employer contributions
- Starting to build savings for the future
- CPF contribution rates for young workers
- Basic retirement planning concepts`,
      
      'early-career': `The user is in their early career, building their professional life. Focus on:
- Optimizing CPF contributions for career growth
- Understanding CPF investment schemes (CPFIS)
- Balancing savings with career development
- Voluntary contributions and their benefits
- Planning for major life milestones ahead`,
      
      'married': `The user is getting married or recently married. Focus on:
- Joint CPF planning strategies for couples
- CPF housing schemes for married couples
- Combining CPF savings for home purchase
- Healthcare planning as a couple
- Family protection schemes and CPF Life nominations`,
      
      'homebuyer': `The user is planning to buy their first home. Focus on:
- CPF housing schemes and eligibility
- Using CPF Ordinary Account for down payment and mortgage
- CPF withdrawal limits for property purchase
- Accrued interest and refund requirements
- Housing grants and subsidies available`,
      
      'parent': `The user is a new parent or planning to start a family. Focus on:
- MediSave for maternity and pediatric care
- Education planning and CPF options
- Adjusting finances with children
- Healthcare coverage for family members
- Balancing family needs with retirement savings`,
      
      'mid-career': `The user is established in their career and building wealth. Focus on:
- Maximizing CPF contributions and investments
- CPF top-ups and tax benefits
- Retirement sum schemes and targets
- Healthcare planning (MediShield Life, Integrated Shield Plans)
- Wealth accumulation strategies using CPF`,
      
      'pre-retirement': `The user is 5-10 years from retirement. Focus on:
- Meeting CPF Retirement Sum requirements
- CPF LIFE payout options and decisions
- Voluntary top-ups to maximize retirement income
- Healthcare cost planning (MediSave usage)
- Transitioning from accumulation to withdrawal phase
- Retirement adequacy assessment`,
      
      'retirement': `The user is at or past retirement age. Focus on:
- CPF LIFE payouts and withdrawal options
- Managing CPF savings in retirement
- MediSave for healthcare expenses in retirement
- Silver Support Scheme and other benefits
- Bequest nominations and legacy planning
- Supplementing CPF with other retirement income`,
    };

    const stageContext = stageContexts[stageId || 'general'] || '';

    // Create system prompt with context
    const systemPrompt = `You are a helpful CPF (Central Provident Fund) assistant for Singapore. Your role is to explain CPF policies, schemes, and regulations in simple, plain English.

${stageContext ? `LIFE STAGE CONTEXT:\n${stageContext}\n\n` : ''}

${context ? `REFERENCE DOCUMENTS:\n${context}\n\n` : ''}

GUIDELINES:
- Tailor your responses to the user's specific life stage and priorities
- Explain CPF concepts in simple terms, avoiding jargon
- Use the provided reference documents when available for accurate information
- Provide practical, actionable advice relevant to their situation
- If you don't know something, say so honestly
- Be friendly, encouraging, and empathetic
- Use examples and scenarios when helpful
- Highlight key deadlines, requirements, or considerations for their life stage`;

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