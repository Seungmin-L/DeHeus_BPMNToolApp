import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import {
    BsArrowBarLeft,
    BsChevronDown,
    BsChevronRight
} from "react-icons/bs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function Sidebar(props) {
    const { handleHidden, projectId } = props;
    const { itemId } = useParams();
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
        const current = processList?.filter(process => process.id === itemId);
        if (current.length === 0) {
            const list = [];
            processList.map(process => {
                process.children && process.children.length > 0 && findDiagram(process.children, list);
            });
            if (list.length > 0) {
                setExpandedRows([...expandedRows, ...list]);
            }
        }
    }

    const findDiagram = (process, list) => {
        process.map(p => {
            if (p.id == itemId) {
                list.push(p.parent_diagram_id);
            } else {
                p.children && p.children.length > 0 && findDiagram(p.children, list);
            }
        });
        if (list.length > 0) {
            console.log(list);
            process.filter(p => {
                if (list.includes(p.id)) {
                    list.push(p.parent_diagram_id);
                }
            });
        }
    }

    const handleOpenClick = (id) => {
        navigate(`/publish/bpmnModeler/${id}`, { state: { itemId: id, projectId: projectId } });
    }

    const renderRow = (process, level = 0) => {
        const isExpanded = expandedRows.includes(process.id);
        const hasChildren = process.children && process.children.length > 0;
        return (
            <React.Fragment key={process.id}>
                <tr>
                    <td style={{ paddingLeft: level * 5 + "px", backgroundColor: process.id == itemId ? "hsl(225, 10%, 90%)" : "white" }}>
                        <span className="mx-1" onClick={() => {
                            hasChildren && toggleRow(process.id);
                        }}
                            style={{ cursor: hasChildren ? "pointer" : "default" }}
                        >
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
                        <span onClick={() => handleOpenClick(process.id)} style={{ cursor: "pointer" }}>{process.name}</span>
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
        axios.get(`/api/allProcesses/${projectId}`)
            .then((res) => {
                setProcesses(res.data);
                getCurrentDiagram(res.data);
            })
            .catch((err) => console.error(err));
    }, [itemId]);
    return (
        <div className='hierarchy-sidebar'>
            <div className="d-flex justify-content-between align-items-center p-2">
                <span style={{ fontWeight: "bold" }}>Hierarchy</span>
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