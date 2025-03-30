import { ReactNode, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export default function PageContainer({
  children,
  title,
  description,
  className,
}: PageContainerProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
      
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      <main className="flex-1 lg:ml-64 pt-6 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          
          <div className={cn("mt-6", className)}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
