import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import ColorPickerModule from 'bpmn-js-color-picker';
import minimapModule from 'diagram-js-minimap';
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import ErrorPage from './ErrorPage';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import attachmentPropertiesProviderModule from '../providers';
import attachmentModdleDescriptor from '../providers/descriptor/attachment.json';

function BpmnTest() {
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
                attachmentPropertiesProviderModule
            ],
            moddleExtensions: {
                attachment: attachmentModdleDescriptor
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
        modelerInstance.get('keyboard').addListener(function(context){
            var event = context.keyEvent;
            if(event.ctrlKey || event.metaKey){
                if(saveKeys.indexOf(event.key) !== -1 || saveKeys.indexOf(event.code) !== -1){
                    modelerInstance.get('editorActions').trigger('save');
                    return true;
                }
            }
        });
        
        setModeler(modelerInstance);
        return () => {
            modeler?.destroy();
        }
    }, [diagramXML]);

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
    const onExportClick = () => {
        setIsOpen(prev => !prev);
    }
    const handleClose = () => {
        setIsOpen(false);
    }
    if (!isFileValid) {
        return(
            <ErrorPage/>
        )
    } else {
        return (
            <div className='main-container' onClick={handleClose}>
                <div className='model-header'>
                    <button className='export-btn' onClick={(e) => {
                        e.stopPropagation();
                        onExportClick();
                    }}>Export as...</button>
                    {isOpen &&
                        <ul className='export-options'>
                            <li>
                                <a id='export-xml' title='download BPMN diagram' target='_blank'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportXml(e.target.id, "diagram");
                                    }}>XML
                                </a>
                            </li>
                            <li>
                                <a id='export-pdf' title='download BPMN diagram as PDF' target='_blank'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // exportDiagram(e.target.id, "diagram");
                                    }}>PDF
                                </a>
                            </li>
                            <li>
                                <a id='export-doc' title='download BPMN diagram as DOC' target='_blank'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // exportDiagram(e.target.id, "diagram");
                                    }}>DOC
                                </a>
                            </li>
                            <li>
                                <a id='export-png' title='download BPMN diagram as png' target='_blank'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // exportDiagram(e.target.id, "diagram");
                                    }}>PNG
                                </a>
                            </li>
                            <li>
                                <a id='export-svg' title='download BPMN diagram as svg' target='_blank'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportSvg(e.target.id, "diagram");
                                    }}>SVG
                                </a>
                            </li>
                        </ul>
                    }
                    <button onClick={onImportClick} title='import BPMN diagram'><input type='file' accept='text/xml' style={{ display: 'none' }} ref={importFile} onChange={(e) => onFileChange(e)} />Import File</button>
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