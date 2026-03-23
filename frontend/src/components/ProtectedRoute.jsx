// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';

// const ProtectedRoute = ({ roleRequired }) => {
//   const token = localStorage.getItem('token');
//   const userStr = localStorage.getItem('user');
  
//   if (!token || !userStr) {
//     return <Navigate to="/login" replace />;
//   }

//   const user = JSON.parse(userStr);

//   if (roleRequired && user.role !== roleRequired) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;


import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ roleRequired }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  // ✅ If role is required and user is NOT matching → redirect properly
  if (roleRequired && user.role !== roleRequired) {
    // 🔥 key fix here
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;