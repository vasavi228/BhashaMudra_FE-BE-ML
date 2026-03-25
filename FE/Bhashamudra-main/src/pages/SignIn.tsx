import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HandMetal, ArrowLeft } from 'lucide-react';
import { signIn } from '../services/authService'

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await signIn(formData.email, formData.password)
    navigate('/selection')
  } catch (error: any) {
    alert(error.message)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-[#004748] hover:text-[#004748]"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            {/* <HandMetal className="h-8 w-8 text-[#004748]" /> */}
            <span className="text-2xl font-bold text-gray-800">BhashaMudra</span>
          </div>
        </div>

        <h2 className="text-3xl text-center font-bold text-gray-800 mb-6">Welcome back!</h2>
        {/* <p className="text-gray-600 text-center mb-8">
          Sign in to continue your ISL journey
        </p> */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004748]-600 focus:border-transparent"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004748] focus:border-transparent"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-[#004748] focus:ring-[#004748] border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-[#004748] hover:text-[#004748]">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004748] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#004748] transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#004748] hover:text-[#004748] font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;