import { Home, Users, Calendar, GraduationCap, MessageSquare, Newspaper, MapPin, LogIn, LogOut, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    testId: "nav-home",
  },
  {
    title: "Discover",
    url: "/discover",
    icon: Users,
    testId: "nav-discover",
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
    testId: "nav-events",
  },
  {
    title: "Study Groups",
    url: "/groups",
    icon: GraduationCap,
    testId: "nav-groups",
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
    testId: "nav-chat",
  },
  {
    title: "News",
    url: "/news",
    icon: Newspaper,
    testId: "nav-news",
  },
  {
    title: "Meetups",
    url: "/meetups",
    icon: MapPin,
    testId: "nav-meetups",
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">CampusConnect</h2>
            <p className="text-xs text-muted-foreground">Find your community</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {user ? (
          <div className="space-y-2">
            {user.student && (
              <div className="px-2 py-1">
                <p className="text-sm font-medium">{user.student.name}</p>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="default"
              className="w-full"
              asChild
              data-testid="button-login"
            >
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
              data-testid="button-register"
            >
              <Link href="/register">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Link>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
