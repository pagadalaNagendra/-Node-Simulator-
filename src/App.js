import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import HomePage from './components/HomePage';
import Vertical from './components/vertical';
import Parameter from './components/parameter';
import Node from './components/node';
import Historystatus from './components/Historystatus';
import AlertPage from './components/AlertPage'; 
import './styles.css';
import Platform from './components/platform';
import Addvertical from './components/Addvertical';
import BulkPage from './components/BulkPage';
import Predefinedconfigurations from './components/Predefinedconfigurations';
function App() {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/Node-Simultor" element={<HomePage />} />
          <Route path="/Node-Simultor/vertical" element={<Vertical />} />
          <Route path="/Node-Simultor/parameter" element={<Parameter />} />
          <Route path="/Node-Simultor/node" element={<Node />} />
          <Route path="/Node-Simultor/platform" element={<Platform />} />
          <Route path="/Node-Simultor/Predefinedconfigurations" element={<Predefinedconfigurations/>} />
          <Route path="/Node-Simultor/Historystatus" element={<Historystatus/>} />
          <Route path="/Node-Simultor/Addvertical" element={<Addvertical/>} />
          {/* <Route Path="/Node-simulator/BulkPage" element={<BulkPage />} /> */}
          <Route path="/Node-Simultor/BulkPage" element={<BulkPage />} />
          <Route path="/Node-Simultor/AlertPage" element={<AlertPage />} />
         
          {/* Redirect any unknown paths to HomePage */}
          <Route path="*" element={<Navigate to="/Node-Simultor" />} />
        </Routes>
      </div>
    
    </Router>
  );
}

export default App;