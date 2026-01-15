import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Activity, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";

export default function SystemAnalytics({ appointments, doctors, users }) {
  // Appointments by status
  const statusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: "Approved", value: statusCounts.approved || 0, color: "#10b981" },
    { name: "Pending", value: statusCounts.pending || 0, color: "#f59e0b" },
    { name: "Completed", value: statusCounts.completed || 0, color: "#3b82f6" },
    { name: "Rejected", value: statusCounts.rejected || 0, color: "#ef4444" },
    { name: "Cancelled", value: statusCounts.cancelled || 0, color: "#6b7280" }
  ].filter(item => item.value > 0);

  // Monthly trends (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(new Date(), 5 - i);
    const monthStr = format(monthDate, 'yyyy-MM');
    const count = appointments.filter(apt => apt.date?.startsWith(monthStr)).length;
    return {
      month: format(monthDate, 'MMM yyyy'),
      appointments: count
    };
  });

  // Appointments by specialty
  const specialtyData = doctors.reduce((acc, doc) => {
    const count = appointments.filter(apt => apt.doctor_id === doc.id).length;
    if (count > 0) {
      acc.push({ specialty: doc.specialty, count });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 5);

  // Peak booking times
  const timeData = Array.from({ length: 24 }, (_, hour) => {
    const hourStr = `${String(hour).padStart(2, '0')}:`;
    const count = appointments.filter(apt => apt.start_time?.startsWith(hourStr)).length;
    return {
      hour: hour < 12 ? `${hour}AM` : `${hour - 12}PM`,
      bookings: count
    };
  }).filter(item => item.bookings > 0);

  // Key metrics
  const totalBookings = appointments.length;
  const approvalRate = statusCounts.approved && totalBookings
    ? ((statusCounts.approved / totalBookings) * 100).toFixed(1)
    : 0;
  const cancellationRate = (statusCounts.cancelled || 0) && totalBookings
    ? (((statusCounts.cancelled + statusCounts.rejected) / totalBookings) * 100).toFixed(1)
    : 0;
  const mostActiveDoctor = doctors.map(doc => ({
    name: doc.name,
    count: appointments.filter(apt => apt.doctor_id === doc.id).length
  })).sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Total Bookings</p>
                <p className="text-4xl font-bold text-slate-900">{totalBookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Approval Rate</p>
                <p className="text-4xl font-bold text-slate-900">{approvalRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Cancellation Rate</p>
                <p className="text-4xl font-bold text-slate-900">{cancellationRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Most Active</p>
                <p className="text-2xl font-bold text-slate-900">Dr. {mostActiveDoctor?.name || 'N/A'}</p>
                <p className="text-sm text-slate-600">{mostActiveDoctor?.count || 0} appointments</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Monthly Appointment Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Top Specialties by Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={specialtyData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="specialty" stroke="#64748b" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Peak Booking Times</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}