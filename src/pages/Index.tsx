import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BookOpen, Sparkles, Clock, Target, Database, Users, Zap, Shield, AlertTriangle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background py-20 lg:py-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <Sparkles className="h-4 w-4" />
              AI-Powered CPF Guidance
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Navigate Your CPF Journey
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}
                with Confidence
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Get personalized information on CPF, tailored to your life stage. From cradle to grave. From first job to retirement.
            </p>
            <div className="flex justify-center">
              <Link to="/stages">
                <Button size="lg" className="gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Start Chatting
                </Button>
              </Link>
            </div>
            
            {/* Disclaimer */}
            <div className="mt-8 mx-auto max-w-3xl">
              <div className="rounded-lg border-2 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">IMPORTANT NOTICE</h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      This web application is developed as a proof-of-concept prototype. The information provided here is NOT intended for actual usage and should not be relied upon for making any decisions, especially those related to financial, legal, or healthcare matters.
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      Furthermore, please be aware that the LLM may generate inaccurate or incorrect information. You assume full responsibility for how you use any generated output.
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                      The data and information provided are current as of November 2025.
                    </p>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Always consult with qualified professionals for accurate and personalized advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-background to-secondary/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Three simple steps to get your CPF questions answered
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Choose Your Stage</h3>
              <p className="text-muted-foreground">
                Select the life stage that matches your current situation
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                  2
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Ask Your Questions</h3>
              <p className="text-muted-foreground">
                Chat naturally about your CPF concerns and goals
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Get Clear Answers</h3>
              <p className="text-muted-foreground">
                Receive personalized, easy-to-understand explanations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-gradient-to-b from-secondary/20 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">About This Project</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Empowering Singaporeans with clear, accessible CPF information through AI technology
            </p>
          </div>

          <div className="mx-auto max-w-6xl space-y-8">
            {/* Project Scope */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Project Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  This AI-powered chatbot is designed to help Singaporeans navigate the complexities of the Central Provident Fund (CPF) system. The project focuses on providing stage-specific guidance tailored to different life phases, from early career professionals to retirees.
                </p>
                <p className="text-muted-foreground">
                  Our platform covers all major CPF schemes including housing, healthcare, retirement planning, and education financing. By leveraging advanced natural language processing and retrieval-augmented generation (RAG), we deliver accurate, contextual answers based on official CPF documentation and guidelines.
                </p>
              </CardContent>
            </Card>

            {/* Objective */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Project Objective
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our primary objective is to democratize CPF knowledge by breaking down complex financial jargon into plain, understandable language. We aim to:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Reduce confusion and misconceptions about CPF schemes and policies</li>
                  <li>Provide personalized guidance based on individual life stages and circumstances</li>
                  <li>Empower Singaporeans to make informed decisions about their CPF savings</li>
                  <li>Improve financial literacy and long-term financial planning capabilities</li>
                  <li>Offer 24/7 accessible support for CPF-related queries without long wait times</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our knowledge base is built on authoritative and up-to-date information from official sources:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-secondary/20 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">Official CPF Website</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive guides, FAQs, and policy documents directly from cpf.gov.sg covering all schemes and services
                    </p>
                  </div>
                  <div className="rounded-lg border bg-secondary/20 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">CPF Circulars & Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Latest policy changes, rate adjustments, and important announcements from CPF Board
                    </p>
                  </div>
                  <div className="rounded-lg border bg-secondary/20 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">Housing Schemes Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed information on CPF usage for home purchases, grants, and property-related matters
                    </p>
                  </div>
                  <div className="rounded-lg border bg-secondary/20 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">Healthcare & Retirement Plans</h4>
                    <p className="text-sm text-muted-foreground">
                      MediSave, MediShield Life, and retirement planning resources including CPF LIFE schemes
                    </p>
                  </div>
                </div>
                <p className="text-sm italic text-muted-foreground">
                  Note: All information is regularly updated through our admin portal to ensure accuracy and relevance. Our AI crawls and indexes official CPF web pages to maintain the most current knowledge base.
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/10 p-2">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Stage-Based Guidance</h4>
                        <p className="text-sm text-muted-foreground">
                          Tailored advice for five life stages: Early Career, Marriage & Family, Home Ownership, Mid-Career, and Pre-Retirement
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-accent/10 p-2">
                        <MessageSquare className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Conversational AI</h4>
                        <p className="text-sm text-muted-foreground">
                          Natural language processing allows you to ask questions in plain English and receive clear, contextual responses
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/10 p-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Source Citations</h4>
                        <p className="text-sm text-muted-foreground">
                          Every answer includes references to official CPF documents, ensuring transparency and trustworthiness
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-accent/10 p-2">
                        <Shield className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Secure & Private</h4>
                        <p className="text-sm text-muted-foreground">
                          Your conversations are private and secure. We don't collect personal financial data or CPF account details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-accent/10 p-2">
                        <Database className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Continuous Updates</h4>
                        <p className="text-sm text-muted-foreground">
                          Admin-managed knowledge base with website crawling capabilities to keep information current and accurate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center space-y-4">
              <Link to="/stages">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Start Your CPF Journey Today
                </Button>
              </Link>
              <div>
                <Link to="/methodology">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Learn About Our Methodology
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
