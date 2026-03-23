import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

const Login = ({ isAdmin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.login(email, password);
      // Optional check if trying to log in as admin but not an admin
      if (isAdmin && data.user.role !== 'admin') {
        setError('Unauthorized: Admin access required.');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg border border-border bg-surface" style={{ boxShadow: isAdmin ? 'var(--shadow-primary)' : '' }}>
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-text">
            {isAdmin ? 'Admin Portal' : 'Sign in to Tirthing'}
          </h2>
          {isAdmin && <p className="text-center text-primary font-medium mt-2">Authorized Personnel Only</p>}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">{error}</div>}
          <div className="space-y-4">
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
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-md text-white font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Sign In {isAdmin && 'as Admin'}
            </button>
          </div>
        </form>
        {!isAdmin && (
          <div className="text-center mt-4">
            <Link to="/signup" className="text-primary hover:text-primary-hover font-medium">
              Don't have an account? Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;
