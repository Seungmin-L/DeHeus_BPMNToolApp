import SearchPadModule from '../search-pad';

import BpmnSearchProvider from './BpmnSearchProvider';


export default {
  __depends__: [
    SearchPadModule
  ],
  __init__: [ 'bpmnSearch' ],
  bpmnSearch: [ 'type', BpmnSearchProvider ]
};