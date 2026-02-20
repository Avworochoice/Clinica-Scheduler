import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Shield, Moon, Globe, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    darkMode: false,
    language: "en",
  });
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    base44.auth
      .me()
      .then((userData) => {
        setUser(userData);
        if (userData.settings) {
          setSettings(userData.settings);
        }
      })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    // Apply dark mode immediately
    if (key === "darkMode") {
      const val = newSettings.darkMode;
      localStorage.setItem("darkMode", String(val));
      document.documentElement.classList.toggle("dark", val);
    }

    await base44.auth.updateMe({ settings: newSettings });
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      // Log the action before deletion
      await base44.entities.AuditLog.create({
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        action: "user_deactivated",
        details: JSON.stringify({ reason: "user_self_deleted" }),
      });
    } catch (_) {}
    // Deactivate the user account
    await base44.auth.updateMe({ is_active: false, deleted_at: new Date().toISOString() });
    base44.auth.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your account preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="shadow-lg border-0 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Bell className="w-5 h-5 text-purple-600" />
                Notifications
              </CardTitle>
              <CardDescription className="dark:text-slate-400">Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {[
                {
                  id: "emailNotifications",
                  label: "Email Notifications",
                  desc: "Receive email notifications for important updates",
                },
                {
                  id: "appointmentReminders",
                  label: "Appointment Reminders",
                  desc: "Get reminders before your scheduled appointments",
                },
                {
                  id: "marketingEmails",
                  label: "Marketing Emails",
                  desc: "Receive newsletters and promotional content",
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor={item.id} className="text-base font-medium dark:text-white">
                      {item.label}
                    </Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={settings[item.id]}
                    onCheckedChange={() => handleToggle(item.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account & Security */}
          <Card className="shadow-lg border-0 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Shield className="w-5 h-5 text-blue-600" />
                Account & Security
              </CardTitle>
              <CardDescription className="dark:text-slate-400">Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium dark:text-white">Account Type</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your current account role</p>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium dark:text-white">Change Password</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password</p>
                </div>
                <Button variant="outline" size="sm" className="dark:border-slate-600 dark:text-white">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <Label className="text-base font-medium dark:text-white">Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm" className="dark:border-slate-600 dark:text-white">
                  Setup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-lg border-0 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Moon className="w-5 h-5 text-orange-600" />
                Preferences
              </CardTitle>
              <CardDescription className="dark:text-slate-400">Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode" className="text-base font-medium dark:text-white">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Switch to dark theme</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={() => handleToggle("darkMode")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium dark:text-white">Language</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Select your preferred language</p>
                </div>
                <Badge variant="outline" className="dark:border-slate-600 dark:text-white">
                  English
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-lg border-0 border-red-200 dark:bg-slate-800 dark:border-red-900/50">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-900/50">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium text-red-700 dark:text-red-400">Delete Account</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-slate-400">
                        This action cannot be undone. Your account and all associated data will be permanently
                        deactivated. You will be logged out immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:border-slate-600 dark:text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deletingAccount ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}