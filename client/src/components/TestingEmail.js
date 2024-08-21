import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { useEffect, useState, useRef } from "react";
import LeftNavBar from "./common/LeftNavBar";
import TopBar from "./common/TopBar";
import emailjs from '@emailjs/browser';
import { Form, Button, Modal } from "react-bootstrap";

function TestingEmail() {
  const isAuthenticated = useIsAuthenticated();
  const [userName, setUserName] = useState("");
  const { accounts } = useMsal();

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      setUserName(accounts[0].username);
    }
  }, [isAuthenticated, accounts]);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [diagram, setDiagram] =useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const serviceId = 'service_deheusvn_bpmnapp';
    const templateId = 'template_rfow6sk';
    const publicKey = 'oQHqsgvCGRFGdRGwg';

    const templateParams = {
      to_name: 'Admin',
      from_name: name,
      from_email: email,
      diagram_name: diagram,
      message: message,
      link: link,
    };

    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully!', response);
        alert("Email sent successfully!");
        setName('');
        setEmail('');
        setDiagram('');
        setMessage('');
        setLink('');
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        alert("Error sending email");
      });
  }

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
          <div className="d-flex flex-column align-items-center w-100 vh-100 bg-light text-dark">
            <Button variant="primary" onClick={handleShowModal} style={{ color: "#1C6091", fontWeight: "550", backgroundColor: "#d2e0ea", border: "none", marginTop: "20px" }}>
                Publish
            </Button>
            <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Publish Diagram</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>User Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="User Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>User Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="User Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="diagram">
                  <Form.Label>Diagram Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Diagram Name"
                    value={diagram}
                    onChange={(e) => setDiagram(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="message">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="link">
                  <Form.Label>Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit" style={{ color: "#1C6091", fontWeight: "550", backgroundColor: "#d2e0ea", border: "none" }}>
                  Send Email
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
            </div>
          </div>
        </div>
      </div>
  );
}

export default TestingEmail;