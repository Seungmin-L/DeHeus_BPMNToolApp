import React from "react";
import BpmnViewer from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
// import "bpmn-font/dist/css/bpmn-embedded.css";
import { 
  BpmnPropertiesPanelModule, 
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'; 
const diagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn';

class BpmnView extends React.Component {
  
  constructor() {
    super();
  }
  render() {
    return (
      <div style={{ height: "100%" }}>
        <div id="js-canvas" ref={this.containerRef} />
        <div id="propview" />
      </div>
    );
  }
  componentDidMount() {
    this.viewer = new BpmnViewer({
      container: document.getElementById("js-canvas"),
      keyboard: {
        bindTo: window
      },
      propertiesPanel: {
        parent: "#propview"
      },
      additionalModules: [
        BpmnPropertiesPanelModule, 
        BpmnPropertiesProviderModule],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      }
    });
// import function
function importXML(url, Viewer) {
  // fetch diagram
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(diagramXML => {
      // import diagram
      Viewer.importXML(diagramXML, function(err) {
        if (err) {
          return console.error("could not import BPMN 2.0 diagram", err);
        }

        var canvas = Viewer.get("canvas"),
          overlays = Viewer.get("overlays");

        // zoom to fit full viewport
        canvas.zoom("fit-viewport");

        // attach an overlay to a node
        overlays.add("SCAN_OK", "note", {
          position: {
            bottom: 0,
            right: 0
          },
          html: '<div class="diagram-note">Mixed up the labels?</div>'
        });

        // add marker
        canvas.addMarker("SCAN_OK", "needs-discussion");
      });
    })
    .catch(err => console.error("could not fetch BPMN 2.0 diagram", err));
}



    // a diagram to display
    //
    // see index-async.js on how to load the diagram asynchronously from a url.
    // (requires a running webserver)


    // import xml
    importXML(diagramUrl, this.viewer);
  }
}

export default BpmnView;
