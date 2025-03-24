import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={cn("hidden md:flex md:flex-col md:w-64 bg-white border-r border-neutral-200 shadow-sm", className)}>
      {/* Logo Section */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <i className="ri-stack-line text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-semibold text-neutral-800">PriorityPro</h1>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col py-4 px-3 space-y-1 overflow-y-auto">
        <Link href="/">
          <a className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            isActive("/") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}>
            <i className="ri-layout-grid-line text-lg mr-3"></i>
            Dashboard
          </a>
        </Link>
        
        <Link href="/features">
          <a className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            isActive("/features") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}>
            <i className="ri-list-check text-lg mr-3"></i>
            Feature Requests
          </a>
        </Link>

        <Link href="/matrix">
          <a className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            isActive("/matrix") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}>
            <i className="ri-bubble-chart-line text-lg mr-3"></i>
            Prioritization Matrix
          </a>
        </Link>

        <Link href="/collaboration">
          <a className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            isActive("/collaboration") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}>
            <i className="ri-team-line text-lg mr-3"></i>
            Collaboration
          </a>
        </Link>

        <Link href="/reports">
          <a className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            isActive("/reports") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}>
            <i className="ri-pie-chart-line text-lg mr-3"></i>
            Reports
          </a>
        </Link>

        <Link href="/settings">
          <a className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            isActive("/settings") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}>
            <i className="ri-settings-line text-lg mr-3"></i>
            Settings
          </a>
        </Link>

        {/* Integrations Section */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            INTEGRATIONS
          </h3>
          <div className="mt-3 space-y-1">
            <Link href="/integrations/jira">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive("/integrations/jira") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}>
                <i className="ri-file-list-line text-lg mr-3"></i>
                Jira
              </a>
            </Link>
            <Link href="/integrations/monday">
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive("/integrations/monday") ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}>
                <i className="ri-calendar-line text-lg mr-3"></i>
                Monday
              </a>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback>
              {user && user.name ? user.name.substring(0, 2).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-800">{user?.name}</p>
            <p className="text-xs text-neutral-500">{user?.role}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto text-neutral-400 hover:text-neutral-800"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
