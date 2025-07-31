// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SearchPage from './components/SearchPage';
import ReportsPage from './components/ReportsPage';
import RateChart from './components/RateChart';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all routes in Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<SearchPage />} />
          <Route path="report" element={<ReportsPage />} />
          <Route path="ratechart" element={<RateChart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
