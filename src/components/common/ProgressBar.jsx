import React from 'react';
import { Check, TrendingUp } from 'lucide-react';

const ProgressBar = ({ 
  percentage, 
  showLabel = true, 
  size = 'md',
  color = 'auto',
  className = '',
  showCheckmark = true,
  animated = true 
}) => {
  // Determine color based on percentage if auto
  const getColor = () => {
    if (color !== 'auto') return color;
    
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    if (percentage < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getColorRing = () => {
    if (color !== 'auto') return color;
    
    if (percentage < 30) return 'text-red-500';
    if (percentage < 60) return 'text-yellow-500';
    if (percentage < 90) return 'text-blue-500';
    return 'text-green-500';
  };

  const getGradient = () => {
    if (color !== 'auto') return color;
    
    if (percentage < 30) return 'from-red-400 to-red-600';
    if (percentage < 60) return 'from-yellow-400 to-yellow-600';
    if (percentage < 90) return 'from-blue-400 to-blue-600';
    return 'from-green-400 to-green-600';
  };

  // Size variations
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const isComplete = percentage >= 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${getColorRing()} ${textSize[size]}`}>
              {percentage}%
            </span>
            {isComplete && showCheckmark && (
              <div className="flex items-center gap-1 text-green-600 animate-fadeIn">
                <Check className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-medium">Complete!</span>
              </div>
            )}
            {!isComplete && percentage > 0 && (
              <TrendingUp className={`w-3 h-3 ${getColorRing()} animate-pulse`} />
            )}
          </div>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]} shadow-inner`}>
        <div
          className={`
            bg-gradient-to-r ${getGradient()} 
            ${sizeClasses[size]} rounded-full 
            ${animated ? 'transition-all duration-700 ease-out' : ''}
            relative overflow-hidden
            ${isComplete ? 'animate-pulse-slow' : ''}
          `}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {/* Shimmer effect */}
          {animated && percentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          )}
          
          {/* Glow effect for completion */}
          {isComplete && (
            <div className="absolute inset-0 bg-white/30 animate-pulse-fast"></div>
          )}
        </div>
      </div>
      
      {/* Milestone markers */}
      {size === 'lg' && (
        <div className="flex justify-between mt-1 px-1">
          {[25, 50, 75, 100].map((milestone) => (
            <span
              key={milestone}
              className={`text-xs transition-all duration-300 ${
                percentage >= milestone 
                  ? 'text-gray-700 font-semibold' 
                  : 'text-gray-400'
              }`}
            >
              {milestone}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
