import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Users, Lock } from "lucide-react";
import type { StudyGroup } from "@shared/schema";

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoin?: () => void;
  isMember?: boolean;
  onClick?: () => void;
}

export function StudyGroupCard({ group, onJoin, isMember, onClick }: StudyGroupCardProps) {
  const memberCount = group.members.length;

  return (
    <Card 
      className="p-6 space-y-4 hover-elevate cursor-pointer" 
      data-testid={`card-group-${group.id}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="rounded-md" data-testid={`badge-course-${group.id}`}>
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
          <h3 className="font-semibold text-lg mb-1" data-testid={`text-group-name-${group.id}`}>
            {group.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        </div>
      </div>

      {group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {group.tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="rounded-full text-xs"
              data-testid={`badge-tag-${idx}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 5).map((_, idx) => (
              <Avatar key={idx} className="h-8 w-8 border-2 border-card">
                <AvatarFallback className="text-xs">
                  {String.fromCharCode(65 + idx)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground" data-testid={`text-members-${group.id}`}>
            <Users className="h-4 w-4 inline mr-1" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
            {group.maxMembers && ` / ${group.maxMembers}`}
          </span>
        </div>

        {onJoin && (
          <Button
            size="sm"
            variant={isMember ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            data-testid={`button-join-${group.id}`}
          >
            {isMember ? "Leave" : group.isPrivate ? "Request" : "Join"}
          </Button>
        )}
      </div>
    </Card>
  );
}
