import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { CampusNews } from "@shared/schema";

interface NewsDetailDialogProps {
  news: CampusNews | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsDetailDialog({ 
  news, 
  open, 
  onOpenChange 
}: NewsDetailDialogProps) {
  if (!news) return null;
  
  const newsDate = new Date(news.createdAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Badge variant="secondary" className="rounded-full" data-testid="badge-news-detail-category">
                {news.category}
              </Badge>
              <DialogTitle className="text-2xl" data-testid="text-news-detail-title">
                {news.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                News article: {news.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {news.image && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={news.image}
                alt={news.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span data-testid="text-news-detail-author">By {news.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span data-testid="text-news-detail-date">
                {format(newsDate, "MMMM d, yyyy")}
              </span>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap" data-testid="text-news-detail-content">
              {news.content}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
