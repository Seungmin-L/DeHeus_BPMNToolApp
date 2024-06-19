import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import minimapModule from 'diagram-js-minimap';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';


function BpmnTest(){
    const container = useRef(null);
    const [ modeler, setModeler ] = useState(null);
    let modelerInstance = null;

    useEffect(() => {
        if(modelerInstance) return;
        modelerInstance = new BpmnModeler({
            container: container.current,
            additionalModules: [
                minimapModule
            ]
        });
        // modelerInstance.importXML(diagramXML)
        // .then(({warnings}) => {
        //     if(warnings.length){
        //         console.warn(warnings);
        //     }
        //     modelerInstance.get("canvas").zoom("fit-viewport");
        // });
        modelerInstance.createDiagram().then(() => modelerInstance.get("minimap").open());
        setModeler(modelerInstance);

        return () => {
            modeler?.destroy();
        }
    }, []);

    return(
        <div className='modeler-parent'>
            <div id='modeler-container' ref={container} style={{width: "100%", height: "100%"}}></div>
        </div>
    )
}

export default BpmnTest;