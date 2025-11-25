import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ProfileSetup from "@/pages/profile-setup";
import Profile from "@/pages/profile";
import Discover from "@/pages/discover";
import Events from "@/pages/events";
import StudyGroups from "@/pages/study-groups";
import Chat from "@/pages/chat";
import News from "@/pages/news";
import Meetups from "@/pages/meetups";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  const publicRoutes = ["/", "/login", "/register", "/events", "/groups", "/news"];
  const isPublicRoute = publicRoutes.includes(location);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user && !isPublicRoute) {
    window.location.href = "/login";
    return null;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/profile" component={Profile} />
      <Route path="/discover" component={Discover} />
      <Route path="/events" component={Events} />
      <Route path="/groups" component={StudyGroups} />
      <Route path="/chat" component={Chat} />
      <Route path="/news" component={News} />
      <Route path="/meetups" component={Meetups} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-4 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
