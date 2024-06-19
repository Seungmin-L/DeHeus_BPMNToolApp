import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Error from './Error';

function Publish() {
  const { filename } = useParams();
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(false);

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


  if (error) {
    return <Error />;
  }

  if (!Component) {
    return <div>Loading...</div>;
  }

  return (
    <Component />
  );
}

export default Publish;