import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import {
  BsChevronDown,
  BsChevronRight,
  BsFillPlusCircleFill,
} from "react-icons/bs";
import { MdOpenInNew } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import LeftNavBar from "./common/LeftNavBar";
import NoAuth from "./common/NoAuth";
import TopBar from "./common/TopBar";
import { formatProcessDates } from '../utils/utils';


function ListSingleProject() {
  const { projectId } = useParams();
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const userName = accounts[0].username;
  const [processes, setProcesses] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [projectName, setProjectName] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get(`/api/processes/${projectId}`)
        .then((response) => {
          console.log("Fetched processes:", response.data);
          const formattedProcesses = formatProcessDates(response.data.processes); // 트리 구조로 된 프로세스 데이터 설정
          setProcesses(formattedProcesses);
          setProjectName(response.data.projectName);  // 프로젝트 이름 설정
          setOptions(response.data.processes.map(process => ({
            id: process.id,
            name: process.name
          })));
        })
        .catch((error) => {
          console.error("Error fetching processes", error);
        });
    }
  }, [isAuthenticated, projectId]);

  const toggleRow = (id) => {
    setExpandedRows(
      expandedRows.includes(id)
        ? expandedRows.filter((rowId) => rowId !== id)
        : [...expandedRows, id]
    );
  };

  // // 기존 코드
  const handleOpenClick = async (event, item) => {
    event.stopPropagation();

    // console.log("Item object:", item);  // 디버깅 용도라서 주석 처리!!

    try {
      const response = await axios.get(`/api/diagrams/get-diagram-with-project/${projectId}/${item.id}/${userName}`);
      // console.log(`Request URL: /api/diagrams/get-diagram-with-project/${projectId}/${item.id}`);  // 디버깅 용도라서 주석 처리!!!
      // console.log("API Response:", response.data);  // 디버깅 용도라서 주석 처리!!!
      if (response.data.fileData) {
        const { diagramName, fileData } = response.data;  // 더 필요한 변수 있으면 추가해서 사용하면 될 것 같습니다~!!!
        // console.log(diagramName)  // 디버깅 용도라서 주석 처리!!!
        console.log(fileData)  // 디버깅 용도라서 주석 처리!!!

        const generatedUrl = `/project/${projectId}/${diagramName.replace(/ /g, '-')}`;  // 다이어그램 이름에 공백 존재할 경우 - 기호로 replace 하는 코드
        // console.log("Generated URL:", generatedUrl);  // 디버깅 용도라서 주석 처리!!!

        // 다이어그램 모델러 페이지로 이동
        // navigate(generatedUrl, { state: { itemId: item.id, userName: userName, fileData: fileData } });
        navigate(generatedUrl, { state: { itemId: item.id, userName: userName, fileData: fileData } });
      } else{
        const generatedUrl = `/project/${projectId}/${item.name.replace(/ /g, '-')}`;  // 다이어그램 이름에 공백 존재할 경우 - 기호로 replace 하는 코드
        // console.log("Generated URL:", generatedUrl);  // 디버깅 용도라서 주석 처리!!!

        // 다이어그램 모델러 페이지로 이동
        // navigate(generatedUrl, { state: { itemId: item.id, userName: userName, fileData: fileData } });
        navigate(generatedUrl, { state: { itemId: item.id, userName: userName } });
      }
    } catch (error) {
      console.error("Error fetching diagram data:", error);
      alert('Failed to open the diagram.');
    }
  };


  const renderRow = (item, level = 0) => {
    if (level > 2) return;
    const isExpanded = expandedRows.includes(item.id);
    const hasChildren = level < 2 && item.children && item.children.length > 0;

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
              {hasChildren ? (
                isExpanded ? (
                  <BsChevronDown />
                ) : (
                  <BsChevronRight />
                )
              ) : (
                <span>&nbsp;&nbsp;</span>
              )}
            </span>
            {item.name}
          </td>
          <td>{item.status}</td>
          <td>{item.last_update}</td>
          <td>
            <MdOpenInNew
              onClick={(event) => handleOpenClick(event, item)}
              style={{ cursor: "pointer" }}
            />
          </td>
        </tr>
        {isExpanded &&
          hasChildren &&
          item.children.map((child) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState("Process");
  const [processName, setProcessName] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [diagramName, setDiagramName] = useState("");

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleCreate = () => {
    if (formType === "Process" && processName !== "") {
      axios.post(`http://localhost:3001/api/processes/add`, {
        projectId: projectId,
        processName: processName
      })
        .then(res => {
          console.log(res.data);
          window.location.reload();
        })
        .catch(err => {
          console.error(err);
        });
      console.log("Creating Process:", processName);
    } else {
      if (diagramName !== "" && selectedProcess !== "") {
        console.log(
          "Creating Diagram:",
          diagramName,
          "for Process:",
          selectedProcess
        );
        axios.post(`http://localhost:3001/api/diagram/add`, {
          projectId: projectId,
          diagramName: diagramName,
          diagramId: selectedProcess
        })
          .then(res => {
            console.log(res.data);
            window.location.reload();
          })
          .catch(err => {
            console.error(err);
          });
      }
    }
    handleCloseModal();
  };

  // if (!isAuthenticated) {
  //   return <NoAuth />;
  // }

  return (
    <div>
      <TopBar onLogoClick={toggleNav} userName={userName} />
      <div className="d-flex">
        {isNavVisible && <LeftNavBar />}
        <div style={{ flexGrow: 1 }}>
          <button
            onClick={handleShowModal}
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
          <Modal size="lg" show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title className="w-100 text-center">
                Create New
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <ToggleButtonGroup
                className="mb-3"
                type="radio"
                name="formType"
                defaultValue={formType}
              >
                <ToggleButton
                  id="typeP"
                  value="Process"
                  style={{
                    backgroundColor:
                      formType === "Process" ? "#2A85E2" : "#d3e0ea",
                    border: "none",
                  }}
                  checked={formType === "Process"}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  Process
                </ToggleButton>
                <ToggleButton
                  id="typeD"
                  value="Diagram"
                  style={{
                    backgroundColor:
                      formType === "Diagram" ? "#2A85E2" : "#d3e0ea",
                    border: "none",
                  }}
                  checked={formType === "Diagram"}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  Diagram
                </ToggleButton>
              </ToggleButtonGroup>

              {formType === "Process" ? (
                <Form.Group className="d-flex align-items-center">
                  <Form.Label style={{ width: "25%" }}>Process Name</Form.Label>
                  <Form.Control
                    style={{ width: "75%" }}
                    type="text"
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                  />
                </Form.Group>
              ) : (
                <>
                  <Form.Group className="d-flex align-items-center mb-3">
                    <Form.Label style={{ width: "25%" }}>
                      Select the Process
                    </Form.Label>
                    <Form.Control
                      style={{ width: "75%" }}
                      as="select"
                      value={selectedProcess}
                      onChange={(e) => setSelectedProcess(e.target.value)}
                    >
                      {options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="d-flex align-items-center">
                    <Form.Label style={{ width: "25%" }}>
                      Diagram Name
                    </Form.Label>
                    <Form.Control
                      style={{ width: "75%" }}
                      type="text"
                      value={diagramName}
                      onChange={(e) => setDiagramName(e.target.value)}
                    />
                  </Form.Group>
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button
                style={{
                  color: "#1C6091",
                  width: "100px",
                  fontWeight: "550",
                  backgroundColor: "#d2e0ea",
                  border: "none",
                }}
                onClick={handleCreate}
              >
                Create
              </Button>
            </Modal.Footer>
          </Modal>
          <div className="d-flex flex-column align-items-center w-100 vh-100 bg-light text-dark">
            <div className="mt-4" style={{ width: "85%" }}>
              <h3 className="mb-3">{projectName}</h3>
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
