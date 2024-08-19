import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: `315b8ac5-abc7-4d17-91d1-2c00cd85c027`,
    authority: `https://login.microsoftonline.com/deheusvn.onmicrosoft.com`,
    redirectUri: "http://localhost:3000/main",
    postLogoutRedirectUri: "/",
    navigateToLoginRequestUrl: false,
  },
  cache: {
      cacheLocation: "localStorage", // Use localStorage instead of sessionStorage
      storeAuthStateInCookie: true, // Recommended to use in browsers to prevent auth errors
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["User.Read"],
};
