import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, startOfWeek, isBefore, startOfDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";

export default function BookAppointmentDialog({ open, onClose, patientId, patientName, patientEmail, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.Doctor.filter({ is_active: true }),
    initialData: []
  });

  const generateTimeSlots = (doctor, date) => {
    if (!doctor || !date) return [];
    
    const dayName = format(date, 'EEEE');
    const availability = doctor.availability?.find(a => a.day === dayName);
    
    if (!availability) return [];

    const slots = [];
    const duration = doctor.consultation_duration || 30;
    const [startHour, startMin] = availability.start_time.split(':').map(Number);
    const [endHour, endMin] = availability.end_time.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      currentMin += duration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
      const endTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      
      if (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
        slots.push({ start: startTime, end: endTime });
      }
    }
    
    return slots;
  };

  const { data: existingAppointments = [] } = useQuery({
    queryKey: ['doctor-appointments', selectedDoctor?.id, selectedDate],
    queryFn: () => base44.entities.Appointment.filter({
      doctor_id: selectedDoctor.id,
      date: format(selectedDate, 'yyyy-MM-dd')
    }),
    enabled: !!selectedDoctor && !!selectedDate,
    initialData: []
  });

  const availableSlots = selectedDoctor && selectedDate
    ? generateTimeSlots(selectedDoctor, selectedDate).filter(slot => {
        const isBooked = existingAppointments.some(apt => 
          apt.start_time === slot.start && 
          (apt.status === 'pending' || apt.status === 'approved')
        );
        return !isBooked;
      })
    : [];

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason.trim()) return;

    setBooking(true);
    try {
      const appointment = await base44.entities.Appointment.create({
        patient_id: patientId,
        patient_name: patientName,
        patient_email: patientEmail,
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        status: "pending",
        reason: reason.trim()
      });

      // Create notification for doctor
      await base44.entities.Notification.create({
        user_id: selectedDoctor.user_id,
        user_email: selectedDoctor.email,
        appointment_id: appointment.id,
        type: "appointment_requested",
        title: "New Appointment Request",
        message: `${patientName} has requested an appointment on ${format(selectedDate, 'MMM dd, yyyy')} at ${selectedSlot.start}`
      });

      onSuccess();
      resetAndClose();
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setBooking(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setReason("");
    onClose();
  };

  const nextWeekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book New Appointment</DialogTitle>
          <DialogDescription>
            Step {step} of 4: {
              step === 1 ? "Select a doctor" :
              step === 2 ? "Choose a date" :
              step === 3 ? "Pick a time slot" :
              "Confirm booking"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {doctors.map(doctor => (
                  <Card
                    key={doctor.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      selectedDoctor?.id === doctor.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setStep(2);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                        {doctor.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Dr. {doctor.name}</h3>
                        <Badge variant="secondary" className="mt-1">{doctor.specialty}</Badge>
                        {doctor.bio && (
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{doctor.bio}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <User className="w-4 h-4 inline mr-2" />
                  Selected: <span className="font-semibold">Dr. {selectedDoctor.name}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {nextWeekDates.map(date => {
                  const dayAvailability = selectedDoctor.availability?.find(
                    a => a.day === format(date, 'EEEE')
                  );
                  const isAvailable = !!dayAvailability;

                  return (
                    <Card
                      key={date.toString()}
                      className={`p-4 cursor-pointer transition-all text-center ${
                        !isAvailable ? 'opacity-50 cursor-not-allowed' :
                        selectedDate?.toString() === date.toString() ? 'ring-2 ring-blue-500 bg-blue-50' :
                        'hover:shadow-lg'
                      }`}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedDate(date);
                          setStep(3);
                        }
                      }}
                    >
                      <div className="text-sm text-slate-600">{format(date, 'EEE')}</div>
                      <div className="text-2xl font-bold text-slate-900 my-1">{format(date, 'd')}</div>
                      <div className="text-sm text-slate-600">{format(date, 'MMM')}</div>
                      {!isAvailable && (
                        <div className="text-xs text-red-600 mt-2">Unavailable</div>
                      )}
                    </Card>
                  );
                })}
              </div>

              <Button variant="outline" onClick={() => setStep(1)} className="mt-4">
                Back to Doctors
              </Button>
            </motion.div>
          )}

          {/* Step 3: Select Time Slot */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                <p className="text-sm text-blue-900">
                  <User className="w-4 h-4 inline mr-2" />
                  <span className="font-semibold">Dr. {selectedDoctor.name}</span>
                </p>
                <p className="text-sm text-blue-900">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  <span className="font-semibold">{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>
                </p>
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No available slots for this date</p>
                  <Button variant="outline" onClick={() => setStep(2)} className="mt-4">
                    Choose Another Date
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot.start}
                      variant={selectedSlot?.start === slot.start ? "default" : "outline"}
                      className={`h-auto py-3 ${
                        selectedSlot?.start === slot.start ? 'bg-blue-600' : ''
                      }`}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep(4);
                      }}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{slot.start}</div>
                        <div className="text-xs opacity-75">{slot.end}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              <Button variant="outline" onClick={() => setStep(2)} className="mt-4">
                Back to Dates
              </Button>
            </motion.div>
          )}

          {/* Step 4: Confirm & Reason */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 space-y-3">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Appointment Summary</h3>
                
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Dr. {selectedDoctor.name}</span>
                  <Badge variant="secondary">{selectedDoctor.specialty}</Badge>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>{selectedSlot.start} - {selectedSlot.end}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="reason" className="text-base mb-2 block">
                  Reason for Visit <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe your symptoms or reason for this appointment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={booking || !reason.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                >
                  {booking ? "Booking..." : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}