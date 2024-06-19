import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Publish from './Publish';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish/:filename" element={<Publish />} />
      </Routes>
    </Router>
  )
}

export default App;