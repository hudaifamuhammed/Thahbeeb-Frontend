import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminDashboard from './components/admin/AdminDashboard';
import UserWebsite from './components/user/UserWebsite';
import Login from './components/admin/Login';

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'adminLoggedIn') {
        setLoggedIn(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={loggedIn ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} 
          />
          <Route 
            path="/admin/login" 
            element={loggedIn ? <Navigate to="/admin" replace /> : <Login onLogin={() => setLoggedIn(true)} />} 
          />
          
          {/* User Routes */}
          <Route path="/*" element={<UserWebsite />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;