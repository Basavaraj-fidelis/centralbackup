import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Server,
  FileArchive,
  AlertTriangle,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

type SideNavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
};

function SideNavItem({ href, icon, children, active }: SideNavItemProps) {
  return (
    <div>
      <Link href={href}>
        <div
          className={cn(
            "flex items-center px-4 py-2.5 cursor-pointer",
            active ? "sidebar-active" : "sidebar-inactive"
          )}
        >
          <span className="mr-3">{icon}</span>
          {children}
        </div>
      </Link>
    </div>
  );
}

interface SidebarProps {
  isMobile?: boolean;
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={cn(
      "w-56 bg-card border-r border-border flex flex-col",
      isMobile ? "h-full" : "h-screen"
    )}>
      {/* Logo */}
      <div className="p-4 flex items-center border-b border-border">
        <div className="p-2 bg-primary rounded-md mr-2">
          <span className="text-white font-semibold">D</span>
        </div>
        <span className="text-xl font-semibold">Duplicati</span>
      </div>
      
      {/* Navigation */}
      <div className="flex-grow py-3">
        <SideNavItem 
          href="/" 
          icon={<LayoutDashboard className="h-5 w-5" />}
          active={location === "/"}
        >
          Dashboard
        </SideNavItem>
        
        <SideNavItem 
          href="/machines" 
          icon={<Server className="h-5 w-5" />}
          active={location === "/machines"}
        >
          Machines
        </SideNavItem>
        
        <SideNavItem 
          href="/backups" 
          icon={<FileArchive className="h-5 w-5" />}
          active={location === "/backups"}
        >
          Backups
        </SideNavItem>
        
        <SideNavItem 
          href="/alerts" 
          icon={<AlertTriangle className="h-5 w-5" />}
          active={location === "/alerts"}
        >
          Alerts
        </SideNavItem>
        
        <SideNavItem 
          href="/settings" 
          icon={<Settings className="h-5 w-5" />}
          active={location === "/settings"}
        >
          Settings
        </SideNavItem>
      </div>
      
      {/* Support */}
      <div className="mt-auto border-t border-border p-4">
        <SideNavItem 
          href="/get-started" 
          icon={<HelpCircle className="h-5 w-5" />}
          active={location === "/get-started"}
        >
          Support
        </SideNavItem>
        
        <div className="px-4 py-2.5 flex items-center justify-between">
          <Label htmlFor="dark-mode" className="text-muted-foreground text-sm">
            Dark Mode
          </Label>
          <Switch
            id="dark-mode"
            checked={theme === "dark"}
            onCheckedChange={handleThemeChange}
          />
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-2.5 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
      
      {/* User Info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <span>{user?.firstName?.[0] || 'U'}</span>
          </div>
          <div>
            <div className="text-sm font-medium">{user?.organization || 'My Organization'}</div>
            <div className="text-xs text-muted-foreground">Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}
