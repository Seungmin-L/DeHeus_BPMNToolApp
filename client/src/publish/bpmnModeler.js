import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import attributePropertiesProviderModule from '../providers';
import attributeModdleDescriptor from '../providers/descriptor/attributes.json';
import parameterPropertiesProviderModule from '../providers';
import parameterModdleDescriptor from '../providers/descriptor/parameter.json';
import endToEndPropertiesProviderModule from '../providers';
import endtoendModdleDescriptor from '../providers/descriptor/endtoend.json';
import functionPropertiesProviderModule from '../providers';
import functionModdleDescriptor from '../providers/descriptor/function.json';
import departmentPropertiesProviderModule from '../providers';
import departmentModdleDescriptor from '../providers/descriptor/department.json';
import domainPropertiesProviderModule from '../providers';
import domainModdleDescriptor from '../providers/descriptor/domain.json';

//search
import bpmnSearchModule from './features/search/provider';
//subprocess
import DrilldownOverlayBehavior from './features/subprocess/';
//replace popup
import PopupMenuModule from './features/popup';
import ReplaceModule from './features/replace';
//palette
import PaletteModule from './features/palette';

//toolbar
import Toolbar from './features/toolbar/toolbar';
import Topbar from '../components/common/TopBar'
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import '../styles/bpmn-js.css';
import '../styles/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

function BpmnTest() {
	const location = useLocation();
	const itemId = location.state?.itemId; // ----
    const projectId = location.state?.projectId;
	// const userName = location.state?.userName; // ----
    const userName = "vnapp.pbmn@deheus.com"
    const container = useRef(null);
    const importFile = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [isHidden, setIsHidden] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [diagramXML, setDiagramXML] = useState(null);
    const [isFileValid, setIsFileValid] = useState(true);
    const [hidePanel, setHidePanel] = useState(false);
    const saveKeys = ['s', 'S'];
    let modelerInstance = null;

    useEffect(() => {
        // console.log("Received item ID:", itemId); 
        // console.log("Received User Name:", userName); 
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
                // minimapModule,
                attachmentPropertiesProviderModule,
                // attributePropertiesProviderModule,
                endToEndPropertiesProviderModule,
                functionPropertiesProviderModule,
                departmentPropertiesProviderModule,
                domainPropertiesProviderModule,
                parameterPropertiesProviderModule,
                bpmnSearchModule,
                DrilldownOverlayBehavior,
                PaletteModule,
                PopupMenuModule,
                ReplaceModule
            ],
            moddleExtensions: {
                attachment: attachmentModdleDescriptor,
                // attribute: attributeModdleDescriptor,
                endtoend: endtoendModdleDescriptor,
                function: functionModdleDescriptor,
                department: departmentModdleDescriptor,
                domain: domainModdleDescriptor,
                parameter: parameterModdleDescriptor,
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
        localStorage.removeItem('bpmnXMl');
        localStorage.removeItem('subProcess');
        // var bpmnnXml = localStorage.getItem('bpmnXml');
        // if (bpmnnXml) {
        //     //set bpmn xml from local
        //     setDiagramXML(bpmnnXml);
        // }
        // Import file or create a new diagram
        if (diagramXML) {
            modelerInstance.importXML(diagramXML)
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.warn(warnings);
                    }
                    modelerInstance.get("canvas").zoom("fit-viewport");
                    modelerInstance.get('keyboard').bind(document);
                    // if subprocess
                    if (localStorage.getItem('subProcess')) {
                        // get plane id from storage
                        var planeId = localStorage.getItem('planeId');
                        // set root from canvas
                        var canvas = modelerInstance.get('canvas');
                        canvas.setRootElement(canvas.findRoot(planeId));
                    }
                })
                .catch(err => {
                    console.log(err);
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
        modelerInstance.on('commandStack.changed', saveDiagram);
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

        return () => {
            modeler?.destroy();
        }
    }, [diagramXML, itemId]);

    // hide heirchy side bar
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
                // Save diagram in DB
                localStorage.setItem('bpmnXml', xml);
                console.log("Saved xml:")
                console.log(xml);
            };
        }
    }
    const onElementDelete = (nodeId) => {
        if(nodeId === undefined){
            console.log("undefined");
            return;
        }
        axios.post(`http://localhost:3001/api/attachments/${itemId}/${nodeId}`)
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
                console.log("diagramId:", itemId)

                axios.post('/api/diagram/save', { xml: xml, diagramId: itemId, userName: userName })
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

    if (!isFileValid) {
        return (
            <ErrorPage />
        )
    } else {
        return (
            <div className='main-container' onClick={handleClose}
                style={{ "--width": window.innerWidth + "px", "--height": window.innerHeight + "px"}}
            >
                <div className='model-header'>
                    <Topbar />
                    <Toolbar
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
                <div className='model-body'>
                    <div className={'hierarchy-sidebar ' + (isHidden ? "hide" : "")}>
                        <button onClick={handleHidden} style={{ width: "50px" }}>{isHidden ? "Show" : "Hide"}</button>
                    </div>
                    <div id='modeler-container' className={"" + (isHidden ? 'sidebar-hidden' : '')} ref={container} />
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
export default BpmnTest;
