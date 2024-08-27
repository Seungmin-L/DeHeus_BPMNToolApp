import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import {
    BsArrowBarLeft,
    BsChevronDown,
    BsChevronUp
} from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";

export default function Sidebar(props) {
    const { handleHidden, diagramId, userName } = props;
    const { projectId } = useParams();
    const [processes, setProcesses] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);
    const navigate = useNavigate();

    const toggleRow = (id) => {
        setExpandedRows(
            expandedRows.includes(id) ?
                expandedRows.filter(r => r !== id) : [...expandedRows, id]
        );
    }

    const getCurrentDiagram = (processList) => {
        const current = processList?.filter(process => process.id === diagramId);
        if (current.length === 0) {
            const list = [];
            processList.forEach(process => {
                process.children && process.children.length > 0 && findDiagram(process.children, list);
            });
            if (list.length > 0) {
                const newRows = list.filter(p => !expandedRows.includes(p));
                setExpandedRows([...expandedRows, ...newRows]);
            }
        }
    }

    const findDiagram = (process, list) => {
        process.forEach(p => {
            if (p.id == diagramId) {
                !list.includes(p.parent_diagram_id) &&
                list.push(p.parent_diagram_id);
            } else {
                p.children && p.children.length > 0 && findDiagram(p.children, list);
            }
        });
        if (list.length > 0) {
            process.forEach(p => {
                if (list.includes(p.id)) {
                    !list.includes(p.parent_diagram_id) && list.push(p.parent_diagram_id);
                }
            });
        }
    }

    const handleOpenClick = async (id, name) => {
        try {
            const response = await axios.get(`/api/diagrams/get-diagram-with-project/${projectId}/${id}/${userName}`);
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
                navigate(generatedUrl, { state: { itemId: id, userName: userName, fileData: fileData } });
            } else {
                const generatedUrl = `/project/${projectId}/${name.replace(/ /g, '-')}`;  // 다이어그램 이름에 공백 존재할 경우 - 기호로 replace 하는 코드
                // console.log("Generated URL:", generatedUrl);  // 디버깅 용도라서 주석 처리!!!

                // 다이어그램 모델러 페이지로 이동
                // navigate(generatedUrl, { state: { itemId: item.id, userName: userName, fileData: fileData } });
                navigate(generatedUrl, { state: { itemId: id, userName: userName, fileData: null } });
            }
        } catch (error) {
            console.error("Error fetching diagram data:", error);
            alert('Failed to open the diagram.');
        }
    }

    const renderRow = (process, level = 0) => {
        const isExpanded = expandedRows.includes(process.id);
        const hasChildren = process.children && process.children.length > 0;
        return (
            <React.Fragment key={process.id}>
                <tr>
                    <td className="process-list-item" style={{
                        paddingLeft: (level + 1) * 5 + "px",
                        backgroundColor: process.id == diagramId ? "rgb(211, 224, 234)" : "white",
                        display: "flex", justifyContent: "space-between", cursor: "pointer"
                    }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenClick(process.id, process.name);
                        }}
                    >
                        <span className="mx-1">{process.name}</span>
                        <span onClick={(e) => {
                            e.stopPropagation();
                            hasChildren && toggleRow(process.id);
                        }}
                            style={{ cursor: hasChildren ? "pointer" : "default" }}
                        >
                            {hasChildren ? (
                                isExpanded ? (
                                    <BsChevronUp />
                                ) : (
                                    <BsChevronDown />
                                )
                            ) : (
                                <span>&nbsp;&nbsp;</span>
                            )}
                        </span>
                    </td>
                </tr>
                {isExpanded && hasChildren
                    &&
                    process.children.map(child => renderRow(child, level + 1))
                }
            </React.Fragment>
        )
    }
    useEffect(() => {
        axios.get(`/api/processes/${projectId}`)
            .then((res) => {
                setProcesses(res.data.processes);
                getCurrentDiagram(res.data.processes);
            })
            .catch((err) => console.error(err));
    }, [diagramId]);
    return (
        <div className='hierarchy-sidebar'>
            <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "hsl(225, 10%, 95%)" }}>
                <span style={{ fontWeight: "600" }}>Hierarchy</span>
                <BsArrowBarLeft className='sidebar-btn' onClick={handleHidden} />
            </div>
            <Table style={{ overflow: "auto", width: "100%", height: "calc(100% - 50px)", display: "block" }}>
                <tbody style={{ width: "100%" }}>
                    {processes && processes.map(process => renderRow(process))}
                </tbody>
            </Table>
        </div>
    )
}