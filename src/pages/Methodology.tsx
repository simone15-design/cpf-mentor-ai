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
            <h1 className="text-4xl font-bold tracking-tight">How We Work</h1>
            <p className="text-xl text-muted-foreground">
              A simple look at how our chatbot helps you understand CPF
            </p>
          </div>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>How Our Chatbot Works</CardTitle>
              <CardDescription>
                Think of our chatbot as a smart assistant that reads official CPF documents and explains them to you in simple English.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our system works in three simple steps:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Step 1 - Collecting Information:</strong> We gather and store official CPF documents and guidelines</li>
                <li><strong>Step 2 - Finding Answers:</strong> When you ask a question, we search through our documents to find the most relevant information</li>
                <li><strong>Step 3 - Explaining to You:</strong> Our AI reads the official information and explains it to you in plain English</li>
              </ul>
            </CardContent>
          </Card>

          {/* Use Case 1: RAG Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                When You Ask a Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">What Happens Behind the Scenes</h3>
                <p className="text-muted-foreground mb-4">
                  When you ask us about CPF, we quickly search our library of official documents, 
                  find the best answers, and explain them to you in a way that makes sense.
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
                <h4 className="font-semibold">Here's How:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>We understand your question:</strong> Your question is analyzed to understand what you're really asking about</li>
                  <li><strong>We search our documents:</strong> We look through our collection to find the 5 most relevant pieces of information</li>
                  <li><strong>We prepare the answer:</strong> The relevant information is gathered together with your conversation history</li>
                  <li><strong>AI explains it to you:</strong> Our AI reads the official information and translates it into simple, friendly language</li>
                  <li><strong>You see the answer:</strong> The response appears on your screen word by word, just like texting, along with links to the original sources</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Use Case 2: Document Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                How We Prepare Our Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Building Our Library</h3>
                <p className="text-muted-foreground mb-4">
                  Before we can answer your questions, we need to organize all the CPF documents 
                  in a way that lets us search through them quickly and accurately.
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
                <h4 className="font-semibold">The Process:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Save the document:</strong> When a document is uploaded, we save it along with its title and where it came from</li>
                  <li><strong>Break it into smaller pieces:</strong> We split long documents into smaller, manageable sections that overlap slightly so we don't lose context</li>
                  <li><strong>Make it searchable:</strong> Each section is converted into a special format that computers can compare and search through</li>
                  <li><strong>Store it in our library:</strong> All these searchable sections are saved in our database</li>
                  <li><strong>Create an index:</strong> We organize everything so we can find the right information super quickly when you ask a question</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Use Case 3: Website Crawling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Keeping Our Information Up-to-Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Staying Current</h3>
                <p className="text-muted-foreground mb-4">
                  CPF policies change, so we automatically check official CPF websites 
                  to make sure we always have the latest information for you.
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
                <h4 className="font-semibold">How It Works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Admin starts the update:</strong> Only authorized administrators can trigger a website scan</li>
                  <li><strong>We visit the website:</strong> Our system visits the official CPF website and reads all the pages</li>
                  <li><strong>We wait for completion:</strong> We check every few seconds to see if all the pages have been collected</li>
                  <li><strong>We save the content:</strong> Each page's title, content, and web address is saved to our system</li>
                  <li><strong>We process it:</strong> All the new information goes through our preparation process so you can search through it</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Data Flow Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                The Complete Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">From Document to Answer</h3>
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
                <h4 className="font-semibold">How We Store Information:</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">Original Documents</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Document ID</li>
                      <li>• Title</li>
                      <li>• Full content</li>
                      <li>• Web address</li>
                      <li>• Where it came from</li>
                      <li>• When it was added</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">Searchable Pieces</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Piece ID</li>
                      <li>• Which document it's from</li>
                      <li>• The text content</li>
                      <li>• Position in document</li>
                      <li>• Searchable format</li>
                      <li>• When it was created</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle>What Powers Our Chatbot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">What You See</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Modern web interface</li>
                    <li>• Beautiful, responsive design</li>
                    <li>• Fast and smooth experience</li>
                    <li>• Easy navigation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Behind the Scenes</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Secure database storage</li>
                    <li>• Fast search capabilities</li>
                    <li>• User authentication</li>
                    <li>• Data protection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">AI Technology</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Smart document understanding</li>
                    <li>• Natural language processing</li>
                    <li>• Context-aware responses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">External Services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Automated website monitoring</li>
                    <li>• Reliable hosting</li>
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
