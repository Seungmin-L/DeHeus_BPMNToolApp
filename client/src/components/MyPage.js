import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { useEffect, useState } from "react";
import { Col, ListGroup, Row, Table } from "react-bootstrap";
import { BsClock, BsThreeDots } from "react-icons/bs";
import { FaSortDown, FaSortUp, FaUserCircle } from "react-icons/fa";
import { MdOpenInNew } from "react-icons/md";
import LeftNavBar from "./common/LeftNavBar";
import TopBar from "./common/TopBar";

function MyPage() {
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
  // Mock data for demonstration
  const userInfo = {
    name: "Christina Yoo",
    email: "christinaghyoo@google.com",
    position: "Developer",
  };

  const checkedOutDiagrams = [
    { name: "Process 1 Flow Diagram 1", time: 2 },
    { name: "Process 3 Flow Diagram 2", time: 5 },
  ];

  const activityLog = [
    {
      activity: "Attached a document to Process 1 Flow Diagram 1",
      date: new Date(2023, 8, 1),
    },
    { activity: "Viewed Process 3 Flow Diagram 2", date: new Date(2023, 8, 2) },
    { activity: "Got access to Project 1", date: new Date(2023, 8, 3) },
    {
      activity: "Edited Process 1 Flow Diagram 1",
      date: new Date(2023, 8, 4),
    },
  ];

  const [sortAscending, setSortAscending] = useState(false);

  const sortActivities = () => {
    setSortAscending(!sortAscending);
  };

  activityLog.sort((a, b) => {
    if (sortAscending) {
      return a.date - b.date;
    } else {
      return b.date - a.date;
    }
  });

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
          <div className="d-flex flex-column align-items-center w-100 vh-100 bg-light text-dark">
            <div className="mt-4" style={{ width: "85%" }}>
              <Row style={{ height: "20vh", marginBottom: "20px" }}>
                <Col
                  style={{
                    width: "100%",
                  }}
                >
                  <h5>User Information</h5>
                  <ListGroup>
                    <ListGroup.Item
                      className="d-flex"
                      style={{ paddingTop: "15px", paddingBottom: "15px" }}
                    >
                      <Col
                        xs={2}
                        style={{
                          maxWidth: "10%",
                          marginRight: "10px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <FaUserCircle size={60} />
                      </Col>
                      <Col className="d-flex flex-column">
                        <strong>Name: {userInfo.name}</strong>
                        <span>Email: {userInfo.email}</span>
                        <span>Position: {userInfo.position}</span>
                      </Col>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
              <Row style={{ height: "80vh" }}>
                <Col md={5}>
                  <h5>Checked Out Diagrams</h5>
                  <Table bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Diagram</th>
                        <th>Remaining Time</th>
                        <th>
                          <BsThreeDots />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkedOutDiagrams.map((diagram, index) => (
                        <tr key={index}>
                          <td>{diagram.name}</td>
                          <td>
                            <BsClock
                              style={{
                                marginLeft: "3px",
                                marginRight: "7px",
                                color:
                                  diagram.time >= 7
                                    ? "#4CAF50"
                                    : diagram.time < 3
                                    ? "#F44336"
                                    : "#FFEB3B",
                              }}
                              size={19}
                            />{" "}
                            {diagram.time} days left
                          </td>
                          <td>
                            <MdOpenInNew />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
                <Col md={7}>
                  <h5>Activity Log</h5>
                  <Table bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={sortActivities}
                        >
                          Date {sortAscending ? <FaSortUp /> : <FaSortDown />}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((log, index) => (
                        <tr key={index}>
                          <td>{log.activity}</td>
                          <td>{log.date.toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
