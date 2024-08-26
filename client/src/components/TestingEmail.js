import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { useEffect, useState, useRef } from "react";
import LeftNavBar from "./common/LeftNavBar";
import TopBar from "./common/TopBar";
import emailjs from '@emailjs/browser';
import { Form, Button, Modal } from "react-bootstrap";

function TestingEmail() {
  const isAuthenticated = useIsAuthenticated();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { accounts } = useMsal();

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      setUserName(accounts[0].username);
      setUserEmail(accounts[0].userEmail);
    }
  }, [isAuthenticated, accounts]);
  
  const [isNavVisible, setIsNavVisible] = useState(false);
  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showConfirmPublishModal, setShowConfirmPublishModal] = useState(false);
  
  const handleShowPublishModal = () => setShowPublishModal(true);
  const handleClosePublishModal = () => setShowPublishModal(false);
  const handleShowCheckInModal = () => setShowCheckInModal(true);
  const handleCloseCheckInModal = () => setShowCheckInModal(false);

  // Publish variables
  const currentUrl = window.location.href;
  const [link] = useState(currentUrl);
  const [message, setMessage] = useState('');

  // Publish & Check In Modal's Diagram path variables
  const [projectName, setProjectName] = useState('ProjectName');
  const [processName, setProcessName] = useState('ProcessName');
  const [diagramName, setDiagramName] = useState('DiagramName');

  // Confirm Publish Modal function
  const handleShowConfirmPublishModal = () => setShowConfirmPublishModal(true);
  const handleCloseConfirmPublishModal = () => setShowConfirmPublishModal(false);

  // Confirm Publish variables
  const [declineReason, setDeclineReason] = useState('');

  // Confirm Publish function
  const handleConfirmPublish = () => {
    alert("Diagram Published!");
    handleCloseConfirmPublishModal();
  }

  // Decline Publish function
  const handleDeclinePublish = () => {
    alert(`Publish declined: ${declineReason}`);
    setDeclineReason('');
    handleCloseConfirmPublishModal();
  }

  // Email sending function
  const handleSubmit = (e) => {
    e.preventDefault();

    const serviceId = 'service_deheusvn_bpmnapp';
    const templateId = 'template_rfow6sk';
    const publicKey = 'oQHqsgvCGRFGdRGwg';

    const templateParams = {
      to_name: 'Admin',
      from_name: userName,
      from_email: userEmail,
      diagram_name: diagramName,
      message: message,
      link: link,
    };

    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully!', response);
        alert("Email sent successfully!");
        setMessage('');
        handleClosePublishModal();
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        alert("Error sending email");
      });
  }

  const handleCheckIn = () => {
    alert("Checked In!");
    handleCloseCheckInModal();
  }

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
          <div className="d-flex flex-column align-items-center w-100 vh-100 bg-light text-dark">
            <Button variant="primary" onClick={handleShowPublishModal} style={{ color: "#1C6091", fontWeight: "550", backgroundColor: "#d2e0ea", border: "none", marginTop: "20px" }}>
                Publish
            </Button>
            <Button variant="secondary" onClick={handleShowCheckInModal} style={{ color: "#1C6091", fontWeight: "550", backgroundColor: "#d2e0ea", border: "none", marginTop: "20px" }}>
              Check In
            </Button>
            <Button variant="warning" onClick={handleShowConfirmPublishModal} style={{ color: "#1C6091", fontWeight: "550", backgroundColor: "#ffc107", border: "none", marginTop: "10px" }}>
              Confirm Publish
            </Button>

            <Modal show={showPublishModal} onHide={handleClosePublishModal} centered>
            <Modal.Header closeButton>
              <Modal.Title style={{ textAlign: 'center', width: '100%' }}>Publish Request Form</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div style={{ padding: '15px', marginBottom: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                <h5>Diagram</h5>
                <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#1C6091' }}>{projectName} - {processName} - {diagramName}</p>
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="message">
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Enter a request message."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit" style={{ color: "#fff", fontWeight: "550", backgroundColor: "#5cb85c", border: "none", display: "block", margin: "0 auto" }}>
                  Send Request
                </Button>
              </Form>
            </Modal.Body>
            </Modal>

            <Modal show={showCheckInModal} onHide={handleCloseCheckInModal} centered>
              <Modal.Header closeButton>
                <Modal.Title style={{ textAlign: 'center', width: '100%' }}>Check In Confirm</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px' }}>
                  <h5>Diagram Path</h5>
                  <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#1C6091' }}>{projectName} - {processName} - {diagramName}</p>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                  <ul style={{ paddingLeft: '20px' }}>
                    <li>Once you check in, you will have editing access to this diagram for the <strong>next 14 days</strong>.</li>
                    <li>During this period, you can <strong>edit</strong> and <strong>save</strong> the draft, then <strong>request for publishing</strong> once completed.</li>
                  </ul>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="success" onClick={handleCheckIn} style={{ color: "#fff", fontWeight: "550", backgroundColor: "#5cb85c", border: "none", display: "block", margin: "0 auto" }}>
                  Check In
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal show={showConfirmPublishModal} onHide={handleCloseConfirmPublishModal} centered>
              <Modal.Header closeButton>
                <Modal.Title style={{ textAlign: 'center', width: '100%' }}>Confirm Publish</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
                  <p>If you agree to publish this diagram, please click <strong>Confirm</strong>. If not, please provide a reason and click <strong>Decline</strong>.</p>
                </div>
                <Form>
                  <Form.Group className="mb-3" controlId="declineReason">
                    <Form.Label style={{ textAlign: 'center', width: '100%' }}>Decline Reason (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Type the reason for declining"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer style={{ justifyContent: 'space-around' }}>
                <Button variant="success" onClick={handleConfirmPublish} style={{ color: "#fff", fontWeight: "550", backgroundColor: "#5cb85c", border: "none" }}>
                  Confirm
                </Button>
                <Button variant="danger" onClick={handleDeclinePublish} style={{ color: "#fff", fontWeight: "550", backgroundColor: "#d9534f", border: "none" }}>
                  Decline
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestingEmail;