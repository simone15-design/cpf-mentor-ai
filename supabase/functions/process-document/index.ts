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
    // Get JWT token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role for server-side operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated by getting user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, title, url, fileData, fileName, documentId } = await req.json();

    if (action === 'upload') {
      let content = '';
      let storagePath = null;

      // Handle file upload
      if (fileData && fileName) {
        // Decode base64 file data
        const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
        
        // Upload to storage
        const timestamp = Date.now();
        storagePath = `${user.id}/${timestamp}-${fileName}`;
        
        const { error: uploadError } = await supabaseClient.storage
          .from('cpf-documents')
          .upload(storagePath, fileBuffer, {
            contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return new Response(JSON.stringify({ error: 'Failed to upload file' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // For PDFs, extract text (basic extraction)
        if (fileName.endsWith('.pdf')) {
          content = `PDF Document: ${title || fileName}\nFile uploaded successfully. Content extraction pending.`;
        } else {
          content = new TextDecoder().decode(fileBuffer);
        }
      }

      // Handle URL
      if (url) {
        try {
          const urlResponse = await fetch(url);
          if (!urlResponse.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch URL' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const urlContent = await urlResponse.text();
          content = urlContent.substring(0, 50000); // Limit content size
        } catch (error) {
          console.error('URL fetch error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch URL content';
          return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Save to database
      const { data: docData, error: dbError } = await supabaseClient
        .from('cpf_documents')
        .insert({
          title: title || fileName || 'Untitled Document',
          content,
          url: url || null,
          uploaded_by: user.id,
          metadata: {
            fileName: fileName || null,
            storagePath: storagePath || null,
            uploadedAt: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        return new Response(JSON.stringify({ error: 'Failed to save document' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, document: docData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      if (!documentId) {
        return new Response(JSON.stringify({ error: 'Document ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get document metadata to delete from storage
      const { data: doc } = await supabaseClient
        .from('cpf_documents')
        .select('metadata')
        .eq('id', documentId)
        .maybeSingle();

      if (doc?.metadata?.storagePath) {
        await supabaseClient.storage
          .from('cpf-documents')
          .remove([doc.metadata.storagePath]);
      }

      // Delete from database
      const { error: deleteError } = await supabaseClient
        .from('cpf_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return new Response(JSON.stringify({ error: 'Failed to delete document' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Process document error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});