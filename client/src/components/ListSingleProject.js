import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { MdOpenInNew } from "react-icons/md";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useNavigate, useParams } from "react-router-dom";
import NoAuth from "./common/NoAuth";
import TopBar from './common/TopBar';
import LeftNavBar from './common/LeftNavBar';

function ListSingleProject() {
  // This is the projectId param from previous page! Fetch appropriate data according to this~~~~
  const { projectId } = useParams();

  // DATAAAAAA~~~~~~
  // This is just mock data I set! we have to fetch once BE is ready~~~
  const mockData = [
    {
      id: 1,
      name: "Order Fulfilment Process",
      status: "Checked in by Chris",
      lastUpdate: "2024-01-01",
      children: [],
    },
    {
      id: 2,
      name: "Payment Process",
      status: "Checked in by Bob",
      lastUpdate: "2024-02-01",
      children: [
        {
          id: 21,
          name: "Order Generation Process",
          status: "Checked in by Chris",
          lastUpdate: "2024-02-10",
          children: [
            { id: 211, name: "POG2002", status: "", lastUpdate: "2024-02-15" },
            { id: 212, name: "POG5037", status: "Checked in by Luke", lastUpdate: "2024-02-20" },
          ],
        },
        { id: 22, name: "Financial Control Process", status: "", lastUpdate: "2024-02-25" },
        { id: 23, name: "Shipment Fulfilment Process", status: "", lastUpdate: "2024-02-26" },
      ],
    },
    {
      id: 3,
      name: "Business Generation Process",
      status: "",
      lastUpdate: "2024-01-01",
      children: [],
    },
    {
      id: 4,
      name: "Order Fulfilment Process",
      status: "",
      lastUpdate: "2024-01-01",
      children: [],
    },
    {
      id: 5,
      name: "Payment Process",
      status: "",
      lastUpdate: "2024-02-01",
      children: [
        {
          id: 51,
          name: "Order Generation Process",
          status: "Checked in by Chris",
          lastUpdate: "2024-02-10",
          children: [
            { id: 511, name: "POG2002", status: "", lastUpdate: "2024-02-15" },
            { id: 512, name: "POG5037", status: "Checked in by Luke", lastUpdate: "2024-02-20" },
          ],
        },
        { id: 52, name: "Financial Control Process", status: "", lastUpdate: "2024-02-25" },
        { id: 53, name: "Shipment Fulfilment Process", status: "", lastUpdate: "2024-02-26" },
      ],
    },
    {
      id: 6,
      name: "Business Generation Process",
      status: "",
      lastUpdate: "2024-01-01",
      children: [],
    },
    {
      id: 7,
      name: "Order Fulfilment Process",
      status: "Checked in by Bob",
      lastUpdate: "2024-01-01",
      children: [],
    },
    {
      id: 8,
      name: "Payment Process",
      status: "",
      lastUpdate: "2024-01-01",
      children: [],
    },
  ];
  // DATAAAAA~~~~~~~

  const isAuthenticated = useIsAuthenticated();

  const { accounts } = useMsal();
  const userName = accounts[0].username; 
  
  // For Hierarchical Table
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false);

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
          <td style={{ paddingLeft: level * 50 + "px", width: "60%" }}>
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
                <tbody>{mockData.map((item) => renderRow(item))}</tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListSingleProject;
