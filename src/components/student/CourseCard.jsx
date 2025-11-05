import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, Award } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

const CourseCard = ({ course, progress }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/student/courses/${course.id || course._id}/assignments`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer overflow-hidden group"
    >
      {/* Header with course color */}
      <div
        className="h-32 p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${course.color || '#6366f1'} 0%, ${course.color || '#6366f1'}dd 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {course.courseCode}
              </h3>
              <p className="text-white/90 text-sm font-medium">
                {course.courseName}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Professor info */}
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {course.professor?.fullName || 'Professor'}
          </span>
        </div>

        {/* Course details */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{course.semester} {course.year}</span>
          </div>
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-2" />
            <span>{course.credits} Credits</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Course Progress</span>
            <span className="text-gray-500">
              {progress?.completed || 0} / {progress?.total || 0} assignments
            </span>
          </div>
          <ProgressBar
            percentage={progress?.percentage || 0}
            showLabel={false}
            size="md"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {progress?.total || 0}
            </div>
            <div className="text-xs text-gray-500">Assignments</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {progress?.pending || 0}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {progress?.completed || 0}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent group-hover:via-indigo-500 transition-colors duration-300"></div>
    </div>
  );
};

export default CourseCard;
