import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  User as UserIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) {
        base44.auth.me().then(setUser).catch(() => {});
      }
      setLoading(false);
    });
  }, []);

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

  // Public pages that don't need authentication
  const publicPages = ["Home", "Register", "ForgotPassword"];
  const isPublicPage = publicPages.includes(currentPageName);

  // If loading, show nothing
  if (loading && !isPublicPage) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg">Loading...</div>
    </div>;
  }

  // Public layout for landing and auth pages
  if (isPublicPage || !user) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Navigation based on user role
  const getNavigation = () => {
    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', page: 'AdminDashboard', icon: Shield },
        { name: 'Appointments', page: 'AdminDashboard', icon: Calendar },
        { name: 'Users', page: 'AdminDashboard', icon: Users },
        { name: 'Doctors', page: 'AdminDashboard', icon: Activity },
        { name: 'Analytics', page: 'AdminDashboard', icon: BarChart3 }
      ];
    } else if (user.doctor_id) {
      return [
        { name: 'Dashboard', page: 'DoctorDashboard', icon: Home },
        { name: 'Requests', page: 'DoctorDashboard', icon: Bell },
        { name: 'Schedule', page: 'DoctorDashboard', icon: Calendar },
        { name: 'Analytics', page: 'DoctorDashboard', icon: BarChart3 }
      ];
    } else {
      return [
        { name: 'Dashboard', page: 'PatientDashboard', icon: Home },
        { name: 'Book Appointment', page: 'PatientDashboard', icon: Calendar },
        { name: 'My Appointments', page: 'PatientDashboard', icon: Activity }
      ];
    }
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.name} to={createPageUrl(item.page)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={isActive ? "bg-gradient-to-r from-blue-600 to-cyan-500" : ""}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                      {user.full_name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.full_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-xs text-slate-500 font-normal">{user.email}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {user.role}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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

              {/* Mobile menu button */}
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

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-slate-200">
              {navigation.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive ? "bg-gradient-to-r from-blue-600 to-cyan-500" : ""
                      }`}
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

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">
                © 2024 Clinica Scheduler. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}