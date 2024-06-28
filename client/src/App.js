import { MsalProvider } from "@azure/msal-react";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Error from "./components/common/Error";
import Home from "./components/Home";
import Main from "./components/Main";
import Publish from "./Publish";
import { msalInstance } from "./config/authConfig";
import ListSingleProject from "./components/ListSingleProject";

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
          <Route path="/project/:projectId" element={<ListSingleProject />} />
          <Route path="/publish/:filename" element={<Publish />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </MsalProvider>
  );
}

export default App;
