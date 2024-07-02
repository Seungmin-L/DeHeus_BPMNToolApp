import { html } from 'htm/preact';

import { isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

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
  console.log(element);
  const getValue = () => {
    return element.businessObject.attachment || '';
  };

  const setValue = value => {
    return modeling.updateProperties(element, {
      attachment: value
    });
  };

  return html`<input type='file'
    id=${ id }
    element=${ element }
    label=${ translate('Attachment File') }
    getValue=${ getValue }
    setValue=${ setValue }
    debounce=${ debounce }
  />`;
}