import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Coffee, Book, Dumbbell, Utensils } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock meetup locations
const mockLocations = [
  {
    id: "1",
    name: "Main Library - Quiet Floor",
    type: "study",
    description: "Perfect for focused studying and research",
    address: "Building A, 3rd Floor",
    popular: true,
  },
  {
    id: "2",
    name: "Campus Coffee House",
    type: "café",
    description: "Great coffee and casual atmosphere for group discussions",
    address: "Student Center, Ground Floor",
    popular: true,
  },
  {
    id: "3",
    name: "Recreation Center",
    type: "recreation",
    description: "Basketball courts, gym, and fitness classes",
    address: "West Campus, Near Stadium",
    popular: false,
  },
  {
    id: "4",
    name: "Student Union Study Lounge",
    type: "study",
    description: "Collaborative study space with whiteboards",
    address: "Student Union, 2nd Floor",
    popular: false,
  },
  {
    id: "5",
    name: "The Green Café",
    type: "café",
    description: "Outdoor seating and healthy food options",
    address: "Central Quad, East Side",
    popular: true,
  },
  {
    id: "6",
    name: "Campus Dining Hall",
    type: "dining",
    description: "Variety of meal options and large seating areas",
    address: "North Campus, Main Building",
    popular: false,
  },
  {
    id: "7",
    name: "Outdoor Amphitheater",
    type: "recreation",
    description: "Open-air venue for events and casual meetups",
    address: "South Campus, Green Space",
    popular: false,
  },
];

const typeIcons = {
  study: Book,
  café: Coffee,
  recreation: Dumbbell,
  dining: Utensils,
};

export default function Meetups() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Campus Meetup Spots</h1>
        <p className="text-muted-foreground">
          Discover the best places to meet, study, and hang out on campus
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-locations">All Locations</TabsTrigger>
          <TabsTrigger value="popular" data-testid="tab-popular">Popular</TabsTrigger>
          <TabsTrigger value="study" data-testid="tab-study-spots">Study Spots</TabsTrigger>
          <TabsTrigger value="café" data-testid="tab-cafes">Cafés</TabsTrigger>
          <TabsTrigger value="recreation" data-testid="tab-recreation">Recreation</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLocations.map((location) => {
              const Icon = typeIcons[location.type as keyof typeof typeIcons];
              return (
                <Card
                  key={location.id}
                  className="p-6 hover-elevate"
                  data-testid={`card-location-${location.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold" data-testid={`text-location-name-${location.id}`}>
                          {location.name}
                        </h3>
                      </div>
                    </div>
                    {location.popular && (
                      <Badge variant="default" className="rounded-full text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {location.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{location.address}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="secondary" className="rounded-full text-xs capitalize">
                      {location.type}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLocations
              .filter((loc) => loc.popular)
              .map((location) => {
                const Icon = typeIcons[location.type as keyof typeof typeIcons];
                return (
                  <Card key={location.id} className="p-6 hover-elevate">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">{location.name}</h3>
                      </div>
                      <Badge variant="default" className="rounded-full text-xs">
                        Popular
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {location.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{location.address}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Badge variant="secondary" className="rounded-full text-xs capitalize">
                        {location.type}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        {["study", "café", "recreation"].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLocations
                .filter((loc) => loc.type === type)
                .map((location) => {
                  const Icon = typeIcons[location.type as keyof typeof typeIcons];
                  return (
                    <Card key={location.id} className="p-6 hover-elevate">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold">{location.name}</h3>
                        </div>
                        {location.popular && (
                          <Badge variant="default" className="rounded-full text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {location.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{location.address}</span>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
