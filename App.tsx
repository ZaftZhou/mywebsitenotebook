import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VerticalPortfolio from './src/VerticalPortfolio';
import DesktopOS from './DesktopOS';
import AdminApp from './components/apps/AdminApp';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VerticalPortfolio />} />
        <Route path="/os" element={<DesktopOS />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
