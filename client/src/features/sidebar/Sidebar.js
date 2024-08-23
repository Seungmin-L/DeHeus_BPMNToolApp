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
    const { handleHidden } = props;
    const { projectId, diagramId } = useParams();
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
                setExpandedRows([...expandedRows, ...list]);
            }
        }
    }

    const findDiagram = (process, list) => {
        process.forEach(p => {
            if (p.id == diagramId) {
                list.push(p.parent_diagram_id);
            } else {
                p.children && p.children.length > 0 && findDiagram(p.children, list);
            }
        });
        if (list.length > 0) {
            process.forEach(p => {
                if (list.includes(p.id)) {
                    list.push(p.parent_diagram_id);
                }
            });
        }
    }

    const handleOpenClick = (id) => {
        navigate(`/project/${projectId}/${id}`, { state: { itemId: id, projectId: projectId } });
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
                            handleOpenClick(process.id);
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
        console.log(diagramId);
        axios.get(`/api/processes/${projectId}`)
            .then((res) => {
                setProcesses(res.data);
                getCurrentDiagram(res.data);
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