import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Bell, Plus } from "lucide-react";
import PullToRefreshWrapper from "../components/shared/PullToRefreshWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookAppointmentDialog from "../components/patient/BookAppointmentDialog";
import AppointmentCard from "../components/patient/AppointmentCard";
import PatientStats from "../components/patient/PatientStats";
import NotificationsList from "../components/shared/NotificationsList";

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    appClient.auth.me().then(setUser).catch(() => appClient.auth.redirectToLogin());
  }, []);

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: () => appClient.entities.Appointment.filter({ patient_id: user.id }, '-created_date'),
    enabled: !!user,
    initialData: []
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => appClient.entities.Notification.filter({ user_id: user.id }, '-created_date', 10),
    enabled: !!user,
    initialData: []
  });

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'approved' && new Date(`${apt.date}T${apt.start_time}`) > new Date()
  );

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || new Date(`${apt.date}T${apt.start_time}`) < new Date()
  );

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg">Loading...</div>
    </div>;
  }

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-cyan-900/20 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-full lg:max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Welcome back, {user.full_name}!</h1>
            <p className="text-slate-600 mt-2">Manage your appointments and health visits</p>
          </div>
          <Button
            size="lg"
            onClick={() => setShowBooking(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Book Appointment
          </Button>
        </motion.div>

        {/* Stats */}
        <PatientStats 
          totalAppointments={appointments.length}
          upcomingCount={upcomingAppointments.length}
          pendingCount={pendingAppointments.length}
          completedCount={pastAppointments.length}
        />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  My Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No upcoming appointments</p>
                        <Button
                          variant="link"
                          onClick={() => setShowBooking(true)}
                          className="mt-2"
                        >
                          Book your first appointment
                        </Button>
                      </div>
                    ) : (
                      upcomingAppointments.map(apt => (
                        <AppointmentCard key={apt.id} appointment={apt} onUpdate={refetch} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {pendingAppointments.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No pending appointments</p>
                      </div>
                    ) : (
                      pendingAppointments.map(apt => (
                        <AppointmentCard key={apt.id} appointment={apt} onUpdate={refetch} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
                    {pastAppointments.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No past appointments</p>
                      </div>
                    ) : (
                      pastAppointments.map(apt => (
                        <AppointmentCard key={apt.id} appointment={apt} onUpdate={refetch} isPast />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <NotificationsList notifications={notifications} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookAppointmentDialog
        open={showBooking}
        onClose={() => setShowBooking(false)}
        patientId={user.id}
        patientName={user.full_name}
        patientEmail={user.email}
        onSuccess={refetch}
      />
    </div>
    </PullToRefreshWrapper>
  );
}