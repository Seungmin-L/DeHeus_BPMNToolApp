import { MsalProvider } from "@azure/msal-react";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Error from "./Error";
import Home from "./Home";
import Main from "./Main";
import Publish from "./Publish";
import { msalInstance } from "./authConfig";

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
          <Route path="/publish/:filename" element={<Publish />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </MsalProvider>
  );
}

export default App;
