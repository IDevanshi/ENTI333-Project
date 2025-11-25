import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Users, Lock, BookOpen } from "lucide-react";
import type { StudyGroup } from "@shared/schema";

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
  isLoggedIn = false 
}: StudyGroupDetailDialogProps) {
  if (!group) return null;
  
  const memberCount = group.members.length;
  const spotsLeft = group.maxMembers ? group.maxMembers - memberCount : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
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
          {group.image && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={group.image}
                alt={group.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              About this group
            </h4>
            <p className="text-muted-foreground" data-testid="text-group-detail-description">
              {group.description}
            </p>
          </div>

          {group.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Topics</h4>
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

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 6).map((_, idx) => (
                    <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {String.fromCharCode(65 + idx)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-medium" data-testid="text-group-detail-members">
                    {memberCount}
                  </span>
                  <span className="text-muted-foreground"> {memberCount === 1 ? "member" : "members"}</span>
                  {group.maxMembers && (
                    <span className="text-muted-foreground"> / {group.maxMembers} max</span>
                  )}
                </div>
              </div>
              {spotsLeft !== null && spotsLeft > 0 && (
                <Badge variant="outline" className="rounded-full">
                  {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                </Badge>
              )}
            </div>
          </div>

          {isLoggedIn && onJoin && (
            <Button
              className="w-full"
              variant={isMember ? "outline" : "default"}
              onClick={onJoin}
              data-testid="button-group-detail-join"
            >
              {isMember ? "Leave Group" : group.isPrivate ? "Request to Join" : "Join Group"}
            </Button>
          )}

          {!isLoggedIn && (
            <p className="text-center text-sm text-muted-foreground">
              Log in to join this study group
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
