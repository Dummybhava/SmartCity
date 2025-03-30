import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/page-container";
import { Event } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, CalendarDays, Clock, Info, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter events based on search query and time filter
  const filteredEvents = events?.filter((event) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Time filter
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    
    const eventDate = new Date(event.startDate);
    
    let matchesTimeFilter = true;
    if (timeFilter === "today") {
      matchesTimeFilter = eventDate.toDateString() === today.toDateString();
    } else if (timeFilter === "week") {
      matchesTimeFilter = eventDate >= today && eventDate <= nextWeek;
    } else if (timeFilter === "month") {
      matchesTimeFilter = eventDate >= today && eventDate <= nextMonth;
    }
    
    return matchesSearch && matchesTimeFilter;
  })?.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <PageContainer title="Events">
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-shrink-0">
            <Tabs defaultValue="all" onValueChange={setTimeFilter}>
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredEvents && filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? 
              `No events match "${searchQuery}"${timeFilter !== "all" ? ` in the selected time period` : ''}` : 
              `No events available${timeFilter !== "all" ? ` in the selected time period` : ''}.`}
          </p>
        </div>
      )}
    </PageContainer>
  );
}

function EventCard({ event }: { event: Event }) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const isUpcoming = startDate > new Date();
  const isOngoing = startDate <= new Date() && endDate >= new Date();
  const isPast = endDate < new Date();
  
  let statusBadge = null;
  if (isUpcoming) {
    statusBadge = <Badge className="bg-primary">Upcoming</Badge>;
  } else if (isOngoing) {
    statusBadge = <Badge className="bg-secondary">Ongoing</Badge>;
  } else if (isPast) {
    statusBadge = <Badge variant="outline">Past</Badge>;
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {event.imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{event.title}</CardTitle>
          {statusBadge}
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {event.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>{format(startDate, 'PPP')}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span>{format(startDate, 'p')} - {format(endDate, 'p')}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full" disabled={isPast}>
          {isPast ? "Event Ended" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}
