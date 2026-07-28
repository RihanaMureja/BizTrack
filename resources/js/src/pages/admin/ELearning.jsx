import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Star, Clock, BookOpen, PlayCircle, CheckCircle } from 'lucide-react';

const ELearning = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const courses = [
    {
      id: 1,
      title: 'Financial Management Fundamentals',
      instructor: 'Dr. Mekdes Alemu',
      duration: '4h 30m',
      lessons: 12,
      rating: 4.8,
      progress: 75,
      category: 'Finance',
      status: 'Continue',
      image: '💰',
    },
    {
      id: 2,
      title: 'Business Analytics with BizTrack',
      instructor: 'Eng. Henok Tadesse',
      duration: '3h 15m',
      lessons: 9,
      rating: 4.6,
      progress: 33,
      category: 'Analytics',
      status: 'Continue',
      image: '📊',
    },
    {
      id: 3,
      title: 'Customer Relationship Management',
      instructor: 'Sara Haile, MBA',
      duration: '2h 45m',
      lessons: 8,
      rating: 4.7,
      progress: 0,
      category: 'CRM',
      status: 'Start',
      image: '📞',
    },
    {
      id: 4,
      title: 'Inventory Management Masterclass',
      instructor: 'Yonas Tesfaye',
      duration: '3h 00m',
      lessons: 10,
      rating: 4.9,
      progress: 10,
      category: 'Inventory',
      status: 'Continue',
      image: '📦',
    },
    {
      id: 5,
      title: 'Sales Strategies for Small Business',
      instructor: 'Mekdes Girma',
      duration: '2h 30m',
      lessons: 7,
      rating: 4.5,
      progress: 0,
      category: 'Sales',
      status: 'Start',
      image: '📈',
    },
  ];

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['All', 'Finance', 'Analytics', 'CRM', 'Inventory', 'Sales'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredByCategory = filtered.filter(c => 
    activeCategory === 'All' || c.category === activeCategory
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Learning Platform</h1>
          <p className="text-gray-500">Video lessons and interactive quizzes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Enrolled Users</p>
            <p className="text-2xl font-bold text-gray-900">1,247</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Avg. Completion</p>
            <p className="text-2xl font-bold text-green-600">64%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Certificates Issued</p>
            <p className="text-2xl font-bold text-blue-600">328</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredByCategory.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">{course.image}</span>
                  <span className="ml-2 text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {course.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.instructor}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> {course.lessons} lessons</span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-green-500 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <button className={`mt-4 w-full py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                course.status === 'Start' 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}>
                {course.status === 'Start' ? (
                  <>
                    <PlayCircle size={16} /> Start
                  </>
                ) : course.progress === 100 ? (
                  <>
                    <CheckCircle size={16} /> Completed
                  </>
                ) : (
                  <>
                    <PlayCircle size={16} /> Continue
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ELearning;