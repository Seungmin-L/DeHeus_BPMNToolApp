import { useIsAuthenticated } from "@azure/msal-react";
import React, { useState } from "react";
import { CiViewTable } from "react-icons/ci";
import NoAuth from "./common/NoAuth";
import TopBar from './common/TopBar';
import LeftNavBar from './common/LeftNavBar';

function Main() {
  const isAuthenticated = useIsAuthenticated();

  const [isNavVisible, setIsNavVisible] = useState(false);

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
            <CiViewTable size={100} className="text-secondary mb-4" />
            <h1 className="display-1">Main Dashboard</h1>
            <p className="lead">
              This is the main dashboard page. (Design to be edited further.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
