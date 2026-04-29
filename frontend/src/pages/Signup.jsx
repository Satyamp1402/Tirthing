import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from "lucide-react";

const Signup = ({ isAdmin = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const role = isAdmin ? "admin" : "user";
      const data = await authService.signup(name, email, password, role);

      // The backend sets the httpOnly cookie — we just update context.
      // No more localStorage.setItem('token') or localStorage.setItem('user').
      login(data.user);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-auto flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg border border-border bg-surface">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-text">{isAdmin ? "Admin Portal - Signup" : "Sign up"}</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded text-center">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-muted">Full Name</label>
              <input
                type="text" required
                className="mt-1 block w-full px-4 py-2 bg-input-bg border border-border text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="Full Name"
                value={name} onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">Email address</label>
              <input
                type="email" required
                className="mt-1 block w-full px-4 py-2 bg-input-bg border border-border text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="Email address"
                value={email} onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </div>
            <div className="relative">
              <label className="text-sm font-medium text-text-muted">Password</label>

              <input
                type={showPassword ? "text" : "password"}
                required
                className="mt-1 block w-full px-4 py-2 pr-10 bg-input-bg border border-border text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-muted hover:text-text"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <button
            disabled = {loading}
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-md text-white font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? "Please wait. Signing up...." : "Sign Up"} 
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link to= {isAdmin ? "/admin-login" : "/login"} className="text-primary hover:text-primary-hover font-medium">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;
