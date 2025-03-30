import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface QuickAccessCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  linkText: string;
  linkHref: string;
  className?: string;
}

export default function QuickAccessCard({
  title,
  value,
  icon,
  iconBgColor,
  linkText,
  linkHref,
  className,
}: QuickAccessCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3">
        <Link href={linkHref}>
          <a className="group text-sm font-medium text-primary hover:text-primary-dark flex items-center">
            {linkText}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
