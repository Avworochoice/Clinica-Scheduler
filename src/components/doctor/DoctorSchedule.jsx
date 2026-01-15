import React from "react";
import { format, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DoctorSchedule({ appointments, doctor }) {
  const groupedByDate = appointments.reduce((acc, apt) => {
    const dateKey = apt.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(apt);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {sortedDates.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 text-lg">No upcoming appointments</p>
              <p className="text-slate-400 text-sm mt-2">Your schedule is clear!</p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((dateKey, index) => {
            const date = new Date(dateKey);
            const dayAppointments = groupedByDate[dateKey].sort((a, b) => 
              a.start_time.localeCompare(b.start_time)
            );

            return (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <CardTitle className="flex items-center gap-3">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <div className="text-xl font-bold">
                          {format(date, 'EEEE, MMMM dd, yyyy')}
                        </div>
                        <div className="text-sm font-normal opacity-90">
                          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex-shrink-0 text-center bg-white p-3 rounded-lg border border-slate-300">
                            <Clock className="w-5 h-5 text-blue-600 mb-1 mx-auto" />
                            <div className="text-sm font-semibold text-slate-900">
                              {apt.start_time}
                            </div>
                            <div className="text-xs text-slate-500">
                              {apt.end_time}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-slate-600" />
                              <h4 className="font-semibold text-slate-900">
                                {apt.patient_name}
                              </h4>
                            </div>

                            {apt.reason && (
                              <div className="text-sm text-slate-600 flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{apt.reason}</span>
                              </div>
                            )}

                            {apt.notes && (
                              <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                                <span className="font-medium">Your notes:</span> {apt.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <div>
        <Card className="shadow-lg border-0 sticky top-6">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Weekly Availability</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {doctor.availability?.map((slot) => (
                <div key={slot.day} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-900">{slot.day}</span>
                  <span className="text-sm text-slate-600">
                    {slot.start_time} - {slot.end_time}
                  </span>
                </div>
              )) || (
                <p className="text-slate-500 text-sm">No availability set</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}