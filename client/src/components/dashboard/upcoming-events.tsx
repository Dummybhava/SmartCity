import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin } from "lucide-react";

interface UpcomingEventsProps {
  events: Event[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">
            Upcoming Events
          </CardTitle>
        </div>
        <div>
          <Link href="/events">
            <a className="text-sm text-primary hover:text-primary-dark">View all</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="bg-white px-4 py-5 sm:p-6">
        {events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No upcoming events</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {events.map((event) => {
              const startDate = new Date(event.startDate);
              const endDate = new Date(event.endDate);
              const isToday = new Date().toDateString() === startDate.toDateString();
              
              return (
                <li key={event.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md bg-primary flex flex-col items-center justify-center text-white text-center">
                      <span className="font-bold text-sm">{format(startDate, 'dd')}</span>
                      <span className="text-xs">{format(startDate, 'MMM')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div>
                      <Button
                        variant={isToday ? "default" : "outline"}
                        size="sm"
                      >
                        {isToday ? "RSVP" : "Details"}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
