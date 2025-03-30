import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Bus, 
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Icons
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ 
  className, 
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "Attractions",
      href: "/attractions",
      icon: <MapPin className="h-5 w-5" />
    },
    {
      title: "Events",
      href: "/events",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "Transportation",
      href: "/transportation",
      icon: <Bus className="h-5 w-5" />
    },
    {
      title: "Feedback",
      href: "/feedback",
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      title: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Mobile sidebar overlay
  if (isMobileOpen) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-800/60 backdrop-blur-sm"
          onClick={onMobileClose}
        />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center border-b px-4">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.3L20 9l-8 4-8-4 8-4.7zm0 16.4l-8-4V9.7l8 4 8-4v8.3l-8 4z"></path>
              </svg>
              <span className="ml-2 text-xl font-heading font-bold text-primary">Smart City</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={onMobileClose}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                >
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      location === item.href
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.name?.charAt(0) || user?.username?.charAt(0) ? (
                  <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center uppercase font-semibold">
                    {user?.name?.charAt(0) || user?.username?.charAt(0)}
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gray-200" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || user?.username}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-primary hover:text-primary-dark flex items-center"
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular sidebar for desktop
  return (
    <div
      className={cn(
        "hidden fixed inset-y-0 lg:flex flex-col border-r bg-white transition-all duration-300 ease-in-out z-30",
        collapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      <div className={cn("flex h-16 items-center border-b px-4", 
        collapsed && "justify-center"
      )}>
        <div className="flex items-center">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.3L20 9l-8 4-8-4 8-4.7zm0 16.4l-8-4V9.7l8 4 8-4v8.3l-8 4z"></path>
          </svg>
          {!collapsed && (
            <span className="ml-2 text-xl font-heading font-bold text-primary">Smart City</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", collapsed && "ml-0 mt-4")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
          <span className="sr-only">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
            >
              <a
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  collapsed ? "justify-center" : "",
                  location === item.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                title={collapsed ? item.title : undefined}
              >
                {item.icon}
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {user?.name?.charAt(0) || user?.username?.charAt(0) ? (
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center uppercase font-semibold">
                  {user?.name?.charAt(0) || user?.username?.charAt(0)}
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-gray-200" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {user?.name || user?.username}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-primary hover:text-primary-dark flex items-center"
              >
                <LogOut className="mr-1 h-3 w-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
      
      {collapsed && (
        <div className="border-t p-2 flex justify-center">
          <button
            onClick={handleLogout}
            className="p-2 text-primary hover:text-primary-dark hover:bg-gray-100 rounded-full"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
