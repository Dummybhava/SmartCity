import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Clock, 
  Calendar, 
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

// Sample activity data (normally would come from an API)
const activities = [
  {
    id: 1,
    type: "profile",
    content: "You updated your profile information",
    icon: <User className="h-5 w-5 text-white" />,
    iconBg: "bg-primary",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    type: "transportation",
    content: "You booked a shuttle service",
    icon: <Clock className="h-5 w-5 text-white" />,
    iconBg: "bg-secondary",
    time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 3,
    type: "event",
    content: "You RSVP'd to the Smart City Tech Conference",
    icon: <Calendar className="h-5 w-5 text-white" />,
    iconBg: "bg-accent",
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 4,
    type: "feedback",
    content: "You submitted a feedback for the Smart City app",
    icon: <MessageSquare className="h-5 w-5 text-white" />,
    iconBg: "bg-gray-400",
    time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
];

export default function ActivityTimeline() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white px-4 py-5 sm:p-6">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center ring-8 ring-white`}>
                        {activity.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {activity.content}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={activity.time.toISOString()}>
                          {formatDistanceToNow(activity.time, { addSuffix: true })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
