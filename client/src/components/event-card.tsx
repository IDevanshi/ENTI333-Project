import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onRSVP?: () => void;
  isAttending?: boolean;
}

export function EventCard({ event, onRSVP, isAttending }: EventCardProps) {
  const eventDate = new Date(event.date);
  const attendeeCount = event.attendees.length;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-event-${event.id}`}>
      <div className="relative aspect-video">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge
          className="absolute left-4 top-4 rounded-md"
          data-testid={`badge-event-date-${event.id}`}
        >
          {format(eventDate, "MMM d")}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-lg line-clamp-2" data-testid={`text-event-title-${event.id}`}>
              {event.title}
            </h3>
            <Badge variant="secondary" className="rounded-full text-xs shrink-0">
              {event.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span data-testid={`text-event-time-${event.id}`}>{format(eventDate, "EEEE, MMMM d 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span data-testid={`text-event-location-${event.id}`}>{event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {event.attendees.slice(0, 3).map((_, idx) => (
                <Avatar key={idx} className="h-8 w-8 border-2 border-card">
                  <AvatarFallback className="text-xs">
                    {String.fromCharCode(65 + idx)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground" data-testid={`text-attendees-${event.id}`}>
              <Users className="h-4 w-4 inline mr-1" />
              {attendeeCount} attending
            </span>
          </div>
        </div>

        {onRSVP && (
          <Button
            className="w-full"
            variant={isAttending ? "outline" : "default"}
            onClick={onRSVP}
            data-testid={`button-rsvp-${event.id}`}
          >
            {isAttending ? "Cancel RSVP" : "RSVP"}
          </Button>
        )}
      </div>
    </Card>
  );
}
