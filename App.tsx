import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesktopOS from './DesktopOS';
import AdminApp from './components/apps/AdminApp';

// The home page is a static document (public/studio/index.html) served at "/" by vercel.json.
// When the SPA itself lands on "/" (client-side navigation, or local dev), load that document.
const StudioHome = () => {
  useEffect(() => {
    window.location.replace('/studio/index.html');
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
