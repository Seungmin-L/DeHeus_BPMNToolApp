import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from "axios";
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import ColorPickerModule from 'bpmn-js-color-picker';
import minimapModule from 'diagram-js-minimap';
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import ErrorPage from './ErrorPage';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule, ZeebePropertiesProviderModule, CamundaPlatformPropertiesProviderModule } from 'bpmn-js-properties-panel';
import attachmentPropertiesProviderModule from '../providers';
import attachmentModdleDescriptor from '../providers/descriptor/attachment.json';
import Toolbar from './features/toolbar/toolbar';

//custom properties module
import attributePropertiesProviderModule from '../providers';
import attributeModdleDescriptor from '../providers/descriptor/attributes.json';
import parameterPropertiesProviderModule from '../providers';
import parameterModdleDescriptor from '../providers/descriptor/parameter.json';

//search
import bpmnSearchModule  from './features/search/provider';

function BpmnTest() {
	const location = useLocation();
	const itemId = location.state?.itemId; // ----
	const userName = location.state?.userName; // ----
    const container = useRef(null);
    const importFile = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [isHidden, setIsHidden] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [diagramXML, setDiagramXML] = useState(null);
    const [isFileValid, setIsFileValid] = useState(true);
    const saveKeys = ['s', 'S'];
    let modelerInstance = null;

    useEffect(() => {
		console.log("Received item ID:", itemId); // ----
		console.log("Received User Name:", userName); // ---- 
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
                attributePropertiesProviderModule,
                parameterPropertiesProviderModule,
                bpmnSearchModule
            ],
            moddleExtensions: {
                attachment: attachmentModdleDescriptor,
                attribute: attributeModdleDescriptor,
                parameter: parameterModdleDescriptor
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
        modelerInstance.on('commandStack.changed', saveDiagram);

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
        setModeler(modelerInstance);
        console.log(
			modeler?.get('elementRegistry'))
        return () => {
            modeler?.destroy();
        }
    }, [diagramXML, itemId]);

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

    const setEncoded = (link, name, data) => {
        var encodedData = encodeURIComponent(data);
        if (data) {
            link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
            link.setAttribute('download', name);
        }
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

    // Save diagram
    const saveDiagram = async () => {
        if (modelerInstance) {
            const { xml } = await modelerInstance.saveXML({ format: true }).catch(err => {
                console.log(err);
            });
            if (xml) {
                // Save diagram in DB
                console.log(xml);
            };
        }
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
    const handleExportXml = (e) => {
        e.stopPropagation();
        exportXml(e.target.id,"diagram")
    }
    const handleExportSvg = (e) => {
        e.stopPropagation();
        exportSvg(e.target.id,"diagram")
    }
    const handleClose = () => {
        setIsOpen(false);
    }
    const handleZoomIn = () => {
        modeler?.get('zoomScroll').stepZoom(1);
    };

    const handleZoomOut = () => {
        modeler?.get('zoomScroll').stepZoom(-1);
    };

    const handleUndo = () => {
        modeler?.get('commandStack').undo();
        console.log(modeler?.get('commandStack'))
    };

    const handleRedo = () => {
        modeler?.get('commandStack').redo();
    };

    const handleSave = async () => {
        if (modeler) {
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

    if (!isFileValid) {
        return (
            <ErrorPage />
        )
    } else {
        return (
            <div className='main-container' onClick={handleClose} >
                <div className='model-header'>
                    <Toolbar
                        isOpen={isOpen} 
                        setIsOpen={setIsOpen}
                        onSave={handleSave}
                        onImport={onImportClick}
                        onExportXml={handleExportXml}
                        onExportSvg={handleExportSvg}
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
                        onFileChange = {onFileChange}
                    />
                    {/* <button onClick={onImportClick} title='import BPMN diagram'><input type='file' accept='text/xml' style={{ display: 'none' }} ref={importFile} onChange={(e) => onFileChange(e)} />Import File</button> */}
                </div>
                <div className='model-body'>
                    <div className={'hierarchy-sidebar ' + (isHidden ? "hide" : "")}>
                        <button onClick={handleHidden} style={{ width: "50px" }}>{isHidden ? "Show" : "Hide"}</button>
                    </div>
                    <div id='modeler-container' className={"" + (isHidden ? 'sidebar-hidden' : '')} ref={container} />
                    <div id='properties-panel-parent' />
                </div>
            </div>
        )
    }

}
export default BpmnTest;
