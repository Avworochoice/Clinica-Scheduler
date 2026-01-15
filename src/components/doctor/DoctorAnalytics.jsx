import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, CheckCircle, XCircle, Users } from "lucide-react";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

export default function DoctorAnalytics({ appointments }) {
  // Status distribution
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

  // Weekly appointments
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const weeklyData = daysInWeek.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = appointments.filter(apt => apt.date === dayStr && apt.status !== 'cancelled').length;
    return {
      day: format(day, 'EEE'),
      appointments: count
    };
  });

  // Approval rate
  const totalRequests = appointments.filter(apt => 
    ['approved', 'rejected'].includes(apt.status)
  ).length;
  const approvedCount = statusCounts.approved || 0;
  const approvalRate = totalRequests > 0 ? ((approvedCount / totalRequests) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Approval Rate</p>
                <p className="text-4xl font-bold text-slate-900">{approvalRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Total Patients</p>
                <p className="text-4xl font-bold text-slate-900">
                  {new Set(appointments.map(apt => apt.patient_id)).size}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Completed</p>
                <p className="text-4xl font-bold text-slate-900">{statusCounts.completed || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>This Week's Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="appointments" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Appointment Status Distribution</CardTitle>
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
                  fill="#8884d8"
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
      </div>
    </div>
  );
}