import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  BookOpen,
  Target,
  Sparkles,
  Mail,
  ArrowLeft
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import type { Student } from "@shared/schema";

export default function StudentProfile() {
  const [, params] = useRoute("/student/:id");
  const [, setLocation] = useLocation();
  const studentId = params?.id;

  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ["/api/students", studentId],
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Student Not Found</h3>
        <p className="text-muted-foreground mb-4">
          This profile doesn't exist or has been removed.
        </p>
        <Button onClick={() => setLocation("/")} data-testid="button-go-home">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const initials = student.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => window.history.back()}
        className="mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card data-testid="card-student-profile">
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl" data-testid="text-student-name">{student.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{student.year} - {student.major}</span>
            </div>
            {student.location && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{student.location}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {student.bio && (
            <div>
              <p className="text-muted-foreground">{student.bio}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {student.courses && student.courses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Courses</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.courses.map((course: string, idx: number) => (
                    <Badge key={idx} variant="default">{course}</Badge>
                  ))}
                </div>
              </div>
            )}

            {student.interests && student.interests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.interests.map((interest: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {student.hobbies && student.hobbies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Hobbies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.hobbies.map((hobby: string, idx: number) => (
                    <Badge key={idx} variant="outline">{hobby}</Badge>
                  ))}
                </div>
              </div>
            )}

            {student.goals && student.goals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Goals</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.goals.map((goal: string, idx: number) => (
                    <Badge key={idx} variant="outline">{goal}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
