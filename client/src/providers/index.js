import AttachmentPropertiesProvider from './AttachmentPropertiesProvider';
// import AttributePropertiesProvider from './attributePropertiesProvider';
import ParameterPropertiesProvider from './ParameterProvider';


export default {
  // initiate custom modules for properties panel
  __init__: [ 
    'attachmentPropertiesProvider',
    // 'attributePropertiesProvider',
    'parameterPropertiesProvider' ],
  attachmentPropertiesProvider: [ 'type', AttachmentPropertiesProvider ],
  // attributePropertiesProvider: [ 'type', AttributePropertiesProvider ],
  parameterPropertiesProvider: [ 'type', ParameterPropertiesProvider ]
};