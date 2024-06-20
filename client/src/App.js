import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate  } from 'react-router-dom';
import Home from './Home';
import Publish from './Publish';
import Error from './Error';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish/:filename" element={<Publish />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  )
}

export default App;