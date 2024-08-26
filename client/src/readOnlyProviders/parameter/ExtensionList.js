/*
 * This file contains code adapted from the [bpmn-js] library.
 * Source: [URL of the source code if available]
 * 
 * [bpmn-js] is licensed under the [bpmn.io License].
 * You can find a copy of the license at [https://bpmn.io/license/].
 */

import { html } from 'htm/preact';

import { without } from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  CollapsibleEntry,
  ListEntry, useError
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';
import { jsx, jsxs } from '@bpmn-io/properties-panel/preact/jsx-runtime';
import { useState } from '@bpmn-io/properties-panel/preact/hooks';
import ExtensionProps from './ExtensionProps';

export default function ExtensionList(props) {
  const {
    element,
    idPrefix,
    parameter
  } = props;

  const id = `${idPrefix}-extensions`;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  let extensions = parameter.get('extensions');

  const extensionsList = (extensions && extensions.get('extensions')) || [];

  return html`<${ListEntry}
    element=${element}
    autoFocusEntry=${`[data-entry-id="${id}-extension-${extensionsList.length - 1}"] input`}
    id=${id}
    label=${translate('Extensions')}
    items=${extensionsList}
    component=${Extension} 
    />`;
}

function Extension(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: extension,
    open
  } = props;

  const translate = useService('translate');

  const id = `${idPrefix}-extension-${index}`;

  return html`
    <${KeyEntry}
      id=${id}
      element=${element}
      label=${extension.get('key') || ''}
    />`;
}

var classnames = require('classnames');
function KeyEntry(props) {
  const {
    id,
    label
  } = props;
  const globalError = useError(id);
  const [localError, setLocalError] = useState(null);
  const error = globalError || localError;
  return label !== '' && jsxs("div", {
    class: classnames('bio-properties-panel-extension-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx("p", {
      children: ["Key: " + label]
    }), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    })]
  });
}

