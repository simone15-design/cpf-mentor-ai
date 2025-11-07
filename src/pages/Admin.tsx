import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "CPF Housing Guide 2024.pdf",
      uploadDate: "2024-01-15",
      size: "2.3 MB",
    },
    {
      id: "2",
      name: "Healthcare Schemes Overview.pdf",
      uploadDate: "2024-01-10",
      size: "1.8 MB",
    },
  ]);

  const handleFileUpload = () => {
    toast({
      title: "Upload Feature",
      description: "Document upload will be enabled when connected to Lovable Cloud.",
    });
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    toast({
      title: "Document Deleted",
      description: "The document has been removed from the knowledge base.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground">
            Manage CPF documents and guides for the knowledge base
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>Add new CPF guides and circulars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-url">Or Enter URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="doc-url"
                    type="url"
                    placeholder="https://example.com/cpf-guide.pdf"
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleFileUpload} className="w-full">
                Upload Document
              </Button>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Knowledge Base Documents
              </CardTitle>
              <CardDescription>
                Currently indexed documents ({documents.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.uploadDate} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-accent">Ready to Enable Backend?</CardTitle>
            <CardDescription>
              Connect Lovable Cloud to enable document storage, vector search, and AI-powered
              responses.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
