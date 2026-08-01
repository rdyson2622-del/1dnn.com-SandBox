import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
  const isAdmin = userRole === 'admin';

  return (
    <div className="w-64 h-screen bg-black border-r border-gray-800 flex flex-col p-6 fixed left-0 top-0 z-40">
      <div className="mb-10 text-[#D4AF37] font-bold text-xl tracking-tighter">
        DYSON <span className="text-white">RELO</span>
      </div>

      <nav className="flex-1 space-y-4">
        {/* Shared Links */}
        <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Relocation Suite</div>
        <Link to="/RelocationRoadmap" className="flex items-center text-gray-300 hover:text-[#D4AF37] transition-colors">My Roadmap</Link>
        <Link to="/CityIntelligence" className="flex items-center text-gray-300 hover:text-[#D4AF37] transition-colors">City Intelligence</Link>

        {/* Admin Only Section */}
        {isAdmin && (
          <div className="mt-8 pt-8 border-t border-gray-900 space-y-4">
            <div className="text-[#D4AF37] text-[10px] uppercase tracking-widest mb-2 font-bold">Admin Command</div>
            <Link to="/admin" className="block text-gray-400 hover:text-white">Listing Owners</Link>
            <Link to="/admin" className="block text-gray-400 hover:text-white">Compose SMS</Link>
            <button className="w-full text-left bg-[#D4AF37]/10 text-[#D4AF37] p-2 rounded text-sm border border-[#D4AF37]/20">
              View as Client Portal
            </button>
          </div>
        )}
      </nav>

      {/* Footer / Heritage Link */}
      <div className="mt-auto pt-6 border-t border-gray-900">
        <Link to="/Explainers" className="text-xs text-gray-600 hover:text-[#D4AF37]">54 Years of Expertise</Link>
      </div>
    </div>
  );
};

export default Sidebar;