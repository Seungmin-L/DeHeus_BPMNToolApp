import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import BpmnModeler from 'bpmn-js/lib/Modeler';
import ColorPickerModule from 'bpmn-js-color-picker';
import minimapModule from 'diagram-js-minimap';
import ErrorPage from './ErrorPage';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import attachmentPropertiesProviderModule from '../providers';
import readOnlyAttachmentProviderModule from '../readOnlyProviders';
import attachmentModdleDescriptor from '../providers/descriptor/attachment.json';
import generateImage from '../util/generateImage';
import generatePdf from '../util/generatePdf';
//custom properties module
import parameterPropertiesProviderModule from '../providers';
import parameterModdleDescriptor from '../providers/descriptor/parameter.json';
import readOnlyParameterProviderModule from '../readOnlyProviders';
import dropdownPropertiesProvider from '../providers';
import readOnlyDropdownProviderModule from '../readOnlyProviders';
import dropdownDescriptor from '../providers/descriptor/dropdown';
//search
import bpmnSearchModule from '../features/search/provider';
//subprocess
import DrilldownOverlayBehavior from '../features/subprocess';
//replace popup
import PopupMenuModule from '../features/popup';
import ReplaceModule from '../features/replace';
//palette
import PaletteModule from '../features/palette';

//publish
import emailjs from '@emailjs/browser';

//toolbar
import Toolbar from '../features/toolbar/toolbar';
import Topbar from './common/TopBar'
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import '../styles/bpmn-js.css';
import '../styles/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import Sidebar from '../features/sidebar/Sidebar';
import { BsArrowBarRight } from 'react-icons/bs';
import { navigateTo } from '../util/navigation';

// Checkin
import { Form, Button, Modal } from "react-bootstrap";


function BpmnEditor() {
    const navigate = useNavigate();
    const location = useLocation();
    const diagramId = location.state?.itemId; // 프로젝트 리스트에서 접근할 때 state로 가지고 온 다이어그램 id
    const { projectId, itemName } = useParams();
    const fileData = location.state?.fileData; // state로 가지고 온 다이어그램 userName
    // const userName = "vnapp.pbmn@deheus.com"
    const container = useRef(null);
    const importFile = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [userEmail, setUserEmail] = useState("");  // *
    const [userRole, setUserRole] = useState(null); // for toolbar view (read-only, contributor, editing)
    const [editor, setEditor] = useState(null);
    const [diagramPath, setDiagramPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHidden, setIsHidden] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [diagramXML, setDiagramXML] = useState(fileData);
    const [isFileValid, setIsFileValid] = useState(true);
    const [hidePanel, setHidePanel] = useState(false);
    const saveKeys = ['s', 'S'];
    const [showPublishModal, setShowPublishModal] = useState(false);
    let modelerInstance = null;
    const searchKeys = ['f', 'F'];
    let priority = 10000;

    const isAuthenticated = useIsAuthenticated();
    const [userName, setUserName] = useState("");
    const { accounts } = useMsal();

    // check-in
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const handleShowCheckInModal = () => setShowCheckInModal(true);
    const handleCloseCheckInModal = () => setShowCheckInModal(false);

    // publish
    const handleShowPublishModal = () => setShowPublishModal(true);
    const handleClosePublishModal = () => setShowPublishModal(false);

    // confirm publish
    const [showConfirmPublishModal, setShowConfirmPublishModal] = useState(false);
    const handleShowConfirmPublishModal = () => setShowConfirmPublishModal(true);
    const handleCloseConfirmPublishModal = () => setShowConfirmPublishModal(false);
    const [declineReason, setDeclineReason] = useState('');

    // Publish variables
    const currentUrl = window.location.href;
    const [link] = useState(currentUrl);
    const [message, setMessage] = useState('');
    const [diagramName, setDiagramName] = useState('DiagramName');  // *

    // fetches contribution. if the user is editor the user role will be set to contributor, if not read-only
    const fetchUserRole = async () => {
        try {
            const response = await axios.get('/api/fetch/user-role', {
                params: { projectId, diagramId, userEmail }
            });
            const userName = response.data.userName;
            const userRole = response.data.role;
            if (userRole === 'editing') {
                setEditor(true);
                setUserName(userName);
                setUserRole('editing');
            } else if (userRole === 'contributor') {
                setUserName(userName);
                setUserRole('contributor');
            } else if (userRole === 'read-only') {
                setUserName(userName);
                setUserRole('read-only');
            } else if (userRole === 'admin') {
                setUserName(userName);
                setUserRole('admin');
            } 
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('No contribution found');
            } else {
                setError('Error fetching user role');
            }
        } finally {
            setLoading(false);
        }
        
    };

    const fetchDiagramPath = async () => {
        try {
            const response = await axios.get('/api/fetch/diagram', {
                params: { diagramId, projectId }
            });

            if (response.status === 200 && response.data.path) {
                const diagramPath = response.data.path;
                const diagramName = response.data.diagramName;
                setDiagramPath(diagramPath);
                setDiagramName(diagramName);
                document.title = diagramPath.split('[').pop().split(']')[0];
            } else {
                console.error("Failed to fetch diagram path: Invalid response data.");
            }
        } catch (err) {
            console.error("An error occurred while fetching the diagram path:", err.message);
        }
    };

    useEffect(() => {
        if (isAuthenticated && accounts.length > 0) {
            const userName = accounts[0].username;
            setUserName(userName);
            setUserEmail(userName);
        }
        fetchUserRole();
        fetchDiagramPath();

        if (modelerInstance) return;
        // If there's a modeler instance already, destroy it
        if (modeler) modeler.destroy();

        modelerInstance = new BpmnModeler({
            container: container.current,
            keyboard: { bindTo: document },
            propertiesPanel: {
                parent: "#properties-panel-parent"
            },
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule,
                ColorPickerModule,
                minimapModule,
                userRole !== 'editing' ? readOnlyAttachmentProviderModule : attachmentPropertiesProviderModule,
                userRole !== 'editing' ? readOnlyParameterProviderModule : parameterPropertiesProviderModule,
                userRole !== 'editing' ? readOnlyDropdownProviderModule : dropdownPropertiesProvider,
                bpmnSearchModule,
                DrilldownOverlayBehavior,
                PaletteModule,
                PopupMenuModule,
                ReplaceModule,
                userRole !== 'editing' && {
                    dragging: ['value', { init: function () { } }],
                    create: ['value', {}]
                }
            ],
            moddleExtensions: {
                attachment: attachmentModdleDescriptor,
                extended: parameterModdleDescriptor,
                dropdown: dropdownDescriptor,
            }
        });

        window.addEventListener("message", (e) => {
            if (e.origin !== window.location.origin) return;
            const data = e.data;
            if (data) {
                const { id, url, userName } = data;
                if (id && url && userName) {
                    console.log(data);
                    if (data.fileData) {
                        navigateTo(url, id, userName, data.fileData);
                    } else {
                        navigateTo(url, id, userName);
                    }
                }
            }
        });
        
        // Import file or create a new diagram
        if (diagramXML) {
            modelerInstance.importXML(diagramXML)
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.warn(warnings);
                    }
                    modelerInstance.get("canvas").zoom("fit-viewport");
                    modelerInstance.get('keyboard').bind(document);
                })
                .catch(err => {
                    // console.log(err);
                    console.error("Error rendering diagram:", err);
                    setIsFileValid(false);
                });
        } else {
            modelerInstance.createDiagram()
                .then(() => {
                    modelerInstance.get("canvas").zoom("fit-viewport");
                    modelerInstance.get('keyboard').bind(document);
                })
                .catch(err => {
                    console.log(err);
                    setIsFileValid(false);
                });
        }
        setModeler(modelerInstance);
        // console.log(modeler?.get('elementRegistry'))
        if (modelerInstance) {
            const eventBus = modelerInstance.get('eventBus');
            const keyboard = modelerInstance.get('keyboard');
            if (userRole !== 'editing') {
                eventBus.on('element.dblclick', priority, () => {
                    return false;
                });

                keyboard.addListener(priority, () => {
                    return false;
                });

                keyboard.addListener(20000, function (context) {
                    var event = context.keyEvent;
                    if (event.ctrlKey || event.metaKey) {
                        if (searchKeys.indexOf(event.key) !== -1 || searchKeys.indexOf(event.code) !== -1) {
                            modelerInstance.get('editorActions').trigger('find');
                            return true;
                        }
                    }
                });
                document.addEventListener("keydown", (e) => {
                    if (e.key === 'Tab') e.preventDefault();
                })
            } else {
                const eventBus = modelerInstance.get('eventBus');
                const elementRegistry = modelerInstance.get('elementRegistry');

                eventBus.on('element.click', function (e) {
                    const element = elementRegistry.get(e.element.id);
                    const overlays = modelerInstance.get('overlays');
                    const existingOverlays = overlays.get({ element: element, type: 'drilldown' });
                    if (existingOverlays.length) {
                        console.log('DrilldownOverlayBehavior.prototype._addOverlay was called for this element.');
                    }
                });
                // Check file api availablitiy
                if (!window.FileList || !window.FileReader) {
                    window.alert(
                        'Looks like you use an older browser that does not support drag and drop. ' +
                        'Try using Chrome, Firefox or the Internet Explorer > 10.');
                } else {
                    registerFileDrop(document.getElementById('modeler-container'));
                }
                // Save diagram on every change
                modelerInstance.on('commandStack.changed', () => console.log(modelerInstance.get('elementRegistry')));
                modelerInstance.on('commandStack.changed', saveDiagram);
                modelerInstance.on('commandStack.shape.delete.executed', (e) => onElementDelete(e.context.shape.id || undefined));
                // Add Save shortcut (ctrl + s)
                modelerInstance.get('editorActions').register('save', saveDiagram);
                keyboard.addListener(function (context) {
                    var event = context.keyEvent;
                    if (event.ctrlKey || event.metaKey) {
                        if (saveKeys.indexOf(event.key) !== -1 || saveKeys.indexOf(event.code) !== -1) {
                            modelerInstance.get('editorActions').trigger('save');
                            return true;
                        }
                    }
                });
            }
        }
        updatePaletteVisibility();

        return () => {
            modeler?.destroy();
        }
    }, [diagramXML, editor, diagramId, projectId, userRole, diagramPath]);

    useEffect(() => {
        if (fileData) {
            setDiagramXML(fileData);
        } else {
            setDiagramXML(null);
        }
    }, [fileData, diagramXML]);

    useEffect(() => {
        const minimapElement = document.querySelector('.djs-minimap');
        if (minimapElement) {
          if (!hidePanel) {
            minimapElement.classList.remove('hidePanelFalse');
          } else {
            minimapElement.classList.add('hidePanelFalse');
          }
        }
    })

    // hide hierarchy side bar
    const handleHidden = () => {
        setIsHidden(prev => !prev);
    }
    // File drag & drop
    const registerFileDrop = (container) => {
        const handleFileSelect = (e) => {
            e.stopPropagation();
            e.preventDefault();

            var files = e.dataTransfer.files;
            var file = files[0];
            var reader = new FileReader();
            if (file) {
                reader.onload = (e) => {
                    var xml = e.target.result;
                    setDiagramXML(xml);
                };

                reader.readAsText(file);
            } else {
                console.log("Invalid File");
            }
        }

        const handleDragOver = (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }

        container.addEventListener('dragover', handleDragOver, false);
        container.addEventListener('drop', handleFileSelect, false);
    }

    // Download exported file (SVG, XML)
    const setEncoded = (link, name, data) => {
        var encodedData = encodeURIComponent(data);
        if (data) {
            link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
            link.setAttribute('download', name);
        }
        handleClose();
    }

    // Download exported image file (PNG, JPEG)
    const downloadImage = (link, name, url) => {
        link.setAttribute('href', url);
        link.setAttribute('download', name);
        handleClose();
    }

    // Export diagram as xml
    const exportXml = async (id) => {
        if (modeler) {
            const { xml } = await modeler.saveXML({ format: true }).catch(err => {
                console.log(err);
            });
            if (xml) {
                setEncoded(document.getElementById(id), itemName + '.xml', xml);
            };
        }
    };

    // Export diagram as svg
    const exportSvg = async (id) => {
        if (modeler) {
            const { svg } = await modeler.saveSVG({ format: true }).catch(err => {
                console.log(err);
            });
            if (svg) {
                setEncoded(document.getElementById(id), itemName + '.svg', svg);
            };
        }
    };

    // Export diagram as png
    const exportPng = async (id) => {
        if (modeler) {
            const { svg } = await modeler.saveSVG({ format: true }).catch(err => {
                console.log(err);
            });
            if (svg) {
                const url = await generateImage('png', svg);
                downloadImage(document.getElementById(id), itemName + '.png', url);
            };
        }
    };

    // Export diagram as pdf
    const exportPdf = async (id) => {
        if (modeler) {
            const { svg } = await modeler.saveSVG({ format: true }).catch(err => {
                console.log(err);
            });
            if (svg) {
                const url = await generateImage('png', svg);
                generatePdf(url, itemName);
            };
            handleClose();
        }
    }

    // Save diagram
    const saveDiagram = async () => {
        if (modelerInstance) {
            const { xml } = await modelerInstance.saveXML({ format: true }).catch(err => {
                console.log(err);
            });
            if (xml) {
                console.log(xml);
                console.log(diagramId, userEmail);
                // Save diagram in DB
                axios.post('http://localhost:3001/api/diagram/save', { xml: xml, diagramId: diagramId, userEmail: userEmail })
                    .then(response => {
                        console.log("Diagram saved successfully:", response.data);
                    })
                    .catch(error => {
                        console.error("Error saving diagram to the database:", error);
                    });
            };
        }
    }
    const onElementDelete = (nodeId) => {
        if (nodeId === undefined) {
            console.log("undefined");
            return;
        }
        axios.post(`http://localhost:3001/api/attachments/${diagramId}/${nodeId}`)
            .then(res => console.log(res.data))
            .catch(err => console.error("Error fetching processes", err));
    }

    const onImportClick = () => {
        importFile.current.click();
    }
    const onFileChange = (e) => {
        e.stopPropagation();
        e.preventDefault();
        var file = e.target.files[0];
        var reader = new FileReader();
        if (file) {
            reader.onload = (e) => {
                var xml = e.target.result;
                setDiagramXML(xml);
            };

            reader.readAsText(file);
        } else {
            console.log("Invalid File");
        }
    }

    // handle exports to files
    const handleExportXml = (e) => {
        e.stopPropagation();
        exportXml(e.target.id, "diagram")
    }
    const handleExportSvg = (e) => {
        e.stopPropagation();
        exportSvg(e.target.id, "diagram")
    }
    const handleExportPng = (e) => {
        e.stopPropagation();
        exportPng(e.target.id, "diagram")
    }
    const handleExportPdf = (e) => {
        e.stopPropagation();
        exportPdf(e.target.id, "diagram");
    }
    const handleClose = () => {
        setIsOpen(false);
    }

    // handle checkout function
    const handleCheckIn = async () => {
        try {
            // console.log(diagramId);
            // console.log(userEmail);
            // console.log(userName);
            const response = await axios.post('http://localhost:3001/api/diagram/checkedout', { diagramId, userEmail });

            if (response.status === 200) {
                alert("Checked In!");
                handleCloseCheckInModal();
                setUserRole("editing");
            } else {
                console.error("Checked-out failed:", response.data.message);
                alert("Checked-out failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during checked-out:", error.message);
            alert("Error during checked-out. Please try again.");
        }
    }

    // handle contributor
    const handleContributor = () => {

    }

    // send a request to publish
    const handleSubmit = (e) => {
        e.preventDefault();

        const serviceId = 'service_deheusvn_bpmnapp';
        const templateId = 'template_rfow6sk';
        const publicKey = 'oQHqsgvCGRFGdRGwg';

        const templateParams = {
            to_name: 'Admin',
            from_name: userName,
            from_email: userEmail,
            diagram_name: diagramName,  // *
            message: message,
            link: link + "/" + diagramId,
        };

        emailjs.send(serviceId, templateId, templateParams, publicKey)
            .then((response) => {
                console.log('Email sent successfully!', response);
                alert("Email sent successfully!");
                setMessage('');
                handleClosePublishModal();
            })
            .catch((error) => {
                console.error('Error sending email:', error);
                alert("Error sending email");
            });
    }

    
    // Confirm Publish function
    const handleConfirmPublish = () => {
        alert("Diagram Published!");
        handleCloseConfirmPublishModal();
    }

    // Decline Publish function
    const handleDeclinePublish = () => {
        alert(`Publish declined: ${declineReason}`);
        setDeclineReason('');
        handleCloseConfirmPublishModal();
    }
    
    /**Tool bar functions */
    // handle zoom in
    const handleZoomIn = () => {
        modeler?.get('zoomScroll').stepZoom(1);
    };
    // handle zoom out
    const handleZoomOut = () => {
        modeler?.get('zoomScroll').stepZoom(-1);
    };
    // handle undo
    const handleUndo = () => {
        modeler?.get('commandStack').undo();
        // console.log(modeler?.get('commandStack'))
    };
    // handle redo
    const handleRedo = () => {
        modeler?.get('commandStack').redo();
    };
    // handle save
    const handleSave = async () => {
        if (modeler) {
            // save bpmn diagram as xml
            const { xml } = await modeler.saveXML({ format: true }).catch(err => {
                console.error("Error saving XML:", err);
            });

            if (xml) {
                console.log("Saved XML:", xml);
                console.log("diagramId:", diagramId);
                axios.post('http://localhost:3001/api/diagram/save', { xml: xml, diagramId: diagramId, userName: userName })
                    .then(response => {
                        console.log("Diagram saved successfully:", response.data);
                    })
                    .catch(error => {
                        console.error("Error saving diagram to the database:", error);
                    });
            }
        }
        // setUserRole("contributor");
    };
    // handle aligning elements
    const handleAlign = (alignment) => {
        const alignElements = modeler?.get('alignElements');
        const selection = modeler?.get('selection');
        const selectedElements = selection.get();

        if (selectedElements.length > 1) {
            alignElements.trigger(selectedElements, alignment);
        } else {
            console.log('Please select at least two elements to align.');
        }
    };
    // handle distributing elements
    const handleDistribute = (direction) => {
        const distributeElements = modeler?.get('distributeElements');
        const selection = modeler?.get('selection');
        const selectedElements = selection.get();

        if (selectedElements.length > 2) {
            distributeElements.trigger(selectedElements, direction);
        } else {
            console.log('Please select at least three elements to distribute.');
        }
    };


    // handle panel visibility
    const toggleVisibility = () => {
        setHidePanel(!hidePanel);
    };
    const toMain = () => {
        navigate("/main");
    }

    // Function to hide the element if the user is not editing
    function updatePaletteVisibility() {
        const palette = document.querySelector('.djs-palette.two-column.open');
        const columnPalette = document.querySelector('.djs-palette.open');
        if (palette) {
            if (userRole !== 'editing') {
                palette.style.display = 'none';
            }
        } else if (columnPalette) {
            if (userRole !== 'editing') {
                columnPalette.style.display = 'none';
            }
        } else {
            console.error('Element not found');
        }
    }


    if (!isFileValid) {
        return (
            <ErrorPage />
        )
    } else {
        return (
            <div className='main-container' onClick={handleClose} style={{ "--height": window.innerHeight }}>
                <div className='model-header'>
                    <Topbar onLogoClick={toMain} />
                    <Toolbar
                        mode={userRole} // "read-only" or "contributor" or "editing"
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        onSave={handleSave}
                        onImport={onImportClick}
                        onExportXml={handleExportXml}
                        onExportSvg={handleExportSvg}
                        onExportPng={handleExportPng}
                        onExportPdf={handleExportPdf}
                        // more export calls here
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        onAlignLeft={() => handleAlign('left')}
                        onAlignCenter={() => handleAlign('center')}
                        onAlignRight={() => handleAlign('right')}
                        onAlignTop={() => handleAlign('top')}
                        onAlignMiddle={() => handleAlign('middle')}
                        onAlignBottom={() => handleAlign('bottom')}
                        onDistributeHorizontally={() => handleDistribute('horizontal')}
                        onDistributeVertically={() => handleDistribute('vertical')}
                        importFile={importFile}
                        onFileChange={onFileChange}
                        onCheckIn={handleShowCheckInModal}
                        onContributor={handleContributor}
                        onShare={handleShowPublishModal}
                        onPublish={handleShowConfirmPublishModal}
                    />
                </div>
                <div className={userRole === 'editing' ? 'model-body' : 'model-body disabled'}>
                    {isHidden ?
                        <BsArrowBarRight className='sidebar-btn hidden' onClick={handleHidden} />
                        :
                        <Sidebar handleHidden={handleHidden} diagramId={diagramId} userName={userEmail} />
                    }

                    <div
                        id='modeler-container'
                        className={"" + (isHidden ? 'sidebar-hidden' : '')}
                        ref={container}
                    />
                    <div className={hidePanel ? 'properties_panel_hidden' : 'properties_panel_open'}>
                        <button className='hide-panel' onClick={toggleVisibility}>
                            Details
                        </button>
                        <div id='properties-panel-parent' />

                    </div>
                </div>
                <div>
                    <Modal show={showPublishModal} onHide={handleClosePublishModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ textAlign: 'center', width: '100%' }}>Publish Request Form</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div style={{ padding: '15px', marginBottom: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                                <h5>Diagram</h5>
                                <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#1C6091' }}>{diagramPath}</p>
                            </div>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="message">
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Enter a request message."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" style={{ color: "#fff", fontWeight: "550", backgroundColor: "#5cb85c", border: "none", display: "block", margin: "0 auto" }}>
                                    Send Request
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    <Modal show={showCheckInModal} onHide={handleCloseCheckInModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ textAlign: 'center', width: '100%' }}>Check Out Confirm</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px' }}>
                                <h5>Diagram Path</h5>
                                <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#1C6091' }}>{diagramPath}</p>
                            </div>
                            <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
                                <ul style={{ paddingLeft: '20px' }}>
                                    <li>Once you check out, you will have editing access to this diagram for the <strong>next 14 days</strong>.</li>
                                    <li>During this period, you can <strong>edit</strong> and <strong>save</strong> the draft, then <strong>request for publishing</strong> once completed.</li>
                                </ul>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="success" onClick={handleCheckIn} style={{ color: "#fff", fontWeight: "550", backgroundColor: "#5cb85c", border: "none", display: "block", margin: "0 auto" }}>
                                Check out
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showConfirmPublishModal} onHide={handleCloseConfirmPublishModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ textAlign: 'center', width: '100%' }}>Confirm Publish</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
                            <p>If you agree to publish this diagram, please click <strong>Confirm</strong>. If not, please provide a reason and click <strong>Decline</strong>.</p>
                            </div>
                            <Form>
                            <Form.Group className="mb-3" controlId="declineReason">
                                <Form.Label style={{ textAlign: 'center', width: '100%' }}>Decline Reason (Optional)</Form.Label>
                                <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Type the reason for declining"
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                />
                            </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer style={{ justifyContent: 'space-around' }}>
                            <Button variant="success" onClick={handleConfirmPublish} style={{ color: "#fff", fontWeight: "550", backgroundColor: "#5cb85c", border: "none" }}>
                            Confirm
                            </Button>
                            <Button variant="danger" onClick={handleDeclinePublish} style={{ color: "#fff", fontWeight: "550", backgroundColor: "#d9534f", border: "none" }}>
                            Decline
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        )
    }

}
export default BpmnEditor;
