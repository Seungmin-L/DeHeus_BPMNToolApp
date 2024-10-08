/*
 * This file contains code adapted from the [bpmn-js] library.
 * Source: [URL of the source code if available]
 * 
 * [bpmn-js] is licensed under the [bpmn.io License].
 * You can find a copy of the license at [https://bpmn.io/license/].
 */

import Ids from 'ids';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export function getParametersExtension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'extended:Parameters');
}

export function getParameters(element) {
  const parameters = getParametersExtension(element);
  return parameters && parameters.get('values');
}

export function getExtension(element, type) {
  if (!element.extensionElements) {
    return null;
  }

  return element.extensionElements.values.filter(function(e) {
    return e.$instanceOf(type);
  })[0];
}

export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

export function createParameters(properties, parent, bpmnFactory) {
  return createElement('extended:Parameters', properties, parent, bpmnFactory);
}


export function nextId(prefix) {
  const ids = new Ids([ 32,32,1 ]);

  return ids.nextPrefixed(prefix);
}