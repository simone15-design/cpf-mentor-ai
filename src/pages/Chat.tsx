import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Download, ArrowLeft, FileText, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const { stageId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your CPF assistant. Ask me anything about CPF schemes, contributions, or how they apply to your situation. I'll explain everything in simple terms.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const stageTitles: Record<string, string> = {
    "fresh-graduate": "Fresh Graduate",
    "early-career": "Early Career",
    "married": "Getting Married",
    "homebuyer": "First-Time Homebuyer",
    "parent": "New Parent",
    "mid-career": "Mid-Career",
    "pre-retirement": "Pre-Retirement",
    "retirement": "Retirement",
  };

  const suggestedQuestions: Record<string, string[]> = {
    "fresh-graduate": [
      "How much will I contribute to CPF each month?",
      "What are the different CPF accounts and what are they for?",
      "When can I start withdrawing from my CPF?",
      "Should I make voluntary CPF contributions?",
    ],
    "early-career": [
      "How can I use CPF for investments?",
      "What are the benefits of CPF top-ups?",
      "How do I maximize my CPF savings for retirement?",
      "Can I transfer money between CPF accounts?",
    ],
    "married": [
      "How can my spouse and I combine CPF for a home?",
      "What CPF schemes are available for married couples?",
      "Can I transfer CPF savings to my spouse?",
      "How do CPF nominations work for married couples?",
    ],
    "homebuyer": [
      "How much CPF can I use for my first home?",
      "What is the CPF Housing Grant and am I eligible?",
      "How does CPF accrued interest work when buying property?",
      "Can I use CPF for both down payment and monthly installments?",
    ],
    "parent": [
      "Can I use MediSave for my child's medical expenses?",
      "What CPF schemes help with education costs?",
      "How do I adjust my CPF planning with children?",
      "Can I include my children in MediShield Life?",
    ],
    "mid-career": [
      "What is the Full Retirement Sum and how do I meet it?",
      "Should I top up my Special Account or Retirement Account?",
      "What are the tax benefits of CPF top-ups?",
      "How can I optimize my CPF investments?",
    ],
    "pre-retirement": [
      "What are my CPF LIFE payout options?",
      "How much do I need in my Retirement Account?",
      "Should I make voluntary contributions before retirement?",
      "When should I start CPF LIFE payouts?",
    ],
    "retirement": [
      "How do I withdraw from my CPF in retirement?",
      "What are the different CPF LIFE plans?",
      "Can I still make CPF contributions after 65?",
      "How do I use MediSave for healthcare in retirement?",
    ],
  };

  const currentSuggestions = suggestedQuestions[stageId || ""] || [];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            stageId: stageId || "",
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let textBuffer = '';

      // Add initial assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.role === 'assistant') {
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: assistantMessage,
                  };
                }
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, continue
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleExportFull = () => {
    const stageTitle = stageTitles[stageId || ""] || "CPF Chat";
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${stageTitle.replace(/\s+/g, '-')}_${timestamp}.json`;
    
    const exportData = {
      stage: stageTitle,
      exportDate: new Date().toISOString(),
      messages: messages,
      messageCount: messages.length,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation Exported",
      description: "Full conversation downloaded successfully.",
    });
  };

  const handleExportSummary = async () => {
    if (messages.length <= 1) {
      toast({
        title: "No Conversation",
        description: "Start a conversation before exporting a summary.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-conversation', {
        body: { messages },
      });

      if (error) throw error;

      const stageTitle = stageTitles[stageId || ""] || "CPF Chat";
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${stageTitle.replace(/\s+/g, '-')}_Summary_${timestamp}.txt`;

      const summaryContent = `CPF Consultation Summary
Stage: ${stageTitle}
Date: ${new Date().toLocaleDateString()}
Messages: ${messages.length}

${data.summary}

---
Generated by CPF Assistant
`;

      const blob = new Blob([summaryContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Summary Generated",
        description: "Conversation summary downloaded successfully.",
      });
    } catch (error) {
      console.error('Export summary error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate conversation summary.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/stages">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {stageTitles[stageId || ""] || "CPF Assistant"}
              </h1>
              <p className="text-sm text-muted-foreground">Ask me anything about CPF</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isExporting}>
                <Download className="h-4 w-4" />
                {isExporting ? "Generating..." : "Export Chat"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportFull}>
                <FileDown className="mr-2 h-4 w-4" />
                Full Conversation (JSON)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSummary} disabled={isExporting}>
                <FileText className="mr-2 h-4 w-4" />
                AI Summary (Text)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-3xl space-y-4">
          {/* Suggested Questions - Show only when conversation just started */}
          {messages.length === 1 && currentSuggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Here are some common questions for your life stage:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left h-auto py-2 px-3 whitespace-normal"
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <div className="p-4">
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-card">
                <div className="p-4">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about CPF contributions, housing schemes, retirement planning..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
