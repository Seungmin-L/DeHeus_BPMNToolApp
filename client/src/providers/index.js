/*
 * This file contains code adapted from the [bpmn-js] library.
 * Source: [URL of the source code if available]
 * 
 * [bpmn-js] is licensed under the [bpmn.io License].
 * You can find a copy of the license at [https://bpmn.io/license/].
 */

import AttachmentPropertiesProvider from './AttachmentPropertiesProvider';
import AttributePropertiesProvider from './attributePropertiesProvider';
import ParameterPropertiesProvider from './ParameterProvider';
import EndToEndPropertiesProvider from './EndToEndProvider';
import FunctionPropertiesProvider from './FunctionProvider';
import DepartmentPropertiesProvider from './DepartmentProvider';
import DomainPropertiesProvider from './DomainProvider';


export default {
  // initiate custom modules for properties panel
  __init__: [ 
    'attachmentPropertiesProvider',
    // 'attributePropertiesProvider',
    'endToEndPropertiesProvider',
    'functionPropertiesProvider',
    'departmentPropertiesProvider',
    'domainPropertiesProvider',
    'parameterPropertiesProvider',
  ],
  attachmentPropertiesProvider: [ 'type', AttachmentPropertiesProvider ],
  // attributePropertiesProvider: [ 'type', AttributePropertiesProvider ],
  endToEndPropertiesProvider: [ 'type', EndToEndPropertiesProvider ],
  functionPropertiesProvider: [ 'type', FunctionPropertiesProvider ],
  departmentPropertiesProvider: [ 'type', DepartmentPropertiesProvider ],
  domainPropertiesProvider: [ 'type', DomainPropertiesProvider ],
  parameterPropertiesProvider: [ 'type', ParameterPropertiesProvider ],

};