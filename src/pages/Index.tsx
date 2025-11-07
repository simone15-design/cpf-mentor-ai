import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BookOpen, Sparkles, Shield, Clock, Target } from "lucide-react";

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
              Understand Your CPF,
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}
                Simply Explained
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Get personalized, plain-English answers to your CPF questions. Whether you're just starting work or planning your first home, we're here to help.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/stages">
                <Button size="lg" className="gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Start Chatting
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Why Use Our CPF Assistant?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We've built the simplest way to navigate Singapore's CPF system
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <Card className="border-primary/20 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Life-Stage Focused</CardTitle>
                <CardDescription>
                  Get answers tailored to your current life situation - from first job to first home
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-3">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Plain English</CardTitle>
                <CardDescription>
                  Complex policies translated into simple, easy-to-understand language
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Answers</CardTitle>
                <CardDescription>
                  No more searching through multiple PDFs - get accurate answers in seconds
                </CardDescription>
              </CardHeader>
            </Card>
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="py-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Ready to Master Your CPF?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Start getting clear answers to your CPF questions today
              </p>
              <Link to="/stages">
                <Button size="lg" className="gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
