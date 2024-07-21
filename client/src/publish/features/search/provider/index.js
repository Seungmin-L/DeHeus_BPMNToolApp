import SearchPadModule from '../searchPad';

import BpmnSearchProvider from './BpmnSearchProvider';


export default {
  __depends__: [
    SearchPadModule
  ],
  __init__: [ 'bpmnSearch' ],
  bpmnSearch: [ 'type', BpmnSearchProvider ]
};