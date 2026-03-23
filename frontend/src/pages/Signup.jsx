import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.signup(name, email, password, role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg border border-border bg-surface">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-text">Create an account</h2>
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
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">Email address</label>
              <input
                type="email" required
                className="mt-1 block w-full px-4 py-2 bg-input-bg border border-border text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="Email address"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">Password</label>
              <input
                type="password" required
                className="mt-1 block w-full px-4 py-2 bg-input-bg border border-border text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">Role</label>
              <select
                className="mt-1 block w-full px-4 py-2 bg-input-bg border border-border text-text rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                value={role} onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-md text-white font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Sign Up
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;
