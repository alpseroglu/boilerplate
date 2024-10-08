import React from 'react'

interface AdminDashboardProps {
  onLogout: () => void
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold text-center">Admin Dashboard</h1>
        <p className="text-center">Welcome to the admin dashboard.</p>
        <button
          onClick={onLogout}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard