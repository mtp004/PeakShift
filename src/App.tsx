import { useState, useEffect, useRef } from 'react';
import SearchPage from './components/SearchPage';
import Reports from './components/Reports';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/report" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}