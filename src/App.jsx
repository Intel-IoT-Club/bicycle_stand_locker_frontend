import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Scan from './scan';
import Login from "./Login"; 
import Allqr from "./allqr";
import Dispcomp from "./dispcomp";
import Genqr from "./genqr";
import Comp from "./feedback";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/scan" element={<Scan />} />
        <Route path="/allqr" element={<Allqr />} />
        <Route path="/dispcomp" element={<Dispcomp />} />
        <Route path="/genqr" element={<Genqr />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feedback" element={<Comp />} />
        <Route path="*" element={<Login />} /> {}
      </Routes>
    </Router>
  );
}

export default App;
