import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Search, User, Clock, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function AppointmentOverview({ appointments, doctors, refetchAppointments }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    patient_name: "",
    patient_email: "",
    doctor_id: "",
    date: "",
    start_time: "",
    end_time: "",
    status: "pending",
    reason: ""
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    completed: "bg-blue-100 text-blue-800",
    no_show: "bg-orange-100 text-orange-800"
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAppointment = async () => {
    try {
      if (!newAppointmentData.patient_name || !newAppointmentData.patient_email || !newAppointmentData.doctor_id || !newAppointmentData.date || !newAppointmentData.start_time || !newAppointmentData.end_time || !newAppointmentData.reason) {
        alert("Please fill all required fields.");
        return;
      }

      const selectedDoctor = doctors.find(doc => doc.id === newAppointmentData.doctor_id);
      if (!selectedDoctor) {
        alert("Selected doctor not found.");
        return;
      }

      // Find user by email to get patient_id
      const users = await base44.entities.User.filter({ email: newAppointmentData.patient_email });
      const patientId = users && users.length > 0 ? users[0].id : "admin-created-patient";

      await base44.entities.Appointment.create({
        patient_id: patientId,
        patient_name: newAppointmentData.patient_name,
        patient_email: newAppointmentData.patient_email,
        doctor_id: newAppointmentData.doctor_id,
        doctor_name: selectedDoctor.name,
        date: newAppointmentData.date,
        start_time: newAppointmentData.start_time,
        end_time: newAppointmentData.end_time,
        status: newAppointmentData.status,
        reason: newAppointmentData.reason
      });

      refetchAppointments();
      resetAddAppointmentForm();
    } catch (error) {
      console.error("Failed to add appointment:", error);
      alert("Failed to add appointment: " + (error.message || "Unknown error"));
    }
  };

  const resetAddAppointmentForm = () => {
    setNewAppointmentData({
      patient_name: "",
      patient_email: "",
      doctor_id: "",
      date: "",
      start_time: "",
      end_time: "",
      status: "pending",
      reason: ""
    });
    setShowAddAppointment(false);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            All Appointments
          </CardTitle>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Patient Name *</Label>
                      <Input
                        value={newAppointmentData.patient_name}
                        onChange={(e) => setNewAppointmentData({ ...newAppointmentData, patient_name: e.target.value })}
                        placeholder="Patient Full Name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Patient Email *</Label>
                      <Input
                        type="email"
                        value={newAppointmentData.patient_email}
                        onChange={(e) => setNewAppointmentData({ ...newAppointmentData, patient_email: e.target.value })}
                        placeholder="patient@example.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Doctor *</Label>
                    <Select value={newAppointmentData.doctor_id} onValueChange={(val) => setNewAppointmentData({ ...newAppointmentData, doctor_id: val })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select Doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map(doc => (
                          <SelectItem key={doc.id} value={doc.id}>Dr. {doc.name} ({doc.specialty})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={newAppointmentData.date}
                        onChange={(e) => setNewAppointmentData({ ...newAppointmentData, date: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Start Time *</Label>
                      <Input
                        type="time"
                        value={newAppointmentData.start_time}
                        onChange={(e) => setNewAppointmentData({ ...newAppointmentData, start_time: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>End Time *</Label>
                      <Input
                        type="time"
                        value={newAppointmentData.end_time}
                        onChange={(e) => setNewAppointmentData({ ...newAppointmentData, end_time: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Reason *</Label>
                    <Textarea
                      value={newAppointmentData.reason}
                      onChange={(e) => setNewAppointmentData({ ...newAppointmentData, reason: e.target.value })}
                      placeholder="Reason for appointment..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={newAppointmentData.status} onValueChange={(val) => setNewAppointmentData({ ...newAppointmentData, status: val })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={resetAddAppointmentForm}>Cancel</Button>
                  <Button onClick={handleAddAppointment}>
                    Add Appointment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((apt) => (
                <TableRow key={apt.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium">{apt.patient_name}</div>
                        <div className="text-xs text-slate-500">{apt.patient_email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">Dr. {apt.doctor_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{format(new Date(apt.date), 'MMM dd, yyyy')}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {apt.start_time} - {apt.end_time}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[apt.status]}>
                      {apt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-slate-600 line-clamp-2">
                      {apt.reason || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {apt.created_date ? format(new Date(apt.created_date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}