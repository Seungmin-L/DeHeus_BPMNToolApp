import React, { useEffect, useRef, useState } from 'react';
// import BpmnModeler from 'camunda-bpmn-js/lib/camunda-platform/Modeler'; 

// BPMN imports
import BpmnModeler from 'bpmn-js/lib/Modeler';
import minimapModule from 'diagram-js-minimap';
import ColorPickerModule from 'bpmn-js-color-picker';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css'; 
import { 
    BpmnPropertiesPanelModule, 
    BpmnPropertiesProviderModule,  
    // ZeebePropertiesProviderModule, 
    // CamundaPlatformPropertiesProviderModule,
    // CamundaPlatformTooltipProvider
  } from 'bpmn-js-properties-panel';
import { isArray } from 'min-dash';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'; 

// diagram file
import diagramXML from '../resources/pizza-collaboration.bpmn';

// toolbar
import Toolbar from './features/toolbar/toolbar';

function BpmnTest() {
    const diagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn';

    const container = useRef(null);
    let [modelerInstance, setModeler] = useState(null); // <-- Add this line

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
                // CamundaPlatformPropertiesProviderModule,
                // CamundaPlatformTooltipProvider,
                // ZeebePropertiesProviderModule,
                // ZeebeBehaviorsModule,
                ColorPickerModule,
                minimapModule,
            ],
            moddleExtensions: {
                // camunda: camundaModdleDescriptor,
                // zeebe: zeebeModdle
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
      


    return (
        <div className='main-container'>

            <div className='model-header'>
            <Toolbar 
                onSave={handleSave} 
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


            </div>

            <div className='model-body'>
                <div id='modeler-container' ref={container}/>
                <div id='properties-panel-parent' />
            </div>

        </div>
    )
}

export default BpmnTest;
