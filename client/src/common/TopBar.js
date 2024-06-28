import React from 'react';
import { Navbar, Container, Form, FormControl, InputGroup, Nav } from 'react-bootstrap';
import { FaSearch, FaUserCircle } from 'react-icons/fa';

function TopBar({ onLogoClick, userName }) {

  return (
    <Navbar style={{backgroundColor: '#d3e0ea'}} variant="light" expand="lg">
      <Container fluid>
        <Navbar.Brand onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <img
            src="/logo_deheus.png"
            height="30"
            className="d-inline-block align-top"
            alt="Company Logo"
          />
        </Navbar.Brand>
        <Nav className="mx-auto">
          <Form className="d-flex">
            <InputGroup>
              <FormControl
                type="search"
                aria-label="Search"
                aria-describedby="search-addon"
              />
              <InputGroup.Text id="search-addon">
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Form>
        </Nav>
        <Nav>
          <Nav.Item className="d-flex align-items-center">
            <span style={{marginRight: '10px', fontSize: '1rem', color: '#6c757d'}}>{userName}</span>
            <FaUserCircle size={30} style={{marginLeft: '5px', color: '#fff'}} />
          </Nav.Item>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopBar;
