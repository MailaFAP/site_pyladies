import { getEvents } from '../../js/services/api.js';
import { renderEvents, renderMessage } from '../../js/components/index.js';

export async function initPage(root) {
    const container = root.querySelector('[data-events-list]');
    try {
        renderEvents(container, await getEvents());
    } catch (error) {
        console.error(error);
        renderMessage(container, 'A agenda estará disponível em breve.');
    }
}
