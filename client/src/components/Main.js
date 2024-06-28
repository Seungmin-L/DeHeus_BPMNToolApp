import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import NoAuth from "./common/NoAuth";
import TopBar from './common/TopBar';
import LeftNavBar from './common/LeftNavBar';

function Main() {
  const isAuthenticated = useIsAuthenticated();

  const { accounts } = useMsal(); // Retrieve accounts from useMsal hook
  const userName = accounts[0].username; 

  // DATAAAAAA~~~~~~ This should be set by the fetched data once the BE is ready. (user's available project!!!)
  const mockData = [
    { id: 1, projectName: "Project 1: VN Sales Department", lastUpdate: "2024-06-25" },
    { id: 2, projectName: "Project 2: MY IT Department", lastUpdate: "2024-06-24" },
    { id: 3, projectName: "Project 3", lastUpdate: "2024-06-23" },
    { id: 4, projectName: "Project 4", lastUpdate: "2024-06-23" },
    { id: 5, projectName: "Project 5", lastUpdate: "2024-06-23" },
    { id: 6, projectName: "Project 6", lastUpdate: "2024-06-23" },
    { id: 7, projectName: "Project 7", lastUpdate: "2024-06-23" },
  ];
  // DATAAAAAA~~~~~~

  const [isNavVisible, setIsNavVisible] = useState(false);

  const navigate = useNavigate();

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  // if not logged in, navigate to noauth pageeeeeeeeee
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
                  {mockData.map((project) => (
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
