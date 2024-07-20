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
  const testing = ["asd", "dsa", "diagram"];
  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  // Get attachment 
  const getValue = () => {
    if(element.businessObject.attachment){
      // Function for geting attachment files in the storage to be added
      if(typeof element.businessObject.attachment === 'string'){
        return [...element.businessObject.attachment.split(',')];
      }
      return [...element.businessObject.attachment];
    }else{
      return [];
    }
  };
  // Update property of the element and save it in the diagram file 
  const setValue = value => {
    // Function for retrieving attachment file names in the storage to be added
    return modeling.updateProperties(element, {
      attachment: testing
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

function AttachmentList(props) {
  const {
    id,
    onChange,
    onDelete,
    handleHide,
    resetFile,
    value = []
  } = props;
  const [localValue, setLocalValue] = hooks.useState(value || []);
  const onDeleteClick = e => {
    e.stopPropagation();
    e.preventDefault();
    if (localValue.length > 0) {
      onDelete(e.target.name);
      // Function for deleting file in the storage to be added
      const newList = localValue.filter(el => { return el.name !== e.target.name });
      setLocalValue(newList);
    }
    if (localValue.length === 0) {
      handleHide();
    }
  }
  // Download file on click
  const onClick = e => {
    e.stopPropagation();
    let file = localValue.find(el => {
      return el.name === e.target.name;
    })
    const url = URL.createObjectURL(file);
    e.target.href = url;
    // e.target.download = localValue.name;
  }
  const btnOnClick = e => {
    e.preventDefault();
    document.getElementById("add-attachment").click();
  }
  // Check value changes
  hooks.useEffect(() => {
    if (value === localValue) {
    console.log(value);
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsxs("div", {
    class: "bio-properties-panel-attachments-wrapper",
    children: [
      jsx("div", { class: "bio-properties-panel-attachments-bg", onClick: handleHide }),
      jsxs("div", {
        class: "bio-properties-panel-attachments-container",
        children: [
          jsxs("div", {
            class: "bio-properties-panel-attachment-header-container",
            children: [
              jsx("h1", { children: "Attachments" }),
              jsx("button", {
                name: id,
                class: "attachment-add-btn",
                onClick: btnOnClick,
              }),
              jsx("input", {
                id: "add-attachment",
                type: "file",
                name: id,
                class: "bio-properties-panel-input-file",
                onChange: onChange,
                onClick: resetFile,
                accept: "image/*, .pdf, .doc, .docx"
              })
            ]
          })
          ,
          jsx("div", {
            class: "bio-properties-panel-attachment-list-container",
            children: localValue.map(el =>
              jsxs("div", {
                class: "bio-properties-panel-attachment-container",
                children: [
                  jsx("a", {
                    name: el.name,
                    title: el.name,
                    children: jsx("p", { children: el.name.length > 20 ? el.name.substring(0, 21) + "..." : el.name }),
                    target: "_blank",
                    onClick: onClick,
                    class: "bio-properties-panel-a"
                  }),
                  jsx("button", {
                    onClick: onDeleteClick,
                    class: "attachment-del-btn",
                    name: el.name
                  })
                ]
              })
            )
          })
          ,
          jsx("div", {
            class: "text-end pb-2",
            children: jsx("button", {
              class: "bio-properties-panel-attachment-close-btn",
              onClick: handleHide,
              children: "Close"
            })
          })
        ]
      })

    ]
  })
}

// Create html element for file attachment
function Attachmentfield(props) {
  const {
    debounce,
    id,
    onChange,
    onDelete,
    value = []
  } = props;
  const [localValue, setLocalValue] = hooks.useState(value || []);
  const [isShown, setIsShown] = hooks.useState(false);
  const ref = useShowEntryEvent(id);
  // Call onChange function to set new property value
  const handleChangeCallback = hooks.useMemo(() => {
    return debounce(target => onChange(target.files.length > 0 ? target.files[0] : undefined));
  }, [onChange, debounce]);
  const handleDeleteCallback = hooks.useMemo(() => {
    return debounce(fileName => onDelete(fileName));
  }, [onDelete, debounce]);
  // Attach new file 
  const handleChange = e => {
    if (e.target.files.length > 0) {
      let newFile = e.target.files[0];
      const newList = [...value];
      if (value.length > 0) {
        const duplicate = value.find(el => { return el.name === newFile.name }) || null;
        if (duplicate === null) {
          handleChangeCallback(e.target);
          // Function for saving file in the storage to be added
          newList.push(newFile);
          setLocalValue(newList);
        }
      } else {
        handleChangeCallback(e.target);
        // Function for saving file in the storage to be added
        newList.push(newFile);
        setLocalValue(newList);
      }
    }
  };
  const handleShow = () => {
    setIsShown(true);
  }
  const handleHide = () => {
    setIsShown(false);
  }
  // Check value changes
  hooks.useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
    console.log(localValue);
  }, [value]);
  //
  const btnOnClick = e => {
    e.preventDefault();
    document.getElementById(prefixId(id)).click();
  }
  const resetFile = e => {
    e.target.value = null;
  }
  return jsxs("div", {
    class: "bio-properties-panel-attachment-field",
    children: [localValue.length > 0 ?
      jsx("button", {
        ref: ref,
        name: id,
        class: "bio-properties-panel-attachment-btn",
        onClick: handleShow,
        children: "View attachments..."
      }) :
      jsx("button", {
        ref: ref,
        name: id,
        class: "bio-properties-panel-attachment-btn",
        onClick: btnOnClick,
        children: "Select a file..."
      }),
    jsx("input", {
      ref: ref,
      id: prefixId(id),
      type: "file",
      name: id,
      class: "bio-properties-panel-input-file",
      onClick: resetFile,
      onChange: handleChange,
      accept: "image/*, .pdf, .doc, .docx"
    }),
    (localValue.length > 0 && isShown) &&
    jsx(AttachmentList, {
      id: id,
      onChange: handleChange,
      onDelete: handleDeleteCallback,
      value: localValue,
      resetFile: resetFile,
      handleHide: handleHide
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
    getValue,
    setValue,
    validate,
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
    const newList = [...value, newValue];
    setValue(newList, newValidationError);
    setLocalError(newValidationError);
  };

  const onDelete = fileName => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(fileName) || null;
    }
    const newList = value.filter(el => { return fileName !== el.name });
    setValue(newList, newValidationError);
    setLocalError(newValidationError);
  };

  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-attachment-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(Attachmentfield, {
      debounce: debounce,
      id: id,
      onChange: onChange,
      value: value,
      element: element,
      onDelete: onDelete
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    })]
  });
}

function prefixId(id) {
  return `bio-properties-panel-${id}`;
}