/*
 * This file contains code adapted from the [bpmn-js] library.
 * Source: [URL of the source code if available]
 * 
 * [bpmn-js] is licensed under the [bpmn.io License].
 * You can find a copy of the license at [https://bpmn.io/license/].
 */

import { useError } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { useState } from '@bpmn-io/properties-panel/preact/hooks';
import { jsx, jsxs } from '@bpmn-io/properties-panel/preact/jsx-runtime';

export default function ExtensionProps(props) {

  const {
    extension,
    element,
    idPrefix
  } = props;

  const entries = [
    {
      id: idPrefix + '-key',
      component: Key,
      extension,
      idPrefix,
      element
    }
  ];

  return entries;
}

function Key(props) {
  const {
    idPrefix,
    element,
    extension
  } = props;

  console.log(extension);
  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const getValue = () => {
    return extension.key;
  };

  return ExtensionFieldEntry({
    element: extension,
    id: idPrefix + '-key',
    label: translate('Key'),
    getValue,
    debounce
  });
}
var classnames = require('classnames');
function ExtensionFieldEntry(props) {
  const {
    element,
    id,
    label,
    getValue
  } = props;
  const globalError = useError(id);
  const [localError, setLocalError] = useState(null);
  let value = getValue();
  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-extension-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx("p", {
      value: value,
      label: label
    }), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    })]
  });
}