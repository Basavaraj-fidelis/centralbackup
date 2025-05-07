import { ReactNode, useState } from "react";
import Sidebar from "@/components/sidebar";
import { MobileMenu } from "@/components/ui/sheet";
import { Menu, Search, Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const handleAddMachine = () => {
    navigate("/get-started");
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <Sidebar isMobile />
      </MobileMenu>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-[200px]"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>

            <Button
              size="sm"
              className="hidden sm:flex items-center gap-1"
              onClick={handleAddMachine}
            >
              <PlusCircle className="h-4 w-4" />
              Add Machine
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-muted overflow-y-auto flex-1 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
