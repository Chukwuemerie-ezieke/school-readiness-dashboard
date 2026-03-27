import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  FileText,
  Moon,
  Sun,
  Menu,
  X,
  School,
  Users,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HarmonyFooter } from "@/components/HarmonyFooter";
import { useAuth } from "@/lib/auth-context";
import { useLocation as useWouterLocation } from "wouter";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles?: Array<"admin" | "consultant" | "school">;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/schools", label: "Schools", icon: School, roles: ["admin", "consultant"] },
  { path: "/admin/users", label: "Users", icon: Users, roles: ["admin"] },
  { path: "/assess", label: "Assessment", icon: ClipboardCheck, roles: ["admin", "consultant"] },
  { path: "/results", label: "Results", icon: BarChart3 },
  { path: "/report", label: "Report", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
];

function HexLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Harmony Digital Consults Logo"
    >
      <path
        d="M20 2L36.5 11.5V30.5L20 40L3.5 30.5V11.5L20 2Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M14 15V29M26 15V29M14 22H26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getRoleBadgeClass(role: string): string {
  if (role === "admin") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (role === "consultant") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, role, signOut, user } = useAuth();
  const [, navigate] = useWouterLocation();

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Filter nav items based on role
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true; // visible to all
    if (!role) return false;
    return item.roles.includes(role);
  });

  const displayName = profile?.full_name || user?.email || "User";
  const displayRole = role || "user";

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col border-r border-sidebar-border bg-sidebar shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <HexLogo className="w-8 h-8 text-primary" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">Harmony Digital</span>
            <span className="text-xs text-muted-foreground">School Readiness</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" data-testid="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info + bottom actions */}
        <div className="px-3 pb-3 mt-auto space-y-2">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                data-testid="button-user-menu"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-sidebar-foreground truncate" data-testid="text-user-name">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize" data-testid="text-user-role">
                    {displayRole}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium">{displayName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${getRoleBadgeClass(displayRole)}`}>
                    {displayRole}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="flex items-center gap-2 cursor-pointer w-full" data-testid="menu-settings">
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
                data-testid="button-logout"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>
          <HarmonyFooter />
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-2">
            <HexLogo className="w-7 h-7 text-primary" />
            <span className="text-sm font-semibold">Harmony Digital</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="mobile-theme-toggle">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </header>

        {/* Mobile nav overlay */}
        {mobileMenuOpen && (
          <div
            className="md:hidden absolute inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-4 py-4 pb-3 border-b border-sidebar-border">
                <HexLogo className="w-7 h-7 text-primary" />
                <span className="text-sm font-semibold">Harmony Digital</span>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>
              {/* Mobile user info */}
              <div className="p-3 border-t border-sidebar-border space-y-2">
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{displayName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${getRoleBadgeClass(displayRole)}`}>
                      {displayRole}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive"
                  onClick={handleLogout}
                  data-testid="mobile-button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overscroll-contain" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
