import React from 'react';
import { Nav } from 'react-bootstrap';

function LeftNavBar() {
  const leftNavBarStyle = {
    backgroundColor: '#2A85E2',
    width: '10%',
    top: '56px',
    left: 0,
    paddingTop: '20px',
    color: 'white',
  };

  const navItemStyle = {
    padding: '10px 20px',
    color: 'white'
  };

  return (
    <div style={leftNavBarStyle}>
      <Nav className="flex-column">
        <Nav.Link href="/" style={navItemStyle}>--------------</Nav.Link>
        <Nav.Link href="/" style={navItemStyle}>--------------</Nav.Link>
        <Nav.Link href="/" style={navItemStyle}>--------------</Nav.Link>
      </Nav>
    </div>
  );
}

export default LeftNavBar;
