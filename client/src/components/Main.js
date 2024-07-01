import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import NoAuth from "./common/NoAuth";
import TopBar from './common/TopBar';
import LeftNavBar from './common/LeftNavBar';

function Main() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const [userName, setUserName] = useState("");
  const [projects, setProjects] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      setUserName(accounts[0].username);
      
      axios.get("/api/projects").then(response => {
        setProjects(response.data);
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

  if (!isAuthenticated) {
    return <NoAuth />;
  }

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
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
                      <td>{project.projectName}</td>
                      <td>{project.lastUpdate}</td>
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
