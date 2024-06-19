import React from 'react';
import { useParams } from 'react-router-dom';

function Publish() {
  const { filename } = useParams();
  const Component = React.lazy(() => import(`./publish/${filename}`));

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component />
    </React.Suspense>
  );
}

export default Publish;
