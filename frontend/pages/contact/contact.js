import { getForms } from '../../js/services/api.js';
import { renderForms, renderMessage } from '../../js/components/index.js';

export async function initPage(root) {
    const container = root.querySelector('[data-forms-list]');
    try {
        renderForms(container, await getForms());
    } catch (error) {
        console.error(error);
        renderMessage(container, 'Os formulários estarão disponíveis em breve.');
    }
}
