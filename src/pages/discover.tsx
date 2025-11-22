import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Heart, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Mock data for demonstration
const mockStudents = [
  {
    id: "1",
    name: "Sarah Chen",
    year: "Junior",
    major: "Computer Science",
    bio: "Love hiking and building apps. Always up for a study session or coffee!",
    courses: ["CS301", "MATH210", "PHYS101"],
    interests: ["Technology", "Hiking", "Photography"],
    hobbies: ["Coding", "Running", "Guitar"],
    goals: ["Find study partners", "Join clubs", "Make new friends"],
    matchScore: 92,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    year: "Sophomore",
    major: "Business",
    bio: "Basketball player and entrepreneur. Looking to network and grow!",
    courses: ["BUS201", "ECON150", "MKTG101"],
    interests: ["Sports", "Music", "Travel"],
    hobbies: ["Basketball", "Piano", "Reading"],
    goals: ["Network professionally", "Stay active", "Make new friends"],
    matchScore: 85,
  },
];

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedProfile, setExpandedProfile] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  const currentStudent = mockStudents[currentIndex];

  const handleSkip = () => {
    if (currentStudent) {
      setSkipped([...skipped, currentStudent.id]);
      console.log("Skipped:", currentStudent.name);
    }
    if (currentIndex < mockStudents.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setExpandedProfile(false);
    }
  };

  const handleConnect = () => {
    if (currentStudent) {
      setConnections([...connections, currentStudent.id]);
      console.log("Connected with:", currentStudent.name, "Match score:", currentStudent.matchScore);
    }
    handleSkip();
  };

  if (!currentStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">You're all caught up!</h3>
        <p className="text-muted-foreground">
          Check back later for more matches
        </p>
      </div>
    );
  }

  const initials = currentStudent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Discover Matches</h1>
          <p className="text-muted-foreground">
            Find students who share your interests
          </p>
        </div>

        <Card className="overflow-hidden" data-testid="card-matching-profile">
          <div className="relative">
            <div className="aspect-[3/4] bg-muted flex items-center justify-center">
              <Avatar className="w-48 h-48">
                <AvatarFallback className="text-6xl">{initials}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-3xl font-bold mb-1" data-testid="text-match-name">
                    {currentStudent.name}
                  </h2>
                  <p className="text-lg opacity-90">
                    {currentStudent.year} • {currentStudent.major}
                  </p>
                </div>
                <Badge
                  className="rounded-full text-lg px-4 py-1 bg-primary"
                  data-testid="text-match-score"
                >
                  {currentStudent.matchScore}% Match
                </Badge>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
              onClick={() => setExpandedProfile(!expandedProfile)}
              data-testid="button-expand-profile"
            >
              {expandedProfile ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>

          {expandedProfile && (
            <div className="p-6 space-y-4 border-t">
              {currentStudent.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{currentStudent.bio}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Courses</h3>
                <div className="flex flex-wrap gap-2">
                  {currentStudent.courses.map((course, idx) => (
                    <Badge key={idx} variant="default" className="rounded-full">
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {currentStudent.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-full">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {currentStudent.hobbies.map((hobby, idx) => (
                    <Badge key={idx} variant="outline" className="rounded-full">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {currentStudent.goals.map((goal, idx) => (
                    <Badge key={idx} variant="outline" className="rounded-full text-xs">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 flex gap-4">
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
              data-testid="button-skip"
            >
              <X className="mr-2 h-5 w-5" />
              Skip
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleConnect}
              data-testid="button-connect-match"
            >
              <Heart className="mr-2 h-5 w-5" />
              Connect
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {mockStudents.length - currentIndex} {mockStudents.length - currentIndex === 1 ? "match" : "matches"} remaining
          </p>
          {connections.length > 0 && (
            <p className="text-sm text-primary font-medium">
              {connections.length} {connections.length === 1 ? "connection" : "connections"} made today!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
