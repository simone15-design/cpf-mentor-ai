import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Link as LinkIcon, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  title: string;
  created_at: string;
  url: string | null;
  metadata: any;
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docUrl, setDocUrl] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges. Please contact an administrator.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchDocuments();
    } catch (error) {
      console.error('Auth check error:', error);
      navigate("/auth");
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cpf_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile && !docUrl) {
      toast({
        title: "Missing Information",
        description: "Please select a file or enter a URL",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let fileData = null;
      let fileName = null;

      if (selectedFile) {
        // Convert file to base64
        const reader = new FileReader();
        fileData = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(selectedFile);
        });
        fileName = selectedFile.name;
      }

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          action: 'upload',
          title: docTitle || fileName || 'Untitled Document',
          url: docUrl || null,
          fileData,
          fileName,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset form
      setSelectedFile(null);
      setDocUrl("");
      setDocTitle("");
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh documents
      await fetchDocuments();

      // Generate embeddings in background
      toast({
        title: "Processing Document",
        description: "Generating embeddings for search...",
      });

      const { error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: { documentId: data.document.id },
      });

      if (embeddingError) {
        console.error('Embedding generation error:', embeddingError);
        toast({
          title: "Warning",
          description: "Document uploaded but embeddings failed. Please regenerate.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Document Ready",
          description: "Document indexed and ready for search!",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-document', {
        body: {
          action: 'delete',
          documentId: id,
        },
      });

      if (error) throw error;

      toast({
        title: "Document Deleted",
        description: "The document has been removed from the knowledge base.",
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/auth");
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-muted-foreground">
              Manage CPF documents and guides for the knowledge base
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
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
                <Label htmlFor="doc-title">Document Title</Label>
                <Input
                  id="doc-title"
                  type="text"
                  placeholder="e.g., CPF Housing Guide 2024"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="cursor-pointer"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-url">Or Enter URL</Label>
                <Input
                  id="doc-url"
                  type="url"
                  placeholder="https://example.com/cpf-guide.pdf"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleFileUpload} 
                className="w-full"
                disabled={uploading || (!selectedFile && !docUrl)}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : documents.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No documents uploaded yet. Upload your first CPF document to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                            {doc.url && ' • URL'}
                            {doc.metadata?.fileName && ` • ${doc.metadata.fileName}`}
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
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Admin;
