import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎓</span>
              <span className="text-xl font-bold text-white">Saarthi</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your AI-Powered Learning Companion. Master any subject with personalized AI tutors.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/" onClick={(e) => e.preventDefault()}>AI Tutors</a></li>
              <li><a href="/" onClick={(e) => e.preventDefault()}>Voice Learning</a></li>
              <li><a href="/" onClick={(e) => e.preventDefault()}>Study Sessions</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/" onClick={(e) => e.preventDefault()}>Documentation</a></li>
              <li><a href="/" onClick={(e) => e.preventDefault()}>Tutorials</a></li>
              <li><a href="/" onClick={(e) => e.preventDefault()}>Community</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/" onClick={(e) => e.preventDefault()}>Help Center</a></li>
              <li><a href="/" onClick={(e) => e.preventDefault()}>Contact Us</a></li>
              <li><a href="/" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          © 2026 Saarthi - AI Learning Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
