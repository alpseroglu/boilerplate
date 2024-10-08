import React from 'react'
import { Link } from 'react-router-dom'

interface UserProfilePageProps {
  email: string
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ email }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold text-center">User Profile</h1>
        <div className="mt-4">
          <p className="text-gray-600">Email:</p>
          <p className="font-semibold">{email}</p>
        </div>
        <Link 
          to="/dashboard" 
          className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default UserProfilePage