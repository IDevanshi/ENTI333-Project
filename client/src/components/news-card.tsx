import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper } from "lucide-react";
import { format } from "date-fns";
import type { CampusNews } from "@shared/schema";

interface NewsCardProps {
  news: CampusNews;
}

export function NewsCard({ news }: NewsCardProps) {
  const newsDate = new Date(news.createdAt);

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-news-${news.id}`}>
      {news.image && (
        <div className="relative aspect-[4/3]">
          <img
            src={news.image}
            alt={news.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="rounded-full text-xs" data-testid={`badge-news-category-${news.id}`}>
            {news.category}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`text-news-date-${news.id}`}>
            {format(newsDate, "MMM d, yyyy")}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-xl mb-2" data-testid={`text-news-title-${news.id}`}>
            {news.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {news.content}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
          <Newspaper className="h-4 w-4" />
          <span data-testid={`text-news-author-${news.id}`}>By {news.author}</span>
        </div>
      </div>
    </Card>
  );
}
