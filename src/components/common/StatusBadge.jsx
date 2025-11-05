import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Award,
  FileText,
  Sparkles 
} from 'lucide-react';

const StatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '',
  animated = true 
}) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      hoverColor: 'hover:bg-yellow-200',
      icon: Clock,
      dotColor: 'bg-yellow-500',
      glowColor: 'shadow-yellow-200'
    },
    submitted: {
      label: 'Submitted',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      hoverColor: 'hover:bg-blue-200',
      icon: FileText,
      dotColor: 'bg-blue-500',
      glowColor: 'shadow-blue-200'
    },
    acknowledged: {
      label: 'Acknowledged',
      color: 'bg-green-100 text-green-800 border-green-300',
      hoverColor: 'hover:bg-green-200',
      icon: CheckCircle,
      dotColor: 'bg-green-500',
      glowColor: 'shadow-green-200'
    },
    reviewed: {
      label: 'Reviewed',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      hoverColor: 'hover:bg-indigo-200',
      icon: AlertCircle,
      dotColor: 'bg-indigo-500',
      glowColor: 'shadow-indigo-200'
    },
    graded: {
      label: 'Graded',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      hoverColor: 'hover:bg-purple-200',
      icon: Award,
      dotColor: 'bg-purple-500',
      glowColor: 'shadow-purple-200'
    },
    overdue: {
      label: 'Overdue',
      color: 'bg-red-100 text-red-800 border-red-300',
      hoverColor: 'hover:bg-red-200',
      icon: XCircle,
      dotColor: 'bg-red-500',
      glowColor: 'shadow-red-200'
    },
    success: {
      label: 'Success',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      hoverColor: 'hover:bg-emerald-200',
      icon: Sparkles,
      dotColor: 'bg-emerald-500',
      glowColor: 'shadow-emerald-200'
    },
    warning: {
      label: 'Warning',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      hoverColor: 'hover:bg-amber-200',
      icon: AlertCircle,
      dotColor: 'bg-amber-500',
      glowColor: 'shadow-amber-200'
    },
    error: {
      label: 'Error',
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      hoverColor: 'hover:bg-rose-200',
      icon: XCircle,
      dotColor: 'bg-rose-500',
      glowColor: 'shadow-rose-200'
    },
    info: {
      label: 'Info',
      color: 'bg-sky-100 text-sky-800 border-sky-300',
      hoverColor: 'hover:bg-sky-200',
      icon: FileText,
      dotColor: 'bg-sky-500',
      glowColor: 'shadow-sky-200'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold border
        ${config.color} ${config.hoverColor} ${sizeClasses[size]} ${className}
        ${animated ? 'transition-all duration-200 transform hover:scale-105' : ''}
        shadow-sm ${config.glowColor}
      `}
    >
      {showIcon && (
        <>
          <span 
            className={`
              ${config.dotColor} rounded-full w-1.5 h-1.5 
              ${animated ? 'animate-pulse' : ''}
            `}
          ></span>
          <Icon className={`${iconSize[size]} ${animated ? 'transition-transform duration-200' : ''}`} />
        </>
      )}
      <span className="select-none">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
