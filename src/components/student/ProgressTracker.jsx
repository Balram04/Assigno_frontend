import { useState, useEffect } from 'react';
import { TrendingUp, Target, CheckCircle2, Clock, BookOpen, Award } from 'lucide-react';
import api from '../../utils/api';

const ProgressTracker = () => {
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch enrolled courses
      const coursesRes = await api.get(`/courses/student/${user.id}`);
      const courses = coursesRes.data.courses || [];
      setCourses(courses);

      // Fetch progress for each course
      const progressPromises = courses.map(course =>
        api.get(`/submissions/course-progress/${course._id}`)
      );
      const progressResults = await Promise.all(progressPromises);

      const progress = {};
      courses.forEach((course, index) => {
        progress[course._id] = progressResults[index].data;
      });

      setProgressData(progress);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading progress...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <TrendingUp className="w-7 h-7 mr-2" />
        Course Progress
      </h2>

      {courses.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          Enroll in courses to track your progress
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const progress = progressData[course._id] || {};
            const percentage = progress.completionPercentage || 0;

            return (
              <div key={course._id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                      <h3 className="font-semibold text-lg text-gray-800">{course.courseName}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{course.courseCode}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary-600">{percentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">{progress.total || 0}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">{progress.confirmed || 0}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                    <p className="text-2xl font-bold text-yellow-600">{progress.pending || 0}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>

                {/* Average Grade */}
                {progress.averageGrade > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Average Grade</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{progress.averageGrade}%</span>
                  </div>
                )}

                {/* Completion Badge */}
                {percentage === 100 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-800 font-medium">🎉 All assignments completed!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
