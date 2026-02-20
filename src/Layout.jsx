import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Home,
  Users,
  Activity,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  User as UserIcon,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState("");

  // Dark mode: system preference + saved preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      const val = saved === "true";
      setDarkMode(val);
      document.documentElement.classList.toggle("dark", val);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem("darkMode") === null) {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then((isAuth) => {
      if (isAuth) {
        base44.auth.me().then((userData) => {
          setUser(userData);
          // Apply saved dark mode pref from user settings too
          if (userData.settings?.darkMode !== undefined) {
            const val = userData.settings.darkMode;
            setDarkMode(val);
            localStorage.setItem("darkMode", String(val));
            document.documentElement.classList.toggle("dark", val);
          }
        }).catch(() => {});
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setCurrentTab(urlParams.get("tab") || "");
  }, [location.search]);

  const handleLogout = async () => {
    try {
      const userData = await base44.auth.me();
      await base44.entities.AuditLog.create({
        user_id: userData.id,
        user_email: userData.email,
        user_role: userData.role,
        action: "user_logout"
      });
    } catch (error) {}
    base44.auth.logout();
  };

  const publicPages = ["Home", "Register", "ForgotPassword"];
  const isPublicPage = publicPages.includes(currentPageName);

  if (loading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
        <div className="animate-pulse text-lg dark:text-white">Loading...</div>
      </div>
    );
  }

  if (isPublicPage || !user) {
    return <div className="min-h-screen dark:bg-slate-900">{children}</div>;
  }

  const getNavigation = () => {
    if (user.role === "admin") {
      return [
        { name: "Dashboard", page: "AdminDashboard", icon: Shield, tab: "appointments" },
        { name: "Appointments", page: "AdminDashboard", icon: Calendar, tab: "appointments" },
        { name: "Users", page: "AdminDashboard", icon: Users, tab: "users" },
        { name: "Doctors", page: "AdminDashboard", icon: Activity, tab: "doctors" },
        { name: "Analytics", page: "AdminDashboard", icon: BarChart3, tab: "analytics" },
      ];
    } else if (user.doctor_id) {
      return [
        { name: "Dashboard", page: "DoctorDashboard", icon: Home, tab: "overview" },
        { name: "Requests", page: "DoctorDashboard", icon: Bell, tab: "requests" },
        { name: "Schedule", page: "DoctorDashboard", icon: Calendar, tab: "schedule" },
        { name: "Analytics", page: "DoctorDashboard", icon: BarChart3, tab: "analytics" },
      ];
    } else {
      return [
        { name: "Dashboard", page: "PatientDashboard", icon: Home, tab: "upcoming" },
        { name: "Upcoming", page: "PatientDashboard", icon: Calendar, tab: "upcoming" },
        { name: "Pending", page: "PatientDashboard", icon: Clock, tab: "pending" },
        { name: "Past", page: "PatientDashboard", icon: Activity, tab: "past" },
      ];
    }
  };

  const navigation = getNavigation();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden select-none"
      style={{ overscrollBehavior: "none" }}
    >
      <style>{`
        body { overscroll-behavior: none; user-select: none; }
      `}</style>

      {/* Top Navigation Bar */}
      <nav
        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl(navigation[0].page)} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Clinica Scheduler
                </span>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                      {user.full_name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium dark:text-white">
                      {user.full_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-medium dark:text-white">{user.full_name}</div>
                      <div className="text-xs text-slate-500 font-normal">{user.email}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("Profile"))}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {user.role}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("Settings"))}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button — only show on mobile when no bottom nav */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile dropdown Nav (fallback, hidden when bottom nav is used) */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
              {navigation.map((item) => {
                const isCurrentPage = currentPageName === item.page;
                const isCurrentTab = item.tab ? currentTab === item.tab : true;
                const isActive = isCurrentPage && isCurrentTab;
                const url = item.tab
                  ? `${createPageUrl(item.page)}?tab=${item.tab}`
                  : createPageUrl(item.page);
                return (
                  <Link key={item.name} to={url} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${isActive ? "bg-gradient-to-r from-blue-600 to-cyan-500" : ""}`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 min-h-screen sticky top-16">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isCurrentPage = currentPageName === item.page;
              const isCurrentTab = item.tab ? currentTab === item.tab : true;
              const isActive = isCurrentPage && isCurrentTab;
              const url = item.tab
                ? `${createPageUrl(item.page)}?tab=${item.tab}`
                : createPageUrl(item.page);
              return (
                <Link key={item.name} to={url}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start dark:text-slate-200 dark:hover:bg-slate-800 ${
                      isActive ? "bg-gradient-to-r from-blue-600 to-cyan-500 dark:text-white" : ""
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content — bottom padding for mobile bottom nav */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* Footer — hidden on mobile to save space */}
      <footer className="hidden md:block bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                © 2026 Clinica Scheduler. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation Bar (< md) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navigation.slice(0, 5).map((item) => {
          const isCurrentPage = currentPageName === item.page;
          const isCurrentTab = item.tab ? currentTab === item.tab : true;
          const isActive = isCurrentPage && isCurrentTab;
          const url = item.tab
            ? `${createPageUrl(item.page)}?tab=${item.tab}`
            : createPageUrl(item.page);
          return (
            <Link
              key={item.name}
              to={url}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive
                    ? "text-blue-600 dark:text-cyan-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-blue-600 dark:text-cyan-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}