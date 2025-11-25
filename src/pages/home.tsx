import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Calendar, GraduationCap, MessageSquare, Heart, Sparkles } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/campus_students_collaborating_together.png";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();
  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "Connect with students who share your courses, interests, and goals",
    },
    {
      icon: Calendar,
      title: "Campus Events",
      description: "Discover and join events happening around campus",
    },
    {
      icon: GraduationCap,
      title: "Study Groups",
      description: "Find or create study groups for your classes",
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "Connect instantly with your campus community",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Students collaborating on campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Find Your Campus Community</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Build Real Connections
            <br />
            on Campus
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            CampusConnect matches you with students who share your courses, interests, and goals.
            Reduce loneliness and build meaningful relationships.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {!user ? (
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-lg px-8 bg-primary/90 backdrop-blur-md hover:bg-primary border border-primary-border"
                    data-testid="button-get-started"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                    data-testid="button-login-home"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/discover">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-primary/90 backdrop-blur-md hover:bg-primary border border-primary-border"
                  data-testid="button-discover"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Discover Matches
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Connect</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From matching with like-minded students to organizing study sessions,
            CampusConnect has all the tools to build your campus community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 text-center hover-elevate" data-testid={`card-feature-${idx}`}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your People?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students building meaningful connections on campus
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8" data-testid="button-create-profile">
                Create Your Profile
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
