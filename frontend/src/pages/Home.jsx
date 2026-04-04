import { useState, useEffect } from "react";
import {
  Stethoscope,
  Calendar,
  ShieldCheck,
  Video,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  Award,
  Activity,
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [retryCount]);

  const loadData = () => {
    setLoading(true);
    setError(false);

    setTimeout(() => {
      // simulate API with occasional error for demo
      const shouldError = retryCount > 0 && retryCount % 2 === 0;
      if (shouldError) {
        setError(true);
        setLoading(false);
      } else {
        setData([1, 2, 3]);
        setLoading(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    }, 1200);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // 🔴 ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]">
        <div className="max-w-md px-6 mx-auto text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-red-50">
            <XCircle className="text-red-500" size={48} />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900">
            Something went wrong
          </h3>
          <p className="mb-8 text-gray-600">
            We couldn't load the healthcare data. Please check your connection
            and try again.
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] 
                     transition-all duration-200 transform hover:scale-105 focus:outline-none 
                     focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] min-h-screen">
      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="fixed z-50 duration-300 top-4 right-4 animate-in slide-in-from-top-2 fade-in">
          <div className="px-4 py-3 border border-green-200 rounded-lg shadow-lg bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <p className="font-medium text-green-800">
                Data loaded successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 shadow-sm bg-white/80 backdrop-blur-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-[#2563eb]/10 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="text-[#2563eb]" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] bg-clip-text text-transparent">
                MediSync
              </h1>
            </div>

            <div className="items-center hidden gap-6 md:flex">
              <a
                href="#"
                className="text-gray-600 hover:text-[#2563eb] transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#2563eb] transition-colors duration-200"
              >
                Doctors
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#2563eb] transition-colors duration-200"
              >
                Pricing
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#2563eb] transition-colors duration-200"
              >
                Contact
              </a>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 text-[#2563eb] hover:bg-[#2563eb]/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2">
                Login
              </button>
              <button
                className="px-5 py-2 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white rounded-lg 
                               hover:shadow-lg hover:scale-105 transition-all duration-200 
                               focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/5 to-transparent"></div>
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#2563eb]/10 rounded-full px-4 py-2 mb-6">
              <Activity className="text-[#2563eb]" size={16} />
              <span className="text-sm font-medium text-[#2563eb]">
                Trusted by 50,000+ patients
              </span>
            </div>

            <h2 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              Smart Healthcare,
              <span className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] bg-clip-text text-transparent">
                {" "}
                Simplified
              </span>
            </h2>

            <p className="max-w-2xl mx-auto mb-10 text-lg text-gray-600 md:text-xl">
              Book appointments, consult doctors online, and manage your health
              records seamlessly with our intelligent healthcare platform.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                className="group px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white rounded-lg 
                               hover:shadow-xl hover:scale-105 transition-all duration-200 
                               focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2
                               flex items-center justify-center gap-2"
              >
                Book Appointment
                <ChevronRight
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  size={18}
                />
              </button>
              <button
                className="px-8 py-4 border-2 border-[#2563eb] text-[#2563eb] rounded-lg 
                               hover:bg-[#2563eb] hover:text-white transition-all duration-200 
                               focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-16 border-t border-gray-200 md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-[#2563eb]">500+</div>
                <div className="mt-1 text-sm text-gray-600">Expert Doctors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#2563eb]">50k+</div>
                <div className="mt-1 text-sm text-gray-600">Happy Patients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#2563eb]">24/7</div>
                <div className="mt-1 text-sm text-gray-600">
                  Support Available
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#2563eb]">100%</div>
                <div className="mt-1 text-sm text-gray-600">
                  Secure Platform
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Why Choose MediSync?
            </h3>
            <p className="max-w-2xl mx-auto text-gray-600">
              We provide comprehensive healthcare solutions with cutting-edge
              technology
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Calendar size={32} />}
              title="Easy Booking"
              desc="Schedule appointments quickly with verified doctors in just a few clicks."
            />
            <FeatureCard
              icon={<Video size={32} />}
              title="Video Consultation"
              desc="Consult doctors from anywhere securely with HD video quality."
            />
            <FeatureCard
              icon={<ShieldCheck size={32} />}
              title="Secure Records"
              desc="Your data is protected with enterprise-level security and encryption."
            />
          </div>
        </div>
      </section>

      {/* DOCTORS SECTION */}
      <section className="py-16 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Meet Our Expert Doctors
            </h3>
            <p className="max-w-2xl mx-auto text-gray-600">
              Highly qualified professionals dedicated to your health
            </p>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#2563eb]" size={48} />
              <p className="mt-4 text-gray-600">Loading healthcare data...</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && data.length === 0 && (
            <div className="py-20 text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
                <AlertCircle className="text-gray-400" size={32} />
              </div>
              <h4 className="mb-2 text-xl font-semibold text-gray-900">
                No doctors available
              </h4>
              <p className="text-gray-600">
                Please check back later for available appointments
              </p>
            </div>
          )}

          {/* SUCCESS STATE - Doctor Cards */}
          {!loading && data.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 
                              transform hover:-translate-y-1 overflow-hidden group cursor-pointer
                              focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  tabIndex={0}
                >
                  <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] h-32 relative">
                    <div className="absolute -bottom-12 left-6">
                      <div className="p-1 bg-white rounded-full shadow-lg">
                        <div className="flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full">
                          <Users className="text-gray-500" size={40} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-14">
                    <h4 className="mb-1 text-xl font-bold text-gray-900">
                      Dr. Sarah Johnson
                    </h4>
                    <p className="text-[#2563eb] font-medium mb-3">
                      Cardiologist
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star
                          className="text-yellow-400 fill-current"
                          size={16}
                        />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        15+ years experience
                      </span>
                    </div>
                    <button
                      className="w-full mt-4 px-4 py-2 border border-[#2563eb] text-[#2563eb] rounded-lg
                                     hover:bg-[#2563eb] hover:text-white transition-all duration-200"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h3 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Transform Your Healthcare Experience?
          </h3>
          <p className="mb-8 text-lg text-blue-100">
            Join thousands of satisfied patients who trust MediSync for their
            healthcare needs
          </p>
          <button
            className="px-8 py-4 bg-white text-[#2563eb] rounded-lg font-semibold
                           hover:shadow-xl hover:scale-105 transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                           focus:ring-offset-[#2563eb]"
          >
            Start Your Journey Today
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-gray-400 bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-8 mb-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="text-[#2563eb]" size={24} />
                <h3 className="text-xl font-bold text-white">MediSync</h3>
              </div>
              <p className="text-sm">
                Making healthcare accessible and convenient for everyone.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail size={16} /> support@medisync.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} /> +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} /> 123 Healthcare Ave, NY
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-sm text-center border-t border-gray-800">
            <p>
              © 2026 MediSync. All rights reserved. Your health, our priority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div
      tabIndex={0}
      className="group bg-white p-8 rounded-xl shadow-sm border border-gray-100 
                 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
                 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 cursor-pointer"
    >
      <div className="text-[#2563eb] mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="leading-relaxed text-gray-600">{desc}</p>
    </div>
  );
}
