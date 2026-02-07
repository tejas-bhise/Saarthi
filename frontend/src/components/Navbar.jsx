import React from 'react';

export const Navbar = ({ 
  showNav = false, 
  onBack = null, 
  showBackButton = false,
  currentPage = 'landing',
  onNavigate = null 
}) => {
  if (!showNav) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Back Button + Logo */}
        <div className="flex items-center gap-4">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all duration-300 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          )}
          
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onNavigate && onNavigate('landing')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
              🎓
            </div>
            <span className="text-2xl font-black text-white">Saarthi</span>
          </div>
        </div>
        
        {/* Right: Navigation Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate('landing')}
            className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
              currentPage === 'landing' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate && onNavigate('companions')}
            className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
              currentPage === 'companions' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            AI Tutors
          </button>
        </div>
      </div>
    </nav>
  );
};
