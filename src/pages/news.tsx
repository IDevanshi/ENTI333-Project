import { useState } from "react";
import { Input } from "@/components/ui/input";
import { NewsCard } from "@/components/news-card";
import { NewsDetailDialog } from "@/components/news-detail-dialog";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CampusNews } from "@shared/schema";
import socialImage from "@assets/generated_images/campus_social_event_outdoors.png";
import studyImage from "@assets/generated_images/study_group_in_library.png";

// Mock news data
const mockNews: CampusNews[] = [
  {
    id: "1",
    title: "Spring Registration Opens Next Week",
    content: "Course registration for the Spring semester will open on Monday, November 27th at 8:00 AM. Make sure to meet with your academic advisor before registering. Early registration helps ensure you get the classes you need!",
    image: "",
    author: "Academic Affairs",
    category: "Academic",
    createdAt: new Date("2024-01-14T10:00:00"),
  },
  {
    id: "2",
    title: "New Study Spaces Available in Library",
    content: "The library has opened three new collaborative study rooms on the 2nd floor. These rooms are equipped with whiteboards, projectors, and comfortable seating. Reserve your spot through the library portal!",
    image: studyImage,
    author: "Campus Services",
    category: "Campus Life",
    createdAt: new Date("2024-01-13T14:30:00"),
  },
  {
    id: "3",
    title: "Annual Career Fair Next Month",
    content: "Don't miss the Spring Career Fair on February 15th! Over 100 companies will be attending, looking to hire interns and full-time positions. Polish your resume and practice your elevator pitch. Business casual attire recommended.",
    image: "",
    author: "Career Center",
    category: "Event",
    createdAt: new Date("2024-01-12T09:00:00"),
  },
  {
    id: "4",
    title: "Campus Sustainability Initiative Launches",
    content: "The university is proud to announce a new campus-wide sustainability program. New recycling bins, composting stations, and water refill stations are being installed across campus. Join the Green Team to get involved!",
    image: socialImage,
    author: "Sustainability Office",
    category: "Announcement",
    createdAt: new Date("2024-01-11T11:15:00"),
  },
];

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedNews, setSelectedNews] = useState<CampusNews | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const filteredNews = mockNews.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Campus News</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest announcements and campus updates
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search news..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testid="input-search-news"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-news">All</TabsTrigger>
          <TabsTrigger value="Academic" data-testid="tab-academic">Academic</TabsTrigger>
          <TabsTrigger value="Event" data-testid="tab-event">Events</TabsTrigger>
          <TabsTrigger value="Campus Life" data-testid="tab-campus">Campus Life</TabsTrigger>
          <TabsTrigger value="Announcement" data-testid="tab-announcement">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((news) => (
                <NewsCard 
                  key={news.id} 
                  news={news}
                  onClick={() => {
                    setSelectedNews(news);
                    setDetailDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-news-search">
              No news found matching "{searchQuery}"
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-news">
              No news articles available in this category
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewsDetailDialog
        news={selectedNews}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
