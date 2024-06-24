import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import ColorPickerModule from 'bpmn-js-color-picker';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';

function BpmnTest() {
    const container = useRef(null);
    const [modeler, setModeler] = useState(null);
    const [isHidden, setIsHidden] = useState(false);
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
                ColorPickerModule
            ]
        });
        // modelerInstance.importXML(diagramXML)
        // .then(({warnings}) => {
        //     if(warnings.length){
        //         console.warn(warnings);
        //     }
        //     modelerInstance.get("canvas").zoom("fit-viewport");
        // });
        modelerInstance.createDiagram().then(() => {
            modelerInstance.get('keyboard').bind(document);
        });
        setModeler(modelerInstance);
        return () => {
            modeler?.destroy();
        }
    }, []);

    const handleHidden = () => {
        setIsHidden(prev => !prev);
    }

    return (
        <div className='main-container'>
            <div className='model-header'>
            </div>
            <div className='model-body'>
                <div className={'hierarchy-sidebar ' + (isHidden ? "hide" : "")}>
                    <button onClick={handleHidden} style={{width: "50px"}}>{isHidden ? "Show" : "Hide"}</button>
                </div>
                <div id='modeler-container' className={"" + (isHidden ? 'sidebar-hidden' : '')} ref={container}/>
                <div id='properties-panel-parent' />
            </div>
        </div>
    )
}

export default BpmnTest;