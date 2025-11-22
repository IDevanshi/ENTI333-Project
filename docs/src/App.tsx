import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProfileSetup from "@/pages/profile-setup";
import Discover from "@/pages/discover";
import Events from "@/pages/events";
import StudyGroups from "@/pages/study-groups";
import Chat from "@/pages/chat";
import News from "@/pages/news";
import Meetups from "@/pages/meetups";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile/setup" component={ProfileSetup} />
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

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
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
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
