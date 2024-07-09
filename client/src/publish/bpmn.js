// import { BpmnModeler, CustomBpmnJsModeler, Event, isContentSavedEvent } from "@miragon/camunda-web-modeler";
// import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
// import Toolbar from './features/toolbar/toolbar';

// const diagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn';

// const Bpmn = () => {
//   const modelerRef = useRef();
//   const [xml, setXml] = useState('');
//   const container = useRef(null);
//   const importFile = useRef(null);
//   const [modeler, setModeler] = useState(null);
//   const [isHidden, setIsHidden] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [diagramXML, setDiagramXML] = useState(null);
//   const [isFileValid, setIsFileValid] = useState(true);
//   const saveKeys = ['s', 'S'];

//   let modelerInstance = null;
//   useEffect(() => {
//     // Fetch the diagram XML
//     fetch(diagramUrl)
//       .then(response => response.text())
//       .then(setXml);
//   }, []);

//   const onEvent = useCallback(async (event) => {
//     if (isContentSavedEvent(event)) {
//       setXml(event.data.xml);
//       return;
//     }
//   }, []);

//   const modelerTabOptions = useMemo(() => ({
//     modelerOptions: { refs: [modelerRef] }
//   }), []);

  
//   const handleHidden = () => {
//     setIsHidden(prev => !prev);
// }
// // File drag & drop
// const registerFileDrop = (container) => {
//     const handleFileSelect = (e) => {
//         e.stopPropagation();
//         e.preventDefault();

//         var files = e.dataTransfer.files;
//         var file = files[0];
//         var reader = new FileReader();
//         if (file) {
//             reader.onload = (e) => {
//                 var xml = e.target.result;
//                 setDiagramXML(xml);
//             };

//             reader.readAsText(file);
//         } else {
//             console.log("Invalid File");
//         }
//     }

//     const handleDragOver = (e) => {
//         e.stopPropagation();
//         e.preventDefault();
//         e.dataTransfer.dropEffect = 'copy';
//     }

//     container.addEventListener('dragover', handleDragOver, false);
//     container.addEventListener('drop', handleFileSelect, false);
// }

// const setEncoded = (link, name, data) => {
//     var encodedData = encodeURIComponent(data);
//     if (data) {
//         link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
//         link.setAttribute('download', name);
//     }
//     handleClose();
// }

// // Export diagram as xml
// const exportXml = async (id, name) => {
//     if (modeler) {
//         const { xml } = await modeler.saveXML({ format: true }).catch(err => {
//             console.log(err);
//         });
//         if (xml) {
//             setEncoded(document.getElementById(id), name + '.xml', xml);
//         };
//     }
// };

// // Export diagram as svg
// const exportSvg = async (id, name) => {
//     if (modeler) {
//         const { svg } = await modeler.saveSVG({ format: true }).catch(err => {
//             console.log(err);
//         });
//         if (svg) {
//             setEncoded(document.getElementById(id), name + '.svg', svg);
//         };
//     }
// };

// // Save diagram
// const saveDiagram = async () => {
//     if (modelerInstance) {
//         const { xml } = await modelerInstance.saveXML({ format: true }).catch(err => {
//             console.log(err);
//         });
//         if (xml) {
//             // Save diagram in DB
//             console.log(xml);
//         };
//     }
// }
// const onImportClick = () => {
//     importFile.current.click();
// }
// const onFileChange = (e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     var file = e.target.files[0];
//     var reader = new FileReader();
//     if (file) {
//         reader.onload = (e) => {
//             var xml = e.target.result;
//             setDiagramXML(xml);
//         };

//         reader.readAsText(file);
//     } else {
//         console.log("Invalid File");
//     }
// }
// const handleExportXml = (e) => {
//     e.stopPropagation();
//     exportXml(e.target.id,"diagram")
// }
// const handleExportSvg = (e) => {
//     e.stopPropagation();
//     exportSvg(e.target.id,"diagram")
// }
// const handleClose = () => {
//     setIsOpen(false);
// }
// const handleZoomIn = () => {
//     modelerRef.current?.get('zoomScroll').stepZoom(1);
// };

// const handleZoomOut = () => {
//     modelerRef.current?.get('zoomScroll').stepZoom(-1);
// };

// const handleUndo = () => {
//     modelerRef.current?.get('commandStack').undo();
//     console.log(modelerRef.current?.get('commandStack'))
// };

// const handleRedo = () => {
//     modelerRef.current?.get('commandStack').redo();
// };

// const handleSave = async () => {
//     // Implement save functionality here
//     if (modeler) {
//         const { xml } = await modeler.saveXML({ format: true }).catch(err => {
//             console.log(err);
//         });
//         if (xml) {
//             // Save diagram in DB
//             console.log(xml);
//         };
//     }
// };

// const handleImport = () => {
//     // import function
// }

// const handleAlign = (alignment) => {
//     const alignElements = modelerRef.current?.get('alignElements');
//     const selection = modelerRef.current?.get('selection');
//     const selectedElements = selection.get();

//     if (selectedElements.length > 1) {
//         alignElements.trigger(selectedElements, alignment);
//     } else {
//         console.log('Please select at least two elements to align.');
//     }
// };

// const handleDistribute = (direction) => {
//     const distributeElements = modelerRef.current?.get('distributeElements');
//     const selection = modelerRef.current?.get('selection');
//     const selectedElements = selection.get();

//     if (selectedElements.length > 2) {
//         distributeElements.trigger(selectedElements, direction);
//     } else {
//         console.log('Please select at least three elements to distribute.');
//     }
// };

//   return (
//     <div style={{ height: "100vh" }}>
//         <Toolbar
//             isOpen={isOpen} 
//             setIsOpen={setIsOpen}
//             onSave={handleSave}
//             onImport={onImportClick}
//             onExportXml={handleExportXml}
//             onExportSvg={handleExportSvg}
//             // more export calls here
//             onZoomIn={handleZoomIn}
//             onZoomOut={handleZoomOut}
//             onUndo={handleUndo}
//             onRedo={handleRedo}
//             onAlignLeft={() => handleAlign('left')}
//             onAlignCenter={() => handleAlign('center')}
//             onAlignRight={() => handleAlign('right')}
//             onAlignTop={() => handleAlign('top')}
//             onAlignMiddle={() => handleAlign('middle')}
//             onAlignBottom={() => handleAlign('bottom')}
//             onDistributeHorizontally={() => handleDistribute('horizontal')}
//             onDistributeVertically={() => handleDistribute('vertical')}
//             importFile={importFile}
//             onFileChange = {onFileChange}
//         />
//       <BpmnModeler xml={xml} onEvent={onEvent} modelerTabOptions={modelerTabOptions} />
//     </div>
//   );
// }

// export default Bpmn;
