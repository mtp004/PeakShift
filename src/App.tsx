// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SearchPage from './components/SearchPage';
import ReportsPage from './components/ReportsPage';
import RateChart from './components/RateChart';
import UploadPage from './components/UploadPage';
import { DataPage } from './components/DataPage';
import { QuestionairePage } from './components/QuestionairePage';
import { SolarInfoPage } from './components/SolarInfoPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all routes in Layout */}
        <Route path="/" element={<Layout />}>
          {/* Search flow routes */}
          <Route index element={<SearchPage />} />
          <Route path="search/report" element={<ReportsPage />} />
          <Route path="search/ratechart" element={<RateChart />} />
          <Route path="search/questionaire" element={<QuestionairePage />} />
          <Route path="search/solarinfo" element={<SolarInfoPage />} />
          
          {/* My Data flow routes */}
          <Route path="data" element={<DataPage />} />
          <Route path="data/ratechart" element={<RateChart />} />
          
          {/* Upload flow routes */}
          <Route path="upload" element={<UploadPage />} />
          <Route path="upload/ratechart" element={<RateChart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}