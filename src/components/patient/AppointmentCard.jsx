import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, XCircle, AlertCircle } from "lucide-react";
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

export default function AppointmentCard({ appointment, onUpdate, isPast = false }) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await appClient.entities.Appointment.update(appointment.id, {
        status: "cancelled",
        cancellation_reason: "Cancelled by patient"
      });

      // Create notification for doctor
      await appClient.entities.Notification.create({
        user_id: appointment.doctor_id,
        user_email: appointment.doctor_email || "",
        appointment_id: appointment.id,
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: `${appointment.patient_name} has cancelled their appointment on ${format(new Date(appointment.date), 'MMM dd, yyyy')} at ${appointment.start_time}`
      });

      onUpdate();
      setShowCancel(false);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
      >
        <Card className="p-5 hover:shadow-lg transition-shadow border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Dr. {appointment.doctor_name}
                  </h3>
                </div>
                <Badge variant="secondary" className={`${statusColors[appointment.status]} border`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{format(new Date(appointment.date), 'EEEE, MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>{appointment.start_time} - {appointment.end_time}</span>
                </div>
              </div>

              {appointment.reason && (
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <span className="font-medium">Reason:</span> {appointment.reason}
                </div>
              )}

              {appointment.notes && (
                <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="font-medium text-blue-900">Doctor's Notes:</span> {appointment.notes}
                </div>
              )}

              {appointment.status === 'rejected' && appointment.cancellation_reason && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Rejection Reason:</span> {appointment.cancellation_reason}
                  </div>
                </div>
              )}
            </div>

            {!isPast && appointment.status !== 'cancelled' && appointment.status !== 'rejected' && (
              <div className="flex md:flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancel(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment with Dr. {appointment.doctor_name} on{" "}
              {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.start_time}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}