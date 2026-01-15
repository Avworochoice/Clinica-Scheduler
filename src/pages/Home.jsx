import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { motion } from "framer-motion";
import { Calendar, Shield, Bell, BarChart3, Clock, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["Efficient", "Secure", "Modern", "Smart"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Real-Time Scheduling",
      description: "Book appointments instantly with conflict-free slot validation",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Role-based access control with encrypted authentication",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated email alerts for bookings, approvals, and reminders",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track appointments, trends, and system performance",
      color: "from-orange-500 to-red-500"
    }
  ];

  const benefits = [
    "24/7 appointment booking access",
    "Instant doctor approval workflow",
    "Automated reminder system",
    "Mobile-friendly interface",
    "Comprehensive audit trails",
    "Real-time availability updates"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Cloud-Based Healthcare Solution
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Clinica Scheduler
              </span>
              <br />
              <span className="text-4xl md:text-5xl mt-4 inline-block">
                Clinical Appointments Made{" "}
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
                >
                  {words[currentWord]}
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Streamline your clinical workflow with intelligent appointment management, 
              real-time scheduling, and automated notifications. Built for patients, doctors, and administrators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 px-8 h-14 text-lg group">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={createPageUrl("Login")}>
                <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:bg-slate-100 h-14 px-8 text-lg">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex justify-center items-center gap-8 text-sm text-slate-600"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-600">Everything you need to manage clinical appointments efficiently</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow"></div>
                <div className="relative p-8 rounded-2xl">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-cyan-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose Clinica Scheduler?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join hundreds of healthcare providers who trust our platform for seamless appointment management.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-white"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">10K+</div>
                  <div className="text-blue-100">Appointments</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">500+</div>
                  <div className="text-blue-100">Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">98%</div>
                  <div className="text-blue-100">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">24/7</div>
                  <div className="text-blue-100">Availability</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Built For Everyone
            </h2>
            <p className="text-xl text-slate-600">Tailored experiences for each user type</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Patients",
                description: "Book appointments easily, track your visits, and receive timely reminders",
                icon: Users,
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Doctors",
                description: "Manage your schedule, approve requests, and maintain patient notes",
                icon: Calendar,
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Administrators",
                description: "Full system control, analytics, user management, and audit trails",
                icon: Shield,
                color: "from-purple-500 to-pink-500"
              }
            ].map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-slate-200"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{role.title}</h3>
                <p className="text-slate-600 leading-relaxed">{role.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of healthcare professionals using Clinica Scheduler
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 px-12 h-14 text-lg">
              Start Free Trial
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}