import React, { useEffect, useState } from "react";
import { AdminLayout } from "../../templates/AdminLayout/AdminLayout";
import { AdminOnly } from "../../atoms/AdminOnly/AdminOnly";
import { Button } from "../../atoms/Button/Button";
import { StatCard } from "../../atoms/StatCard/StatCard";
import { userApi } from "../../../api/userApi";
import { blogApi } from "../../../api/blogApi";
import { User } from "../../../types/types";

export const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [companies, setCompanies] = useState<User[]>([]);
  const [recentStudents, setRecentStudents] = useState<User[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<User[]>([]);
  const [blogCount, setBlogCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users by role
      const [studentsData, companiesData, blogsData] = await Promise.all([
        userApi.getAll('STUDENT'),
        userApi.getAll('COMPANY'),
        blogApi.getAll() // Get all blogs to count
      ]);

      setStudents(studentsData);
      setCompanies(companiesData);
      setBlogCount(blogsData.length || 0);

      // Get recent users (last 5)
      setRecentStudents(studentsData.slice(0, 3));
      setRecentCompanies(companiesData.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Students",
      value: loading ? "..." : students.length.toLocaleString(),
      change: "Active users",
      positive: true,
      color: "blue" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: "Total Companies",
      value: loading ? "..." : companies.length.toLocaleString(),
      change: "Registered companies",
      positive: true,
      color: "green" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: "Total Blog Posts",
      value: loading ? "..." : blogCount.toLocaleString(),
      change: "Published posts",
      positive: true,
      color: "purple" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Total Users",
      value: loading ? "..." : (students.length + companies.length).toLocaleString(),
      change: "All platform users",
      positive: true,
      color: "red" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {loading && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              positive={stat.positive}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Students</h2>
              <AdminOnly>
                <Button variant="secondary" className="text-sm">View All</Button>
              </AdminOnly>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentStudents.length > 0 ? (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.fullName || student.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-blue-600 font-semibold text-sm">
                          {(student.fullName || student.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{student.fullName || student.username}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No students found</p>
              )}
            </div>
          </div>

          {/* Recent Companies */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Companies</h2>
              <AdminOnly>
                <Button variant="secondary" className="text-sm">View All</Button>
              </AdminOnly>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentCompanies.length > 0 ? (
                recentCompanies.map((company) => (
                  <div key={company.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                      {company.avatar ? (
                        <img src={company.avatar} alt={company.fullName || company.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-green-600 font-semibold text-sm">
                          {(company.fullName || company.username || 'C').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{company.fullName || company.username}</p>
                      <p className="text-xs text-gray-500">{company.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No companies found</p>
              )}
            </div>
          </div>
        </div>

        {/* Admin-Only Quick Actions */}
        <AdminOnly>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-md p-6 border border-red-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="primary" className="w-full justify-center">
                Manage Users
              </Button>
              <Button variant="primary" className="w-full justify-center">
                View Reports
              </Button>
              <Button variant="primary" className="w-full justify-center">
                System Settings
              </Button>
            </div>
          </div>
        </AdminOnly>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
