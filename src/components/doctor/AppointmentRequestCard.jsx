import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle2, XCircle, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AppointmentRequestCard({ appointment, onUpdate }) {
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await appClient.entities.Appointment.update(appointment.id, {
        status: "approved",
        notes: notes.trim() || undefined
      });

      await appClient.entities.Notification.create({
        user_id: appointment.patient_id,
        user_email: appointment.patient_email,
        appointment_id: appointment.id,
        type: "appointment_approved",
        title: "Appointment Approved",
        message: `Your appointment on ${format(new Date(appointment.date), 'MMM dd, yyyy')} at ${appointment.start_time} has been approved.`
      });

      onUpdate();
      setShowApprove(false);
      setNotes("");
    } catch (error) {
      console.error("Failed to approve appointment:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    setProcessing(true);
    try {
      await appClient.entities.Appointment.update(appointment.id, {
        status: "rejected",
        cancellation_reason: rejectionReason.trim()
      });

      await appClient.entities.Notification.create({
        user_id: appointment.patient_id,
        user_email: appointment.patient_email,
        appointment_id: appointment.id,
        type: "appointment_rejected",
        title: "Appointment Not Available",
        message: `Your appointment request for ${format(new Date(appointment.date), 'MMM dd, yyyy')} at ${appointment.start_time} has been declined. Reason: ${rejectionReason.trim()}`
      });

      onUpdate();
      setShowReject(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject appointment:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {appointment.patient_name}
                </h3>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  Pending Review
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
                <div className="text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-slate-900">Reason for Visit:</span>
                      <p className="text-slate-700 mt-1">{appointment.reason}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500">
                Patient Email: {appointment.patient_email}
              </div>
            </div>

            <div className="flex lg:flex-col gap-3">
              <Button
                size="sm"
                onClick={() => setShowApprove(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex-1 lg:flex-none"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReject(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 flex-1 lg:flex-none"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Approve Dialog */}
      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Appointment</DialogTitle>
            <DialogDescription>
              Confirm appointment with {appointment.patient_name} on{" "}
              {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.start_time}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="notes">Add Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any instructions or notes for the patient..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprove(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? "Approving..." : "Confirm & Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Appointment</DialogTitle>
            <DialogDescription>
              Provide a reason for declining this appointment request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection">Reason for Declining *</Label>
              <Textarea
                id="rejection"
                placeholder="e.g., Not available at this time, slot already taken..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? "Declining..." : "Decline Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}