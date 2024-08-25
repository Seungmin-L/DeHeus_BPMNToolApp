/*
 * This file contains code adapted from the [bpmn-js] library.
 * Source: [URL of the source code if available]
 * 
 * [bpmn-js] is licensed under the [bpmn.io License].
 * You can find a copy of the license at [https://bpmn.io/license/].
 */

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  createElement,
  createParameters,
  getParameters,
  getParametersExtension,
  nextId
} from '../../providers/util';

import ParameterProps from './ParameterProps';

import { without } from 'min-dash';


export default function ParametersProps({ element, injector }) {

  const parameters = getParameters(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = parameters.map((parameter, index) => {
    const id = element.id + '-parameter-' + index;

    return {
      id,
      label: parameter.get('name') || '',
      entries: ParameterProps({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-name',
    };
  });

  return {
    items
  };
}