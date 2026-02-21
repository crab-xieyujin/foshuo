import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Reader } from './pages/Reader';

import { AppUpdater } from './components/AppUpdater';
import { TabLayout } from './components/Layout/TabLayout';
import { Jingxin } from './pages/tabs/Jingxin';
import { Xiuxing } from './pages/tabs/Xiuxing';
import { Wenfo } from './pages/tabs/Wenfo';
import { Jieyuan } from './pages/tabs/Jieyuan';
import { Wode } from './pages/tabs/Wode';
import { PersonalSettings } from './pages/tabs/PersonalSettings';

import { Login } from './pages/auth/Login';
import { AuthGuard } from './components/Layout/AuthGuard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AppUpdater />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/player/:id" element={<Reader />} />

          <Route path="/tabs" element={<TabLayout />}>
            <Route path="jingxin" element={<Jingxin />} />
            <Route path="xiuxing" element={<Xiuxing />} />
            <Route path="wenfo" element={<Wenfo />} />
            <Route path="jieyuan" element={<Jieyuan />} />
            <Route path="wode" element={<Wode />} />
            <Route path="wode/settings" element={<PersonalSettings />} />
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/tabs/jingxin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
