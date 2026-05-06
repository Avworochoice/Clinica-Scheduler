import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Stethoscope, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    appClient.auth.me().then((userData) => {
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || ""
      });
    }).catch(() => appClient.auth.redirectToLogin());
  }, []);

  const { data: doctor } = useQuery({
    queryKey: ['doctor-profile', user?.doctor_id],
    queryFn: () => appClient.entities.Doctor.filter({ id: user.doctor_id }),
    enabled: !!user?.doctor_id,
    select: (data) => data[0]
  });

  const updateMutation = useMutation({
    mutationFn: (data) => appClient.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setEditing(false);
      appClient.auth.me().then(setUser);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-2">Manage your personal information</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card className="shadow-lg border-0 md:col-span-2">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Profile Information
                </span>
                {!editing && (
                  <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                    Edit Profile
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="mt-2 bg-slate-100"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-500">Full Name</Label>
                    <p className="text-lg font-medium mt-1">{user.full_name || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Email Address</Label>
                    <p className="text-lg font-medium mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Account Role</Label>
                    <div className="mt-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                        {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-500">Member Since</Label>
                    <p className="text-lg font-medium mt-1">
                      {new Date(user.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Profile (if applicable) */}
          {doctor && (
            <Card className="shadow-lg border-0 md:col-span-2">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-green-600" />
                  Doctor Profile
                </CardTitle>
                <CardDescription>Your medical practice information</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-slate-500">Specialty</Label>
                    <p className="text-lg font-medium mt-1">{doctor.specialty}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Phone</Label>
                    <p className="text-lg font-medium mt-1">{doctor.phone || "Not set"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-500">Bio</Label>
                    <p className="text-base mt-1 text-slate-700">{doctor.bio || "No bio available"}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Consultation Duration</Label>
                    <p className="text-lg font-medium mt-1">{doctor.consultation_duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Status</Label>
                    <div className="mt-2">
                      <Badge variant={doctor.is_active ? 'default' : 'secondary'}>
                        {doctor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}