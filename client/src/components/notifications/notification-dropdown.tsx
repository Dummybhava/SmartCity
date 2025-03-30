import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Mark a notification as read
  const markAsRead = async (id: number) => {
    try {
      await apiRequest("PUT", `/api/notifications/${id}/read`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  // Mark all notifications as read when dropdown is opened
  useEffect(() => {
    if (isDropdownOpen && unreadCount > 0) {
      const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.read);
        
        for (const notification of unreadNotifications) {
          try {
            await markAsRead(notification.id);
          } catch (error) {
            console.error(`Error marking notification ${notification.id} as read:`, error);
          }
        }
      };
      
      // Wait a bit before marking as read to allow user to see which ones were unread
      const timeoutId = setTimeout(() => {
        markAllAsRead();
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isDropdownOpen, notifications, unreadCount]);

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" 
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t('notifications.title')}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>{t('notifications.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('notifications.empty')}
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className="flex flex-col items-start py-3 px-4 focus:bg-accent cursor-default"
                >
                  <div className="flex w-full">
                    <div className="flex-shrink-0 mr-2">
                      <div 
                        className={`h-2 w-2 rounded-full mt-1.5 ${
                          notification.read ? 'bg-gray-300' : 'bg-primary'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center text-sm text-primary">
          {t('notifications.viewAll')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
