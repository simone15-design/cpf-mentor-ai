import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_DOMAINS = [
  'cpf.gov.sg',
  'www.cpf.gov.sg',
];

function validateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Block private IP ranges and localhost
    const hostname = url.hostname;
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname === '0.0.0.0'
    ) {
      return false;
    }
    
    // Whitelist allowed domains
    if (!ALLOWED_DOMAINS.includes(hostname)) {
      return false;
    }
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

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

    const { url, crawlType = 'member' } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate crawlType parameter
    if (crawlType !== 'member' && crawlType !== 'employer') {
      return new Response(JSON.stringify({ 
        error: 'Invalid crawlType. Must be either "member" or "employer"' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL to prevent SSRF attacks
    if (!validateUrl(url)) {
      console.error('Invalid or unauthorized URL attempted:', url);
      return new Response(JSON.stringify({ 
        error: 'Invalid or unauthorized URL. Only official CPF domains are allowed.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('URL validation passed for:', url);
    console.log('Crawl type:', crawlType);

    // Select the appropriate API key based on crawl type
    const apiKeyEnvVar = crawlType === 'employer' 
      ? 'FIRECRAWL_API_KEY_EMPLOYER' 
      : 'FIRECRAWL_API_KEY';
    
    const firecrawlApiKey = Deno.env.get(apiKeyEnvVar);
    if (!firecrawlApiKey) {
      return new Response(JSON.stringify({ 
        error: `Firecrawl API key not configured for ${crawlType} queries` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting crawl for:', url);

    // Call Firecrawl API to crawl the website with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let crawlResponse;
    try {
      crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firecrawlApiKey}`,
        },
        body: JSON.stringify({
          url: url,
          limit: 100,
          scrapeOptions: {
            formats: ['markdown', 'html'],
          }
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Firecrawl API connection error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to connect to Firecrawl API. The service may be temporarily unavailable. Please try again later.' 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!crawlResponse.ok) {
      const errorText = await crawlResponse.text();
      console.error('Firecrawl API error:', crawlResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Firecrawl API error (${crawlResponse.status}): ${errorText || 'Failed to start crawl'}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const crawlData = await crawlResponse.json();
    console.log('Crawl initiated:', crawlData);

    if (!crawlData.id) {
      return new Response(JSON.stringify({ error: 'No crawl ID returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Poll for crawl completion
    let crawlStatus = 'scraping';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    let finalData: any = null;

    while (crawlStatus === 'scraping' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlData.id}`, {
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        crawlStatus = statusData.status;
        finalData = statusData;
        console.log('Crawl status:', crawlStatus, 'Completed:', statusData.completed, 'Total:', statusData.total);
      }
      
      attempts++;
    }

    if (crawlStatus !== 'completed') {
      return new Response(JSON.stringify({ 
        error: 'Crawl timeout or failed', 
        status: crawlStatus,
        crawlId: crawlData.id 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process and save the crawled pages
    const pages = finalData.data || [];
    const savedDocuments = [];

    for (const page of pages) {
      const content = page.markdown || page.html || '';
      const pageTitle = page.metadata?.title || page.url || 'Untitled Page';
      
      const { data: docData, error: dbError } = await supabaseClient
        .from('cpf_documents')
        .insert({
          title: pageTitle,
          content: content.substring(0, 50000), // Limit content size
          url: page.url,
          uploaded_by: user.id,
          metadata: {
            crawlId: crawlData.id,
            crawlType: crawlType,
            sourceUrl: url,
            crawledAt: new Date().toISOString(),
            pageMetadata: page.metadata || {},
          },
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving document:', dbError);
      } else {
        savedDocuments.push(docData);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      documentsCreated: savedDocuments.length,
      totalPages: pages.length,
      crawlId: crawlData.id,
      documents: savedDocuments
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Crawl error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
