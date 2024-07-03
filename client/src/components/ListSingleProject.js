import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { MdOpenInNew } from "react-icons/md";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useNavigate, useParams } from "react-router-dom";
import NoAuth from "./common/NoAuth";
import TopBar from './common/TopBar';
import LeftNavBar from './common/LeftNavBar';

function ListSingleProject() {
  const { projectId } = useParams();
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const userName = accounts[0].username;
  const [processes, setProcesses] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      axios.get(`/api/processes/${projectId}`).then(response => {
        const formattedProcesses = formatProcessDates(response.data);
        setProcesses(formattedProcesses);
      }).catch(error => {
        console.error("Error fetching processes", error);
      });
    }
  }, [isAuthenticated, projectId]);

  const formatProcessDates = (processes) => {
    return processes.map(process => {
      return {
        ...process,
        lastUpdate: convertUTCToLocal(process.lastUpdate),
        children: formatProcessDates(process.children || [])
      };
    });
  };

  const convertUTCToLocal = (dateString) => {
    const date = new Date(dateString);
    const localTime = new Date(date.getTime() + (7 * 60 * 60 * 1000)); // UTC+7 (VN)
    return localTime.toISOString().slice(0, 16).replace('T', ' ');
  };

  const toggleRow = (id) => {
    setExpandedRows(expandedRows.includes(id)
      ? expandedRows.filter((rowId) => rowId !== id)
      : [...expandedRows, id]
    );
  };

  const handleOpenClick = (event, item) => {
    event.stopPropagation();
    navigate("/diagram", { state: { itemId: item.id } });
  };

  const renderRow = (item, level = 0) => {
    const isExpanded = expandedRows.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    const rowClass = (level) => {
      if (hasChildren) {
        return level === 0 ? "table-primary" : "table-secondary";
      }
      return "";
    };

    return (
      <React.Fragment key={item.id}>
        <tr
          onClick={() => hasChildren && toggleRow(item.id)}
          style={{ cursor: hasChildren ? "pointer" : "default" }}
          className={isExpanded ? rowClass(level) : ""}
        >
          <td style={{ paddingLeft: level * 20 + "px", width: "60%" }}>
            <span style={{ marginRight: "5px" }}>
              {hasChildren ? (isExpanded ? <BsChevronDown /> : <BsChevronRight />) : <span>&nbsp;&nbsp;</span>}
            </span>
            {item.name}
          </td>
          <td>{item.status}</td>
          <td>{item.lastUpdate}</td>
          <td>
            <MdOpenInNew onClick={(event) => handleOpenClick(event, item)} style={{ cursor: "pointer" }} />
          </td>
        </tr>
        {isExpanded && hasChildren && item.children.map((child) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
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
              <h3 className="mb-3">Project {projectId}: VN Sales Department</h3>
              <style type="text/css">
                {`
                  .table-primary {
                    background-color: #b8daff;
                  }
                  .table-secondary {
                    background-color: #d1ecf1;
                  }
                `}
              </style>
              <Table>
                <thead>
                  <tr>
                    <th>Process Name</th>
                    <th>Status</th>
                    <th>Last Update</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>{processes.map((item) => renderRow(item))}</tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListSingleProject;
