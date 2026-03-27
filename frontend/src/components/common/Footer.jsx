import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer – Standard footer for Patient pages.
 */
const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 px-8 md:px-16 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MediSync</span>
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Connecting patients with the best healthcare specialists instantly. Your health, our priority.
          </p>
          <div className="flex gap-4">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">f</span>
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">t</span>
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">i</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Services</h4>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Online Consultation</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Diagnostic Tests</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Lab Bookings</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Health Checkups</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-blue-400 transition-colors cursor-pointer">About Us</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Contact Us</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Terms of Service</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Newsletter</h4>
          <p className="text-xs mb-4">Subscribe to get health tips and updates.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-slate-800 border-none rounded-lg px-4 py-2 text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} MediSync Healthcare Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
