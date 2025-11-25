import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, MapPin, BookOpen, Heart, Target, Sparkles } from "lucide-react";
import type { Student } from "@shared/schema";

interface StudentProfileDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileDialog({ 
  student, 
  open, 
  onOpenChange 
}: StudentProfileDialogProps) {
  if (!student) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={student.avatar || undefined} alt={student.name} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <DialogTitle className="text-2xl" data-testid="text-student-name">
                {student.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Profile for {student.name}
              </DialogDescription>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="rounded-md">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {student.year}
                </Badge>
                <Badge variant="secondary" className="rounded-md">
                  {student.major}
                </Badge>
              </div>
              {student.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{student.location}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {student.bio && (
            <div>
              <p className="text-muted-foreground" data-testid="text-student-bio">
                {student.bio}
              </p>
            </div>
          )}

          {student.courses && student.courses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Courses</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.courses.map((course, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-full"
                    data-testid={`badge-course-${idx}`}
                  >
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {student.interests && student.interests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.interests.map((interest, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="rounded-full"
                    data-testid={`badge-interest-${idx}`}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {student.hobbies && student.hobbies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Hobbies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.hobbies.map((hobby, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-full"
                    data-testid={`badge-hobby-${idx}`}
                  >
                    {hobby}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {student.goals && student.goals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Goals</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.goals.map((goal, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="rounded-full"
                    data-testid={`badge-goal-${idx}`}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
