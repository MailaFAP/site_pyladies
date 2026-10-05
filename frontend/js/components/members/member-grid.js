import { createMemberCard } from './member-card.js';
import { renderMessage } from '../shared/empty-state.js';

export function renderMembers(container, members, { home = false } = {}) {
    container.replaceChildren();
    if (!members.length) {
        renderMessage(container, 'As integrantes estarão disponíveis em breve.');
        return;
    }

    members.forEach((member) => {
        container.appendChild(createMemberCard(member, { home }));
    });
}
