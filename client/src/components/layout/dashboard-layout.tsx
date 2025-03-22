import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar onMobileMenuOpen={() => setIsMobileMenuOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 md:p-6 p-4 pt-20 md:pt-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
