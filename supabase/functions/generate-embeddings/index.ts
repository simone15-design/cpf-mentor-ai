import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }
  
  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { documentId } = await req.json();

    if (!documentId) {
      return new Response(JSON.stringify({ error: 'Document ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch document
    const { data: document, error: docError } = await supabaseClient
      .from('cpf_documents')
      .select('id, title, content')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Chunk the document content
    const chunks = chunkText(document.content);
    console.log(`Processing ${chunks.length} chunks for document: ${document.title}`);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: chunk,
          dimensions: 768,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to generate embedding for chunk ${i}:`, await response.text());
        continue;
      }

      const embeddingData = await response.json();
      const embedding = embeddingData.data[0].embedding;

      // Store chunk with embedding
      const { error: insertError } = await supabaseClient
        .from('document_chunks')
        .insert({
          document_id: documentId,
          chunk_text: chunk,
          chunk_index: i,
          embedding: embedding,
          metadata: {
            documentTitle: document.title,
            chunkLength: chunk.length,
          },
        });

      if (insertError) {
        console.error(`Error inserting chunk ${i}:`, insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksProcessed: chunks.length,
        message: 'Embeddings generated successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Generate embeddings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});