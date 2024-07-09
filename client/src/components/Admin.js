import { useIsAuthenticated, useMsal } from "@azure/msal-react";
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

function Admin() {
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

  //라인 38~283 은 목데이터 라인입니다
  //MOCKDATAAAAA~~~~ please fetch the project list!
  const [projects, setProjects] = useState([
    {
      id: 1,
      projectName: "Project1",
    },
    {
      id: 2,
      projectName: "Project2",
    },
    {
      id: 3,
      projectName: "Project3",
    },
    {
      id: 4,
      projectName: "Project4",
    },
    {
      id: 5,
      projectName: "Project5",
    },
    {
      id: 6,
      projectName: "Project6",
    },
    {
      id: 7,
      projectName: "Project7",
    },
  ]);
  // MOCKDATAAAAA~~~~~~~~~ please fetch the user data! Contribution 같은 건 데이터 포맷 정리가 필요해요, 생각하고 추후에 상의해주세용!
  const [users, setUsers] = useState([
    {
      id: 1,
      email: "user1@example.com",
      name: "Bob Smith",
      position: "Manager",
      lastUpdate: "2023-09-01",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram2", remainingTime: 8 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 2,
      email: "user2@example.com",
      name: "Chris Yoo",
      position: "Developer",
      lastUpdate: "2023-08-25",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 3,
      email: "user1@example.com",
      name: "Bob Smith",
      position: "Manager",
      lastUpdate: "2023-09-01",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 4,
      email: "user2@example.com",
      name: "Chris Yoo",
      position: "Developer",
      lastUpdate: "2023-08-25",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 5,
      email: "user1@example.com",
      name: "Bob Smith",
      position: "Manager",
      lastUpdate: "2023-09-01",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 6,
      email: "user2@example.com",
      name: "Chris Yoo",
      position: "Developer",
      lastUpdate: "2023-08-25",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 7,
      email: "user1@example.com",
      name: "Bob Smith",
      position: "Manager",
      lastUpdate: "2023-09-01",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 8,
      email: "user2@example.com",
      name: "Chris Yoo",
      position: "Developer",
      lastUpdate: "2023-08-25",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 11,
      email: "user1@example.com",
      name: "Bob Smith",
      position: "Manager",
      lastUpdate: "2023-09-01",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
    {
      id: 10,
      email: "user2@example.com",
      name: "Chris Yoo",
      position: "Developer",
      lastUpdate: "2023-08-25",
      projects: [
        { projectId: 1, role: "Read-only" },
        { projectId: 2, role: "Editor" },
        { projectId: 4, role: "Editor" },
      ],
      contributions: [
        "Project1->Process2->Diagram3",
        "Project4->Process1->Diagram4",
      ],
      checkedOut: [
        { diagram: "Project1->Process2->Diagram3", remainingTime: 5 },
        { diagram: "Project2->Process2->Diagram12", remainingTime: 14 },
        { diagram: "Project4->Process1->Diagram4", remainingTime: 2 },
      ],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  const handleShowModal = (user) => {
    const clonedUser = JSON.parse(JSON.stringify(user));
    setTempUser(clonedUser);
    setShowModal(true);
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
    console.log("temp Role changed");
  };

  const handleRemoveProject = (projectIndex) => {
    const updatedProjects = tempUser.projects.filter(
      (_, index) => index !== projectIndex
    );
    setTempUser({ ...tempUser, projects: updatedProjects });
    console.log("temp Removed");
  };

  const handleSaveChanges = () => {
    const userIndex = users.findIndex((user) => user.id === tempUser.id);
    const updatedUsers = [...users];
    updatedUsers[userIndex] = tempUser;
    setUsers(updatedUsers);
    console.log("Save function here");
    // 수정하고 세이브 버튼 눌렀을때 백 데이터 업데이트하는 펑션 여기에 추가하시면 됩니다.

    setShowModal(false);
    setTempUser(null);
  };

  const handleAddProject = (projId) => {
    const newProject = {
      projectId: projId,
      role: "Read-only",
    };

    setTempUser((prevTempUser) => ({
      ...prevTempUser,
      projects: [...prevTempUser.projects, newProject],
    }));
  };

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
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
                    <th>Position</th>
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
                      <td>{user.position}</td>
                      <td>
                        <FaFile
                          style={{ cursor: "pointer" }}
                          onClick={() => handleShowModal(user)}
                        />
                      </td>
                      <td>{user.lastUpdate}</td>
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
                        Position
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={tempUser.position || ""}
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
                          <BsPlusCircle
                            size={17}
                            style={{ color: "#2A85E2" }}
                          />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {projects.map((project) => (
                            <Dropdown.Item
                              key={project.id}
                              onClick={() => handleAddProject(project.id)}
                            >
                              {project.projectName}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <ListGroup>
                      {tempUser &&
                        tempUser.projects.map((project, index) => (
                          <ListGroup.Item
                            key={index}
                            className="d-flex justify-content-between align-items-center"
                            style={{ paddingLeft: "30px" }}
                          >
                            <div style={{ width: "55%" }}>
                              {
                                projects.find((p) => p.id === project.projectId)
                                  .projectName
                              }
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
                        ))}
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
        </div>
      </div>
    </div>
  );
}

export default Admin;
