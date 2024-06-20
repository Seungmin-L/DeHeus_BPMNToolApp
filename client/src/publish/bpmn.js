import React, { useEffect, useRef } from 'react';
import BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js';
import $ from 'jquery';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

const BPMNViewer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const diagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn';

    const bpmnModeler = new BpmnJS({
      container: canvasRef.current,
      keyboard: {
        bindTo: window
      }
    });

    const exportDiagram = async () => {
      try {
        const result = await bpmnModeler.saveXML({ format: true });
        alert('Diagram exported. Check the developer tools!');
        console.log('DIAGRAM', result.xml);
      } catch (err) {
        console.error('could not save BPMN 2.0 diagram', err);
      }
    };

    const openDiagram = async (bpmnXML) => {
      try {
        await bpmnModeler.importXML(bpmnXML);
        const canvas = bpmnModeler.get('canvas');
        const overlays = bpmnModeler.get('overlays');
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

    $.get(diagramUrl, openDiagram, 'text');

    document.getElementById('save-button').addEventListener('click', exportDiagram);
  }, []);

  return (
    <>
        <div style={{ height: '100vh', padding: 0, margin: 0 }}>
            <h1>BPMN Modifier</h1>
            <button id="save-button">print to console</button>
            <div ref={canvasRef} style={{ height: '100%', padding: 0, margin: 0 }}></div>
        </div>
    </>


  );
};

export default BPMNViewer;
