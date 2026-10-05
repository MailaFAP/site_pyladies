import { getEvents, getForms, getMembers } from '../../js/services/api.js';
import { renderEvents, renderForms, renderMembers, renderMessage } from '../../js/components/index.js';

export async function initPage(root) {
    const eventsContainer = root.querySelector('[data-home-events]');
    const membersContainer = root.querySelector('[data-home-members]');
    const formsContainer = root.querySelector('[data-home-forms]');

    try {
        const [events, members, forms] = await Promise.all([getEvents(), getMembers(), getForms()]);
        renderEvents(eventsContainer, events, { home: true });
        renderMembers(membersContainer, members, { home: true });
        renderForms(formsContainer, forms);
    } catch (error) {
        console.error(error);
        renderMessage(eventsContainer, 'A agenda estará disponível em breve.');
        renderMessage(membersContainer, 'As integrantes estarão disponíveis em breve.');
        renderMessage(formsContainer, 'Os formulários estarão disponíveis em breve.');
    }
}
