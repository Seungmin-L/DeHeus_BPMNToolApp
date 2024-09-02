import { MsalProvider, useIsAuthenticated } from "@azure/msal-react";
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
import PageForNav from "./components/common/PageForNavigation";
import NoAuth from "./components/common/NoAuth";

function ProtectedRoute({ element }) {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? element : <NoAuth />;
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <NavigationHelper/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<ProtectedRoute element={<Main />} />} />
          <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
          <Route path="/mypage" element={<ProtectedRoute element={<MyPage />} />} />
          <Route path="/project/:projectId" element={<ProtectedRoute element={<ListSingleProject />} />} />
          <Route path="/project/:projectId/:diagramName" element={<ProtectedRoute element={<BpmnEditor />} />} />
          <Route path="/testingemail" element={<ProtectedRoute element={<TestingEmail />} />} />
          <Route path="*" element={<ProtectedRoute element={<Error />} />} />
          <Route path="/:filename" element={<ProtectedRoute element={<BpmnEditor />} />} />
          <Route path="/project/:projectId/:diagramName/:diagramId" element={<ProtectedRoute element={<PageForNav/>}/>} />
        </Routes>
      </Router>
    </MsalProvider>
  );
}

export default App;
