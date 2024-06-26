import { useMsal } from "@azure/msal-react";
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { loginRequest } from "../config/authConfig";
import axios from 'axios';

function Home() {
  const { instance } = useMsal();
  const [loginError, setLoginError] = useState('');

  const handleLoginRedirect = () => {
    console.log('[handleLoginRedirect] Handling login redirect');
    instance.loginPopup(loginRequest).then(
      async (loginResponse) => {
        const idToken = loginResponse.idToken;
        console.log(`[handleLoginRedirect] Logged in user token: ${idToken}`);

        // 백엔드로 토큰 전달
        try {
          const response = await axios.post('http://localhost:3001/api/authenticate', {
            token: idToken,
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
    //
        if (response.status === 200 && response.data.isAuthenticated) {
          console.log('[handleLoginPopup] Email is registered, proceeding with login');
          window.location.href = "http://localhost:3000/main"; // 리다이렉트 링크
        }
      } catch (error) {
        if (error.response.status === 401) {
          console.log('[handleLoginPopup] Email is not registered, logging out (2)');
          setLoginError('Email is not registered.');
        } else {
          console.error(`[handleLoginPopup] Server error: ${error}`);
          setLoginError('Server error occurred.');
        }
      }
    //
    }).catch((error) => {
      console.error(`[handleLoginRedirect] Login error: ${error}`);
      setLoginError('Login failed.');
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
        onClick={handleLoginRedirect}
        size="lg"
        className="mt-4"
      >
        Start
      </Button>
      {loginError && <p className="text-danger mt-3">{loginError}</p>}
    </div>
  );
}

export default Home;
