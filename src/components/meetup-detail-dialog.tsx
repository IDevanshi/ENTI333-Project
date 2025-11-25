import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Coffee, Book, Dumbbell, Utensils, Clock, Star, Users } from "lucide-react";

interface MeetupLocation {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  popular: boolean;
}

interface MeetupDetailDialogProps {
  location: MeetupLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  study: Book,
  café: Coffee,
  recreation: Dumbbell,
  dining: Utensils,
};

const typeDetails = {
  study: {
    hours: "7:00 AM - 11:00 PM",
    capacity: "Up to 50 people",
    amenities: ["Free WiFi", "Power outlets", "Quiet environment", "Individual study spaces"]
  },
  café: {
    hours: "7:30 AM - 9:00 PM",
    capacity: "Up to 30 people",
    amenities: ["Free WiFi", "Coffee & snacks", "Comfortable seating", "Background music"]
  },
  recreation: {
    hours: "6:00 AM - 10:00 PM",
    capacity: "Varies by activity",
    amenities: ["Equipment provided", "Locker rooms", "Water fountains", "Sports facilities"]
  },
  dining: {
    hours: "7:00 AM - 8:00 PM",
    capacity: "Up to 200 people",
    amenities: ["Multiple cuisines", "Meal plans accepted", "Microwave available", "Large seating area"]
  }
};

export function MeetupDetailDialog({ 
  location, 
  open, 
  onOpenChange 
}: MeetupDetailDialogProps) {
  if (!location) return null;
  
  const Icon = typeIcons[location.type as keyof typeof typeIcons] || MapPin;
  const details = typeDetails[location.type as keyof typeof typeDetails] || typeDetails.study;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl" data-testid="text-meetup-detail-title">
                  {location.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Details for {location.name}
                </DialogDescription>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full capitalize">
                    {location.type}
                  </Badge>
                  {location.popular && (
                    <Badge variant="default" className="rounded-full">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">About this location</h3>
            <p className="text-muted-foreground" data-testid="text-meetup-detail-description">
              {location.description}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <span data-testid="text-meetup-detail-address">{location.address}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Hours</span>
              </div>
              <p className="text-sm text-muted-foreground">{details.hours}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Capacity</span>
              </div>
              <p className="text-sm text-muted-foreground">{details.capacity}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {details.amenities.map((amenity, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="rounded-full"
                  data-testid={`badge-amenity-${index}`}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">
              This is a great spot for meeting up with fellow students. 
              {location.type === "study" && " Perfect for focused study sessions and group projects."}
              {location.type === "café" && " Ideal for casual conversations and coffee breaks between classes."}
              {location.type === "recreation" && " Great for unwinding and staying active with friends."}
              {location.type === "dining" && " A convenient place to grab a meal and catch up with classmates."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
