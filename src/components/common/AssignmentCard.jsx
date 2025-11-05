import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  User,
  CheckCircle,
  Upload,
  AlertTriangle,
  Award,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';

const AssignmentCard = ({
  assignment,
  onSubmit,
  onAcknowledge,
  onViewDetails,
  isGroupLeader = false,
  isProfessor = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 2 && daysRemaining > 0;

  // Calculate progress percentage
  const getProgress = () => {
    const status = assignment.status?.toLowerCase() || 'pending';
    switch (status) {
      case 'graded':
        return 100;
      case 'acknowledged':
        return 85;
      case 'submitted':
        return 65;
      case 'in-progress':
        return 40;
      default:
        return 0;
    }
  };

  // Get status color
  const getStatusType = () => {
    const status = assignment.status?.toLowerCase() || 'pending';
    if (isOverdue && status === 'pending') return 'overdue';
    return status;
  };

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
        transform transition-all duration-300 hover:shadow-xl
        ${className}
      `}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {assignment.title}
              </h3>
              <StatusBadge status={getStatusType()} size="sm" />
            </div>

            {/* Assignment Type Badge */}
            <div className="flex items-center gap-2 mb-3">
              {assignment.submissionType === 'group' ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                  <Users className="w-3 h-3" />
                  Group Assignment
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                  <User className="w-3 h-3" />
                  Individual
                </span>
              )}

              {assignment.points && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                  <Award className="w-3 h-3" />
                  {assignment.points} pts
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {assignment.description}
            </p>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Due Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Time Left</p>
              <p
                className={`font-semibold ${
                  isOverdue
                    ? 'text-red-600'
                    : isDueSoon
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {isOverdue
                  ? 'Overdue'
                  : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isProfessor && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Progress</span>
              <span className="text-xs text-gray-500">
                {assignment.status || 'Not Started'}
              </span>
            </div>
            <ProgressBar
              percentage={getProgress()}
              size="md"
              showLabel={false}
              animated={true}
              showCheckmark={true}
            />
          </div>
        )}

        {/* Warning for overdue */}
        {isOverdue && assignment.status === 'pending' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg mb-4 animate-pulse-slow">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                This assignment is overdue!
              </p>
            </div>
          </div>
        )}

        {/* Due Soon Warning */}
        {isDueSoon && assignment.status === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
              <p className="text-sm font-semibold text-yellow-800">
                Due soon! Submit before the deadline.
              </p>
            </div>
          </div>
        )}

        {/* Group Leader Acknowledgment */}
        {assignment.submissionType === 'group' &&
          assignment.status === 'submitted' &&
          isGroupLeader && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-4 animate-scaleIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900 mb-1">
                    Acknowledgment Required
                  </p>
                  <p className="text-sm text-green-700">
                    As group leader, please acknowledge this submission
                  </p>
                </div>
                <button
                  onClick={() => onAcknowledge && onAcknowledge(assignment)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Acknowledge
                </button>
              </div>
            </div>
          )}

        {/* Submission Success */}
        {(assignment.status === 'acknowledged' || assignment.status === 'graded') && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl mb-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  {assignment.status === 'graded'
                    ? 'Assignment Graded'
                    : 'Submission Acknowledged'}
                </p>
                <p className="text-sm text-green-700">
                  {assignment.status === 'graded'
                    ? `Grade: ${assignment.grade || 'Pending'}`
                    : 'Your submission has been acknowledged successfully'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          {!isProfessor && assignment.status === 'pending' && (
            <button
              onClick={() => onSubmit && onSubmit(assignment)}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Submit
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isExpanded ? 'Hide' : 'View'} Details
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="px-6 pb-6 animate-slideDown">
          <div className="pt-4 border-t border-gray-100 space-y-4">
            {assignment.instructions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {assignment.instructions}
                </p>
              </div>
            )}

            {assignment.resources && assignment.resources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Resources</h4>
                <div className="space-y-2">
                  {assignment.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      {resource.name || `Resource ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {assignment.submittedAt && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Submission Info</h4>
                <div className="text-sm text-gray-600">
                  <p>
                    Submitted:{' '}
                    {new Date(assignment.submittedAt).toLocaleString()}
                  </p>
                  {assignment.submittedBy && (
                    <p>By: {assignment.submittedBy.name}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;
