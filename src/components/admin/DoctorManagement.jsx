import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { UserPlus, Search, Activity, Mail, Phone, Edit, Plus, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SPECIALTIES = [
  "General Practice", "Cardiology", "Dermatology", "Neurology", 
  "Orthopedics", "Pediatrics", "Psychiatry", "Gynecology", 
  "Ophthalmology", "ENT"
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorManagement({ doctors, refetchDoctors }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    bio: "",
    consultation_duration: 30,
    availability: []
  });
  const [availabilitySlot, setAvailabilitySlot] = useState({ day: "Monday", start_time: "09:00", end_time: "17:00" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredDoctors = doctors.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      // Find user by email to get user_id
      let doctorUserId = null;
      if (formData.email) {
        const users = await base44.entities.User.filter({ email: formData.email });
        if (users && users.length > 0) {
          doctorUserId = users[0].id;
        } else {
          alert("No user found with this email. Please ensure the doctor is registered as a user first.");
          return;
        }
      }

      const dataToSave = { ...formData, user_id: doctorUserId };

      if (editing) {
        await base44.entities.Doctor.update(editing.id, dataToSave);
      } else {
        await base44.entities.Doctor.create(dataToSave);
      }
      refetchDoctors();
      resetForm();
    } catch (error) {
      console.error("Failed to save doctor:", error);
      alert("Failed to save doctor: " + (error.message || "Unknown error"));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      bio: "",
      consultation_duration: 30,
      availability: []
    });
    setEditing(null);
    setShowAdd(false);
  };

  const addAvailabilitySlot = () => {
    setFormData({
      ...formData,
      availability: [...(formData.availability || []), availabilitySlot]
    });
    setAvailabilitySlot({ day: "Monday", start_time: "09:00", end_time: "17:00" });
  };

  const removeAvailabilitySlot = (index) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter((_, i) => i !== index)
    });
  };

  const handleEdit = (doctor) => {
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || "",
      specialty: doctor.specialty,
      bio: doctor.bio || "",
      consultation_duration: doctor.consultation_duration || 30,
      availability: doctor.availability || []
    });
    setEditing(doctor);
    setShowAdd(true);
  };

  const handleDelete = async (doctorId) => {
    try {
      await base44.entities.Doctor.delete(doctorId);
      refetchDoctors();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete doctor:", error);
      alert("Failed to delete doctor: " + (error.message || "Unknown error"));
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Doctor Management
          </CardTitle>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showAdd} onOpenChange={(open) => { if (!open) resetForm(); setShowAdd(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-500">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. John Doe"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@example.com"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Specialty *</Label>
                      <Select value={formData.specialty} onValueChange={(val) => setFormData({ ...formData, specialty: val })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map(spec => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Professional background and expertise..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Consultation Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.consultation_duration}
                      onChange={(e) => setFormData({ ...formData, consultation_duration: parseInt(e.target.value) })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block">Weekly Availability</Label>
                    <div className="space-y-3">
                      {formData.availability?.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium w-24">{slot.day}</span>
                          <span className="text-slate-600">{slot.start_time} - {slot.end_time}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAvailabilitySlot(index)}
                            className="ml-auto"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Select value={availabilitySlot.day} onValueChange={(val) => setAvailabilitySlot({ ...availabilitySlot, day: val })}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="time"
                        value={availabilitySlot.start_time}
                        onChange={(e) => setAvailabilitySlot({ ...availabilitySlot, start_time: e.target.value })}
                        className="w-32"
                      />
                      <Input
                        type="time"
                        value={availabilitySlot.end_time}
                        onChange={(e) => setAvailabilitySlot({ ...availabilitySlot, end_time: e.target.value })}
                        className="w-32"
                      />
                      <Button onClick={addAvailabilitySlot} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.email || !formData.specialty}>
                    {editing ? "Update Doctor" : "Add Doctor"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border border-slate-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                      {doctor.name.charAt(0)}
                    </div>
                    <Badge className="bg-green-100 text-green-800">{doctor.specialty}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Dr. {doctor.name}</h3>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {doctor.email}
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {doctor.phone}
                      </div>
                    )}
                  </div>

                  {doctor.bio && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">{doctor.bio}</p>
                  )}

                  <div className="text-xs text-slate-500 mb-4">
                    {doctor.availability?.length || 0} availability slots
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(doctor)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(doctor)}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Dr. {deleteConfirm?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}