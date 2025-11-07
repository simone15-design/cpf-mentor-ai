import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Database, MessageSquare, FileText, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Methodology = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Methodology</h1>
            <p className="text-xl text-muted-foreground">
              Understanding the Technical Implementation and Data Flows
            </p>
          </div>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>System Architecture Overview</CardTitle>
              <CardDescription>
                Our CPF Guide Chatbot leverages a Retrieval-Augmented Generation (RAG) architecture
                combined with modern cloud infrastructure to provide accurate, context-aware responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The system is built on three core pillars:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Data Ingestion Layer:</strong> Processes and stores CPF documents from multiple sources</li>
                <li><strong>Vector Search Engine:</strong> Enables semantic similarity matching for relevant information retrieval</li>
                <li><strong>Conversational AI Layer:</strong> Generates natural language responses using retrieved context</li>
              </ul>
            </CardContent>
          </Card>

          {/* Use Case 1: RAG Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Use Case 1: Conversational Chat with RAG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Process Flow</h3>
                <p className="text-muted-foreground mb-4">
                  When a user asks a question, the system retrieves relevant information from the knowledge base
                  and generates contextual responses using AI.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`graph TD
    A[User Asks Question] --> B[Generate Query Embedding]
    B --> C[Vector Similarity Search]
    C --> D{Relevant Chunks Found?}
    D -->|Yes| E[Retrieve Top 5 Similar Chunks]
    D -->|No| F[Use General Knowledge]
    E --> G[Build Context Prompt]
    F --> G
    G --> H[Send to AI Model]
    H --> I[Stream Response to User]
    I --> J[Display Sources]
    
    style A fill:#e1f5ff
    style I fill:#d4f1d4
    style J fill:#d4f1d4`}
                </pre>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Technical Details:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Query Embedding:</strong> User's question is converted to a 768-dimensional vector using OpenAI's text-embedding-3-small model</li>
                  <li><strong>Similarity Search:</strong> Vector database (pgvector) finds the 5 most similar document chunks using cosine similarity (threshold: 0.5)</li>
                  <li><strong>Context Assembly:</strong> Retrieved chunks are formatted with document titles and combined into a context string</li>
                  <li><strong>AI Generation:</strong> Gemini 2.5 Flash model generates responses using the system prompt, conversation history, and retrieved context</li>
                  <li><strong>Streaming Response:</strong> AI response is streamed back to the user in real-time with source citations</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Use Case 2: Document Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Use Case 2: Document Processing & Embedding Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Process Flow</h3>
                <p className="text-muted-foreground mb-4">
                  Documents are processed, chunked, and converted into vector embeddings for efficient retrieval.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`graph TD
    A[Admin Uploads Document] --> B[Store in cpf_documents Table]
    B --> C[Trigger Embedding Generation]
    C --> D[Fetch Document Content]
    D --> E[Split into Chunks]
    E --> F[Chunk Size: 1000 chars, Overlap: 200 chars]
    F --> G[For Each Chunk]
    G --> H[Generate 768-dim Embedding]
    H --> I[Store in document_chunks Table]
    I --> J{More Chunks?}
    J -->|Yes| G
    J -->|No| K[Document Ready for Search]
    
    style A fill:#e1f5ff
    style K fill:#d4f1d4`}
                </pre>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Technical Details:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Document Storage:</strong> Raw document content stored in cpf_documents table with metadata (title, URL, source_type)</li>
                  <li><strong>Text Chunking:</strong> Content split into overlapping chunks (1000 characters, 200 character overlap) to preserve context</li>
                  <li><strong>Embedding Generation:</strong> Each chunk converted to vector using OpenAI text-embedding-3-small (768 dimensions)</li>
                  <li><strong>Vector Storage:</strong> Embeddings stored in document_chunks table with pgvector extension for efficient similarity search</li>
                  <li><strong>Indexing:</strong> Database maintains vector index for fast retrieval using HNSW or IVFFlat algorithms</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Use Case 3: Website Crawling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Use Case 3: Automated Website Crawling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Process Flow</h3>
                <p className="text-muted-foreground mb-4">
                  Official CPF websites are crawled to automatically import the latest policy documents.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`graph TD
    A[Admin Initiates Crawl] --> B[Verify Admin Role]
    B --> C{Is Admin?}
    C -->|No| D[Return Error]
    C -->|Yes| E[Call Firecrawl API]
    E --> F[Start Website Crawl]
    F --> G[Poll Crawl Status]
    G --> H{Crawl Complete?}
    H -->|No| I[Wait 2 seconds]
    I --> G
    H -->|Yes| J[Retrieve All Pages]
    J --> K[For Each Page]
    K --> L[Extract Title & Content]
    L --> M[Store in cpf_documents]
    M --> N{More Pages?}
    N -->|Yes| K
    N -->|No| O[Trigger Embedding Generation]
    O --> P[Documents Ready]
    
    style A fill:#e1f5ff
    style P fill:#d4f1d4`}
                </pre>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Technical Details:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Authentication:</strong> Admin role verification via Supabase JWT and user_roles table</li>
                  <li><strong>Firecrawl Integration:</strong> Third-party service handles web scraping with rate limiting and robots.txt compliance</li>
                  <li><strong>Async Polling:</strong> System polls crawl status every 2 seconds with 5-minute timeout</li>
                  <li><strong>Content Extraction:</strong> Markdown content extracted with metadata (title, URL, source_type='web_crawl')</li>
                  <li><strong>Batch Processing:</strong> All pages stored in database, then batch embedding generation triggered</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Data Flow Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Flow Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">End-to-End Data Flow</h3>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`graph LR
    A[Data Sources] --> B[Ingestion Layer]
    B --> C[Database Storage]
    C --> D[Embedding Generation]
    D --> E[Vector Index]
    E --> F[Query Processing]
    F --> G[AI Response]
    G --> H[User Interface]
    
    A1[CPF Website] --> B
    A2[Manual Upload] --> B
    A3[Web Crawl] --> B
    
    C --> C1[(cpf_documents)]
    D --> D1[(document_chunks)]
    D1 --> E
    
    style A fill:#fff4e6
    style H fill:#d4f1d4`}
                </pre>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Database Schema:</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">cpf_documents</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• id (uuid)</li>
                      <li>• title (text)</li>
                      <li>• content (text)</li>
                      <li>• url (text)</li>
                      <li>• source_type (text)</li>
                      <li>• created_at (timestamp)</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">document_chunks</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• id (uuid)</li>
                      <li>• document_id (uuid)</li>
                      <li>• chunk_text (text)</li>
                      <li>• chunk_index (integer)</li>
                      <li>• embedding (vector[768])</li>
                      <li>• created_at (timestamp)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Frontend</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• React 18 with TypeScript</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• React Query for state management</li>
                    <li>• React Router for navigation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Backend</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Supabase (PostgreSQL + Auth)</li>
                    <li>• Edge Functions (Deno runtime)</li>
                    <li>• pgvector extension for vector search</li>
                    <li>• Row Level Security (RLS) policies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">AI/ML Services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• OpenAI text-embedding-3-small</li>
                    <li>• Google Gemini 2.5 Flash</li>
                    <li>• Lovable AI Gateway</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Third-Party Services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Firecrawl for web scraping</li>
                    <li>• Vercel for deployment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
