import { useMsal } from "@azure/msal-react";
// import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import React, { useState } from "react";
import { Button } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgrounds/home_background.png";
import logo from "../assets/logos/logo_deheus.png";
import { loginRequest } from "../config/authConfig";
import axios from 'axios';

function Home() {
  const { instance } = useMsal();
  const [loginError, setLoginError] = useState('');
  // const isAuthenticated = useIsAuthenticated();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/main");
  //   }
  // }, [isAuthenticated, navigate]);

  const handleLoginRedirect = () => {
    console.log('[handleLoginRedirect] Handling login redirect');
    instance.loginPopup(loginRequest).then(
      async (loginResponse) => {
        const accessToken = loginResponse.accessToken;
        console.log(`[handleLoginRedirect] Logged in user token: ${accessToken}`);

        // 백엔드로 토큰 전달
        try {
          const response = await axios.post('http://localhost:3001/api/authenticate', {
            token: accessToken,
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        if (response.status === 200 && response.data.isAuthenticated) {
          console.log('[handleLoginPopup] Email is registered, proceeding with login');
          window.location.href = "http://localhost:3000/main"; // 리다이렉트 링크
        }
      } catch (error) {
        if (error.response.status === 401) {
          console.log('[handleLoginPopup] Email is not registered, logging out');
          setLoginError('Email is not registered.');
        } else {
          console.error(`[handleLoginPopup] Server error: ${error}`);
          setLoginError('Server error occurred.');
        }
      }
    }).catch((error) => {
      console.error(`[handleLoginRedirect] Login error: ${error}`);
      setLoginError('Login failed.');
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
          onClick={handleLoginRedirect}
          size="lg"
          className="mt-4"
          style={{ backgroundColor: "#2A85E2", width: "30%"}}
        >
          Start
        </Button>
        {loginError && <p className="text-danger mt-3">{loginError}</p>}
      </div>
    </div>
  );
}

export default Home;
