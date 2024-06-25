import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/publish/bpmntest')
  },[navigate]);

  return (
    <div>This is Home Page</div>
  )
}

export default Home;