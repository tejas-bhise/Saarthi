import React from 'react';
import { CompanionCard } from '../components/CompanionCard';
import { Footer } from '../components/Footer';

// ✅ ONLY 2 TUTORS
const companions = [
  {
    id: "omkar_ai",
    name: "Omkar",
    subject: "AI & Machine Learning",
    description: "Expert in Artificial Intelligence and Machine Learning. Clear explanations for complex concepts.",
    imageUrl: "/tutor-images/omkar.png",
    modelUrl: null,
    expertise: ["AI", "Machine Learning", "Deep Learning", "Neural Networks"],
    rating: 4.9,
    sessions: 150,
    gradient: "from-blue-600 to-cyan-600"
  },
  {
    id: "priya_biology",
    name: "Priya",
    subject: "Biology",
    description: "Passionate biology teacher making learning fun with real-world examples and interactive sessions.",
    imageUrl: "/tutor-images/priya.png",
    modelUrl: "female_glb.glb",
    expertise: ["Cell Biology", "Genetics", "Ecology", "Human Anatomy"],
    rating: 4.9,
    sessions: 120,
    gradient: "from-purple-600 to-pink-600"
  }
];

export const CompanionsPage = ({ onSelectCompanion }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }}></div>
      
      <div className="relative flex-1 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/10 backdrop-blur-xl border border-blue-500/30 rounded-full text-blue-400 font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span>2 Expert AI Tutors Available</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Choose Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                AI Tutor
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Each tutor is powered by advanced AI models with voice interaction, 
              3D avatars, and personalized learning experiences.
            </p>
          </div>

          {/* Tutors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {companions.map((companion) => (
              <div 
                key={companion.id}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${companion.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  {/* Avatar Icon */}
                  <div className={`w-24 h-24 bg-gradient-to-br ${companion.gradient} rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {companion.id === 'omkar_ai' ? '🧑‍💻' : '👩‍🔬'}
                  </div>
                  
                  {/* Name & Subject */}
                  <h3 className="text-3xl font-bold text-white mb-2">{companion.name}</h3>
                  <p className={`text-lg font-semibold bg-gradient-to-r ${companion.gradient} bg-clip-text text-transparent mb-4`}>
                    {companion.subject}
                  </p>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {companion.description}
                  </p>
                  
                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {companion.expertise.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white font-semibold">{companion.rating}</span>
                      <span className="text-gray-400">rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">👥</span>
                      <span className="text-white font-semibold">{companion.sessions}+</span>
                      <span className="text-gray-400">sessions</span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    onClick={() => onSelectCompanion(companion)}
                    className={`w-full px-6 py-4 bg-gradient-to-r ${companion.gradient} hover:shadow-2xl hover:shadow-${companion.gradient.split('-')[1]}-500/50 text-white rounded-xl font-bold transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2`}
                  >
                    Start Learning with {companion.name}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">What You Get With Every Tutor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎤</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Voice Interaction</h4>
                  <p className="text-gray-400 text-sm">Speak naturally and get instant voice responses</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">🤖</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">3D Avatar</h4>
                  <p className="text-gray-400 text-sm">Realistic animations and lip-sync technology</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">💾</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Session History</h4>
                  <p className="text-gray-400 text-sm">All conversations saved, resume anytime</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">📝</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Smart Notes</h4>
                  <p className="text-gray-400 text-sm">Take notes during sessions with built-in editor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
