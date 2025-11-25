import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

interface EventDetailDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRSVP?: () => void;
  isAttending?: boolean;
  isLoggedIn?: boolean;
}

export function EventDetailDialog({ 
  event, 
  open, 
  onOpenChange, 
  onRSVP, 
  isAttending,
  isLoggedIn = true
}: EventDetailDialogProps) {
  if (!event) return null;
  
  const eventDate = new Date(event.date);
  const attendeeCount = event.attendees.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Badge variant="secondary" className="rounded-full" data-testid="badge-event-detail-category">
                {event.category}
              </Badge>
              <DialogTitle className="text-2xl" data-testid="text-event-detail-title">
                {event.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Event details for {event.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {event.image && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium" data-testid="text-event-detail-date">
                  {format(eventDate, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium" data-testid="text-event-detail-time">
                  {format(eventDate, "h:mm a")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium" data-testid="text-event-detail-location">{event.location}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">About this event</h3>
            <p className="text-muted-foreground" data-testid="text-event-detail-description">
              {event.description}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {event.attendees.slice(0, 5).map((_, idx) => (
                    <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {String.fromCharCode(65 + idx)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-event-detail-attendees">
                  <Users className="h-4 w-4 inline mr-1" />
                  {attendeeCount} {attendeeCount === 1 ? "person" : "people"} attending
                  {event.capacity && ` (${event.capacity - attendeeCount} spots left)`}
                </span>
              </div>
            </div>
          </div>

          {isLoggedIn && onRSVP && (
            <Button
              className="w-full"
              size="lg"
              variant={isAttending ? "outline" : "default"}
              onClick={onRSVP}
              data-testid="button-event-detail-rsvp"
            >
              {isAttending ? "Cancel RSVP" : "RSVP to this Event"}
            </Button>
          )}

          {!isLoggedIn && (
            <p className="text-center text-sm text-muted-foreground">
              Sign in to RSVP to this event
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
