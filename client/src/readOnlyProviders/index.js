/*
 * This file contains code adapted from the [bpmn-js] library.
 * Source: [URL of the source code if available]
 * 
 * [bpmn-js] is licensed under the [bpmn.io License].
 * You can find a copy of the license at [https://bpmn.io/license/].
 */

import ReadOnlyAttachmentProvider from './ReadOnlyAttachmentProvider';

export default {
  // initiate custom modules for properties panel
  __init__: [ 
    'readOnlyAttachmentProvider'
  ],
  readOnlyAttachmentProvider: [ 'type', ReadOnlyAttachmentProvider]
};