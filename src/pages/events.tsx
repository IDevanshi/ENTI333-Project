import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/event-card";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import studyImage from "@assets/generated_images/study_group_in_library.png";
import socialImage from "@assets/generated_images/campus_social_event_outdoors.png";
import sportsImage from "@assets/generated_images/students_playing_campus_sports.png";

// Mock events data
const mockEvents = [
  {
    id: "1",
    title: "Study Marathon: Finals Week Prep",
    description: "Join us for an all-day study session at the library. Snacks and coffee provided!",
    date: new Date("2024-12-15T09:00:00"),
    location: "Main Library, 3rd Floor",
    image: studyImage,
    organizerId: "user1",
    category: "Study",
    capacity: 30,
    attendees: ["1", "2", "3", "4", "5"],
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Campus Spring Festival",
    description: "Annual spring celebration with food, music, and activities. Don't miss out!",
    date: new Date("2024-04-20T14:00:00"),
    location: "Central Quad",
    image: socialImage,
    organizerId: "user2",
    category: "Social",
    capacity: 200,
    attendees: ["1", "2", "3", "4", "5", "6", "7", "8"],
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Intramural Basketball Tournament",
    description: "Show your skills! Team up with friends for a friendly basketball competition.",
    date: new Date("2024-03-25T16:00:00"),
    location: "Recreation Center Court A",
    image: sportsImage,
    organizerId: "user3",
    category: "Sports",
    capacity: 40,
    attendees: ["1", "2", "3"],
    createdAt: new Date(),
  },
];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [attendingEvents, setAttendingEvents] = useState<Set<string>>(new Set(["1"]));
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleRSVP = (eventId: string) => {
    const newAttending = new Set(attendingEvents);
    if (newAttending.has(eventId)) {
      newAttending.delete(eventId);
    } else {
      newAttending.add(eventId);
    }
    setAttendingEvents(newAttending);
  };

  const filteredEvents = mockEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-muted-foreground">
            Discover and join events happening around campus
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-event">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
              <div>
                <Label htmlFor="event-title">Event Title</Label>
                <Input id="event-title" placeholder="Spring Concert" data-testid="input-event-title" />
              </div>
              <div>
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Tell people about your event..."
                  rows={3}
                  data-testid="input-event-description"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-date">Date & Time</Label>
                  <Input id="event-date" type="datetime-local" data-testid="input-event-date" />
                </div>
                <div>
                  <Label htmlFor="event-category">Category</Label>
                  <Select>
                    <SelectTrigger id="event-category" data-testid="select-event-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Study" data-testid="option-study">Study</SelectItem>
                      <SelectItem value="Social" data-testid="option-social">Social</SelectItem>
                      <SelectItem value="Sports" data-testid="option-sports">Sports</SelectItem>
                      <SelectItem value="Arts" data-testid="option-arts">Arts</SelectItem>
                      <SelectItem value="Academic" data-testid="option-academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="event-location">Location</Label>
                <Input id="event-location" placeholder="Student Center Room 201" data-testid="input-event-location" />
              </div>
              <div>
                <Label htmlFor="event-capacity">Capacity (Optional)</Label>
                <Input id="event-capacity" type="number" placeholder="50" data-testid="input-event-capacity" />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-event">
                Create Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-events"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-events">All Events</TabsTrigger>
          <TabsTrigger value="attending" data-testid="tab-attending">Attending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isAttending={attendingEvents.has(event.id)}
                  onRSVP={() => toggleRSVP(event.id)}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-events-search">
              No events found matching "{searchQuery}"
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-events">
              No events available. Create the first one!
            </div>
          )}
        </TabsContent>

        <TabsContent value="attending" className="mt-6">
          {filteredEvents.filter(e => attendingEvents.has(e.id)).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents
                .filter(e => attendingEvents.has(e.id))
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isAttending={true}
                    onRSVP={() => toggleRSVP(event.id)}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-attending-events">
              You're not attending any events yet. RSVP to events to see them here.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
