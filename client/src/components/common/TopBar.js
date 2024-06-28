import React from 'react';
import { Navbar, Container, Form, FormControl, InputGroup, Nav, Dropdown } from 'react-bootstrap';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import logo from '../../assets/logos/logo_deheus.png';
import { useMsal } from "@azure/msal-react";

function TopBar({ onLogoClick, userName }) {
  const { instance } = useMsal();

  const logout = () => {
    instance.logoutRedirect().catch((error) => {
      console.error("Logout error:", error);
    });
  };

  return (
    <Navbar style={{backgroundColor: '#d3e0ea'}} variant="light" expand="lg">
      <Container fluid>
        <Navbar.Brand onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <img
            src={logo}
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
          <Dropdown >
            <Dropdown.Toggle as={Nav.Item}>
              <span style={{ marginRight: '10px', fontSize: '1rem', color: '#6c757d' }}>{userName}</span>
              <FaUserCircle size={30} style={{ marginRight: '5px', color: '#fff' }} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="/">---------</Dropdown.Item>
              <Dropdown.Item href="/">---------</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopBar;
