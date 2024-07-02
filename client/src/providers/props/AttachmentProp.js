import { html } from 'htm/preact';

import { useShowEntryEvent, isTextFieldEntryEdited, TooltipEntry, useError } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { isFunction } from 'min-dash';
import { jsx, jsxs } from '@bpmn-io/properties-panel/preact/jsx-runtime';

export default function(element) {

  return [
    {
      id: 'attachment',
      element,
      component: Attachment,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Attachment(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const getValue = () => {
    return element.businessObject.attachment || '';
  };

  const setValue = value => {
    return modeling.updateProperties(element, {
      attachment: value
    });
  };

  return html`<${AttachmentfieldEntry}
    id=${ id }
    element=${ element }
    label=${ translate('Attachment File') }
    getValue=${ getValue }
    setValue=${ setValue }
    debounce=${ debounce }
  />`;
}

var hooks = require('../../../node_modules/@bpmn-io/properties-panel/preact/hooks');
var classnames = require('classnames');

function Attachmentfield(props) {
  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    onFocus,
    onBlur,
    placeholder,
    value = '',
    tooltip
  } = props;
  const [localValue, setLocalValue] = hooks.useState(value || '');
  const ref = useShowEntryEvent(id);
  const handleInputCallback = hooks.useMemo(() => {
    return debounce(target => onInput(target.value.length ? target.value : undefined));
  }, [onInput, debounce]);
  const handleInput = e => {
    handleInputCallback(e.target);
    setLocalValue(e.target.value);
  };
  hooks.useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsxs("div", {
    class: "bio-properties-panel-textfield",
    children: [jsx("label", {
      for: prefixId(id),
      class: "bio-properties-panel-label",
      children: jsx(TooltipEntry, {
        value: tooltip,
        forId: id,
        element: props.element,
        children: label
      })
    }), jsx("input", {
      ref: ref,
      id: prefixId(id),
      type: "file",
      name: id,
      spellCheck: "false",
      autoComplete: "off",
      disabled: disabled,
      class: "bio-properties-panel-input",
      onInput: handleInput,
      onFocus: onFocus,
      onBlur: onBlur,
      placeholder: placeholder,
      value: localValue
    })]
  });
}

function AttachmentfieldEntry(props) {
  const {
    element,
    id,
    debounce,
    disabled,
    label,
    getValue,
    setValue,
    validate,
    onFocus,
    onBlur,
    placeholder,
    tooltip
  } = props;
  const globalError = useError(id);
  const [localError, setLocalError] = hooks.useState(null);
  let value = getValue(element);
  hooks.useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;
      setLocalError(newValidationError);
    }
  }, [value, validate]);
  const onInput = newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }
    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };
  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(Attachmentfield, {
      debounce: debounce,
      disabled: disabled,
      id: id,
      label: label,
      onInput: onInput,
      onFocus: onFocus,
      onBlur: onBlur,
      placeholder: placeholder,
      value: value,
      tooltip: tooltip,
      element: element
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    })]
  });
}

function prefixId(id) {
  return `bio-properties-panel-${id}`;
}