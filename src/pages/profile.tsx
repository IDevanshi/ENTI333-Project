import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  Target, 
  MapPin,
  Pencil,
  Gamepad2
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Not Logged In</h3>
        <p className="text-muted-foreground mb-4">
          Please log in to view your profile
        </p>
        <Link href="/login">
          <Button data-testid="button-login">Log In</Button>
        </Link>
      </div>
    );
  }

  const student = user.student;

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Complete Your Profile</h3>
        <p className="text-muted-foreground mb-4">
          Set up your profile to start connecting with other students
        </p>
        <Link href="/profile-setup">
          <Button data-testid="button-setup-profile">Set Up Profile</Button>
        </Link>
      </div>
    );
  }

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Link href="/profile-setup">
            <Button variant="outline" data-testid="button-edit-profile">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden" data-testid="card-profile">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-8">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold" data-testid="text-profile-name">
                  {student.name}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <GraduationCap className="h-4 w-4" />
                  <span data-testid="text-profile-year-major">
                    {student.year} - {student.major}
                  </span>
                </div>
                {student.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span data-testid="text-profile-location">{student.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {student.bio && (
              <div data-testid="section-bio">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">About Me</h3>
                </div>
                <p className="text-muted-foreground" data-testid="text-profile-bio">
                  {student.bio}
                </p>
              </div>
            )}

            <Separator />

            {student.courses && student.courses.length > 0 && (
              <div data-testid="section-courses">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Current Courses</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.courses.map((course, idx) => (
                    <Badge key={idx} variant="default" className="rounded-full" data-testid={`badge-course-${idx}`}>
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {student.interests && student.interests.length > 0 && (
              <div data-testid="section-interests">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-full" data-testid={`badge-interest-${idx}`}>
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {student.hobbies && student.hobbies.length > 0 && (
              <div data-testid="section-hobbies">
                <div className="flex items-center gap-2 mb-3">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Hobbies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.hobbies.map((hobby, idx) => (
                    <Badge key={idx} variant="outline" className="rounded-full" data-testid={`badge-hobby-${idx}`}>
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {student.goals && student.goals.length > 0 && (
              <div data-testid="section-goals">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Goals</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.goals.map((goal, idx) => (
                    <Badge key={idx} variant="outline" className="rounded-full" data-testid={`badge-goal-${idx}`}>
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Account: {user.username}</p>
        </div>
      </div>
    </div>
  );
}
