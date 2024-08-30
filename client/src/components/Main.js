import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import NoAuth from "./common/NoAuth";
import TopBar from './common/TopBar';
import LeftNavBar from './common/LeftNavBar';
import { formatProjectDates } from '../utils/utils';
import { Form, Button, Modal } from "react-bootstrap";
import { BsFillPlusCircleFill } from "react-icons/bs";

function Main() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const [userName, setUserName] = useState("");
  const [projects, setProjects] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const navigate = useNavigate();


  // listing the projects based on user role
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const userName = accounts[0].username;
      setUserName(userName);
      axios.get("/api/projects", {
        params: { userName }
      }).then(response => {
        const formattedProjects = formatProjectDates(response.data);
        setProjects(formattedProjects);
      }).catch(error => {
        console.error("Error fetching projects", error);
      });
    }
  }, [isAuthenticated, accounts]);


  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  // Add project function
  const [showAddModal, setAddModal] = useState(false);

  const handleShowAddModal = () => setAddModal(true);
  const handleCloseAddModal = () => setAddModal(false);

  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = () => {
    // backend here

    if (projects) {
      const duplicate = projects.filter((project) => project.name === newProjectName);
      if (duplicate) {
        alert(`Project, ${newProjectName}, already exists!`);
      } else {
        alert(`Project, ${newProjectName}, has been successfully added!`);
        axios.post(`http://localhost:3001/api/project/add`, { projectName: newProjectName })
          .then((res) => {
            console.log(res);
          })
          .catch(err => console.error("Error creating new project: ", err))
          .finally(() => {
            window.location.reload();
          });
      }
    }

  }

  // if (!isAuthenticated) {
  //   return <NoAuth />;
  // }

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
          {userName == "vnapp.pbmn@deheus.com" && (
            <>
              <button
                onClick={handleShowAddModal}
                style={{
                  background: "none",
                  border: "none",
                  position: "fixed",
                  bottom: 25,
                  right: 25,
                  zIndex: 999,
                }}
              >
                <BsFillPlusCircleFill size={50} style={{ color: "#2A85E2" }} />
              </button>
              <Modal size="lg" show={showAddModal} onHide={handleCloseAddModal} centered>
                <Modal.Header closeButton>
                  <Modal.Title className="w-100 text-center">
                    Create New Project
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                  <Form.Group className="d-flex align-items-center">
                    <Form.Label style={{ width: "25%" }}>Project Name</Form.Label>
                    <Form.Control
                      style={{ width: "75%" }}
                      type="text"
                      placeholder="Enter the new project name here."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                  <Button
                    style={{
                      color: "#fff",
                      width: "100px",
                      fontWeight: "550",
                      backgroundColor: "#5cb85c",
                      border: "none",
                    }}
                    onClick={handleCreate}
                  >
                    Create
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}
          <div className="d-flex flex-column align-items-center w-100 vh-100 bg-light text-dark">
            <div className="mt-4" style={{ width: "85%" }}>
              <h3 className="mb-3">Accessible Projects</h3>
              <Table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} onClick={() => handleProjectClick(project.id)} style={{ cursor: "pointer" }}>
                      <td>{project.name}</td>
                      <td>{project.last_update}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
