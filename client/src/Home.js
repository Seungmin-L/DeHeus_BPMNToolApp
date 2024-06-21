import { useMsal } from "@azure/msal-react";
import React from "react";
import { Button } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { loginRequest } from "./authConfig";

function Home() {
  const { instance } = useMsal();
  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error(e);
    });
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <FaHome size={100} className="mb-4 text-primary" />
      <h1 className="display-1">De Heus BPMN Tool Application</h1>
      <p className="lead">
        This is the landing page. (Design to be edited further.)
      </p>
      <Button
        variant="primary"
        onClick={handleLogin}
        size="lg"
        className="mt-4"
      >
        Start
      </Button>
    </div>
  );
}

export default Home;
