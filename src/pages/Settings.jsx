import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Shield, Moon, Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    darkMode: false,
    language: 'en'
  });

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      // Load user settings from user data if they exist
      if (userData.settings) {
        setSettings(userData.settings);
      }
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    // Save to user data
    try {
      await base44.auth.updateMe({ settings: newSettings });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-slate-500">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="appointment-reminders" className="text-base font-medium">
                    Appointment Reminders
                  </Label>
                  <p className="text-sm text-slate-500">
                    Get reminders before your scheduled appointments
                  </p>
                </div>
                <Switch
                  id="appointment-reminders"
                  checked={settings.appointmentReminders}
                  onCheckedChange={() => handleToggle('appointmentReminders')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="marketing-emails" className="text-base font-medium">
                    Marketing Emails
                  </Label>
                  <p className="text-sm text-slate-500">
                    Receive newsletters and promotional content
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={settings.marketingEmails}
                  onCheckedChange={() => handleToggle('marketingEmails')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account & Security */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Account & Security
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Account Type</Label>
                  <p className="text-sm text-slate-500">Your current account role</p>
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Change Password</Label>
                  <p className="text-sm text-slate-500">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Setup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-600" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-slate-500">
                    Switch to dark theme (coming soon)
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  disabled
                  onCheckedChange={() => handleToggle('darkMode')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Language</Label>
                  <p className="text-sm text-slate-500">Select your preferred language</p>
                </div>
                <Badge variant="outline">English</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}