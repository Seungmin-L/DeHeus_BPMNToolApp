import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { useState} from "react";
import { Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import NoAuth from "./NoAuth";
import TopBar from './common/TopBar';
import LeftNavBar from './common/LeftNavBar';

function Main() {
  const isAuthenticated = useIsAuthenticated();

  const { instance } = useMsal();

  const [isNavVisible, setIsNavVisible] = useState(false);

  const logout = () => {
    instance.logoutRedirect().catch((error) => {
      console.error("Logout error:", error);
    });
  };

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  if (!isAuthenticated) {
    return <NoAuth />;
  }

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName="User Name" />
      <div style={{ display: 'flex' }}>
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgray' }}>
          <div className="d-flex flex-column justify-content-center align-items-center w-100 vh-100 bg-light text-dark">
            <FaUserCircle size={100} className="text-warning mb-4" />
            <h1 className="display-1">Main Dashboard</h1>
            <p className="lead">
              This is the main dashboard page. (Design to be edited further.)
            </p>
            <Button variant="primary" onClick={logout} className="mt-4">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
