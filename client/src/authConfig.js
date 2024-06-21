import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "e4db6b6f-081e-43cd-a20c-ef7024e8f7ef",
    authority:
      "https://login.microsoftonline.com/christinaghyoogmail.onmicrosoft.com",
    redirectUri: "http://localhost:3000/main",
    postLogoutRedirectUri: "/",
    navigateToLoginRequestUrl: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["User.Read"],
};
