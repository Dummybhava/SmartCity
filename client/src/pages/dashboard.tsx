import { useAuth } from "@/hooks/use-auth";
import PageContainer from "@/components/layout/page-container";
import QuickAccessCard from "@/components/dashboard/quick-access-card";
import ActivityTimeline from "@/components/dashboard/activity-timeline";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import CityMap from "@/components/dashboard/city-map";
import { MapIcon, Calendar, Building, Bus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const upcomingEvents = events?.slice(0, 4).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <PageContainer title="Dashboard">
      {/* Welcome Card */}
      <div className="bg-white shadow rounded-lg my-6">
        <div className="bg-primary px-4 py-5 sm:px-6 flex items-center justify-between rounded-t-lg">
          <div>
            <h3 className="text-lg leading-6 font-medium text-white">
              Welcome to Smart City, {user?.name || user?.username}!
            </h3>
            <p className="text-sm text-primary-light mt-1">
              Your smart guide to navigate around the city
            </p>
          </div>
          <div className="hidden md:block">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Take a Tour
            </button>
          </div>
        </div>
        
        <div className="bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Access Cards */}
            <QuickAccessCard
              title="Popular Attractions"
              value="12 New Places"
              icon={<Building className="h-6 w-6 text-white" />}
              iconBgColor="bg-primary"
              linkText="View all attractions"
              linkHref="/attractions"
            />
            
            <QuickAccessCard
              title="Upcoming Events"
              value={`${upcomingEvents?.length || 0} This Week`}
              icon={<Calendar className="h-6 w-6 text-white" />}
              iconBgColor="bg-accent"
              linkText="View all events"
              linkHref="/events"
            />
            
            <QuickAccessCard
              title="Transportation"
              value="Real-time Tracking"
              icon={<Bus className="h-6 w-6 text-white" />}
              iconBgColor="bg-secondary"
              linkText="View transportation options"
              linkHref="/transportation"
            />
          </div>
        </div>
      </div>

      {/* City Map */}
      <CityMap />

      {/* Activity Timeline and Upcoming Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        <ActivityTimeline />
        <UpcomingEvents events={upcomingEvents || []} />
      </div>
    </PageContainer>
  );
}
