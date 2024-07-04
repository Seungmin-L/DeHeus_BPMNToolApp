import { html } from 'htm/preact';

import { useShowEntryEvent, isTextFieldEntryEdited, useError } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { isFunction } from 'min-dash';
import { jsx, jsxs } from '@bpmn-io/properties-panel/preact/jsx-runtime';

export default function (element) {

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
  const debounce = useService('debounceInput');
  const getValue = () => {
    return element.businessObject.attachment || '';
  };
  // Update property of the element and save it in the diagram file 
  const setValue = value => {
    return modeling.updateProperties(element, {
      attachment: value
    });
  };

  return html`<${AttachmentfieldEntry}
    id=${id}
    element=${element}
    getValue=${getValue}
    setValue=${setValue}
    debounce=${debounce}
  />`;
}

var hooks = require('../../../node_modules/@bpmn-io/properties-panel/preact/hooks');
var classnames = require('classnames');

// Create html element for file attachment
function Attachmentfield(props) {
  const {
    debounce,
    disabled = false,
    id,
    onChange,
    onFocus,
    onBlur,
    value = ''
  } = props;
  const [localValue, setLocalValue] = hooks.useState(value || '');
  const ref = useShowEntryEvent(id);
  // Call onChange function to set new property value
  const handleChangeCallback = hooks.useMemo(() => {
    return debounce(target => onChange(target.files.length > 0 ? target.files[0] : undefined));
  }, [onChange, debounce]);
  // Attach new file 
  const handleChange = e => {
    handleChangeCallback(e.target);
    if (e.target.files.length > 0) {
      let newFile = e.target.files[0];
      // Function for saving file in the storage to be added
      setLocalValue(newFile);
    }
  };
  // Download file on click
  const onClick = e => {
    e.stopPropagation();
    if (localValue !== '') {
      const url = URL.createObjectURL(localValue);
      e.target.href = url;
      // e.target.download = localValue.name;
    }
  }
  // Check value changes
  hooks.useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  //
  const btnOnClick = e => {
    e.preventDefault();
    document.getElementById(prefixId(id)).click();
  }
  return jsxs("div", {
    class: "bio-properties-panel-attachment-field",
    children: [localValue !== '' &&
      jsx("a", {
        ref: ref,
        name: id,
        onFocus: onFocus,
        onBlur: onBlur,
        children: jsx("p", {children: localValue.name}),
        target: "_blank",
        onClick: onClick,
        class: "bio-properties-panel-a"
      }),
    jsx("button", {
      ref: ref,
      name: id,
      class: "bio-properties-panel-attachment-btn",
      onClick: btnOnClick,
      children: localValue === '' ? "Select a file..." : "Browse..."
    }),
    jsx("input", {
      ref: ref,
      id: prefixId(id),
      type: "file",
      name: id,
      spellCheck: "false",
      autoComplete: "off",
      disabled: disabled,
      class: "bio-properties-panel-input-file",
      onChange: handleChange,
      onFocus: onFocus,
      onBlur: onBlur,
      value: localValue,
      accept: "image/*, .xml, .pdf, .doc, .docx"
    })
    ]
  });
}

// Create html element for field wrapper
function AttachmentfieldEntry(props) {
  const {
    element,
    id,
    debounce,
    disabled,
    getValue,
    setValue,
    validate,
    onFocus,
    onBlur
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
  // Change attachment in the element 
  const onChange = newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }
    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };

  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-attachment-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(Attachmentfield, {
      debounce: debounce,
      disabled: disabled,
      id: id,
      onChange: onChange,
      onFocus: onFocus,
      onBlur: onBlur,
      value: value,
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