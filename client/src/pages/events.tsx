import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEventSchema, type InsertEvent, type Event } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  capacity: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function Events() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      category: "",
      capacity: "",
    },
  });

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      if (!user?.student?.id) throw new Error("Not authenticated");
      const eventData: InsertEvent = {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        location: data.location,
        category: data.category,
        organizerId: user.student.id,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        attendees: [],
      };
      const response = await apiRequest("POST", "/api/events", eventData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created!",
        description: "Your event has been successfully created.",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event. Please try again.",
      });
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, action }: { eventId: string; action: "add" | "remove" }) => {
      if (!user?.student?.id) throw new Error("Not authenticated");
      const method = action === "add" ? "POST" : "DELETE";
      const response = await apiRequest(method, `/api/events/${eventId}/rsvp`, {
        studentId: user.student.id,
      });
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: variables.action === "add" ? "RSVP confirmed!" : "RSVP cancelled",
        description: variables.action === "add" 
          ? "You're now attending this event."
          : "You've been removed from the attendee list.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
      });
    },
  });

  const handleRSVP = (eventId: string, isAttending: boolean) => {
    rsvpMutation.mutate({
      eventId,
      action: isAttending ? "remove" : "add",
    });
  };

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const filteredEvents = events?.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isAttending = (event: Event) => {
    return user?.student?.id ? event.attendees.includes(user.student.id) : false;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

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
            <Button data-testid="button-create-event" disabled={!user?.student}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Spring Concert" {...field} data-testid="input-event-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell people about your event..."
                          rows={3}
                          {...field}
                          data-testid="input-event-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} data-testid="input-event-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-event-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Study" data-testid="option-study">Study</SelectItem>
                            <SelectItem value="Social" data-testid="option-social">Social</SelectItem>
                            <SelectItem value="Sports" data-testid="option-sports">Sports</SelectItem>
                            <SelectItem value="Arts" data-testid="option-arts">Arts</SelectItem>
                            <SelectItem value="Academic" data-testid="option-academic">Academic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Student Center Room 201" {...field} data-testid="input-event-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} data-testid="input-event-capacity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createEventMutation.isPending}
                  data-testid="button-submit-event"
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </Form>
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
                  isAttending={isAttending(event)}
                  onRSVP={() => handleRSVP(event.id, isAttending(event))}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-events-search">
              No events found matching "{searchQuery}"
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4" data-testid="empty-events">
                Be the first to create an event!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attending" className="mt-6">
          {filteredEvents.filter(e => isAttending(e)).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents
                .filter(e => isAttending(e))
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isAttending={true}
                    onRSVP={() => handleRSVP(event.id, true)}
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
