import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { Home } from './pages/Home';
import { Reader } from './pages/Reader';

import { AppUpdater } from './components/AppUpdater';

function App() {
  return (
    <BrowserRouter>
      <AppUpdater />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="player/:id" element={<Reader />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
