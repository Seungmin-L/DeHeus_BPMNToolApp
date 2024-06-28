import { useIsAuthenticated } from "@azure/msal-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Error from "./components/common/Error";
import NoAuth from "./components/common/NoAuth";

function Publish() {
  const { filename } = useParams();
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const importFile = async () => {
      try {
        const ImportedComponent = await import(`./publish/${filename}`);
        setComponent(() => ImportedComponent.default);
      } catch (err) {
        setError(true);
      }
    };

    importFile();
  }, [filename]);

  if (!isAuthenticated) {
    return <NoAuth />;
  }

  if (error) {
    return <Error />;
  }

  if (!Component) {
    return <div>Loading...</div>;
  }

  return <Component />;
}

export default Publish;
