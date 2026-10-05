import { createFormLink } from './form-link.js';
import { renderMessage } from '../shared/empty-state.js';

export function renderForms(container, forms) {
    container.replaceChildren();
    if (!forms.length) {
        renderMessage(container, 'Os formulários estarão disponíveis em breve.');
        return;
    }

    forms.forEach((form) => {
        container.appendChild(createFormLink(form));
    });
}
