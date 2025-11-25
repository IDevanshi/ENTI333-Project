import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Users, Lock, BookOpen, Target } from "lucide-react";
import { StudentProfileDialog } from "./student-profile-dialog";
import type { StudyGroup, Student } from "@shared/schema";

interface StudyGroupDetailDialogProps {
  group: StudyGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin?: () => void;
  isMember?: boolean;
  isLoggedIn?: boolean;
}

export function StudyGroupDetailDialog({ 
  group, 
  open, 
  onOpenChange, 
  onJoin, 
  isMember,
  isLoggedIn = true
}: StudyGroupDetailDialogProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
    enabled: open && !!group && group.members.length > 0,
  });

  if (!group) return null;
  
  const memberCount = group.members.length;

  const getMemberStudents = () => {
    return students.filter(student => group.members.includes(student.id));
  };

  const memberStudents = getMemberStudents();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setProfileDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default" className="rounded-md" data-testid="badge-group-detail-course">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {group.course}
                  </Badge>
                  {group.isPrivate && (
                    <Badge variant="secondary" className="rounded-md">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl" data-testid="text-group-detail-name">
                  {group.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Study group details for {group.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-medium">About this group</h3>
              </div>
              <p className="text-muted-foreground" data-testid="text-group-detail-description">
                {group.description}
              </p>
            </div>

            {group.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Topics & Focus Areas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="rounded-full"
                      data-testid={`badge-group-detail-tag-${idx}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-medium">
                  Members ({memberCount})
                  {group.maxMembers && ` / ${group.maxMembers} max`}
                </h3>
              </div>
              
              {memberStudents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {memberStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className="flex items-center gap-2 p-2 rounded-lg hover-elevate cursor-pointer bg-muted/50"
                      data-testid={`button-member-${student.id}`}
                    >
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={student.avatar || undefined} alt={student.name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{student.name}</span>
                    </button>
                  ))}
                </div>
              ) : memberCount > 0 ? (
                <div className="flex -space-x-2">
                  {group.members.slice(0, 8).map((_, idx) => (
                    <Avatar key={idx} className="h-10 w-10 border-2 border-background">
                      <AvatarFallback className="text-sm">
                        {String.fromCharCode(65 + idx)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {memberCount > 8 && (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium border-2 border-background">
                      +{memberCount - 8}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members yet. Be the first to join!</p>
              )}
            </div>

            {group.isPrivate && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Private Group</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is a private study group. You'll need to request access to join.
                </p>
              </div>
            )}

            {isLoggedIn && onJoin && (
              <Button
                className="w-full"
                size="lg"
                variant={isMember ? "outline" : "default"}
                onClick={onJoin}
                data-testid="button-group-detail-join"
              >
                {isMember ? "Leave Group" : group.isPrivate ? "Request to Join" : "Join Group"}
              </Button>
            )}

            {!isLoggedIn && (
              <p className="text-center text-sm text-muted-foreground">
                Sign in to join this study group
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <StudentProfileDialog
        student={selectedStudent}
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </>
  );
}
