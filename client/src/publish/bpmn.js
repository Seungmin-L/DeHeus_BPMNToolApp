import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import minimapModule from 'diagram-js-minimap';
import $ from 'jquery';
import { 
  BpmnPropertiesPanelModule, 
  BpmnPropertiesProviderModule,  
  ZeebePropertiesProviderModule, 
  CamundaPlatformPropertiesProviderModule // Camunda 8 provider
} from 'bpmn-js-properties-panel';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';
import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'; // Import this


import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '../property-panel.css';

import diagramXML from '../resources/pizza-collaboration.bpmn';


const BPMN = () => {
  const container = useRef(null);
  const [modeler, setModeler] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  let modelerInstance = null;
  const diagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn';

  useEffect(() => {
    if (modelerInstance) return;
    modelerInstance = new BpmnJS({
      container: container.current,
      keyboard: {
        bindTo: document
      },
      propertiesPanel: {
        parent: '#properties-panel-parent'
      },
      additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
          minimapModule,
          // ZeebePropertiesProviderModule,
          // ZeebeBehaviorsModule,
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor 
        // zeebe: zeebeModdle
      }
    });

    // const exportDiagram = async () => {
    //   try {
    //     const result = await bpmnModeler.saveXML({ format: true });
    //     alert('Diagram exported. Check the developer tools!');
    //     console.log('DIAGRAM', result.xml);
    //   } catch (err) {
    //     console.error('could not save BPMN 2.0 diagram', err);
    //   }
    // };

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

    modelerInstance.createDiagram().then(() => {
      modelerInstance.get('keyboard').bind(document);
    });
    setModeler(modelerInstance);
    return () => {
        modeler?.destroy();
    }
    // $.get(diagramUrl, openDiagram, 'text');


  }, []);

  const handleHidden = () => {
    setIsHidden(prev => !prev);
  }

  return (
    <div className='main-container'>

      <div className='model-header'></div>

      <div className='model-body'>
        <div className={'hierarchy-sidebar ' + (isHidden ? "hide" : "")}>
            <button onClick={handleHidden} style={{width: "50px"}}>{isHidden ? "Show" : "Hide"}</button>
        </div>
        <div id='modeler-container' className={"" + (isHidden ? 'sidebar-hidden' : '')} ref={container}/>
        <div id='properties-panel-parent'></div>
      </div>

    </div>
  );
};

export default BPMN;
