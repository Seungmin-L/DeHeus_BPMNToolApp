import { MsalProvider } from "@azure/msal-react";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Admin from "./components/Admin";
import Error from "./components/common/Error";
import Home from "./components/Home";
import ListSingleProject from "./components/ListSingleProject";
import Main from "./components/Main";
import MyPage from "./components/MyPage";
import { msalInstance } from "./config/authConfig";
import TestingEmail from "./components/TestingEmail";
import BpmnEditor from "./components/bpmnModeler";
import { NavigationHelper } from "./util/navigation";

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <NavigationHelper/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/project/:projectId" element={<ListSingleProject />} />
          <Route path="/project/:projectId/:diagramName" element={<BpmnEditor />} />
          <Route path="/testingemail" element={<TestingEmail />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </MsalProvider>
  );
}

export default App;
