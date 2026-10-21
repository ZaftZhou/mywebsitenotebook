import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesktopOS from './DesktopOS';
import AdminApp from './components/apps/AdminApp';

// The home page is a static document (public/index.html). The SPA is served from app.html for
// /os and /admin; if it lands on "/" (client-side navigation), load the static home page instead.
const StudioHome = () => {
  useEffect(() => {
    window.location.replace('/');
  }, []);
  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudioHome />} />
        <Route path="/os" element={<DesktopOS />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
