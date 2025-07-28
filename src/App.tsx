import { useState, useEffect, useRef } from 'react';
import SearchPage from './components/SearchPage';
import ReportsPage from './components/ReportsPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RateChart from './components/RateChart';

export function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/report" element={<ReportsPage />} />
        <Route path="/ratechart" element={<RateChart />} />
      </Routes>
    </BrowserRouter>
  );
}