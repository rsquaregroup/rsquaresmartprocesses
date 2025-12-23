import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderPlus,
  Home,
  LogOut,
  Menu,
  Settings,
  Shield,
  SlidersHorizontal,
  Sun,
  Moon,
  Users,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavLink } from "@/components/NavLink";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(true);
  const role = profile?.role ?? "requester";
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Shield className="h-5 w-5" />;
      case "backoffice":
        return <Briefcase className="h-5 w-5" />;
      case "requester":
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "admin":
        return "Admin";
      case "backoffice":
        return "Backoffice";
      case "requester":
      default:
        return "Requester";
    }
  };

  const getNavLinks = (): NavItem[] => {
    const links: NavItem[] = [{ to: "/dashboard", label: "Dashboard", icon: Home }];

    if (role === "requester") {
      links.push(
        { to: "/requests", label: "My Requests", icon: FileText },
        { to: "/requests/new", label: "New Request", icon: FolderPlus }
      );
    } else {
      links.push({ to: "/requests", label: "Requests", icon: FileText });
    }

    return links;
  };

  const getAdminLinks = (): NavItem[] | null => {
    if (role !== "admin") return null;

    return [
      { to: "/admin/request-types", label: "Request Types", icon: SlidersHorizontal },
      { to: "/admin/users", label: "Users", icon: Users },
    ];
  };

  const NavigationContent = () => {
    const adminLinks = getAdminLinks();

    return (
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center justify-start">
            <img
              src="/images/logo_vertical.svg"
              alt="RSquare Smart Processes"
              className="h-12 dark:brightness-0 dark:invert"
            />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getNavLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth hover:bg-accent"
              activeClassName="bg-primary/10 text-primary"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}

          {adminLinks && (
            <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-smooth hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    Admin
                  </div>
                  {adminOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-1 mt-1">
                {adminLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth hover:bg-accent"
                    activeClassName="bg-primary/10 text-primary"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </nav>

        <div className="p-4">
          <div className="flex flex-col gap-1 mb-4 px-4">
            <p className="text-xs text-muted-foreground">Signed in as:</p>
            <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getRoleIcon()}
              {getRoleLabel()}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium hover:bg-accent"
                size="sm"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuItem onClick={toggleTheme} className="flex items-center justify-between">
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/account")}>Your Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="h-3" />
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium hover:bg-accent"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  };

  const backgroundStyle =
    theme === "dark"
      ? { backgroundImage: "none", backgroundColor: "hsl(var(--background))" }
      : {
          backgroundImage: "url(/images/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        };

  return (
    <div className="relative min-h-screen bg-background" style={backgroundStyle}>
      <div className="absolute inset-0 bg-background/60 transition-colors pointer-events-none" />

      <div className="lg:hidden sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <img
            src="/images/logo_vertical.svg"
            alt="RSquare Smart Processes"
            className="h-8 dark:brightness-0 dark:invert"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:block w-72 border-r border-border/50 bg-white sticky top-0 h-screen">
          <NavigationContent />
        </aside>

        <main className="flex-1 relative">
          <div className="container mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
