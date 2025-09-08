import React from "react";

interface DrewLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const DrewLogo: React.FC<DrewLogoProps> = ({ 
  className = "", 
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer hexagon with gradient effect */}
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
            <stop offset="100%" stopColor="#60a5fa" /> {/* blue-400 */}
          </linearGradient>
        </defs>
        
        {/* Hexagon background */}
        <path 
          d="M16 2L28 9L28 23L16 30L4 23L4 9L16 2Z" 
          fill="url(#blueGradient)" 
          stroke="#1e40af" 
          strokeWidth="1"
        />
        
        {/* Inner geometric design - representing AI/tech */}
        <path 
          d="M16 8L22 12L22 20L16 24L10 20L10 12L16 8Z" 
          fill="white" 
          opacity="0.8"
        />
        
        {/* Central element - representing intelligence/connectivity */}
        <circle cx="16" cy="16" r="3" fill="#1e40af" />
        
        {/* Connection lines */}
        <line x1="16" y1="8" x2="16" y2="13" stroke="white" strokeWidth="1" />
        <line x1="22" y1="12" x2="19" y2="14" stroke="white" strokeWidth="1" />
        <line x1="22" y1="20" x2="19" y2="18" stroke="white" strokeWidth="1" />
        <line x1="16" y1="24" x2="16" y2="19" stroke="white" strokeWidth="1" />
        <line x1="10" y1="20" x2="13" y2="18" stroke="white" strokeWidth="1" />
        <line x1="10" y1="12" x2="13" y2="14" stroke="white" strokeWidth="1" />
      </svg>
    </div>
  );
};