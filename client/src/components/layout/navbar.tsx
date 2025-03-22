import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, HelpCircle, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMobileMenuOpen?: () => void;
}

export function Navbar({ onMobileMenuOpen }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-neutral-200 h-16 flex items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="h-16 flex items-center px-4 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <i className="ri-stack-line text-white text-lg"></i>
                </div>
                <h1 className="text-lg font-semibold text-neutral-800">PriorityPro</h1>
              </div>
            </div>
            
            <nav className="flex-1 flex flex-col py-4 px-3 space-y-1">
              <Link href="/">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive("/") ? "bg-primary/10 text-primary" : "text-neutral-800 hover:bg-neutral-100"
                )}>
                  <i className="ri-dashboard-line text-lg mr-3"></i>
                  Dashboard
                </a>
              </Link>
              <Link href="/features">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive("/features") ? "bg-primary/10 text-primary" : "text-neutral-800 hover:bg-neutral-100"
                )}>
                  <i className="ri-list-check-2 text-lg mr-3"></i>
                  Feature Requests
                </a>
              </Link>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-800 hover:bg-neutral-100">
                <i className="ri-bubble-chart-line text-lg mr-3"></i>
                Prioritization Matrix
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-800 hover:bg-neutral-100">
                <i className="ri-team-line text-lg mr-3"></i>
                Collaboration
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-800 hover:bg-neutral-100">
                <i className="ri-pie-chart-line text-lg mr-3"></i>
                Reports
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-800 hover:bg-neutral-100">
                <i className="ri-settings-line text-lg mr-3"></i>
                Settings
              </a>
              
              <div className="border-t border-neutral-200 mt-6 pt-6">
                <span className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Account
                </span>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center px-3 py-2">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>
                        {user?.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-neutral-500">{user?.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="ml-4 flex items-center space-x-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <i className="ri-stack-line text-white text-lg"></i>
          </div>
          <h1 className="text-lg font-semibold text-neutral-800">PriorityPro</h1>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Desktop Navbar */}
      <header className="hidden md:flex h-16 bg-white border-b border-neutral-200 items-center px-6">
        <div className="flex-1 flex">
          <div className={cn(
            "relative max-w-md w-full transition-all duration-200",
            isSearchFocused ? "ring-2 ring-primary rounded-md" : ""
          )}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Search feature requests..." 
              className="pl-10 py-2 border border-neutral-200 rounded-md text-sm placeholder-neutral-400 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary"></span>
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <div className="flex items-center text-sm font-medium text-neutral-800 hover:text-primary">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>
                {user?.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{user?.name}</span>
            <i className="ri-arrow-down-s-line ml-1"></i>
          </div>
        </div>
      </header>
    </>
  );
}
