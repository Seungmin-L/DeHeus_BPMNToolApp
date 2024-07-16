import { useMsal, useIsAuthenticated, useAccount } from "@azure/msal-react";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/backgrounds/home_background.png";
import logo from "../assets/logos/logo_deheus.png";
import { loginRequest } from "../config/authConfig";
import axios from 'axios';

function Home() {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0]);
  const [loginError, setLoginError] = useState('');
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const verifyUserRegistration = async (accessToken) => {
    try {
      const response = await axios.post('http://localhost:3001/api/authenticate', {
        token: accessToken,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200 && response.data.isAuthenticated) {
        navigate("/main");
      } else {
        setLoginError('Email is not registered.');
        handleLogout();
      }
    } catch (error) {
      console.error('Server error:', error);
      setLoginError('Server error occurred.');
    }
  };

  useEffect(() => {
    if (account && localStorage.getItem('msalAccount')) {
        verifyUserRegistration(localStorage.getItem('msalToken'));
    }
  }, [account, isAuthenticated, accounts, verifyUserRegistration]);

  const handleLoginRedirect = async () => {
    if (!accounts.length) {
      try {
        const loginResponse = await instance.loginPopup(loginRequest);
        instance.setActiveAccount(loginResponse.account);
        localStorage.setItem('msalAccount', loginResponse.account.username);
        await acquireToken(loginResponse.account);
      } catch (error) {
        console.error('Login popup error:', error);
        setLoginError('Login failed with popup.');
      }
    } else {
      await acquireToken(account);
    }
  };

  const acquireToken = async (account) => {
    try {
      const loginResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });
      localStorage.setItem('msalToken', loginResponse.accessToken);
      await verifyUserRegistration(loginResponse.accessToken);
    } catch (error) {
      console.error('Error acquiring token:', error);
      setLoginError('Login failed.');
      localStorage.removeItem('msalToken');
      localStorage.removeItem('msalAccount');
    }
  };

  const handleLogout = () => {
    instance.logout();
    localStorage.removeItem('msalToken');
    localStorage.removeItem('msalAccount');
    navigate("/login");
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-start vh-100" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', minHeight: '100vh' }}>
      <div style={{ marginLeft: "15%", color: "#004085" }}>
        <img src={logo} alt="De Heus Logo" style={{ width: "120px", marginBottom: "25px" }} />
        <h1 className="display-1 mb-3">De Heus<span className="d-block">BPMN Tool</span></h1>
        <p className="lead">
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
