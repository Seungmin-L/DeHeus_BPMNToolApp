/*
 * This file contains code adapted from the [bpmn-js] library.
 * Source: [URL of the source code if available]
 * 
 * [bpmn-js] is licensed under the [bpmn.io License].
 * You can find a copy of the license at [https://bpmn.io/license/].
 */

import { useService } from 'bpmn-js-properties-panel';
import { useError } from '@bpmn-io/properties-panel';
import ExtensionList from './ExtensionList';
import { useState } from '@bpmn-io/properties-panel/preact/hooks';
import { jsx, jsxs } from '@bpmn-io/properties-panel/preact/jsx-runtime';


export default function ParameterProps(props) {

  const {
    idPrefix,
    parameter
  } = props;

  const entries = [
    {
      id: idPrefix + '-name',
      component: Name,
      idPrefix,
      parameter
    },
    {
      id: idPrefix + '-value',
      component: Value,
      idPrefix,
      parameter
    },
    {
      id: idPrefix + '-extensions',
      component: ExtensionList,
      idPrefix,
      parameter
    }
  ];

  return entries;
}

function Name(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = (parameter) => {
    return parameter.name;
  };

  return ParameterFieldEntry({
    element: parameter,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue
  });
}

function Value(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = (parameter) => {
    return parameter.value;
  };

  return ParameterFieldEntry({
    element: parameter,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue
  });
}

var classnames = require('classnames');
function ParameterFieldEntry(props) {
  const {
    element,
    id,
    label,
    getValue
  } = props;
  const globalError = useError(id);
  const [localError, setLocalError] = useState(null);
  let value = getValue(element);
  console.log(value);
  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-parameter-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [label === 'Value' && jsx("p", {
      value: value,
      label: label,
      children:[value]
    }), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    })]
  });
}