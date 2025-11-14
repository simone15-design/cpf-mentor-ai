import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, Home, Heart, Baby, Users, TrendingUp, Clock, Building2 } from "lucide-react";

const lifeStages = [
  {
    id: "fresh-graduate",
    title: "Fresh Graduate",
    description: "Ages 22-25: Understanding your first CPF contributions and starting your savings journey.",
    icon: GraduationCap,
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "early-career",
    title: "Early Career Professional",
    description: "Ages 25-32: Building your career foundation and maximizing CPF savings for future goals.",
    icon: Briefcase,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "family-planning",
    title: "Family Planning",
    description: "Ages 28-38: Getting married and buying your first home? Navigate CPF for major life milestones.",
    icon: Heart,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "growing-family",
    title: "Growing Family",
    description: "Ages 35-45: Raising children? Optimize CPF for education, healthcare, and upgrading your home.",
    icon: Baby,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "mid-career-wealth",
    title: "Mid-Career Wealth Building",
    description: "Ages 40-55: Peak earning years - maximize CPF investments and grow your retirement fund.",
    icon: TrendingUp,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "pre-retirement",
    title: "Pre-Retirement Planning",
    description: "Ages 55-65: Final stretch before retirement - top up CPF and secure your retirement income.",
    icon: Clock,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "retirement",
    title: "Retiree",
    description: "Age 65+: Managing CPF LIFE payouts, withdrawals, and enjoying your golden years.",
    icon: Users,
    color: "from-violet-500 to-violet-600",
  },
  {
    id: "employer",
    title: "Employer",
    description: "Business owner or HR professional? Understand employer CPF obligations and contributions.",
    icon: Building2,
    color: "from-amber-500 to-amber-600",
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
