import { getEvents } from '../../js/services/api.js';
import { renderEvents, renderMessage } from '../../js/components/index.js';

export async function initPage(root) {
    const container = root.querySelector('[data-events-list]');
    try {
        renderEvents(container, await getEvents(), { filterType: 'Mini Cursos' });
    } catch (error) {
        console.error(error);
        renderMessage(container, 'Os minicursos estarão disponíveis em breve.');
    }
}
