import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import BpmnModeler from 'bpmn-js/lib/Modeler';
import ColorPickerModule from 'bpmn-js-color-picker';
import minimapModule from 'diagram-js-minimap';
import ErrorPage from './ErrorPage';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import attachmentPropertiesProviderModule from '../providers';
import attachmentModdleDescriptor from '../providers/descriptor/attachment.json';
import generateImage from '../util/generateImage';
import generatePdf from '../util/generatePdf';
//custom properties module
import parameterPropertiesProviderModule from '../providers';
import parameterModdleDescriptor from '../providers/descriptor/parameter.json';
import dropdownPropertiesProvider from '../providers';
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

function BpmnEditor() {
    const navigate = useNavigate();
    const location = useLocation();
    const diagramId = location.state?.itemId; // state로 가지고 온 다이어그램 id
    const { projectId } = useParams();
    const userName = location.state?.userName; // state로 가지고 온 다이어그램 userName
    const fileData = location.state?.fileData; // state로 가지고 온 다이어그램 userName
    const container = useRef(null);
    const importFile = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [userRole, setUserRole] = useState(null); // for toolbar view (readOnly, contributor, editing)
    const [editor, setEditor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHidden, setIsHidden] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [diagramXML, setDiagramXML] = useState(null);
    const [isFileValid, setIsFileValid] = useState(true);
    const [hidePanel, setHidePanel] = useState(false);
    const saveKeys = ['s', 'S'];
    let modelerInstance = null;

    // fetches contribution. if the user is editor the user role will be set to contributor, if not readOnly
    const fetchEditor = async () => {
        try {
            const response = await axios.get('/api/contribution/editor', {
                params: { projectId, userName }
            });
            setEditor(response.data.editor);
            if (response.data.editor && userRole !== "editing") {
                setUserRole("contributor");
            } else if (!response.data.editor && userRole !== "editing") {
                setUserRole("readOnly");
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('No contribution found');
            } else {
                setError('Error fetching editor');
            }
        } finally {
            setLoading(false);
        }

    };
    useEffect(() => {
        // 아래는 디버깅 용도 로그입니다~!!
        // console.log("Received Diagram ID:", diagramId); 
        // console.log("Received User Name:", userName); 
        // console.log("Received File Data:", fileData); 

        // 아래 코드는 내가 임의로 작성해 둔 건데, server/src/controllers/diagramController.js 파일에서 api response로 가지고 온 xml 정보 (diagram_published 테이블의 file data 컬럼에 해당)를 다이어그램 모델러로 띄우면 됩니다~!!! 라인 193도 함께 주석 처리 완료!!!
        // if (projectName && diagramName && publishDate) {
        //     axios.get(`/api/diagrams/get-diagram-with-project/${diagramId}`)
        //         .then(response => {
        //             const { fileData } = response.data;
        //             setDiagramXML(fileData);
        //         })
        //         .catch(error => {
        //             console.error("Error fetching diagram data:", error);
        //             setIsFileValid(false);
        //         });
        // }
        fetchEditor();


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
                parameterPropertiesProviderModule,
                dropdownPropertiesProvider,
                bpmnSearchModule,
                DrilldownOverlayBehavior,
                PaletteModule,
                PopupMenuModule,
                ReplaceModule
            ],
            moddleExtensions: {
                attachment: attachmentModdleDescriptor,
                extended: parameterModdleDescriptor,
                dropdown: dropdownDescriptor,
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
        // if subprocess
        // var bpmnnXml = localStorage.getItem('bpmnXml');
        // if (bpmnnXml) {
        //     //set bpmn xml from local
        //     setDiagramXML(bpmnnXml);
        // }
        // Import file or create a new diagram

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
        if (fileData) {
            setDiagramXML(fileData);
        }
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

        // Save diagram on every change
        modelerInstance.on('commandStack.changed', () => console.log(modelerInstance.get('elementRegistry')));
        // modelerInstance.on('commandStack.changed', saveDiagram);
        modelerInstance.on('commandStack.shape.delete.executed', (e) => onElementDelete(e.context.shape.id || undefined));
        // Add Save shortcut (ctrl + s)
        modelerInstance.get('editorActions').register('save', saveDiagram);
        modelerInstance.get('keyboard').addListener(function (context) {
            var event = context.keyEvent;
            if (event.ctrlKey || event.metaKey) {
                if (saveKeys.indexOf(event.key) !== -1 || saveKeys.indexOf(event.code) !== -1) {
                    modelerInstance.get('editorActions').trigger('save');
                    return true;
                }
            }
        });
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

        setModeler(modelerInstance);
        // console.log(modeler?.get('elementRegistry'))

        updatePaletteVisibility();

        return () => {
            modeler?.destroy();
        }
    }, [diagramXML, editor, diagramId, projectId, userName, userRole]);
    // }, [diagramXML, projectName, diagramName, publishDate]);  // 생각한 변수는 이 정도인데 필요한 대로 수정하시면 될 것 같습니다~!!!

    useEffect(() => {
        if (modelerInstance) {
            const canvas = modelerInstance.get('canvas');
            const eventBus = modelerInstance.get('eventBus');

            if (userRole !== "editing") {
                // Disable interactions
                canvas.zoom('fit-viewport');
                eventBus.fire('interaction.disable');
            } else {
                // Enable interactions
                eventBus.fire('interaction.enable');
            }
        }
    }, [userRole]);

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
    const exportXml = async (id, name) => {
        if (modeler) {
            const { xml } = await modeler.saveXML({ format: true }).catch(err => {
                console.log(err);
            });
            if (xml) {
                setEncoded(document.getElementById(id), name + '.xml', xml);
            };
        }
    };

    // Export diagram as svg
    const exportSvg = async (id, name) => {
        if (modeler) {
            const { svg } = await modeler.saveSVG({ format: true }).catch(err => {
                console.log(err);
            });
            if (svg) {
                setEncoded(document.getElementById(id), name + '.svg', svg);
            };
        }
    };

    // Export diagram as png
    const exportPng = async (id, name) => {
        if (modeler) {
            const { svg } = await modeler.saveSVG({ format: true }).catch(err => {
                console.log(err);
            });
            if (svg) {
                const url = await generateImage('png', svg);
                downloadImage(document.getElementById(id), name + '.png', url);
            };
        }
    };

    // Export diagram as pdf
    const exportPdf = async (id, name) => {
        if (modeler) {
            const { svg } = await modeler.saveSVG({ format: true }).catch(err => {
                console.log(err);
            });
            if (svg) {
                const url = await generateImage('png', svg);
                generatePdf(url, name);
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
                // Save diagram in DB
                axios.post('http://localhost:3001/api/diagram/save', { xml: xml, diagramId: diagramId, userName: userName })
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
    // handle checkIn
    const handleCheckIn = () => {
        setUserRole("editing");
        console.log(userRole);
    }
    // handle contributor
    const handleContributor = () => {

    }
    // handle share
    const handleShare = () => {

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
        setUserRole("contributor");

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
            <div className='main-container' onClick={handleClose}>
                <div className='model-header'>
                    <Topbar onLogoClick={toMain} />
                    <Toolbar
                        mode={userRole} // "readOnly" or "contributor" or "editing"
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
                        onCheckIn={handleCheckIn}
                        onContributor={handleContributor}
                        onShare={handleShare}
                    />
                </div>
                <div className='model-body'>
                    {isHidden ?
                        <BsArrowBarRight className='sidebar-btn hidden' onClick={handleHidden} />
                        :
                        <Sidebar handleHidden={handleHidden} diagramId={diagramId} userName={userName} />
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
            </div>
        )
    }

}
export default BpmnEditor;