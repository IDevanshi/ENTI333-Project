import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, UserPlus } from "lucide-react";
import type { Student } from "@shared/schema";

interface StudentCardProps {
  student: Student;
  matchScore?: number;
  onConnect?: () => void;
  onMessage?: () => void;
}

export function StudentCard({ student, matchScore, onConnect, onMessage }: StudentCardProps) {
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-student-${student.id}`}>
      <div className="relative aspect-square">
        <Avatar className="h-full w-full rounded-none">
          <AvatarImage src={student.avatar} alt={student.name} />
          <AvatarFallback className="rounded-none text-4xl">{initials}</AvatarFallback>
        </Avatar>
        {matchScore !== undefined && (
          <Badge
            className="absolute right-2 top-2 rounded-full"
            variant="default"
            data-testid={`badge-match-${student.id}`}
          >
            {matchScore}% Match
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg" data-testid={`text-student-name-${student.id}`}>
            {student.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {student.year} • {student.major}
          </p>
        </div>

        {student.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {student.interests.slice(0, 3).map((interest, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="rounded-full text-xs"
                data-testid={`badge-interest-${idx}`}
              >
                {interest}
              </Badge>
            ))}
            {student.interests.length > 3 && (
              <Badge variant="secondary" className="rounded-full text-xs">
                +{student.interests.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {onConnect && (
            <Button
              size="sm"
              className="flex-1"
              onClick={onConnect}
              data-testid={`button-connect-${student.id}`}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Connect
            </Button>
          )}
          {onMessage && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onMessage}
              data-testid={`button-message-${student.id}`}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
