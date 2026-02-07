import React from 'react';

export const CompanionCard = ({ companion, onSelect }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-blue-500 transform hover:scale-105 shadow-xl"
      onClick={() => onSelect(companion)}
    >
      {/* Companion Image */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={companion.imageUrl}
          alt={companion.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
        />
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{companion.name}</h3>
          <p className="text-blue-400 text-sm">{companion.subject}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4">{companion.description}</p>

      {/* Expertise Tags */}
      {companion.expertise && companion.expertise.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {companion.expertise.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        {companion.rating && (
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{companion.rating}</span>
          </div>
        )}
        {companion.sessions && (
          <div>
            <span>{companion.sessions} sessions</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors">
        Start Learning
      </button>
    </div>
  );
};
