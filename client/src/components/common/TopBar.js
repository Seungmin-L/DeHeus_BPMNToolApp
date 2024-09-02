import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Dropdown,
  Form,
  FormControl,
  InputGroup,
  Nav,
  Navbar,
} from "react-bootstrap";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logos/logo_deheus.png";
import { useNavigate, useParams } from "react-router-dom";

function TopBar({ onLogoClick, userName, projectId }) {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const logout = () => {
    instance.logoutRedirect().catch((error) => {
      console.error("Logout error:", error);
    });
    localStorage.removeItem('msalToken');
    localStorage.removeItem('msalAccount');
  };

  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get(`http://localhost:3001/api/diagrams/getAll`, {
          params: { projectId }
        })
        .then((response) => {
          setDiagrams(response.data.result.recordset);
        })
        .catch((error) => {
          console.error("Error fetching processes", error);
        });
    }

  }, [isAuthenticated, projectId]);

  const filteredDiagrams = diagrams.filter(diagram =>
    diagram.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        // console.log(fileData)  // 디버깅 용도라서 주석 처리!!!

        const generatedUrl = `/project/${projectId}/${diagramName.replace(/ /g, '-')}`;  // 다이어그램 이름에 공백 존재할 경우 - 기호로 replace 하는 코드
        // console.log("Generated URL:", generatedUrl);  // 디버깅 용도라서 주석 처리!!!

        // 다이어그램 모델러 페이지로 이동
        // navigate(generatedUrl, { state: { itemId: item.id, userName: userName, fileData: fileData } });
        navigate(generatedUrl, { state: { itemId: item.id, userName: userName, fileData: fileData } });
      } else {
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

  return (
    <Navbar style={{ backgroundColor: "#d3e0ea" }} variant="light" expand="lg">
      <Container fluid>
        <Navbar.Brand onClick={onLogoClick} style={{ cursor: "pointer" }}>
          <img
            src={logo}
            height="30"
            className="d-inline-block align-top"
            alt="Company Logo"
          />
        </Navbar.Brand>
        {projectId && (
          <Nav className="mx-auto">
            <Form className="d-flex" style={{ position: 'relative' }}>
              <InputGroup style={{ width: '400px' }}>
                <FormControl
                  type="search"
                  placeholder="Search diagrams"
                  aria-label="Search"
                  aria-describedby="search-addon"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroup.Text id="search-addon">
                  <FaSearch />
                </InputGroup.Text>
              </InputGroup>
              {searchQuery && (
                <Dropdown.Menu show style={{ position: 'absolute', top: '100%', left: 0, right: 0, width: '100%' }}>
                  {filteredDiagrams.length > 0 ? (
                    filteredDiagrams.map((diagram) => (
                      <Dropdown.Item key={diagram.id} onClick={(event) => handleOpenClick(event, diagram)}>
                        {diagram.name}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item>No results found</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              )}
            </Form>
          </Nav>
        )}
        <Nav>
          <Dropdown>
            <Dropdown.Toggle as={Nav.Item}>
              <span
                style={{
                  marginRight: "10px",
                  fontSize: "1rem",
                  color: "#6c757d",
                }}
              >
                {userName}
              </span>
              <FaUserCircle
                size={30}
                style={{ marginRight: "5px", color: "#fff" }}
              />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="/mypage">My Page</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopBar;
