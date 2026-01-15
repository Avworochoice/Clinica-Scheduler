import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, User, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
    initialData: []
  });

  const filteredLogs = logs.filter(log =>
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actionColors = {
    user_login: "bg-blue-100 text-blue-800",
    user_logout: "bg-slate-100 text-slate-800",
    appointment_created: "bg-green-100 text-green-800",
    appointment_approved: "bg-emerald-100 text-emerald-800",
    appointment_rejected: "bg-red-100 text-red-800",
    appointment_cancelled: "bg-orange-100 text-orange-800",
    user_created: "bg-purple-100 text-purple-800",
    user_updated: "bg-indigo-100 text-indigo-800",
    doctor_created: "bg-cyan-100 text-cyan-800"
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Audit Logs
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50">
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {log.created_date ? format(new Date(log.created_date), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900">{log.user_email || 'System'}</div>
                        {log.user_role && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {log.user_role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.action] || "bg-gray-100 text-gray-800"}>
                      {log.action?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm text-slate-600 line-clamp-2">
                      {log.details || 'No additional details'}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {log.ip_address || 'N/A'}
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