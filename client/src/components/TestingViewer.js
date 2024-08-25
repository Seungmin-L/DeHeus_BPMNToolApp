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
import { init } from '@emailjs/browser';

function BpmnViewer() {
    const navigate = useNavigate();
    const location = useLocation();
    const diagramId = location.state?.itemId; // state로 가지고 온 다이어그램 id
    const { projectId, diagramName } = useParams();
    const userName = location.state?.userName; // state로 가지고 온 다이어그램 userName
    const fileData = location.state?.fileData; // state로 가지고 온 다이어그램 userName
    // const userName = "vnapp.pbmn@deheus.com"
    const container = useRef(null);
    const importFile = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [userRole, setUserRole] = useState('readOnly'); // for toolbar view (readOnly, contributor, editing)
    const [isHidden, setIsHidden] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [diagramXML, setDiagramXML] = useState(null);
    const [isFileValid, setIsFileValid] = useState(true);
    const [hidePanel, setHidePanel] = useState(false);
    const searchKeys = ['f', 'F'];
    let modelerInstance = null;
    let priority = 10000;
    useEffect(() => {
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
                minimapModule,
                parameterPropertiesProviderModule,
                dropdownPropertiesProvider,
                bpmnSearchModule,
                DrilldownOverlayBehavior,
                { dragging: ['value', { init: function () { } }] }
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
        if (fileData) {
            setDiagramXML(fileData);
        }else{
            setDiagramXML(null);
        }
        // Import file
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
        }
        const eventBus = modelerInstance.get('eventBus');
        const keyboard = modelerInstance.get('keyboard');
        eventBus.on(['element.click', 'element.dblclick'], priority, () => {
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
        setModeler(modelerInstance);
        // console.log(modeler?.get('elementRegistry'))

        //set user's role for the modeler
        // setUserRole("readOnly");

        return () => {
            modeler?.destroy();
        }
    }, [diagramXML, diagramId]);
    // }, [diagramXML, projectName, diagramName, publishDate]);  // 생각한 변수는 이 정도인데 필요한 대로 수정하시면 될 것 같습니다~!!!

    // hide heirchy side bar
    const handleHidden = () => {
        setIsHidden(prev => !prev);
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

    const exportXml = async (id) => {
        if (modeler) {
            const { xml } = await modeler.saveXML({ format: true }).catch(err => {
                console.log(err);
            });
            if (xml) {
                setEncoded(document.getElementById(id), diagramName + '.xml', xml);
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
                setEncoded(document.getElementById(id), diagramName + '.svg', svg);
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
                downloadImage(document.getElementById(id), diagramName + '.png', url);
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
                generatePdf(url, diagramName);
            };
            handleClose();
        }
    }

    const onImportClick = () => {
        importFile.current.click();
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
                    />
                </div>
                <div className='model-body disabled'>
                    {isHidden ?
                        <BsArrowBarRight className='sidebar-btn hidden' onClick={handleHidden} />
                        :
                        <Sidebar handleHidden={handleHidden} diagramId={diagramId} userName={userName} />
                    }

                    <div id='modeler-container' className={"" + (isHidden ? 'sidebar-hidden' : '')} ref={container} />
                    <div className={hidePanel ? 'properties_panel_hidden disabled' : 'properties_panel_open disabled'}>
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
export default BpmnViewer;
