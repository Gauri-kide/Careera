import { Event } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building, Tag } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
  showRegisteredBadge?: boolean;
}

export function EventCard({ event, showStatus = true, showRegisteredBadge = false }: EventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
      case "deadline_soon": return "bg-amber-500/15 text-amber-700 border-amber-500/30";
      case "closed": return "bg-slate-500/15 text-slate-700 border-slate-500/30";
      case "cancelled": return "bg-red-500/15 text-red-700 border-red-500/30";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-border/60">
      <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary" />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="font-display font-bold text-xl text-foreground line-clamp-2">
            {event.name}
          </h3>
          <div className="flex flex-col gap-1 items-end shrink-0">
            {showStatus && (
              <Badge variant="outline" className={`whitespace-nowrap capitalize ${getStatusColor(event.status)}`}>
                {event.status.replace("_", " ")}
              </Badge>
            )}
            {showRegisteredBadge && (
              <Badge variant="outline" className="whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                ✓ Registered
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6 flex-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{event.organizationName || event.organizerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>{event.collegeName} • {event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(new Date(event.eventDate), "MMM d, yyyy • h:mm a")}</span>
          </div>
          
          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {event.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/20">
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{event.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="font-semibold text-foreground">
            {event.fees && event.fees > 0 ? `$${event.fees}` : "Free"}
          </div>
          <Link href={`/events/${event.id}`}>
            <Button variant="default" className="shadow-lg shadow-primary/20">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
