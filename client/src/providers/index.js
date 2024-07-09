import AttachmentPropertiesProvider from './AttachmentPropertiesProvider';
import AttributePropertiesProvider from './attributePropertiesProvider';
import MagicPropertiesProvider from './ParameterProvider';


export default {
  __init__: [ 'attachmentPropertiesProvider','attributePropertiesProvider','magicPropertiesProvider' ],
  attachmentPropertiesProvider: [ 'type', AttachmentPropertiesProvider ],
  attributePropertiesProvider: [ 'type', AttributePropertiesProvider ],
  magicPropertiesProvider: [ 'type', MagicPropertiesProvider ]
};