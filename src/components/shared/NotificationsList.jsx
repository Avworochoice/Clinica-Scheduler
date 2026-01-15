import React from "react";
import { format } from "date-fns";
import { Bell, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationsList({ notifications }) {
  const getIcon = (type) => {
    switch (type) {
      case "appointment_approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "appointment_rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "appointment_cancelled":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "appointment_reminder":
        return <Bell className="w-4 h-4 text-blue-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-600" />;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 hover:bg-slate-50 transition-colors ${
            notif.status === 'sent' ? 'bg-blue-50/30' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                {notif.title}
              </h4>
              <p className="text-sm text-slate-600 mb-2">
                {notif.message}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {notif.created_date && format(new Date(notif.created_date), 'MMM dd, yyyy h:mm a')}
                </span>
                {notif.status === 'sent' && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Delivered
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}