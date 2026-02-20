import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, Users, Calendar, Activity, FileText, Settings } from "lucide-react";
import PullToRefreshWrapper from "../components/shared/PullToRefreshWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "../components/admin/AdminStats";
import UserManagement from "../components/admin/UserManagement";
import DoctorManagement from "../components/admin/DoctorManagement";
import AppointmentOverview from "../components/admin/AppointmentOverview";
import SystemAnalytics from "../components/admin/SystemAnalytics";
import AuditLogs from "../components/admin/AuditLogs";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("appointments");
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then((userData) => {
      if (userData.role !== 'admin') {
        window.location.href = '/';
      }
      setUser(userData);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const data = await base44.entities.User.list('-created_date');
      // Deduplicate by id
      const uniqueUsers = Array.from(new Map(data.map(item => [item.id, item])).values());
      return uniqueUsers;
    },
    enabled: !!user,
    initialData: []
  });

  const { data: doctors = [], refetch: refetchDoctors } = useQuery({
    queryKey: ['all-doctors'],
    queryFn: async () => {
      const data = await base44.entities.Doctor.list('-created_date');
      // Deduplicate by id
      const uniqueDoctors = Array.from(new Map(data.map(item => [item.id, item])).values());
      return uniqueDoctors;
    },
    enabled: !!user,
    initialData: []
  });

  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: async () => {
      const data = await base44.entities.Appointment.list('-created_date');
      // Deduplicate by id
      const uniqueAppointments = Array.from(new Map(data.map(item => [item.id, item])).values());
      return uniqueAppointments;
    },
    enabled: !!user,
    initialData: []
  });

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-full lg:max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">System management and analytics</p>
          </div>
        </motion.div>

        {/* Stats */}
        <AdminStats
          totalUsers={users.length}
          totalDoctors={doctors.length}
          totalAppointments={appointments.length}
          activeAppointments={appointments.filter(a => a.status === 'approved').length}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 lg:w-auto">
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="doctors">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Audit Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <AppointmentOverview appointments={appointments} doctors={doctors} refetchAppointments={refetchAppointments} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement users={users} refetchUsers={refetchUsers} />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorManagement doctors={doctors} refetchDoctors={refetchDoctors} />
          </TabsContent>

          <TabsContent value="analytics">
            <SystemAnalytics appointments={appointments} doctors={doctors} users={users} />
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}