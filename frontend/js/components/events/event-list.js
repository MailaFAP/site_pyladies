import { createEventCard } from './event-card.js';
import { renderMessage } from '../shared/empty-state.js';

export function renderEvents(container, events, { filterType = null, home = false } = {}) {
    const matchingEvents = events.filter((event) => !filterType || event.tipo === filterType);
    const visibleEvents = home ? matchingEvents.slice(0, 4) : matchingEvents;
    container.replaceChildren();

    if (!visibleEvents.length) {
        renderMessage(container, 'As atividades estarão disponíveis em breve.');
        return;
    }

    visibleEvents.forEach((event) => {
        container.appendChild(createEventCard(event, { home }));
    });
}
