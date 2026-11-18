import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { LangProvider } from './i18n/lang';
import { AlertsPage } from './pages/AlertsPage';
import { MapPage } from './pages/MapPage';
import { OfficerPage } from './pages/OfficerPage';
import { OverviewPage } from './pages/OverviewPage';
import { ReviewPage } from './pages/ReviewPage';
import { TargetsPage } from './pages/TargetsPage';
import { TeamPage } from './pages/TeamPage';

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<OverviewPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="team/:id" element={<OfficerPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="targets" element={<TargetsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}
