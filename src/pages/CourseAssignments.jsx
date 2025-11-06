import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload, 
  FileText, 
  Users,
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';
import api, { courseAPI, submissionAPI } from '../utils/api';

const CourseAssignments = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const isProfessor = user?.role === 'professor' || user?.role === 'admin';

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details with assignments included
      const courseRes = await courseAPI.getCourseById(courseId);
      
      setCourse(courseRes.data.course);
      
      // Use assignments from course response if available, otherwise fetch separately
      if (courseRes.data.assignments) {
        setAssignments(courseRes.data.assignments);
      } else {
        // Fallback: Fetch assignments separately if not included
        const assignmentsRes = await courseAPI.getCourseAssignments(courseId);
        setAssignments(assignmentsRes.data.assignments || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmitAssignment = async (assignmentId, groupId) => {
    if (!file) {
      setError('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('assignmentId', assignmentId);
      formData.append('groupId', groupId);
      formData.append('submissionNotes', submissionNotes);

      await submissionAPI.submitAssignment(formData);

      setSuccess('Assignment submitted successfully! 🎉');
      setFile(null);
      setSubmissionNotes('');
      setSelectedAssignment(null);
      
      // Refresh assignments
      fetchCourseData();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledgeSubmission = async (submissionId) => {
    try {
      await submissionAPI.acknowledgeSubmission(submissionId, 'Submission acknowledged by group leader');

      setSuccess('Submission acknowledged successfully!');
      fetchCourseData();
    } catch (error) {
      console.error('Error acknowledging submission:', error);
      setError(error.response?.data?.error || 'Failed to acknowledge submission');
    }
  };

  const getStatusIcon = (assignment) => {
    const status = assignment.userSubmission?.status || 'pending';
    switch (status) {
      case 'submitted':
      case 'acknowledged':
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (assignment) => {
    const status = assignment.userSubmission?.status || 'pending';
    switch (status) {
      case 'submitted':
      case 'acknowledged':
        return 'success';
      case 'graded':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'error';
    }
  };

  const calculateProgress = (assignment) => {
    const status = assignment.userSubmission?.status || 'pending';
    if (status === 'graded') return 100;
    if (status === 'acknowledged' || status === 'submitted') return 75;
    if (status === 'pending') return 0;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(isProfessor ? '/admin' : '/student')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 font-medium text-sm sm:text-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Course Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -ml-16 sm:-ml-24 -mb-16 sm:-mb-24"></div>
          
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs sm:text-sm font-medium mb-2">{course?.courseCode || 'N/A'}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{course?.courseName || course?.name}</h1>
            <p className="text-indigo-100 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-none">{course?.description || 'No description available'}</p>
            
            <div className="flex flex-wrap gap-3 sm:gap-6">
              <div className="flex items-center text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>{course?.enrolledStudents?.filter(e => e.status === 'active').length || 0} Students</span>
              </div>
              <div className="flex items-center text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>{assignments.length} Assignments</span>
              </div>
              <div className="flex items-center text-sm sm:text-base">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>{course?.semester || 'Fall'} {course?.year || new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 animate-slideDown">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 animate-slideDown">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Assignments List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
          
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
              <p className="text-gray-600">There are no assignments for this course yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {assignments.map((assignment) => {
                const submissionStatus = assignment.userSubmission?.status || 'pending';
                const isOverdue = assignment.isOverdue || (new Date() > new Date(assignment.dueDate) && !assignment.userSubmission);
                
                return (
                <div
                  key={assignment._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{assignment.title}</h3>
                          <StatusBadge status={getStatusColor(assignment)} />
                          {isOverdue && submissionStatus === 'pending' && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{assignment.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5" />
                            <span>
                              {new Date(assignment.dueDate) > new Date() 
                                ? `${Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days left`
                                : 'Overdue'
                              }
                            </span>
                          </div>
                          {assignment.submissionType && (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1.5" />
                              <span className="capitalize">{assignment.submissionType} Submission</span>
                            </div>
                          )}
                          {assignment.maxPoints && (
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1.5" />
                              <span>{assignment.maxPoints} Points</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-4">
                        {getStatusIcon(assignment)}
                      </div>
                    </div>

                    {/* OneDrive Link */}
                    {assignment.onedriveLink && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <a
                          href={assignment.onedriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          View Assignment Resources
                        </a>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {!isProfessor && (
                      <div className="mb-4">
                        <ProgressBar
                          percentage={calculateProgress(assignment)}
                          size="md"
                          color={submissionStatus === 'graded' ? 'bg-green-500' : 'bg-indigo-500'}
                        />
                      </div>
                    )}

                    {/* Assignment Actions */}
                    {!isProfessor && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        {submissionStatus === 'pending' && (
                          <div>
                            {selectedAssignment === assignment._id ? (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Upload Submission File
                                  </label>
                                  <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200"
                                    accept=".pdf,.doc,.docx,.zip,.rar"
                                  />
                                  {file && (
                                    <p className="mt-2 text-sm text-green-600 flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      {file.name} selected
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Submission Notes (Optional)
                                  </label>
                                  <textarea
                                    value={submissionNotes}
                                    onChange={(e) => setSubmissionNotes(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-200"
                                    rows="3"
                                    placeholder="Add any notes or comments about your submission..."
                                  />
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleSubmitAssignment(assignment._id, assignment.groupId)}
                                    disabled={submitting || !file}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                                  >
                                    {submitting ? (
                                      <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-5 h-5 mr-2" />
                                        Submit Assignment
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedAssignment(null);
                                      setFile(null);
                                      setSubmissionNotes('');
                                      setError('');
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedAssignment(assignment._id)}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center"
                              >
                                <Upload className="w-5 h-5 mr-2" />
                                Submit Assignment
                              </button>
                            )}
                          </div>
                        )}

                        {submissionStatus === 'submitted' && assignment.submissionType === 'group' && (
                          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                            <div>
                              <p className="font-semibold text-gray-900">Waiting for Acknowledgment</p>
                              <p className="text-sm text-gray-600">Group leader needs to acknowledge this submission</p>
                            </div>
                            <button
                              onClick={() => handleAcknowledgeSubmission(assignment.userSubmission.id)}
                              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200"
                            >
                              Acknowledge
                            </button>
                          </div>
                        )}

                        {submissionStatus === 'acknowledged' && (
                          <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                            <div>
                              <p className="font-semibold text-gray-900">Submission Acknowledged</p>
                              <p className="text-sm text-gray-600">Your submission has been acknowledged by the group leader</p>
                            </div>
                          </div>
                        )}

                        {submissionStatus === 'graded' && assignment.userSubmission && (
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-gray-900">Graded</p>
                              <span className="text-2xl font-bold text-blue-600">
                                {assignment.userSubmission.grade || 0}/{assignment.maxPoints || 100}
                              </span>
                            </div>
                            {assignment.userSubmission.feedback && (
                              <div className="mt-3 pt-3 border-t border-blue-100">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                                <p className="text-sm text-gray-600">{assignment.userSubmission.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Professor View */}
                    {isProfessor && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Submissions: </span>
                              <span className="font-semibold text-gray-900">
                                {assignment.submittedCount || 0}/{assignment.totalSubmissions || 0}
                              </span>
                            </div>
                          </div>
                          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200">
                            View Submissions
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CourseAssignments;
