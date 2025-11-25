import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Heart, ChevronDown, ChevronUp, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@shared/schema";

interface MatchResult {
  student: Student;
  score: number;
}

export default function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedProfile, setExpandedProfile] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);

  const { data: matches, isLoading, error } = useQuery<MatchResult[]>({
    queryKey: ["/api/matches/calculate", user?.student?.id],
    queryFn: async () => {
      if (!user?.student?.id) return [];
      const response = await apiRequest("POST", "/api/matches/calculate", {
        studentId: user.student.id,
      });
      return await response.json();
    },
    enabled: !!user?.student?.id,
  });

  const createMatchMutation = useMutation({
    mutationFn: async ({ student1Id, student2Id, score, studentName }: { student1Id: string; student2Id: string; score: number; studentName: string }) => {
      const response = await apiRequest("POST", "/api/matches", {
        student1Id,
        student2Id,
        compatibilityScore: score,
        status: "accepted",
      });
      return { data: await response.json(), studentName };
    },
    onSuccess: (result) => {
      setConnections(prev => [...prev, result.data.student2Id]);
      toast({
        title: "Connection made!",
        description: `You've connected with ${result.studentName}.`,
      });
      moveToNext();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create connection. Please try again.",
      });
    },
  });

  if (!user?.student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Complete Your Profile</h3>
        <p className="text-muted-foreground mb-4">
          You need to set up your profile to discover matches
        </p>
        <Button onClick={() => window.location.href = "/profile-setup"} data-testid="button-setup-profile">
          Set Up Profile
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Discover Matches</h1>
            <p className="text-muted-foreground">
              Finding students who share your interests...
            </p>
          </div>
          <Card className="overflow-hidden" data-testid="card-matching-profile-loading">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentMatch = matches?.[currentIndex];

  const moveToNext = () => {
    if (currentIndex < (matches?.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
      setExpandedProfile(false);
    } else {
      setCurrentIndex(matches?.length || 0);
    }
  };

  const handleSkip = () => {
    moveToNext();
  };

  const handleConnect = () => {
    if (currentMatch && user?.student?.id) {
      createMatchMutation.mutate({
        student1Id: user.student.id,
        student2Id: currentMatch.student.id,
        score: currentMatch.score,
        studentName: currentMatch.student.name,
      });
    }
  };

  if (!currentMatch || currentIndex >= (matches?.length || 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">
          {matches?.length === 0 ? "No Matches Yet" : "You're all caught up!"}
        </h3>
        <p className="text-muted-foreground">
          {matches?.length === 0 
            ? "Be the first to find connections! Invite your classmates to join."
            : "Check back later for more matches"}
        </p>
        {connections.length > 0 && (
          <p className="text-sm text-primary font-medium mt-4">
            {connections.length} {connections.length === 1 ? "connection" : "connections"} made!
          </p>
        )}
      </div>
    );
  }

  const currentStudent = currentMatch.student;
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
                    {currentStudent.year} - {currentStudent.major}
                  </p>
                </div>
                <Badge
                  className="rounded-full text-lg px-4 py-1 bg-primary"
                  data-testid="text-match-score"
                >
                  {currentMatch.score}% Match
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

              {currentStudent.courses && currentStudent.courses.length > 0 && (
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
              )}

              {currentStudent.interests && currentStudent.interests.length > 0 && (
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
              )}

              {currentStudent.hobbies && currentStudent.hobbies.length > 0 && (
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
              )}

              {currentStudent.goals && currentStudent.goals.length > 0 && (
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
              )}
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
              disabled={createMatchMutation.isPending}
              data-testid="button-connect-match"
            >
              <Heart className="mr-2 h-5 w-5" />
              {createMatchMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {(matches?.length || 0) - currentIndex} {(matches?.length || 0) - currentIndex === 1 ? "match" : "matches"} remaining
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
