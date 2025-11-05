import { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Calendar, Award, CheckCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../utils/api';

const BrowseCourses = ({ isProfessor = false }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    department: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    credits: 3,
    maxStudents: 50
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch all available courses
      const allCoursesResponse = await api.get('/courses');
      
      if (isProfessor) {
        // For professors, fetch their own courses
        const professorCoursesResponse = await api.get(`/courses/professor/${user.id}`);
        setEnrolledCourses(professorCoursesResponse.data.courses || []);
      } else {
        // For students, fetch enrolled courses
        const enrolledResponse = await api.get(`/courses/student/${user.id}`);
        setEnrolledCourses(enrolledResponse.data.courses || []);
      }
      
      setAllCourses(allCoursesResponse.data.courses || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      await api.post(`/courses/${courseId}/enroll`);
      
      // Refresh courses after enrollment
      await fetchCourses();
      alert('Successfully enrolled in course!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (courseId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course? All assignments will be removed.')) return;
    
    try {
      await api.delete(`/courses/${courseId}`);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete course');
    }
  };

  const openEditModal = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode || '',
      courseName: course.courseName || course.name || '',
      description: course.description || '',
      department: course.department || '',
      semester: course.semester || 'Fall',
      year: course.year || new Date().getFullYear(),
      credits: course.credits || 3,
      maxStudents: course.maxStudents || 50
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      courseName: '',
      description: '',
      department: '',
      semester: 'Fall',
      year: new Date().getFullYear(),
      credits: 3,
      maxStudents: 50
    });
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  const isOwnCourse = (course) => {
    if (!isProfessor) return false;
    const user = JSON.parse(localStorage.getItem('user'));
    return course.professor?._id === user.id || course.professor === user.id;
  };

  const isFull = (course) => {
    // Only count active enrollments
    const activeEnrollments = course.enrolledStudents?.filter(
      enrollment => enrollment.status === 'active'
    ).length || 0;
    return activeEnrollments >= course.maxStudents;
  };

  const filteredCourses = allCourses.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.courseName?.toLowerCase().includes(searchLower) ||
      course.name?.toLowerCase().includes(searchLower) ||
      course.courseCode?.toLowerCase().includes(searchLower) ||
      course.department?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isProfessor ? 'Course Management' : 'Browse Courses'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isProfessor ? 'Create and manage your courses' : 'Find and enroll in available courses'}
          </p>
        </div>
        {isProfessor && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Course
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="Search by course name, code, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Enrolled Courses Summary */}
      {!isProfessor && enrolledCourses.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <span className="font-semibold text-green-900 text-sm sm:text-base">
              You are enrolled in {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {isProfessor && enrolledCourses.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
            <span className="font-semibold text-indigo-900 text-sm sm:text-base">
              You are teaching {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-sm sm:text-base text-gray-600">
            {searchTerm ? 'Try a different search term' : 'No courses available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCourses.map((course, index) => {
            const enrolled = isEnrolled(course._id);
            const full = isFull(course);
            const canEnroll = !enrolled && !full;
            
            return (
              <div
                key={course._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className={`h-24 sm:h-32 bg-gradient-to-br ${getCourseColor(index)} p-4 sm:p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="relative z-10">
                    <p className="text-white/90 text-xs sm:text-sm font-medium mb-1">{course.courseCode}</p>
                    <h3 className="text-white text-base sm:text-xl font-bold line-clamp-2">{course.courseName || course.name}</h3>
                  </div>
                  
                  {enrolled && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 sm:px-3 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Enrolled</span>
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 sm:p-6">
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>
                        {course.enrolledStudents?.filter(e => e.status === 'active').length || 0} / {course.maxStudents || 50} students
                      </span>
                      {full && <span className="text-red-600 font-semibold text-xs">(Full)</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{course.semester} {course.year}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{course.credits || 3} Credits</span>
                    </div>
                    
                    {course.department && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{course.department}</span>
                      </div>
                    )}

                    {course.professor && (
                      <div className="text-xs sm:text-sm text-gray-600 mt-2">
                        <span className="font-medium">Professor:</span> {course.professor.name || course.professor.fullName || 'N/A'}
                      </div>
                    )}
                  </div>

                  {isProfessor && isOwnCourse(course) ? (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => openEditModal(course, e)}
                        className="flex-1 bg-indigo-50 text-indigo-600 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteCourse(course._id, e)}
                        className="flex-1 bg-red-50 text-red-600 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-red-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </button>
                    </div>
                  ) : enrolled ? (
                    <button
                      disabled
                      className="w-full bg-green-50 text-green-700 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {isProfessor ? 'Your Course' : 'Already Enrolled'}
                    </button>
                  ) : full && !isProfessor ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-500 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold cursor-not-allowed"
                    >
                      Course Full
                    </button>
                  ) : !isProfessor ? (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrollingCourseId === course._id}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {enrollingCourseId === course._id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-50 text-gray-500 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold cursor-not-allowed"
                    >
                      Other Professor's Course
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Course Modal for Professors */}
      {isProfessor && showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="CS301"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Credits *
                  </label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    min="1"
                    max="6"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Web Development Fundamentals"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                  rows="3"
                  placeholder="Course description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Max Students
                  </label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    min="1"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all bg-white"
                    required
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 5}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl font-semibold text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getCourseColor = (index) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-red-500 to-red-600',
  ];
  return colors[index % colors.length];
};

export default BrowseCourses;
