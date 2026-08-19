import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataPegawai from './pages/DataPegawai';
import Layanan from './pages/Layanan';
import PengembanganKompetensi from './pages/PengembanganKompetensi';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sebaran-pegawai" element={<DataPegawai />} />
        <Route path="/layanan" element={<Layanan />} />
        <Route path="/pengembangan-kompetensi" element={<PengembanganKompetensi />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
