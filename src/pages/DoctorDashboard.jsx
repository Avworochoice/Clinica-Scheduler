import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorStats from "../components/doctor/DoctorStats";
import AppointmentRequestCard from "../components/doctor/AppointmentRequestCard";
import DoctorSchedule from "../components/doctor/DoctorSchedule";
import DoctorAnalytics from "../components/doctor/DoctorAnalytics";

export default function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      if (userData.doctor_id) {
        const doctorData = await base44.entities.Doctor.filter({ id: userData.doctor_id });
        setDoctor(doctorData[0]);
      }
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: appointments = [], refetch } = useQuery({
    queryKey: ['doctor-appointments', doctor?.id],
    queryFn: () => base44.entities.Appointment.filter({ doctor_id: doctor.id }, '-created_date'),
    enabled: !!doctor,
    initialData: []
  });

  const pendingRequests = appointments.filter(apt => apt.status === 'pending');
  const approvedAppointments = appointments.filter(apt => 
    apt.status === 'approved' && new Date(`${apt.date}T${apt.start_time}`) >= new Date()
  );
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today && apt.status === 'approved';
  });

  if (!user || !doctor) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-slate-900">Welcome, Dr. {doctor.name}!</h1>
          <p className="text-slate-600 mt-2">{doctor.specialty} • Manage your appointments and schedule</p>
        </motion.div>

        {/* Stats */}
        <DoctorStats
          pendingCount={pendingRequests.length}
          todayCount={todayAppointments.length}
          upcomingCount={approvedAppointments.length}
          totalAppointments={appointments.length}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="schedule">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Pending Appointment Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No pending requests</p>
                    <p className="text-sm mt-2">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(appointment => (
                      <AppointmentRequestCard
                        key={appointment.id}
                        appointment={appointment}
                        onUpdate={refetch}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <DoctorSchedule appointments={approvedAppointments} doctor={doctor} />
          </TabsContent>

          <TabsContent value="analytics">
            <DoctorAnalytics appointments={appointments} doctorId={doctor.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}