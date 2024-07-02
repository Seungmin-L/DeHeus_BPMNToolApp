import React, { useEffect, useRef, useState } from 'react';

// BPMN imports
import BpmnModeler from 'bpmn-js/lib/Modeler';
import minimapModule from 'diagram-js-minimap';
import ColorPickerModule from 'bpmn-js-color-picker';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { 
    BpmnPropertiesPanelModule, 
    BpmnPropertiesProviderModule,  
  } from 'bpmn-js-properties-panel';

// diagram file
import diagramXML from '../resources/pizza-collaboration.bpmn';

// toolbar
import Toolbar from './features/toolbar/toolbar';


function BpmnTest() {
    const diagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn';

    const container = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    let [modelerInstance, setModeler] = useState(null); // <-- Add this line
    // Event handler to toggle the export dropdown


    useEffect(() => {
        if (modelerInstance) return;
        modelerInstance = new BpmnModeler({
            container: container.current,
            keyboard: { bindTo: document },
            propertiesPanel: {
                parent: '#properties-panel-parent'
            },
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule,
                ColorPickerModule,
            ],
            moddleExtensions: {
            },
            textRenderer: {
                defaultStyle: {
                //   fontFamily: 'none'
                }
            },
            bpmnRenderer: {
                defaultStrokeColor: '#333'
            }
        });

        // opens diagram
        const openDiagram = async (bpmnXML) => {
            try {
            await modelerInstance.importXML(bpmnXML);
            const canvas = modelerInstance.get('canvas');
            const overlays = modelerInstance.get('overlays');
            canvas.zoom('fit-viewport');
            overlays.add('SCAN_OK', 'note', {
                position: {
                bottom: 0,
                right: 0
                },
                html: '<div class="diagram-note">Mixed up the labels?</div>'
            });
            canvas.addMarker('SCAN_OK', 'needs-discussion');
            } catch (err) {
            console.error('could not import BPMN 2.0 diagram', err);
            }
        };
    
        fetch('https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn')
            .then(response => response.text())
            .then(openDiagram);

        // modelerInstance.createDiagram().then(() => {
        //     modelerInstance.get('keyboard').bind(document);
        //     console.log(modelerInstance.get('commandStack')); // Should log the commandStack
        // });
        setModeler(modelerInstance);
        // return () => {
        //     modeler?.destroy();
        // }
        console.log(modelerInstance)
    }, []);

    const handleZoomIn = () => {
        modelerInstance?.get('zoomScroll').stepZoom(1);
    };

    const handleZoomOut = () => {
        modelerInstance?.get('zoomScroll').stepZoom(-1);
    };

    const handleUndo = () => {
        modelerInstance?.get('commandStack').undo();
        console.log(modelerInstance?.get('commandStack'))
    };

    const handleRedo = () => {
        modelerInstance?.get('commandStack').redo();
    };

    const handleSave = () => {
    // Implement save functionality here
    };

    const handleImport = () => {
        // import function
    }

    const handleExport = (e) => {
        // export function
    }

    const handleExportXml = (e) => {
      // export xml function
      e.stopPropagation();
      exportXml(e.target.id,"diagram")
    }

    const handleAlign = (alignment) => {
        const alignElements = modelerInstance.get('alignElements');
        const selection = modelerInstance.get('selection');
        const selectedElements = selection.get();
    
        if (selectedElements.length > 1) {
            alignElements.trigger(selectedElements, alignment);
        } else {
            console.log('Please select at least two elements to align.');
        }
    };
    
    const handleDistribute = (direction) => {
        const distributeElements = modelerInstance.get('distributeElements');
        const selection = modelerInstance.get('selection');
        const selectedElements = selection.get();
    
        if (selectedElements.length > 2) {
            distributeElements.trigger(selectedElements, direction);
        } else {
            console.log('Please select at least three elements to distribute.');
        }
    };
      
    const handleChangeColor = () => {
        const selection = modelerInstance.get('selection');
        const modeling = modelerInstance.get('modeling');
        const selectedElement = selection.get()[0]; // get the first selected element
      
        if (selectedElement) {
          modeling.setColor(selectedElement, {
            stroke: 'red',
            
          });
        //   console.log(selectedElement);
        }
    };
    
    const onExportClick = () => {
      setIsOpen(prev => !prev);
    }
    // Export diagram as xml
    const exportXml = async (id, name) => {
      if (modelerInstance) {
          const { xml } = await modelerInstance.saveXML({ format: true }).catch(err => {
              console.log(err);
          });
          if (xml) {
              setEncoded(document.getElementById(id), name + '.xml', xml);
          };
      }
    };
  
    // Export diagram as svg
    const exportSvg = async (id, name) => {
        if (modelerInstance) {
            const { svg } = await modelerInstance.saveSVG({ format: true }).catch(err => {
                console.log(err);
            });
            if (svg) {
                setEncoded(document.getElementById(id), name + '.svg', svg);
            };
        }
    };

    const setEncoded = (link, name, data) => {
      var encodedData = encodeURIComponent(data);
      if (data) {
          link.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData);
          link.setAttribute('download', name);
      }
      handleClose();
  }
  const handleClose = () => {
    setIsOpen(false);
}

    return (
        <div className='main-container'>

            <div className='model-header'>
            <Toolbar 
                onSave={handleSave} 
                onImport={handleImport}
                onExport={handleExport}
                onExportXml={handleExportXml}
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
            />
            {/* <button onClick={handleChangeColor}>Change Color</button> */}

            </div>

            <div className='model-body'>
                <div id='modeler-container' ref={container}/>
                <div id='properties-panel-parent' />
            </div>

        </div>
    )
}

export default BpmnTest;
