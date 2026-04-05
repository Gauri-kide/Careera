import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Settings, User as UserIcon, Calendar, Megaphone, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "user" | "organizer" | "admin";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe();
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== role) {
    setLocation("/login");
    return null;
  }

  const getNavItems = () => {
    if (role === "admin") {
      return [
        { label: "Overview", icon: LayoutDashboard, href: "/admin" },
      ];
    }
    if (role === "organizer") {
      return [
        { label: "Dashboard", icon: LayoutDashboard, href: "/organizer" },
      ];
    }
    return [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ];
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-72 bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl z-10 hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-cyan-300 flex items-center justify-center shadow-lg">
              <span className="font-display font-bold text-xl text-primary-foreground">C</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Careera</span>
          </Link>
          <div className="mt-4 px-3 py-2 bg-sidebar-accent/50 rounded-lg border border-sidebar-border/50">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {getNavItems().map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/50">
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="font-display font-bold text-white">C</span>
            </div>
            <span className="font-display font-bold text-xl">Careera</span>
          </div>
          <button onClick={() => logoutMutation.mutate()} className="p-2 bg-sidebar-accent rounded-lg">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
