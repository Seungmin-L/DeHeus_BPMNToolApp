import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React from "react";
import { Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import NoAuth from "./NoAuth";

function Main() {
  const isAuthenticated = useIsAuthenticated();

  const { instance } = useMsal();

  const logout = () => {
    instance.logoutRedirect().catch((error) => {
      console.error("Logout error:", error);
    });
  };

  if (!isAuthenticated) {
    return <NoAuth />;
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-dark">
      <FaUserCircle size={100} className="text-warning mb-4" />
      <h1 className="display-1">Main Dashboard</h1>
      <p className="lead">
        This is the main dashboard page. (Design to be edited further.)
      </p>
      <Button variant="primary" onClick={logout} className="mt-4">
        Logout
      </Button>
    </div>
  );
}

export default Main;
