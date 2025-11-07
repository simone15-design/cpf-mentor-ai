import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, Home, Heart, Baby, Users, TrendingUp, Clock } from "lucide-react";

const lifeStages = [
  {
    id: "fresh-graduate",
    title: "Fresh Graduate",
    description: "Just started working? Learn about CPF contributions and savings.",
    icon: GraduationCap,
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "early-career",
    title: "Early Career",
    description: "Building your career? Understand CPF for career growth and planning.",
    icon: Briefcase,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "married",
    title: "Getting Married",
    description: "Tying the knot? Discover joint CPF planning strategies.",
    icon: Heart,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "homebuyer",
    title: "First-Time Homebuyer",
    description: "Planning to buy a home? Learn about CPF housing schemes.",
    icon: Home,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "parent",
    title: "New Parent",
    description: "Starting a family? Learn about healthcare and education planning.",
    icon: Baby,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "mid-career",
    title: "Mid-Career",
    description: "Established in your career? Optimize your CPF for wealth building.",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "pre-retirement",
    title: "Pre-Retirement",
    description: "5-10 years from retirement? Maximize your CPF and plan ahead.",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "retirement",
    title: "Retirement",
    description: "Enjoying your golden years? Learn about CPF withdrawals and payouts.",
    icon: Clock,
    color: "from-violet-500 to-violet-600",
  },
];

const LifeStages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Choose Your Life Stage</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Select the stage that best describes where you are in life. We'll tailor the CPF information to your specific needs.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lifeStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <Link key={stage.id} to={`/chat/${stage.id}`}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${stage.color} p-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{stage.title}</CardTitle>
                    <CardDescription className="text-base">{stage.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="group-hover:text-primary">
                      Start Chat →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/">
            <Button variant="outline" size="lg">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LifeStages;
