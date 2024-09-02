import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
  ListGroup,
  Modal,
  Table,
} from "react-bootstrap";
import {
  BsClock,
  BsDashCircle,
  BsPlusCircle,
  BsThreeDots,
} from "react-icons/bs";
import { FaFile } from "react-icons/fa";
import LeftNavBar from "./common/LeftNavBar";
import TopBar from "./common/TopBar";
import { convertUTCToLocal } from '../utils/utils';
import {  BsFillPlusCircleFill } from "react-icons/bs";

function Admin() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [removedProjects, setRemovedProjects] = useState([]);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const userName = accounts[0].username;
      setUserName(userName);

      axios.get("/api/admin/users")
        .then(response => {
          setUsers(response.data);
        })
        .catch(error => {
          console.error("Error fetching users", error);
        });

      // Bring all projects
      axios.get("/api/projects", {
          params: { userName }
        }).then(response => {
          const filteredProjects = response.data.map(project => ({
            id: project.id,
            name: project.name
          }));
          setAllProjects(filteredProjects);
        }).catch(error => {
          console.error("Error fetching projects", error);
        });
    }
  }, [isAuthenticated, accounts]);

  const [isNavVisible, setIsNavVisible] = useState(false);
  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const [showModal, setShowModal] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  const handleShowModal = (user) => {
    console.log("Selected user:", user);

    const userIdentifier = user.email.split('@')[0];

    axios.get(`/api/admin/users/${userIdentifier}`)
    .then(response => {
        const existingProjects = response.data.projects.map(project => ({
            projectId: project.projectId,
            projectName: project.projectName,
            role: project.role
        }));

        const availableProjects = response.data.availableProjects.map(project => ({
            projectId: project.id,
            projectName: project.name
        }));

        setTempUser({
            ...response.data,
            existingProjects: existingProjects,
            availableProjects: availableProjects
        });

        setShowModal(true);
    })
    .catch(error => {
        console.error("Error fetching user details", error);
    });
  };


  const handleCloseModal = () => {
    setTempUser(null);
    setShowModal(false);
  };

  const handleRoleChange = (projectIndex, newRole) => {
    setTempUser((tempUser) => {
      const updatedProjects = tempUser.projects.map((project, index) => {
        if (index === projectIndex) {
          return { ...project, role: newRole };
        }
        return project;
      });
      return { ...tempUser, projects: updatedProjects };
    });

    // console.log("Role change stored in tempUser but not saved to DB yet");  // debugging console log
  };

  const handleRemoveProject = (projectIndex) => {
    const projectToRemove = tempUser.projects[projectIndex];
    const updatedProjects = tempUser.projects.filter(
      (_, index) => index !== projectIndex
    );

    setTempUser({ ...tempUser, projects: updatedProjects });

    setRemovedProjects((prevRemovedProjects) => [
      ...prevRemovedProjects,
      projectToRemove.projectId,
    ]);

    // console.log("Project removed:", projectToRemove);  // debugging console log
    // console.log("Updated Removed Projects:", [...removedProjects, projectToRemove.projectId]);  // debugging console log
  };


  const handleAddProject = (projId, projName) => {
    const newProject = {
      projectId: projId,
      projectName: projName,
      role: "Read-only",
    };
  
    setTempUser((prevTempUser) => ({
      ...prevTempUser,
      projects: [...prevTempUser.projects, newProject],
    }));
  };
  
  const handleSaveChanges = () => {
    const existingProjects = tempUser.existingProjects || [];
    const projects = tempUser.projects || [];

    const projectUpdates = projects.filter(project => 
      !existingProjects.some(p => p.projectId === project.projectId)
    );

    const removedProjects = existingProjects.filter(existingProject => 
      !projects.some(project => project.projectId === existingProject.projectId)
    ).map(project => project.projectId);

    const roleChanges = projects.filter((project, index) => {
      const originalProject = existingProjects.find(p => p.projectId === project.projectId);
      return originalProject && originalProject.role !== project.role;
    }).map(project => ({
      projectId: project.projectId,
      role: project.role
    }));

    // console.log("Final Removed Projects:", removedProjects);  // debugging console log
    // console.log("Role Changes:", roleChanges);  // debugging console log
    // console.log("Project Updates:", projectUpdates);  // debugging console log

    axios.post('/api/admin/saveUserData', {
      userEmail: tempUser.email,
      projectUpdates,
      removedProjects,
      roleChanges,
    })
    .then(response => {
      console.log("User data saved successfully");
    })
    .catch(error => {
      console.error("Error saving user data", error);
    });

    setShowModal(false);
    setTempUser(null);
    setRemovedProjects([]);
  };
  

  // Add new user~~~!!!
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    department: '',
    projects: [],
  });

  const handleShowNewUserModal = () => {
    setNewUser({
      email: '',
      name: '',
      department: '',
      projects: [],
    });
    setShowNewUserModal(true);
  };
  const handleCloseNewUserModal = () => {
    setShowNewUserModal(false);
  };

  const handleAddNewUserProject = (projectId, projectName) => {
    const newProject = {
      projectId: projectId,
      projectName: projectName,
      role: "Read-only",
    };
    setNewUser(prevNewUser => ({
      ...prevNewUser,
      projects: [...prevNewUser.projects, newProject],
    }));
  };

  const newUserAvailableProjects = allProjects.filter(project => 
    !newUser.projects.some(assignedProject => assignedProject.projectId === project.id)
  );

  const handleNewUserRoleChange = (projectIndex, newRole) => {
    setNewUser((prevNewUser) => {
      const updatedProjects = prevNewUser.projects.map((project, index) => {
        if (index === projectIndex) {
          return { ...project, role: newRole };
        }
        return project;
      });
      return { ...prevNewUser, projects: updatedProjects };
    });
  };

  const handleRemoveNewUserProject = (projectIndex) => {
    setNewUser((prevNewUser) => ({
      ...prevNewUser,
      projects: prevNewUser.projects.filter((_, index) => index !== projectIndex),
    }));
  };

  const handleAddNewUser = () => {

    //
    // BACK API HERE! S2S2S2
    // console.log(newUser) 확인하고 필요한 것 수정하시면 됩니다아
    //

    alert("New user added successfully!!");
    handleCloseNewUserModal();

  };

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
        <button
            onClick={handleShowNewUserModal}
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
          <div className="d-flex flex-column align-items-center w-100 vh-100 bg-light text-dark">
            <div className="mt-4" style={{ width: "85%" }}>
                <h3>User Account Information</h3>
              <Table>
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" />
                    </th>
                    <th>No</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>
                      <BsThreeDots />
                    </th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>{index + 1}</td>
                      <td>{user.email}</td>
                      <td>{user.name}</td>
                      <td>{user.department}</td>
                      <td>
                        <FaFile
                          style={{ cursor: "pointer" }}
                          onClick={() => handleShowModal(user)}
                        />
                      </td>
                      <td>{convertUTCToLocal(user.lastUpdate)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          <Modal size="lg" show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title className="w-100 text-center">
                User Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {tempUser && (
                <>
                  <Form.Group className="d-flex align-items-center mb-2">
                    <Form.Label style={{ width: "9%" }}>Email</Form.Label>
                    <Form.Control
                      type="text"
                      value={tempUser.email || ""}
                      readOnly
                      style={{
                        boxShadow: "none",
                        pointerEvents: "none",
                      }}
                    />
                  </Form.Group>
                  <div className="d-flex align-items-center mb-2">
                    <Form.Group
                      style={{ width: "60%" }}
                      className="d-flex align-items-center "
                    >
                      <Form.Label style={{ width: "16%" }}>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={tempUser.name || ""}
                        readOnly
                        style={{
                          boxShadow: "none",
                          pointerEvents: "none",
                        }}
                      />
                    </Form.Group>
                    <Form.Group
                      style={{ width: "40%" }}
                      className="d-flex align-items-center"
                    >
                      <Form.Label style={{ width: "50%", paddingLeft: "25px" }}>
                        Department
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={tempUser.department || ""}
                        readOnly
                        style={{
                          boxShadow: "none",
                          pointerEvents: "none",
                        }}
                      />
                    </Form.Group>
                  </div>
                  <Form.Group className="mb-2">
                    <div className="d-flex align-items-center">
                      <Form.Label className="me-2">
                        Accessible Projects
                      </Form.Label>
                      <Dropdown>
                        <Dropdown.Toggle
                            variant="success"
                            id="dropdown-basic"
                            className="d-flex mb-1"
                            style={{
                              border: "none",
                              height: "27px",
                              background: "transparent",
                            }}
                          >
                          <BsPlusCircle size={17} style={{ color: "#2A85E2" }} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {tempUser && tempUser.availableProjects && tempUser.availableProjects.length > 0 ? (
                            tempUser.availableProjects.map((project) => (
                              <Dropdown.Item
                                key={project.projectId}
                                onClick={() => handleAddProject(project.projectId, project.projectName)}
                              >
                                {project.projectName}
                              </Dropdown.Item>
                            ))
                          ) : (
                            <Dropdown.Item disabled>No projects available</Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <ListGroup>
                      {tempUser.projects && tempUser.projects.length > 0 ? (
                        tempUser.projects.map((project, index) => (
                          <ListGroup.Item
                            key={index}
                            className="d-flex justify-content-between align-items-center"
                            style={{ paddingLeft: "30px" }}
                          >
                            <div style={{ width: "55%" }}>
                              {project.projectName}
                            </div>
                            <div
                              className="d-flex align-items-center"
                              style={{ width: "40%" }}
                            >
                              <Form.Label
                                style={{ marginRight: "10px" }}
                                className="pr-2"
                              >
                                Role
                              </Form.Label>
                              <DropdownButton
                                title={project.role}
                                onSelect={(newRole) =>
                                  handleRoleChange(index, newRole)
                                }
                                variant="outline-secondary"
                                style={{ width: "100%" }}
                              >
                                <Dropdown.Item eventKey="Read-only">
                                  Read-only
                                </Dropdown.Item>
                                <Dropdown.Item eventKey="Editor">
                                  Editor
                                </Dropdown.Item>
                              </DropdownButton>
                            </div>
                            <div style={{ width: "5%" }}>
                              <BsDashCircle
                                style={{
                                  cursor: "pointer",
                                  color: "#F44336",
                                  marginLeft: "10px",
                                }}
                                onClick={() => handleRemoveProject(index)}
                              />
                            </div>
                          </ListGroup.Item>
                        ))
                      ) : (
                        <ListGroup.Item>No projects available</ListGroup.Item>
                      )}
                    </ListGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Current Checked Out Diagrams</Form.Label>
                    <ListGroup>
                      {tempUser.checkedOut.map((item, index) => (
                        <ListGroup.Item
                          key={index}
                          className="d-flex align-items-center"
                          style={{ paddingLeft: "30px" }}
                        >
                          <div style={{ width: "80%" }}>{item.diagram}</div>
                          <div>
                            <BsClock
                              style={{
                                marginRight: "7px",
                                color:
                                  item.remainingTime >= 7
                                    ? "#4CAF50"
                                    : item.remainingTime < 3
                                    ? "#F44336"
                                    : "#FFEB3B",
                              }}
                              size={19}
                            />
                            {item.remainingTime} days left
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Form.Group>
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button
              style={{ backgroundColor: "#2A85E2" }}
              onClick={handleSaveChanges}
            >
              Save
            </Button>
          </Modal.Footer>
          </Modal>

          <Modal size="lg" show={showNewUserModal} onHide={handleCloseNewUserModal} centered>
            <Modal.Header closeButton>
              <Modal.Title className="w-100 text-center">
                Add New User
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="d-flex align-items-center mb-2">
                <Form.Label style={{ width: "9%" }}>Email</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </Form.Group>
              <div className="d-flex align-items-center mb-2">
                <Form.Group
                  style={{ width: "60%" }}
                  className="d-flex align-items-center "
                >
                  <Form.Label style={{ width: "16%" }}>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newUser.name || ""}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </Form.Group>
                <Form.Group
                  style={{ width: "40%" }}
                  className="d-flex align-items-center"
                >
                  <Form.Label style={{ width: "50%", paddingLeft: "25px" }}>
                    Department
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newUser.department || ""}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </Form.Group>
              </div>
              <Form.Group className="mb-2">
                <div className="d-flex align-items-center">
                  <Form.Label className="me-2">
                    Accessible Projects
                  </Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="success"
                      id="dropdown-basic"
                      className="d-flex mb-1"
                      style={{
                        border: "none",
                        height: "27px",
                        background: "transparent",
                      }}
                    >
                      <BsPlusCircle size={17} style={{ color: "#2A85E2" }} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {newUserAvailableProjects.length > 0 ? (
                        newUserAvailableProjects.map(project => (
                          <Dropdown.Item
                            key={project.id}
                            onClick={() => handleAddNewUserProject(project.id, project.name)}
                          >
                            {project.name}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>No projects available</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <ListGroup>
                  {newUser.projects && newUser.projects.length > 0 ? (
                    newUser.projects.map((project, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                        style={{ paddingLeft: "30px" }}
                      >
                        <div style={{ width: "55%" }}>
                          {project.projectName}
                        </div>
                        <div
                          className="d-flex align-items-center"
                          style={{ width: "40%" }}
                        >
                          <Form.Label
                            style={{ marginRight: "10px" }}
                            className="pr-2"
                          >
                            Role
                          </Form.Label>
                          <DropdownButton
                            title={project.role}
                            onSelect={(newRole) =>
                              handleNewUserRoleChange(index, newRole)
                            }
                            variant="outline-secondary"
                            style={{ width: "100%" }}
                          >
                            <Dropdown.Item eventKey="Read-only">
                              Read-only
                            </Dropdown.Item>
                            <Dropdown.Item eventKey="Editor">
                              Editor
                            </Dropdown.Item>
                          </DropdownButton>
                        </div>
                        <div style={{ width: "5%" }}>
                          <BsDashCircle
                            style={{
                              cursor: "pointer",
                              color: "#F44336",
                              marginLeft: "10px",
                            }}
                            onClick={() => handleRemoveNewUserProject(index)}
                          />
                        </div>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No projects assigned</ListGroup.Item>
                  )}
                </ListGroup>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button
                style={{ color: "#fff", fontWeight: "550", backgroundColor: "#5cb85c", border: "none" }}
                onClick={handleAddNewUser}
              >
                Add User
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Admin;