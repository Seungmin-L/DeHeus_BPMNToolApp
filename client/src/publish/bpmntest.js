import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import minimapModule from 'diagram-js-minimap';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import diagramXML from '../resources/pizza-collaboration.bpmn';

function BpmnTest() {
    const container = useRef(null);
    const [modeler, setModeler] = useState(null);
    const diagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn';

    let modelerInstance = null;

    useEffect(() => {
        if (modelerInstance) return;
        modelerInstance = new BpmnModeler({
            container: container.current,
            keyboard: { bindTo: document },
            propertiesPanel: {
                parent: document.getElementById("properties-panel-parent")
            },
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule,
                minimapModule
            ]
        });

        // Import the XML diagram
        // modelerInstance.importXML(diagramXML).then(() => {
        //     modelerInstance.get('canvas').zoom('fit-viewport');
        //     modelerInstance.get('minimap').open();
        //     modelerInstance.get('keyboard').bind(document);
        // }).catch(err => {
        //     console.error('something went wrong:', err);
        // });
        
        modelerInstance.createDiagram().then(() => {
            modelerInstance.get('minimap').open();
            modelerInstance.get('keyboard').bind(document);
        });

        setModeler(modelerInstance);

        return () => {
            modeler?.destroy();
        }
    }, []);

    return (
        <div className='main-container'>
            <div className='model-header'>

            </div>
            <div className='model-body'>
                <div className='hierarchy-sidebar'>Hierarchy</div>
                <div id='modeler-container' ref={container}>
                </div>
                <div id='properties-panel-parent' />
            </div>
        </div>
    )
}

export default BpmnTest