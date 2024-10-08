import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import UserPage from './UserPage'
import UserProfilePage from './UserProfilePage'
import AdminDashboard from './AdminDashboard'

interface AuthFormProps {
  isLogin: boolean
  onSubmit: (email: string, password: string) => void
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isLogin ? 'Log In' : 'Sign Up'}
      </button>
    </form>
  )
}

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<{ email: string; isAdmin?: boolean } | null>(null)

  const handleAuth = async (email: string, password: string) => {
    const endpoint = isLogin ? '/.netlify/functions/api/login' : '/.netlify/functions/api/register'
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      console.log('Response:', data)
      if (response.ok) {
        setMessage(isLogin ? 'Logged in successfully' : 'Registered successfully')
        setUser({ email, isAdmin: data.isAdmin })
        localStorage.setItem('token', data.token)
      } else {
        setMessage(data.message || 'An error occurred')
      }
    } catch (error) {
      console.error('An error occurred:', error)
      setMessage('An error occurred. Please try again.')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setMessage('Logged out successfully')
  }

  if (user) {
    return (
      <Router>
        <Routes>
          <Route path="/dashboard" element={user.isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <UserPage email={user.email} onLogout={handleLogout} />} />
          <Route path="/profile" element={<UserProfilePage email={user.email} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Log in to your account' : 'Create a new account'}
          </h2>
        </div>
        {message && (
          <div className={`text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
        <AuthForm isLogin={isLogin} onSubmit={handleAuth} />
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App