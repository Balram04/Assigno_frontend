import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, BarChart3, BookOpen, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AssignmentManagement from '../components/admin/AssignmentManagement';
import BrowseCourses from '../components/BrowseCourses';
import Analytics from '../components/admin/Analytics';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    submissionRate: 0
  });
  const navigate = useNavigate();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'Browse Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  useEffect(() => {
    fetchProfessorData();
  }, []);

  const fetchProfessorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch professor's courses
      const coursesRes = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/professor/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCourses(coursesRes.data.courses || []);
      
      // Fetch assignments
      const assignmentsRes = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/assignments/admin/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const assignments = assignmentsRes.data.assignments || [];
      
      // Calculate total students - only count active enrollments
      const totalStudents = coursesRes.data.courses?.reduce((sum, course) => {
        const activeStudents = course.enrolledStudents?.filter(
          enrollment => enrollment.status === 'active'
        ).length || 0;
        return sum + activeStudents;
      }, 0) || 0;
      
      // Calculate total assignments submitted and total expected
      const totalSubmitted = assignments.reduce((sum, assignment) => sum + (assignment.submitted_count || 0), 0);
      const totalExpected = assignments.reduce((sum, assignment) => sum + (assignment.total_students || 0), 0);
      const submissionRate = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;
      
      setStats({
        totalCourses: coursesRes.data.courses?.length || 0,
        totalStudents: totalStudents,
        totalAssignments: assignments.length,
        submissionRate: submissionRate
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching professor data:', error);
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/admin/course/${courseId}`);
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
            Professor Dashboard 👨‍🏫
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Manage your courses, assignments, and track student progress.
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
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Total Students</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
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
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Submission Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.submissionRate > 0 ? `${stats.submissionRate}%` : 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">Overall completion</p>
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
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats Overview */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Active Courses</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.totalCourses}</p>
                      </div>
                      <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 opacity-20" />
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Total Students</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.totalStudents}</p>
                      </div>
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 opacity-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <BrowseCourses isProfessor={true} />
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <AssignmentManagement />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <Analytics />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
