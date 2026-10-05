import { getMembers } from '../../js/services/api.js';
import { renderMembers, renderMessage } from '../../js/components/index.js';

export async function initPage(root) {
    const container = root.querySelector('[data-members-grid]');
    try {
        renderMembers(container, await getMembers());
    } catch (error) {
        console.error(error);
        renderMessage(container, 'As integrantes estarão disponíveis em breve.');
    }
}
