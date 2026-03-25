import React, { useState } from 'react';
import { signUp } from '../services/authService'
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({ password: '', form: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, password: 'Passwords do not match' });
      return false;
    }
    if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      setErrors({ ...errors, password: 'Password must have 8+ chars, 1 uppercase, and 1 number' });
      return false;
    }
    setErrors({ ...errors, password: '' });
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validatePasswords()) return
  setIsSubmitting(true)
  setErrors({ ...errors, form: '' })

  try {
    await signUp(formData.fullName, formData.email, formData.password)
    localStorage.setItem('userProfile', JSON.stringify({
      fullName: formData.fullName,
      email: formData.email
    }))
    navigate('/welcome')
  } catch (error: any) {
    setErrors({ ...errors, form: error.message })
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#98E7DE] to-[#ffe8e1] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => navigate('/')} className="text-[#004748] hover:text-[#003634] transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <span className="text-2xl font-bold text-gray-800">BhashaMudra</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">Create your account</h2>
        <p className="text-gray-600 mb-8">Join our community and start your journey with Indian Sign Language</p>

        {errors.form && <p className="text-red-600 text-sm mb-4">{errors.form}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {["fullName", "email", "password", "confirmPassword"].map((field, index) => (
            <div key={index}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-2">
                {field === "fullName" ? "Full Name" : field === "email" ? "Email address" : field === "password" ? "Password" : "Confirm Password"}
              </label>
              <input
                type={field === "confirmPassword" ? "password" : field.includes("password") ? "password" : "text"}
                id={field}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004748] focus:border-transparent"
                placeholder={`Enter your ${field.replace("fullName", "full name")}`}
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
              />
              {field === "password" && errors.password && <p className="text-sm text-red-600 mt-2">{errors.password}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#004748] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#003634] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#004748] hover:text-[#003634] font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
