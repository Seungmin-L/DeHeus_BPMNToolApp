import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { loginRequest } from "../config/authConfig";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgrounds/home_background.png";
import logo from "../assets/logos/logo_deheus.png";

function Home() {
  const { instance } = useMsal();

  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/main");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error(e);
    });
  };

  return (
    // <div className="d-flex flex-column justify-content-center align-items-center vh-100">
    <div className="d-flex flex-column justify-content-center align-items-start vh-100" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', minHeight: '100vh' }}>
      <div style={{ marginLeft: "15%", color: "#004085" }}>
        <img src={logo} alt="De Heus Logo" style={{ width: "120px", marginBottom: "25px" }} /> {/* Logo Image */}
        <h1 className="display-1 mb-3">De Heus<span className="d-block">BPMN Tool</span></h1>
        <p className="lead">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod<span className="d-block">tempor incididunt ut labore et dolore magna aliqua.</span>
        </p>
        <Button
          onClick={handleLogin}
          size="lg"
          className="mt-4"
          style={{ backgroundColor: "#2A85E2", width: "30%"}}
        >
          Start
        </Button>
      </div>
    </div>
  );
}

export default Home;
