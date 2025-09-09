import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Geometric Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-10 animate-bounce" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 transform rotate-45 opacity-10 animate-spin" 
           style={{ animationDuration: '10s' }} />
    </div>
  );
};

export default AnimatedBackground;