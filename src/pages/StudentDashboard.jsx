import { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, BookOpen, Calendar, Clock, ChevronRight, Award, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EnhancedGroupManagement from '../components/student/EnhancedGroupManagement';
import AssignmentList from '../components/student/AssignmentList';
import ProgressTracker from '../components/student/ProgressTracker';
import BrowseCourses from '../components/BrowseCourses';
import api, { courseAPI, assignmentAPI } from '../utils/api';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0
  });
  const navigate = useNavigate();

  const tabs = [
    { id: 'courses', label: 'Browse Courses', icon: Search },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch enrolled courses
      const coursesRes = await courseAPI.getStudentCourses(user.id);
      
      setCourses(coursesRes.data.courses || []);
      
      // Fetch assignments
      const assignmentsRes = await assignmentAPI.getAllAssignments();
      
      const assignments = assignmentsRes.data.assignments || [];
      
      // Calculate stats
      const completedAssignments = assignments.filter(a => 
        a.status === 'graded' || a.status === 'submitted' || a.status === 'reviewed'
      ).length;
      
      const gradedAssignments = assignments.filter(a => a.status === 'graded' && a.grade !== undefined);
      const averageGrade = gradedAssignments.length > 0
        ? Math.round(gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length)
        : 0;
      
      setStats({
        totalCourses: coursesRes.data.courses?.length || 0,
        totalAssignments: assignments.length,
        completedAssignments: completedAssignments,
        averageGrade: averageGrade
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  const getCourseColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Here's what's happening with your courses today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Total Courses</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Assignments</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">View in Assignments tab</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.completedAssignments}</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Graded assignments</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Average Grade</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.averageGrade > 0 ? `${stats.averageGrade}%` : 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Based on graded work</p>
              </div>
              <div className="bg-orange-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm mb-4 sm:mb-6 overflow-x-auto border border-gray-100">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center space-x-2 py-3 sm:py-4 px-3 sm:px-6 font-semibold text-sm sm:text-base transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-3 border-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <BrowseCourses />
            </div>
          )}
          {activeTab === 'assignments' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <AssignmentList />
            </div>
          )}
          {activeTab === 'groups' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <EnhancedGroupManagement />
            </div>
          )}
          {activeTab === 'progress' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <ProgressTracker />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
